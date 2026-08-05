import numpy as np
import pytest
from engine.algorithms.base import BaseOptimizer


class ConcreteOptimizer(BaseOptimizer):
    """Concrete implementation for testing base class."""
    def optimize(self, objective_function):
        # Simple random search for testing
        low, high = self.bounds
        for _ in range(self.evaluation_budget):
            x = np.random.uniform(low, high, size=self.n_dimensions)
            y = objective_function(x)
            self._update_progress(y, x)


class TestBaseOptimizer:
    """Tests for the BaseOptimizer abstract base class."""

    def test_initialization(self):
        optimizer = ConcreteOptimizer(n_dimensions=5, bounds=(-5.0, 5.0), evaluation_budget=10)
        assert optimizer.n_dimensions == 5
        assert optimizer.bounds == (-5.0, 5.0)
        assert optimizer.evaluation_budget == 10
        assert optimizer.best_value == float('inf')
        assert optimizer.convergence_curve == []
        assert optimizer.n_evaluations == 0

    def test_update_progress(self, simple_objective):
        optimizer = ConcreteOptimizer(n_dimensions=3, bounds=(-5.0, 5.0), evaluation_budget=10)

        # First evaluation
        x1 = np.array([1.0, 2.0, 3.0])
        y1 = simple_objective(x1)  # 1 + 4 + 9 = 14
        optimizer._update_progress(y1, x1)

        assert optimizer.best_value == 14.0
        assert optimizer.convergence_curve == [14.0]
        assert optimizer.n_evaluations == 1
        assert optimizer.final_incumbent == {"x0": 1.0, "x1": 2.0, "x2": 3.0}

        # Better evaluation
        x2 = np.array([0.5, 0.5, 0.5])
        y2 = simple_objective(x2)  # 0.25 + 0.25 + 0.25 = 0.75
        optimizer._update_progress(y2, x2)

        assert optimizer.best_value == 0.75
        assert optimizer.convergence_curve == [14.0, 0.75]
        assert optimizer.n_evaluations == 2
        assert optimizer.final_incumbent == {"x0": 0.5, "x1": 0.5, "x2": 0.5}

        # Worse evaluation - best_value should not change
        x3 = np.array([2.0, 2.0, 2.0])
        y3 = simple_objective(x3)  # 12
        optimizer._update_progress(y3, x3)

        assert optimizer.best_value == 0.75
        assert optimizer.convergence_curve == [14.0, 0.75, 0.75]
        assert optimizer.n_evaluations == 3

    def test_run_returns_expected_structure(self, simple_objective):
        optimizer = ConcreteOptimizer(n_dimensions=2, bounds=(-5.0, 5.0), evaluation_budget=5)
        result = optimizer.run(simple_objective)

        assert "best_value" in result
        assert "convergence_curve" in result
        assert "wall_clock_time" in result
        assert "n_evaluations" in result
        assert "final_incumbent" in result

        assert result["n_evaluations"] == 5
        assert len(result["convergence_curve"]) == 5
        assert result["wall_clock_time"] >= 0
        assert isinstance(result["final_incumbent"], dict)