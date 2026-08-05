import os
import sys
import numpy as np

# Ensure root bo-engine is on path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from engine.test_functions import BENCHMARK_FUNCTIONS
from engine.algorithms import AVAILABLE_ALGORITHMS
from engine.feature_extractor import extract_features_from_spec
from engine.meta_dataset import MetaDatasetManager
from engine.selector.model import AlgorithmSelector

def run_seed_benchmarks():
    print("=" * 60)
    print("Starting Meta-Dataset Benchmark Seeding...")
    print("=" * 60)

    meta_manager = MetaDatasetManager()
    
    # Grid of benchmark problems
    test_configs = [
        {"func_name": "sphere", "dims": 2, "budget": 15},
        {"func_name": "ackley", "dims": 4, "budget": 15},
        {"func_name": "rosenbrock", "dims": 6, "budget": 15},
        {"func_name": "rastrigin", "dims": 10, "budget": 15},
        {"func_name": "ackley", "dims": 20, "budget": 15},
        {"func_name": "levy", "dims": 30, "budget": 15},
        {"func_name": "ackley", "dims": 50, "budget": 15},
        {"func_name": "rosenbrock", "dims": 80, "budget": 15},
    ]

    for config in test_configs:
        func_name = config["func_name"]
        dims = config["dims"]
        budget = config["budget"]
        problem_id = f"{func_name}_{dims}d"

        fn_info = BENCHMARK_FUNCTIONS[func_name]
        fn = fn_info["fn"]
        bounds = fn_info["default_bounds"]

        features = extract_features_from_spec(
            n_dimensions=dims,
            n_continuous=dims,
            n_integer=0,
            n_categorical=0,
            bounds_range=bounds[1] - bounds[0],
            evaluation_budget=budget,
            is_noisy=False
        )

        problem_results = []
        print(f"\nRunning benchmark for Problem: {problem_id} (dims={dims}, budget={budget})")

        for algo_name, algo_cls in AVAILABLE_ALGORITHMS.items():
            try:
                optimizer = algo_cls(n_dimensions=dims, bounds=bounds, evaluation_budget=budget)
                res = optimizer.run(fn)
                problem_results.append({
                    "algorithm_id": algo_name,
                    "best_value": res["best_value"],
                    "wall_clock_time": res["wall_clock_time"],
                    "n_evaluations": res["n_evaluations"],
                    "final_incumbent": res["final_incumbent"]
                })
                print(f"  [{algo_name}] best_value: {res['best_value']:.4f} in {res['wall_clock_time']:.2f}s")
            except Exception as e:
                print(f"  [{algo_name}] Failed: {e}")

        # Record this problem's results in meta-dataset
        meta_manager.record_benchmark_run(
            problem_features=features,
            results=problem_results,
            problem_id=problem_id,
            problem_name=f"{fn_info['name']} ({dims}D)"
        )

    print("\n" + "=" * 60)
    print("Seeding complete! Now training Algorithm Selection ML Model...")
    selector = AlgorithmSelector()
    train_res = selector.train()
    print("Training result:", train_res)
    print("=" * 60)

if __name__ == "__main__":
    run_seed_benchmarks()
