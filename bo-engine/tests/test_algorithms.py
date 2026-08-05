import numpy as np
import pytest
from engine.algorithms import AVAILABLE_ALGORITHMS, ALGORITHM_METADATA
from engine.algorithms.base import BaseOptimizer


class TestAlgorithmsRegistry:
    """Tests for the algorithm registry."""

    def test_all_algorithms_registered(self):
        expected = ["random-search", "optuna", "vanilla-bo", "turbo", "saasbo", "baxus", "hebo"]
        for name in expected:
            assert name in AVAILABLE_ALGORITHMS
            assert issubclass(AVAILABLE_ALGORITHMS[name], BaseOptimizer)

    def test_all_algorithms_have_metadata(self):
        for name in AVAILABLE_ALGORITHMS:
            assert name in ALGORITHM_METADATA
            meta = ALGORITHM_METADATA[name]
            assert "name" in meta
            assert "family" in meta
            assert "bestFor" in meta
            assert "complexity" in meta


class TestVanillaBO:
    """Tests for VanillaBO algorithm."""

    def test_vanilla_bo_converges_on_sphere(self, bounds):
        from engine.algorithms.vanilla_bo import VanillaBO

        optimizer = VanillaBO(n_dimensions=2, bounds=bounds, evaluation_budget=30, n_init=5)

        def sphere(x):
            return float(np.sum(x**2))

        result = optimizer.run(sphere)

        # Should find something close to 0
        assert result["best_value"] < 1.0
        assert result["n_evaluations"] == 30
        assert len(result["convergence_curve"]) == 30

    def test_vanilla_bo_converges_on_rosenbrock(self, bounds):
        from engine.algorithms.vanilla_bo import VanillaBO

        optimizer = VanillaBO(n_dimensions=2, bounds=bounds, evaluation_budget=30, n_init=5)

        def rosenbrock(x):
            return float(np.sum(100.0 * (x[1:] - x[:-1]**2)**2 + (1 - x[:-1])**2))

        result = optimizer.run(rosenbrock)

        # Should find reasonable value
        assert result["best_value"] < 10.0
        assert result["n_evaluations"] == 30


class TestTuRBO:
    """Tests for TuRBO algorithm."""

    def test_turbo_converges_on_sphere(self, bounds):
        from engine.algorithms.turbo import TuRBOOptimizer

        optimizer = TuRBOOptimizer(n_dimensions=3, bounds=bounds, evaluation_budget=25, n_init=5)

        def sphere(x):
            return float(np.sum(x**2))

        result = optimizer.run(sphere)

        assert result["best_value"] < 1.0
        assert result["n_evaluations"] == 25
        assert len(result["convergence_curve"]) == 25

    def test_turbo_trust_region_adaptation(self, bounds):
        from engine.algorithms.turbo import TuRBOOptimizer

        optimizer = TuRBOOptimizer(n_dimensions=2, bounds=bounds, evaluation_budget=15, n_init=3)

        def simple(x):
            return float(x[0]**2 + x[1]**2)

        optimizer.run(simple)

        # Trust region length should have been updated
        assert optimizer.length <= optimizer.length_max
        assert optimizer.length >= optimizer.length_min


class TestSAASBO:
    """Tests for SAASBO algorithm."""

    def test_saasbo_converges_on_sphere(self, bounds):
        from engine.algorithms.saasbo import SAASBOOptimizer

        optimizer = SAASBOOptimizer(n_dimensions=5, bounds=bounds, evaluation_budget=25, n_init=5)

        def sphere(x):
            return float(np.sum(x**2))

        result = optimizer.run(sphere)

        assert result["best_value"] < 20.0
        assert result["n_evaluations"] == 25

    def test_saasbo_active_dimension_estimation(self, bounds):
        from engine.algorithms.saasbo import SAASBOOptimizer

        optimizer = SAASBOOptimizer(n_dimensions=10, bounds=bounds, evaluation_budget=20, n_init=5)

        def sphere(x):
            return float(np.sum(x**2))

        optimizer.run(sphere)

        # max_active_dims should be sqrt(10) ≈ 3
        assert optimizer.max_active_dims >= 3
        assert optimizer.max_active_dims <= 10


class TestBAxUS:
    """Tests for BAxUS algorithm."""

    def test_baxus_converges_on_sphere(self, bounds):
        from engine.algorithms.baxus import BAxUSOptimizer

        optimizer = BAxUSOptimizer(n_dimensions=10, bounds=bounds, evaluation_budget=25, n_init=5)

        def sphere(x):
            return float(np.sum(x**2))

        result = optimizer.run(sphere)

        assert result["best_value"] < 20.0  # BAxUS with projection may not be as precise
        assert result["n_evaluations"] == 25

    def test_baxus_subspace_expansion(self, bounds):
        from engine.algorithms.baxus import BAxUSOptimizer

        optimizer = BAxUSOptimizer(n_dimensions=8, bounds=bounds, evaluation_budget=15, n_init=3)

        def sphere(x):
            return float(np.sum(x**2))

        initial_target_dim = optimizer.d_target
        optimizer.run(sphere)

        # Target dimension might expand
        assert optimizer.d_target >= initial_target_dim


class TestHEBO:
    """Tests for HEBO algorithm."""

    def test_hebo_converges_on_sphere(self, bounds):
        from engine.algorithms.hebo_algo import HEBOOptimizer

        optimizer = HEBOOptimizer(n_dimensions=3, bounds=bounds, evaluation_budget=25, n_init=5)

        def sphere(x):
            return float(np.sum(x**2))

        result = optimizer.run(sphere)

        assert result["best_value"] < 1.0
        assert result["n_evaluations"] == 25

    def test_hebo_power_transform(self, bounds):
        from engine.algorithms.hebo_algo import HEBOOptimizer

        optimizer = HEBOOptimizer(n_dimensions=2, bounds=bounds, evaluation_budget=20, n_init=5)

        y = np.array([1.0, 2.0, 3.0, 4.0, 5.0])
        transformed = optimizer._power_transform(y)

        assert transformed.shape == y.shape
        assert not np.any(np.isnan(transformed))


class TestOptuna:
    """Tests for Optuna (TPE) algorithm."""

    def test_optuna_converges_on_sphere(self, bounds):
        from engine.algorithms.optuna_algo import OptunaOptimizer

        optimizer = OptunaOptimizer(n_dimensions=2, bounds=bounds, evaluation_budget=20)

        def sphere(x):
            return float(np.sum(x**2))

        result = optimizer.run(sphere)

        assert result["best_value"] < 1.0
        assert result["n_evaluations"] == 20


class TestRandomSearch:
    """Tests for Random Search baseline."""

    def test_random_search_runs(self, bounds):
        from engine.algorithms.random_search import RandomSearch

        optimizer = RandomSearch(n_dimensions=3, bounds=bounds, evaluation_budget=15)

        def sphere(x):
            return float(np.sum(x**2))

        result = optimizer.run(sphere)

        assert result["n_evaluations"] == 15
        assert len(result["convergence_curve"]) == 15
        assert result["best_value"] >= 0


@pytest.mark.parametrize("algo_name", ["vanilla-bo", "turbo", "saasbo", "baxus", "hebo", "optuna", "random-search"])
def test_all_algorithms_run_on_simple_problem(algo_name, bounds):
    """Parametrized test to ensure all algorithms can run on a simple problem."""
    algo_cls = AVAILABLE_ALGORITHMS[algo_name]

    # Use appropriate params for each algorithm
    if algo_name == "optuna":
        optimizer = algo_cls(n_dimensions=2, bounds=bounds, evaluation_budget=15)
    elif algo_name == "random-search":
        optimizer = algo_cls(n_dimensions=2, bounds=bounds, evaluation_budget=15)
    else:
        optimizer = algo_cls(n_dimensions=2, bounds=bounds, evaluation_budget=15, n_init=3)

    def sphere(x):
        return float(np.sum(x**2))

    result = optimizer.run(sphere)

    assert result["n_evaluations"] == 15
    assert "best_value" in result
    assert "wall_clock_time" in result
    assert result["wall_clock_time"] >= 0