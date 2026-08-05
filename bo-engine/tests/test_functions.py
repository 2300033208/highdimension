import numpy as np
import pytest
from engine.test_functions import BENCHMARK_FUNCTIONS, get_test_function
from engine.test_functions.ackley import ackley_function
from engine.test_functions.rosenbrock import rosenbrock_function
from engine.test_functions.sphere import sphere_function
from engine.test_functions.rastrigin import rastrigin_function
from engine.test_functions.levy import levy_function


class TestSphereFunction:
    """Tests for the Sphere function."""

    def test_optimum_at_zero(self):
        x = np.zeros(5)
        assert sphere_function(x) == 0.0

    def test_positive_values(self):
        x = np.array([1.0, 2.0, 3.0])
        assert sphere_function(x) == 14.0  # 1 + 4 + 9

    def test_negative_values(self):
        x = np.array([-1.0, -2.0])
        assert sphere_function(x) == 5.0  # 1 + 4


class TestRosenbrockFunction:
    """Tests for the Rosenbrock function."""

    def test_optimum_at_ones(self):
        x = np.ones(5)
        assert rosenbrock_function(x) == 0.0

    def test_simple_case(self):
        # f([1, 1]) = 0
        # f([0, 0]) = 100*(0-0)^2 + (1-0)^2 = 1
        x = np.array([0.0, 0.0])
        assert rosenbrock_function(x) == 1.0


class TestAckleyFunction:
    """Tests for the Ackley function."""

    def test_optimum_at_zero(self):
        x = np.zeros(5)
        # Ackley global minimum is at x=0 with value 0
        val = ackley_function(x)
        assert abs(val - 0.0) < 1e-10


class TestRastriginFunction:
    """Tests for the Rastrigin function."""

    def test_optimum_at_zero(self):
        x = np.zeros(5)
        assert rastrigin_function(x) == 0.0

    def test_regular_points(self):
        x = np.array([1.0, 1.0, 1.0])
        # Rastrigin: 10*n + sum(xi^2 - 10*cos(2*pi*xi))
        # For xi=1: 1 - 10*cos(2*pi) = 1 - 10 = -9
        # Sum = -27, + 10*3 = 30 => 3
        val = rastrigin_function(x)
        assert abs(val - 3.0) < 1e-10


class TestLevyFunction:
    """Tests for the Levy function."""

    def test_optimum_at_ones(self):
        x = np.ones(5)
        val = levy_function(x)
        assert abs(val - 0.0) < 1e-10


class TestBenchmarkFunctionsRegistry:
    """Tests for the benchmark function registry."""

    def test_all_functions_registered(self):
        expected = ["ackley", "rosenbrock", "sphere", "rastrigin", "levy"]
        for name in expected:
            assert name in BENCHMARK_FUNCTIONS
            assert "fn" in BENCHMARK_FUNCTIONS[name]
            assert "default_bounds" in BENCHMARK_FUNCTIONS[name]
            assert "optimum" in BENCHMARK_FUNCTIONS[name]
            assert "name" in BENCHMARK_FUNCTIONS[name]

    def test_get_test_function(self):
        fn_info = get_test_function("ackley")
        assert fn_info["fn"] is ackley_function

    def test_get_test_function_case_insensitive(self):
        fn_info = get_test_function("ACKLEY")
        assert fn_info["fn"] is ackley_function

    def test_get_test_function_fallback(self):
        fn_info = get_test_function("nonexistent")
        assert fn_info["fn"] is ackley_function