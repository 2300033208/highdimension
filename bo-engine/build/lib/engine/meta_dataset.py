import os
import pandas as pd
import numpy as np
from typing import List, Dict, Any

META_DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "meta_dataset.csv")

META_COLUMNS = [
    "problem_id",
    "problem_name",
    "n_dimensions",
    "n_continuous",
    "n_integer",
    "n_categorical",
    "continuous_ratio",
    "search_space_volume",
    "evaluation_budget",
    "budget_per_dim",
    "is_noisy",
    "dimensionality_class",
    "algorithm_id",
    "best_value",
    "wall_clock_time",
    "n_evaluations",
    "rank",
    "is_best"
]

class MetaDatasetManager:
    def __init__(self, filepath: str = META_DATASET_PATH):
        self.filepath = filepath
        os.makedirs(os.path.dirname(self.filepath), exist_ok=True)
        if not os.path.exists(self.filepath):
            df = pd.DataFrame(columns=META_COLUMNS)
            df.to_csv(self.filepath, index=False)

    def load(self) -> pd.DataFrame:
        if os.path.exists(self.filepath) and os.path.getsize(self.filepath) > 0:
            return pd.read_csv(self.filepath)
        return pd.DataFrame(columns=META_COLUMNS)

    def record_benchmark_run(self, problem_features: Dict[str, Any], results: List[Dict[str, Any]], problem_id: str = "custom", problem_name: str = "Benchmark Problem"):
        """
        Takes benchmark results across multiple algorithms for a given problem,
        computes ranks and is_best, and appends to the meta-dataset.
        """
        if not results:
            return

        # Sort results by best_value (assuming minimization)
        sorted_results = sorted(results, key=lambda r: r.get("best_value", float('inf')))

        rows = []
        for rank, res in enumerate(sorted_results, start=1):
            row = {
                "problem_id": problem_id,
                "problem_name": problem_name,
                "n_dimensions": problem_features.get("n_dimensions", 10),
                "n_continuous": problem_features.get("n_continuous", 10),
                "n_integer": problem_features.get("n_integer", 0),
                "n_categorical": problem_features.get("n_categorical", 0),
                "continuous_ratio": problem_features.get("continuous_ratio", 1.0),
                "search_space_volume": problem_features.get("search_space_volume", 20.0),
                "evaluation_budget": problem_features.get("evaluation_budget", 50),
                "budget_per_dim": problem_features.get("budget_per_dim", 5.0),
                "is_noisy": problem_features.get("is_noisy", False),
                "dimensionality_class": problem_features.get("dimensionality_class", "medium"),
                "algorithm_id": res.get("algorithm_id"),
                "best_value": res.get("best_value"),
                "wall_clock_time": res.get("wall_clock_time"),
                "n_evaluations": res.get("n_evaluations"),
                "rank": rank,
                "is_best": (rank == 1)
            }
            rows.append(row)

        df_existing = self.load()
        df_new = pd.concat([df_existing, pd.DataFrame(rows)], ignore_index=True)
        df_new.to_csv(self.filepath, index=False)

    def get_summary_stats(self) -> Dict[str, Any]:
        df = self.load()
        if df.empty:
            return {
                "total_runs": 0,
                "total_problems": 0,
                "algorithm_wins": {},
                "algorithms_evaluated": []
            }
        
        wins = df[df["is_best"] == True]["algorithm_id"].value_counts().to_dict()
        return {
            "total_runs": int(len(df)),
            "total_problems": int(df["problem_id"].nunique()),
            "algorithm_wins": wins,
            "algorithms_evaluated": list(df["algorithm_id"].unique())
        }
