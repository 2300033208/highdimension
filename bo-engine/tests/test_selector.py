import os
import tempfile
import pytest
import numpy as np
import pandas as pd
from engine.selector.model import AlgorithmSelector, FEATURE_COLS
from engine.meta_dataset import MetaDatasetManager


class TestAlgorithmSelector:
    """Tests for AlgorithmSelector class."""

    @pytest.fixture
    def temp_model_path(self):
        with tempfile.NamedTemporaryFile(suffix='.pkl', delete=False) as f:
            temp_path = f.name
        yield temp_path
        if os.path.exists(temp_path):
            os.unlink(temp_path)

    @pytest.fixture
    def temp_meta_dataset(self):
        with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
            temp_path = f.name
        yield temp_path
        if os.path.exists(temp_path):
            os.unlink(temp_path)

    def test_fallback_heuristics_low_dim(self, temp_model_path, temp_meta_dataset):
        selector = AlgorithmSelector(model_path=temp_model_path)
        selector.meta_manager = MetaDatasetManager(filepath=temp_meta_dataset)

        features = {
            "n_dimensions": 5,
            "evaluation_budget": 30,
            "budget_per_dim": 6.0,
            "continuous_ratio": 1.0,
            "search_space_volume": 10.0,
            "is_noisy": False
        }

        result = selector.predict(features)

        assert result["recommended_algorithm"] == "vanilla-bo"
        assert result["model_type"] == "domain_rule_fallback"
        assert result["confidence_score"] > 0.8
        assert "vanilla-bo" in result["ranked_algorithms"]

    def test_fallback_heuristics_medium_dim(self, temp_model_path, temp_meta_dataset):
        selector = AlgorithmSelector(model_path=temp_model_path)
        selector.meta_manager = MetaDatasetManager(filepath=temp_meta_dataset)

        features = {
            "n_dimensions": 15,
            "evaluation_budget": 50,
            "budget_per_dim": 3.33,
            "continuous_ratio": 1.0,
            "search_space_volume": 30.0,
            "is_noisy": False
        }

        result = selector.predict(features)

        assert result["recommended_algorithm"] == "turbo"
        assert result["model_type"] == "domain_rule_fallback"

    def test_fallback_heuristics_high_dim(self, temp_model_path, temp_meta_dataset):
        selector = AlgorithmSelector(model_path=temp_model_path)
        selector.meta_manager = MetaDatasetManager(filepath=temp_meta_dataset)

        features = {
            "n_dimensions": 50,
            "evaluation_budget": 100,
            "budget_per_dim": 2.0,
            "continuous_ratio": 1.0,
            "search_space_volume": 80.0,
            "is_noisy": False
        }

        result = selector.predict(features)

        assert result["recommended_algorithm"] == "saasbo"

    def test_fallback_heuristics_ultra_high_dim(self, temp_model_path, temp_meta_dataset):
        selector = AlgorithmSelector(model_path=temp_model_path)
        selector.meta_manager = MetaDatasetManager(filepath=temp_meta_dataset)

        features = {
            "n_dimensions": 200,
            "evaluation_budget": 150,
            "budget_per_dim": 0.75,
            "continuous_ratio": 1.0,
            "search_space_volume": 200.0,
            "is_noisy": False
        }

        result = selector.predict(features)

        assert result["recommended_algorithm"] == "baxus"

    def test_train_requires_sufficient_data(self, temp_model_path, temp_meta_dataset):
        selector = AlgorithmSelector(model_path=temp_model_path)
        selector.meta_manager = MetaDatasetManager(filepath=temp_meta_dataset)

        # Empty dataset
        result = selector.train()
        assert result["status"] == "error"
        assert "empty" in result["message"].lower()

    def test_train_with_sufficient_data(self, temp_model_path, temp_meta_dataset):
        selector = AlgorithmSelector(model_path=temp_model_path)
        selector.meta_manager = MetaDatasetManager(filepath=temp_meta_dataset)

        # Create enough data to train
        for i in range(10):
            features = {
                "n_dimensions": np.random.randint(2, 20),
                "n_continuous": np.random.randint(2, 20),
                "n_integer": 0,
                "n_categorical": 0,
                "continuous_ratio": 1.0,
                "search_space_volume": 20.0,
                "evaluation_budget": 50,
                "budget_per_dim": 5.0,
                "is_noisy": False,
                "dimensionality_class": "medium"
            }
            results = [
                {"algorithm_id": "vanilla-bo", "best_value": np.random.rand(), "wall_clock_time": 1.0, "n_evaluations": 50},
                {"algorithm_id": "turbo", "best_value": np.random.rand(), "wall_clock_time": 1.5, "n_evaluations": 50},
                {"algorithm_id": "hebo", "best_value": np.random.rand(), "wall_clock_time": 2.0, "n_evaluations": 50},
            ]
            selector.meta_manager.record_benchmark_run(features, results, f"prob_{i}", f"Problem {i}")

        result = selector.train()

        assert result["status"] == "success"
        assert result["samples_trained"] > 0
        assert "feature_importances" in result
        assert len(result["feature_importances"]) == len(FEATURE_COLS)

    def test_model_based_prediction_after_training(self, temp_model_path, temp_meta_dataset):
        selector = AlgorithmSelector(model_path=temp_model_path)
        selector.meta_manager = MetaDatasetManager(filepath=temp_meta_dataset)

        # Train with some data
        for i in range(15):
            features = {
                "n_dimensions": 5,
                "n_continuous": 5,
                "n_integer": 0,
                "n_categorical": 0,
                "continuous_ratio": 1.0,
                "search_space_volume": 10.0,
                "evaluation_budget": 30,
                "budget_per_dim": 6.0,
                "is_noisy": False,
                "dimensionality_class": "low"
            }
            # Make vanilla-bo consistently best for low dim
            results = [
                {"algorithm_id": "vanilla-bo", "best_value": 0.01, "wall_clock_time": 1.0, "n_evaluations": 30},
                {"algorithm_id": "turbo", "best_value": 0.1, "wall_clock_time": 1.5, "n_evaluations": 30},
                {"algorithm_id": "hebo", "best_value": 0.2, "wall_clock_time": 2.0, "n_evaluations": 30},
            ]
            selector.meta_manager.record_benchmark_run(features, results, f"prob_{i}", f"Problem {i}")

        selector.train()

        # Now predict - should use trained model
        features = {
            "n_dimensions": 5,
            "evaluation_budget": 30,
            "budget_per_dim": 6.0,
            "continuous_ratio": 1.0,
            "search_space_volume": 10.0,
            "is_noisy": False
        }

        result = selector.predict(features)

        assert result["model_type"] == "random_forest_meta_model"
        assert "recommended_algorithm" in result
        assert "confidence_score" in result
        assert "ranked_algorithms" in result