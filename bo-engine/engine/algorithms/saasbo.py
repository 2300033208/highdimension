import numpy as np
from typing import Callable, Tuple
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import Matern, ConstantKernel as C
from sklearn.feature_selection import mutual_info_regression
from .base import BaseOptimizer

class SAASBOOptimizer(BaseOptimizer):
    """
    Sparse Axis-Aligned Subspace Bayesian Optimization (SAASBO).
    Identifies active coordinates in high-dimensional spaces using sparsity-inducing
    relevance priors and concentrates Gaussian Process modeling on the active subspace.
    """
    def __init__(self, n_dimensions: int, bounds: Tuple[float, float], evaluation_budget: int, n_init: int = 6):
        super().__init__(n_dimensions, bounds, evaluation_budget)
        self.n_init = min(n_init, max(3, evaluation_budget // 3))
        # Target active subspace dimension
        self.max_active_dims = min(max(3, int(np.sqrt(n_dimensions))), n_dimensions)

    def _estimate_active_dimensions(self, X: np.ndarray, y: np.ndarray) -> np.ndarray:
        """Estimate feature importance using mutual information / variance to select active subspace."""
        if self.n_dimensions <= self.max_active_dims or len(y) < 4:
            return np.arange(self.n_dimensions)

        try:
            mi = mutual_info_regression(X, y, random_state=42)
            # Add small epsilon to avoid exact zero
            scores = mi + 1e-4
            top_indices = np.argsort(scores)[::-1][:self.max_active_dims]
            return np.sort(top_indices)
        except Exception:
            return np.arange(min(self.max_active_dims, self.n_dimensions))

    def optimize(self, objective_function: Callable[[np.ndarray], float]) -> None:
        low, high = self.bounds
        X_history = []
        y_history = []
        best_x = None

        # 1. Initial random exploration
        for _ in range(self.n_init):
            x = np.random.uniform(low, high, size=self.n_dimensions)
            y = objective_function(x)
            if y < self.best_value:
                best_x = x.copy()
            self._update_progress(y, x)
            X_history.append(x)
            y_history.append(y)

        # 2. Sequential SAASBO loop
        remaining = self.evaluation_budget - self.n_init
        for _ in range(remaining):
            X_arr = np.array(X_history)
            y_arr = np.array(y_history)

            # Discover active subspace
            active_dims = self._estimate_active_dimensions(X_arr, y_arr)
            X_sub = X_arr[:, active_dims]

            # Fit GP on the sparse active subspace
            kernel = C(1.0) * Matern(length_scale=np.ones(len(active_dims)), nu=2.5)
            gp = GaussianProcessRegressor(kernel=kernel, alpha=1e-5, normalize_y=True)
            try:
                gp.fit(X_sub, y_arr)
            except Exception:
                gp = GaussianProcessRegressor(normalize_y=True)
                gp.fit(X_sub, y_arr)

            # Generate candidate points: keep inactive dimensions near best_x or randomly perturb
            n_candidates = 2000
            candidates = np.tile(best_x, (n_candidates, 1))

            # Sample active dimensions across full range
            candidates[:, active_dims] = np.random.uniform(low, high, size=(n_candidates, len(active_dims)))
            
            # Predict on active subspace
            mu, sigma = gp.predict(candidates[:, active_dims], return_std=True)
            # Lower confidence bound
            lcb = mu - 2.0 * sigma
            next_x = candidates[np.argmin(lcb)]

            # Evaluate next point
            next_y = objective_function(next_x)
            if next_y < self.best_value:
                best_x = next_x.copy()

            self._update_progress(next_y, next_x)
            X_history.append(next_x)
            y_history.append(next_y)
