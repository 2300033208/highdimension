import numpy as np
from typing import Callable, Tuple
from scipy.stats import norm
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import Matern, ConstantKernel as C
from .base import BaseOptimizer

class VanillaBO(BaseOptimizer):
    """
    Standard Gaussian Process Bayesian Optimization with Expected Improvement (EI).
    """
    def __init__(self, n_dimensions: int, bounds: Tuple[float, float], evaluation_budget: int, n_init: int = 5):
        super().__init__(n_dimensions, bounds, evaluation_budget)
        self.n_init = min(n_init, max(2, evaluation_budget // 3))

    def _expected_improvement(self, X: np.ndarray, model: GaussianProcessRegressor, y_best: float, xi: float = 0.01) -> np.ndarray:
        mu, sigma = model.predict(X, return_std=True)
        sigma = np.maximum(sigma, 1e-9)
        # Minimize objective: improvement is y_best - mu
        improvement = y_best - mu - xi
        z = improvement / sigma
        ei = improvement * norm.cdf(z) + sigma * norm.pdf(z)
        return ei

    def optimize(self, objective_function: Callable[[np.ndarray], float]) -> None:
        low, high = self.bounds
        X_history = []
        y_history = []

        # 1. Initial random exploration
        for _ in range(self.n_init):
            x = np.random.uniform(low, high, size=self.n_dimensions)
            y = objective_function(x)
            self._update_progress(y, x)
            X_history.append(x)
            y_history.append(y)

        # 2. Sequential BO with GP
        remaining = self.evaluation_budget - self.n_init
        for _ in range(remaining):
            X_arr = np.array(X_history)
            y_arr = np.array(y_history)

            kernel = C(1.0, (1e-3, 1e3)) * Matern(length_scale=np.ones(self.n_dimensions), nu=2.5)
            gp = GaussianProcessRegressor(kernel=kernel, n_restarts_optimizer=2, alpha=1e-6, normalize_y=True)
            
            try:
                gp.fit(X_arr, y_arr)
            except Exception:
                # Fallback if matrix inversion fails
                gp = GaussianProcessRegressor(normalize_y=True)
                gp.fit(X_arr, y_arr)

            # Sample candidates to optimize acquisition function
            n_candidates = 2000
            candidates = np.random.uniform(low, high, size=(n_candidates, self.n_dimensions))
            ei = self._expected_improvement(candidates, gp, self.best_value)

            best_idx = np.argmax(ei)
            next_x = candidates[best_idx]

            # Evaluate next point
            next_y = objective_function(next_x)
            self._update_progress(next_y, next_x)
            X_history.append(next_x)
            y_history.append(next_y)
