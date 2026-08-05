import sys
import os

# Add engine to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
import numpy as np

# Seed for reproducible tests
np.random.seed(42)


@pytest.fixture
def simple_objective():
    """A simple quadratic objective function for testing."""
    def objective(x: np.ndarray) -> float:
        return float(np.sum(x**2))
    return objective


@pytest.fixture
def rosenbrock_objective():
    """Rosenbrock function for testing."""
    def objective(x: np.ndarray) -> float:
        return float(np.sum(100.0 * (x[1:] - x[:-1]**2)**2 + (1 - x[:-1])**2))
    return objective


@pytest.fixture
def bounds():
    """Standard bounds for testing."""
    return (-5.0, 5.0)


@pytest.fixture
def high_dim_bounds():
    """High dimensional bounds for testing."""
    return (-10.0, 10.0)