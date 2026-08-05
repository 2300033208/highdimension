import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from sklearn.ensemble import RandomForestClassifier
from ..meta_dataset import MetaDatasetManager

MODEL_FILE = os.path.join(os.path.dirname(__file__), "..", "..", "models", "selector_model.pkl")

FEATURE_COLS = [
    "n_dimensions",
    "continuous_ratio",
    "search_space_volume",
    "evaluation_budget",
    "budget_per_dim",
    "is_noisy"
]

class AlgorithmSelector:
    def __init__(self, model_path: str = MODEL_FILE):
        self.model_path = model_path
        self.model: Optional[RandomForestClassifier] = None
        self.meta_manager = MetaDatasetManager()
        self._load_or_init()

    def _load_or_init(self):
        if os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
            except Exception:
                self.model = None

    def train(self) -> Dict[str, Any]:
        """
        Trains the Random Forest model on the accumulated meta-dataset.
        """
        df = self.meta_manager.load()
        if df.empty:
            return {"status": "error", "message": "Meta-dataset is empty. Run seed benchmarks first."}

        # Filter to winning algorithms per problem
        best_df = df[df["is_best"] == True].copy()
        if len(best_df) < 3 or best_df["algorithm_id"].nunique() < 2:
            # If not enough distinct winning samples, include rank-weighted samples
            best_df = df.sort_values(by=["problem_id", "rank"]).groupby("problem_id").first().reset_index()

        X = best_df[FEATURE_COLS].copy()
        X["is_noisy"] = X["is_noisy"].astype(int)
        y = best_df["algorithm_id"]

        clf = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42)
        clf.fit(X, y)
        self.model = clf

        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        joblib.dump(clf, self.model_path)

        # Feature importances
        importances = dict(zip(FEATURE_COLS, [round(float(v), 4) for v in clf.feature_importances_]))

        return {
            "status": "success",
            "samples_trained": len(best_df),
            "classes": list(clf.classes_),
            "feature_importances": importances
        }

    def predict(self, problem_features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predicts the recommended algorithm and returns ranked alternatives with confidence.
        """
        n_dim = problem_features.get("n_dimensions", 10)
        budget = problem_features.get("evaluation_budget", 50)
        budget_per_dim = problem_features.get("budget_per_dim", budget / max(n_dim, 1))

        # Heuristic baseline if model not trained yet
        if self.model is None or not hasattr(self.model, "classes_"):
            # Mathematical domain heuristics based on HD-BO literature
            if n_dim <= 6:
                best_algo = "vanilla-bo"
                conf = 0.85
                reason = f"Low dimensional problem (d={n_dim}). Standard Gaussian Process BO with full covariance achieves state-of-the-art sample efficiency."
                ranking = ["vanilla-bo", "optuna", "hebo", "turbo", "saasbo", "baxus", "random-search"]
            elif n_dim <= 25:
                best_algo = "turbo"
                conf = 0.82
                reason = f"Moderate dimensionality (d={n_dim}). TuRBO's localized trust regions prevent over-exploration and combat the curse of dimensionality."
                ranking = ["turbo", "optuna", "saasbo", "hebo", "vanilla-bo", "baxus", "random-search"]
            elif n_dim <= 80:
                best_algo = "saasbo"
                conf = 0.88
                reason = f"High dimensionality (d={n_dim}). SAASBO uses sparsity-inducing priors to identify the effective low-dimensional subspace driving performance."
                ranking = ["saasbo", "turbo", "baxus", "optuna", "hebo", "vanilla-bo", "random-search"]
            else:
                best_algo = "baxus"
                conf = 0.91
                reason = f"Ultra high dimensionality (d={n_dim}). BAxUS adaptively expands the embedding target subspace to scale to hundreds of parameters."
                ranking = ["baxus", "saasbo", "turbo", "optuna", "random-search", "hebo", "vanilla-bo"]

            return {
                "recommended_algorithm": best_algo,
                "confidence_score": conf,
                "reasoning": reason,
                "ranked_algorithms": ranking,
                "model_type": "domain_rule_fallback"
            }

        # Model-based inference
        sample = {
            "n_dimensions": n_dim,
            "continuous_ratio": problem_features.get("continuous_ratio", 1.0),
            "search_space_volume": problem_features.get("search_space_volume", 20.0),
            "evaluation_budget": budget,
            "budget_per_dim": budget_per_dim,
            "is_noisy": 1 if problem_features.get("is_noisy", False) else 0
        }
        X_df = pd.DataFrame([sample])[FEATURE_COLS]
        probs = self.model.predict_proba(X_df)[0]
        classes = self.model.classes_

        sorted_indices = np.argsort(probs)[::-1]
        best_algo = classes[sorted_indices[0]]
        confidence = float(probs[sorted_indices[0]])
        ranked = [classes[i] for i in sorted_indices]

        # Generate contextual reasoning
        reason = (
            f"Based on learned patterns across previous benchmarks: "
            f"for d={n_dim} dimensions and an evaluation budget of {budget} (budget/dim ratio = {budget_per_dim:.2f}), "
            f"{best_algo.upper()} was trained to yield the highest convergence efficiency."
        )

        return {
            "recommended_algorithm": best_algo,
            "confidence_score": round(confidence, 3),
            "reasoning": reason,
            "ranked_algorithms": ranked,
            "model_type": "random_forest_meta_model"
        }
