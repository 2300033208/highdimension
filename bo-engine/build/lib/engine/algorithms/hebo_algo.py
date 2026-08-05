import numpy as np
from typing import Callable, Tuple
from scipy.stats import norm
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import Matern, WhiteKernel, ConstantKernel as C
from .base import BaseOptimizer

class HEBOOptimizer(BaseOptimizer):
    """
    Heteroscedastic Evolutionary Bayesian Optimization (HEBO).
    Uses heteroscedastic noise modeling with Multi-Objective Acquisition Ensembles
    (combining Expected Improvement, Lower Confidence Bound, and Probability of Improvement).
    """
    def __init__(self, n_dimensions: int, bounds: Tuple[float, float], evaluation_budget: int, n_init: int = 5):
        super().__init__(n_dimensions, bounds, evaluation_budget)
        self.n_init = min(n_init, max(3, evaluation_budget // 3))

    def _power_transform(self, y: np.ndarray) -> np.ndarray:
        """Non-linear output warping to handle skewed response surfaces."""
        y_norm = (y - np.mean(y)) / (np.std(y) + 1e-8)
        # Sinh-Arcsinh or soft sign transform
        return np.arcsinh(y_norm)

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

        # 2. Sequential HEBO loop with MACE (Multi-Acquisition Candidate Ensemble)
        remaining = self.evaluation_budget - self.n_init
        for _ in range(remaining):
            X_arr = np.array(X_history)
            y_arr = np.array(y_history)

            # Warped targets
            y_warped = self._power_transform(y_arr)

            # Heteroscedastic noise kernel: Matern + WhiteKernel
            kernel = C(1.0) * Matern(length_scale=np.ones(self.n_dimensions), nu=2.5) + WhiteKernel(noise_level=1e-3)
            gp = GaussianProcessRegressor(kernel=kernel, normalize_y=True)
            try:
                gp.fit(X_arr, y_warped)
            except Exception:
                gp = GaussianProcessRegressor(normalize_y=True)
                gp.fit(X_arr, y_warped)

            # Sample candidates
            n_candidates = 2000
            candidates = np.random.uniform(low, high, size=(n_candidates, self.n_dimensions))
            mu, sigma = gp.predict(candidates, return_std=True)
            sigma = np.maximum(sigma, 1e-9)

            # MACE objectives
            best_warped = np.min(y_warped)
            # 1. Lower Confidence Bound (exploration)
            lcb = mu - 2.0 * sigma
            # 2. Expected Improvement (balanced)
            imp = best_warped - mu
            z = imp / sigma
            ei = -(imp * norm.cdf(z) + sigma * norm.pdf(z))
            # 3. Probability of Improvement (exploitation)
            pi = -norm.cdf(z)

            # Weighted Pareto rank combination (MACE)
            combined_rank = (np.argsort(np.argsort(lcb)) + 
                             np.argsort(np.argsort(ei)) + 
                             np.argsort(np.argsort(pi)))

            best_idx = np.argmin(combined_rank)
            next_x = candidates[best_idx]

            # Evaluate next point
            next_y = objective_function(next_x)
            self._update_progress(next_y, next_x)
            X_history.append(next_x)
            y_history.append(next_y)
