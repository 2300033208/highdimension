from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import io
import numpy as np
import pandas as pd

from engine.algorithms import AVAILABLE_ALGORITHMS, ALGORITHM_METADATA
from engine.test_functions import BENCHMARK_FUNCTIONS, get_test_function
from engine.feature_extractor import extract_features_from_spec, extract_features_from_dataset
from engine.meta_dataset import MetaDatasetManager
from engine.selector.model import AlgorithmSelector
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import Matern, ConstantKernel as C

app = FastAPI(
    title="HD-BO Benchmark Engine API",
    description="Real Bayesian Optimization execution engine and ML Algorithm Selection service"
)

# Enable CORS for React frontend (port 5173) and Spring Boot backend (port 8081)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

meta_manager = MetaDatasetManager()
selector = AlgorithmSelector()

class ProblemDefinition(BaseModel):
    problem_id: str = "ackley-problem"
    test_function: Optional[str] = "ackley"
    n_dimensions: int = 10
    n_continuous: Optional[int] = None
    n_integer: Optional[int] = 0
    n_categorical: Optional[int] = 0
    search_space_volume: Optional[float] = 20.0
    objective_type: Optional[str] = "minimize"
    evaluation_budget: int = 25
    is_noisy: Optional[bool] = False
    algorithms_to_run: Optional[List[str]] = None

class BenchmarkResponse(BaseModel):
    algorithm_id: str
    best_value: float
    convergence_curve: List[float]
    wall_clock_time: float
    n_evaluations: int
    final_incumbent: Dict[str, Any]

class RecommendationRequest(BaseModel):
    n_dimensions: int = 10
    n_continuous: Optional[int] = None
    n_integer: Optional[int] = 0
    n_categorical: Optional[int] = 0
    bounds_range: Optional[float] = 20.0
    evaluation_budget: Optional[int] = 50
    is_noisy: Optional[bool] = False

class RecommendationResponse(BaseModel):
    recommended_algorithm: str
    confidence_score: float
    reasoning: str
    ranked_algorithms: List[str]
    model_type: str
    problem_features: Dict[str, Any]

@app.get("/")
def read_root():
    return {
        "status": "ok",
        "service": "HD-BO Optimization Engine",
        "supported_algorithms": list(AVAILABLE_ALGORITHMS.keys()),
        "supported_test_functions": list(BENCHMARK_FUNCTIONS.keys())
    }

@app.get("/api/algorithms")
def list_algorithms():
    return {
        "algorithms": ALGORITHM_METADATA
    }

@app.post("/api/extract-features")
def extract_features(problem: ProblemDefinition):
    features = extract_features_from_spec(
        n_dimensions=problem.n_dimensions,
        n_continuous=problem.n_continuous or problem.n_dimensions,
        n_integer=problem.n_integer or 0,
        n_categorical=problem.n_categorical or 0,
        bounds_range=problem.search_space_volume or 20.0,
        evaluation_budget=problem.evaluation_budget,
        is_noisy=problem.is_noisy or False
    )
    return features

@app.post("/api/recommend", response_model=RecommendationResponse)
def recommend_algorithm(req: RecommendationRequest):
    features = extract_features_from_spec(
        n_dimensions=req.n_dimensions,
        n_continuous=req.n_continuous or req.n_dimensions,
        n_integer=req.n_integer or 0,
        n_categorical=req.n_categorical or 0,
        bounds_range=req.bounds_range or 20.0,
        evaluation_budget=req.evaluation_budget or 50,
        is_noisy=req.is_noisy or False
    )
    rec = selector.predict(features)
    return RecommendationResponse(
        recommended_algorithm=rec["recommended_algorithm"],
        confidence_score=rec["confidence_score"],
        reasoning=rec["reasoning"],
        ranked_algorithms=rec["ranked_algorithms"],
        model_type=rec["model_type"],
        problem_features=features
    )

@app.post("/api/run-benchmark", response_model=List[BenchmarkResponse])
def run_benchmark(problem: ProblemDefinition):
    fn_info = get_test_function(problem.test_function or problem.problem_id)
    fn = fn_info["fn"]
    bounds = fn_info["default_bounds"]

    algos_to_execute = problem.algorithms_to_run
    if not algos_to_execute or len(algos_to_execute) == 0:
        algos_to_execute = list(AVAILABLE_ALGORITHMS.keys())

    results: List[BenchmarkResponse] = []
    raw_results_for_meta = []

    for algo_id in algos_to_execute:
        clean_id = algo_id.lower().strip()
        if clean_id not in AVAILABLE_ALGORITHMS:
            continue

        algo_cls = AVAILABLE_ALGORITHMS[clean_id]
        optimizer = algo_cls(
            n_dimensions=problem.n_dimensions,
            bounds=bounds,
            evaluation_budget=problem.evaluation_budget
        )

        res = optimizer.run(fn)
        resp_item = BenchmarkResponse(
            algorithm_id=clean_id,
            best_value=float(res["best_value"]),
            convergence_curve=[float(v) for v in res["convergence_curve"]],
            wall_clock_time=float(res["wall_clock_time"]),
            n_evaluations=int(res["n_evaluations"]),
            final_incumbent=res["final_incumbent"]
        )
        results.append(resp_item)
        raw_results_for_meta.append({
            "algorithm_id": clean_id,
            "best_value": res["best_value"],
            "wall_clock_time": res["wall_clock_time"],
            "n_evaluations": res["n_evaluations"]
        })

    # Record benchmark run into the meta-dataset for future training
    features = extract_features_from_spec(
        n_dimensions=problem.n_dimensions,
        n_continuous=problem.n_continuous or problem.n_dimensions,
        n_integer=problem.n_integer or 0,
        n_categorical=problem.n_categorical or 0,
        bounds_range=bounds[1] - bounds[0],
        evaluation_budget=problem.evaluation_budget,
        is_noisy=problem.is_noisy or False
    )
    meta_manager.record_benchmark_run(
        problem_features=features,
        results=raw_results_for_meta,
        problem_id=problem.problem_id,
        problem_name=fn_info["name"]
    )

    return results

@app.post("/api/train-selector")
def train_selector():
    train_res = selector.train()
    return train_res

@app.get("/api/meta-dataset/stats")
def meta_dataset_stats():
    return meta_manager.get_summary_stats()


class DatasetOptimizeRequest(BaseModel):
    problem_id: str = "dataset-problem"
    n_dimensions: int = 10
    evaluation_budget: int = 25
    algorithms_to_run: Optional[List[str]] = None
    target_column: Optional[str] = None


@app.post("/api/optimize-dataset", response_model=List[BenchmarkResponse])
async def optimize_dataset(
    file: UploadFile = File(...),
    problem_id: str = Form("dataset-problem"),
    evaluation_budget: int = Form(25),
    algorithms_to_run: str = Form(""),  # comma-separated
    target_column: str = Form("")
):
    """
    Upload a CSV dataset and run Bayesian Optimization algorithms on the actual data.
    The dataset should have features in all columns except the target column (last column by default).
    The target column values will be used as the objective function to minimize.
    """
    # Parse CSV
    content = await file.read()
    df = pd.read_csv(io.StringIO(content.decode('utf-8')))

    # Determine target column
    if target_column and target_column in df.columns:
        y = df[target_column].values
        X = df.drop(columns=[target_column])
    else:
        # Default: last column is target
        y = df.iloc[:, -1].values
        X = df.iloc[:, :-1]

    n_dimensions = X.shape[1]
    n_rows = X.shape[0]

    # Normalize features to [0, 1] range for optimization
    X_min = X.min(axis=0)
    X_max = X.max(axis=0)
    X_range = X_max - X_min
    X_range = np.where(X_range == 0, 1.0, X_range)
    X_normalized = (X - X_min) / X_range

    # Normalize target to reasonable scale
    y_min = y.min()
    y_max = y.max()
    y_range = y_max - y_min
    y_range = max(y_range, 1e-6)
    y_normalized = (y - y_min) / y_range

    # Build objective function from dataset
    # Use GP regression to interpolate the objective function
    kernel = C(1.0) * Matern(length_scale=np.ones(n_dimensions), nu=2.5)
    gp = GaussianProcessRegressor(kernel=kernel, alpha=1e-6, normalize_y=True)
    gp.fit(X_normalized, y_normalized)

    def objective_function(x: np.ndarray) -> float:
        # Clip to bounds
        x_clipped = np.clip(x, 0, 1)
        # Reshape for single prediction
        if x_clipped.ndim == 1:
            x_clipped = x_clipped.reshape(1, -1)
        pred = gp.predict(x_clipped)
        return float(pred[0])

    # Bounds for normalized space
    bounds = (0.0, 1.0)

    # Parse algorithms to run
    if algorithms_to_run.strip():
        algos_to_execute = [a.strip().lower() for a in algorithms_to_run.split(",")]
    else:
        algos_to_execute = list(AVAILABLE_ALGORITHMS.keys())

    results: List[BenchmarkResponse] = []
    raw_results_for_meta = []

    for algo_id in algos_to_execute:
        clean_id = algo_id.lower().strip()
        if clean_id not in AVAILABLE_ALGORITHMS:
            continue

        algo_cls = AVAILABLE_ALGORITHMS[clean_id]
        optimizer = algo_cls(
            n_dimensions=n_dimensions,
            bounds=bounds,
            evaluation_budget=evaluation_budget
        )

        res = optimizer.run(objective_function)
        resp_item = BenchmarkResponse(
            algorithm_id=clean_id,
            best_value=float(res["best_value"]),
            convergence_curve=[float(v) for v in res["convergence_curve"]],
            wall_clock_time=float(res["wall_clock_time"]),
            n_evaluations=int(res["n_evaluations"]),
            final_incumbent=res["final_incumbent"]
        )
        results.append(resp_item)
        raw_results_for_meta.append({
            "algorithm_id": clean_id,
            "best_value": res["best_value"],
            "wall_clock_time": res["wall_clock_time"],
            "n_evaluations": res["n_evaluations"]
        })

    # Record benchmark run into the meta-dataset
    features = extract_features_from_dataset(df, target_column)
    meta_manager.record_benchmark_run(
        problem_features=features,
        results=raw_results_for_meta,
        problem_id=problem_id,
        problem_name=f"dataset-{problem_id}"
    )

    return results
