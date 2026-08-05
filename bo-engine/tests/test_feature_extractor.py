import numpy as np
import pandas as pd
import pytest
from engine.feature_extractor import extract_features_from_spec, extract_features_from_dataset


class TestExtractFeaturesFromSpec:
    """Tests for extract_features_from_spec function."""

    def test_basic_extraction(self):
        features = extract_features_from_spec(
            n_dimensions=10,
            n_continuous=8,
            n_integer=2,
            n_categorical=0,
            bounds_range=10.0,
            evaluation_budget=50,
            is_noisy=False
        )

        assert features["n_dimensions"] == 10
        assert features["n_continuous"] == 8
        assert features["n_integer"] == 2
        assert features["n_categorical"] == 0
        assert features["continuous_ratio"] == 0.8
        assert features["categorical_ratio"] == 0.0
        assert features["integer_ratio"] == 0.2
        assert features["evaluation_budget"] == 50
        assert features["budget_per_dim"] == 5.0
        assert features["is_noisy"] == False

    def test_dimensionality_classes(self):
        # Low dimension
        f = extract_features_from_spec(n_dimensions=3, n_continuous=3, n_integer=0, n_categorical=0, evaluation_budget=10)
        assert f["dimensionality_class"] == "low"

        # Medium dimension
        f = extract_features_from_spec(n_dimensions=10, n_continuous=10, n_integer=0, n_categorical=0, evaluation_budget=50)
        assert f["dimensionality_class"] == "medium"

        # High dimension
        f = extract_features_from_spec(n_dimensions=50, n_continuous=50, n_integer=0, n_categorical=0, evaluation_budget=100)
        assert f["dimensionality_class"] == "high"

        # Extreme dimension
        f = extract_features_from_spec(n_dimensions=200, n_continuous=200, n_integer=0, n_categorical=0, evaluation_budget=200)
        assert f["dimensionality_class"] == "extreme"

    def test_search_space_volume(self):
        features = extract_features_from_spec(
            n_dimensions=5,
            n_continuous=5,
            n_integer=0,
            n_categorical=0,
            bounds_range=10.0,
            evaluation_budget=50
        )
        # log_volume = 5 * log(10) ≈ 5 * 2.3026 = 11.513
        assert abs(features["search_space_volume"] - 11.5129) < 0.01

    def test_handles_zero_bounds_range(self):
        features = extract_features_from_spec(
            n_dimensions=5,
            n_continuous=5,
            n_integer=0,
            n_categorical=0,
            bounds_range=0.0,
            evaluation_budget=50
        )
        # Should not crash and should handle gracefully
        assert features["search_space_volume"] < 0  # log(1e-4) is negative


class TestExtractFeaturesFromDataset:
    """Tests for extract_features_from_dataset function."""

    def test_basic_dataframe_extraction(self):
        df = pd.DataFrame({
            "x1": [1.0, 2.0, 3.0],
            "x2": [4.0, 5.0, 6.0],
            "x3": [1, 2, 3],  # integer
            "target": [10.0, 20.0, 30.0]
        })

        features = extract_features_from_dataset(df, target_column="target")

        assert features["n_dimensions"] == 3
        assert features["n_continuous"] == 2
        assert features["n_integer"] == 1
        assert features["n_categorical"] == 0

    def test_default_target_column(self):
        df = pd.DataFrame({
            "x1": [1.0, 2.0],
            "x2": [3.0, 4.0],
            "y": [10.0, 20.0]
        })

        features = extract_features_from_dataset(df)

        # Should use last column as target by default
        assert features["n_dimensions"] == 2

    def test_categorical_detection(self):
        df = pd.DataFrame({
            "x1": [1.0, 2.0, 3.0],
            "x2": ["a", "b", "c"],
            "target": [10.0, 20.0, 30.0]
        })

        features = extract_features_from_dataset(df, target_column="target")

        assert features["n_categorical"] == 1
        assert features["n_continuous"] == 1