import os
import tempfile
import pytest
import pandas as pd
import numpy as np
from engine.meta_dataset import MetaDatasetManager, META_COLUMNS


class TestMetaDatasetManager:
    """Tests for MetaDatasetManager class."""

    @pytest.fixture
    def temp_meta_dataset(self):
        """Create a temporary meta-dataset file."""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
            temp_path = f.name
        yield temp_path
        # Cleanup
        if os.path.exists(temp_path):
            os.unlink(temp_path)

    def test_initialization_creates_file(self, temp_meta_dataset):
        manager = MetaDatasetManager(filepath=temp_meta_dataset)
        assert os.path.exists(temp_meta_dataset)
        df = manager.load()
        assert list(df.columns) == META_COLUMNS
        assert len(df) == 0

    def test_load_empty_dataset(self, temp_meta_dataset):
        manager = MetaDatasetManager(filepath=temp_meta_dataset)
        df = manager.load()
        assert isinstance(df, pd.DataFrame)
        assert len(df) == 0

    def test_record_benchmark_run(self, temp_meta_dataset):
        manager = MetaDatasetManager(filepath=temp_meta_dataset)

        features = {
            "n_dimensions": 10,
            "n_continuous": 10,
            "n_integer": 0,
            "n_categorical": 0,
            "continuous_ratio": 1.0,
            "search_space_volume": 23.0,
            "evaluation_budget": 50,
            "budget_per_dim": 5.0,
            "is_noisy": False,
            "dimensionality_class": "medium"
        }

        results = [
            {"algorithm_id": "vanilla-bo", "best_value": 0.1, "wall_clock_time": 1.5, "n_evaluations": 50},
            {"algorithm_id": "turbo", "best_value": 0.05, "wall_clock_time": 2.0, "n_evaluations": 50},
            {"algorithm_id": "hebo", "best_value": 0.2, "wall_clock_time": 1.8, "n_evaluations": 50},
        ]

        manager.record_benchmark_run(
            problem_features=features,
            results=results,
            problem_id="test_10d",
            problem_name="Test Problem 10D"
        )

        df = manager.load()
        assert len(df) == 3
        assert list(df["problem_id"]) == ["test_10d", "test_10d", "test_10d"]
        # Check ranking (turbo should be rank 1 with best value 0.05)
        assert df[df["rank"] == 1]["algorithm_id"].values[0] == "turbo"
        assert df[df["is_best"] == True]["algorithm_id"].values[0] == "turbo"

    def test_record_multiple_problems(self, temp_meta_dataset):
        manager = MetaDatasetManager(filepath=temp_meta_dataset)

        features = {"n_dimensions": 5, "evaluation_budget": 30, "budget_per_dim": 6.0, "is_noisy": False}
        results = [{"algorithm_id": "vanilla-bo", "best_value": 0.1, "wall_clock_time": 1.0, "n_evaluations": 30}]

        manager.record_benchmark_run(features, results, "prob1", "Problem 1")
        manager.record_benchmark_run(features, results, "prob2", "Problem 2")

        df = manager.load()
        assert len(df) == 2
        assert df["problem_id"].nunique() == 2

    def test_get_summary_stats_empty(self, temp_meta_dataset):
        manager = MetaDatasetManager(filepath=temp_meta_dataset)
        stats = manager.get_summary_stats()

        assert stats["total_runs"] == 0
        assert stats["total_problems"] == 0
        assert stats["algorithm_wins"] == {}
        assert stats["algorithms_evaluated"] == []

    def test_get_summary_stats_with_data(self, temp_meta_dataset):
        manager = MetaDatasetManager(filepath=temp_meta_dataset)

        features = {"n_dimensions": 5, "evaluation_budget": 30, "budget_per_dim": 6.0, "is_noisy": False}
        results = [
            {"algorithm_id": "vanilla-bo", "best_value": 0.1, "wall_clock_time": 1.0, "n_evaluations": 30},
            {"algorithm_id": "turbo", "best_value": 0.05, "wall_clock_time": 1.5, "n_evaluations": 30},
        ]

        manager.record_benchmark_run(features, results, "prob1", "Problem 1")

        stats = manager.get_summary_stats()

        assert stats["total_runs"] == 2
        assert stats["total_problems"] == 1
        assert "vanilla-bo" in stats["algorithm_wins"] or "turbo" in stats["algorithm_wins"]
        assert set(stats["algorithms_evaluated"]) == {"vanilla-bo", "turbo"}

    def test_record_with_empty_results(self, temp_meta_dataset):
        manager = MetaDatasetManager(filepath=temp_meta_dataset)
        features = {"n_dimensions": 5}
        manager.record_benchmark_run(features, [], "prob1", "Problem 1")
        df = manager.load()
        assert len(df) == 0