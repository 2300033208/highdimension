import numpy as np
from typing import Callable, Tuple
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import Matern, ConstantKernel as C
from .base import BaseOptimizer

class BAxUSOptimizer(BaseOptimizer):
    """
    BAxUS (Bayesian Optimization with Adaptively Expanding Subspaces).
    Maps high-dimensional input space to an adaptively expanding low-dimensional
    target subspace using hash embeddings (CountSketch projection).
    """
    def __init__(self, n_dimensions: int, bounds: Tuple[float, float], evaluation_budget: int, n_init: int = 5):
        super().__init__(n_dimensions, bounds, evaluation_budget)
        self.n_init = min(n_init, max(3, evaluation_budget // 3))
        self.d_target = min(2, n_dimensions)
        self.stagnation_counter = 0
        self.stagnation_limit = 4
        self._init_embedding()

    def _init_embedding(self):
        """Create hash projection matrix from d_dimensions to d_target."""
        self.h = np.random.randint(0, self.d_target, size=self.n_dimensions)
        self.s = np.random.choice([-1.0, 1.0], size=self.n_dimensions)

    def _project_to_original(self, z: np.ndarray) -> np.ndarray:
        """Projects target space point z (size d_target) to original space x (size n_dimensions)."""
        x = np.zeros(self.n_dimensions)
        for i in range(self.n_dimensions):
            x[i] = self.s[i] * z[self.h[i]]
        return np.clip(x, self.bounds[0], self.bounds[1])

    def _expand_subspace(self):
        """Doubles target dimensionality if not yet reaching original dimension."""
        if self.d_target < self.n_dimensions:
            self.d_target = min(self.d_target * 2, self.n_dimensions)
            self._init_embedding()
            self.stagnation_counter = 0

    def optimize(self, objective_function: Callable[[np.ndarray], float]) -> None:
        low, high = self.bounds
        X_target = []
        y_history = []
        prev_best = float('inf')

        # 1. Initial random exploration in target space
        for _ in range(self.n_init):
            z = np.random.uniform(low, high, size=self.d_target)
            x = self._project_to_original(z)
            y = objective_function(x)
            self._update_progress(y, x)
            X_target.append(z)
            y_history.append(y)

        # 2. Sequential BAxUS optimization
        remaining = self.evaluation_budget - self.n_init
        for _ in range(remaining):
            # Check stagnation and expand subspace if stuck
            if self.best_value < prev_best - 1e-4:
                self.stagnation_counter = 0
                prev_best = self.best_value
            else:
                self.stagnation_counter += 1
                if self.stagnation_counter >= self.stagnation_limit:
                    self._expand_subspace()
                    # Reset target history projection to match new d_target
                    X_target = [np.random.uniform(low, high, size=self.d_target) for _ in range(len(y_history))]

            X_arr = np.array(X_target)
            y_arr = np.array(y_history)

            kernel = C(1.0) * Matern(length_scale=np.ones(self.d_target), nu=2.5)
            gp = GaussianProcessRegressor(kernel=kernel, alpha=1e-5, normalize_y=True)
            try:
                gp.fit(X_arr, y_arr)
            except Exception:
                gp = GaussianProcessRegressor(normalize_y=True)
                gp.fit(X_arr, y_arr)

            # Sample candidates in compact target space
            n_candidates = 1500
            candidates = np.random.uniform(low, high, size=(n_candidates, self.d_target))
            mu, sigma = gp.predict(candidates, return_std=True)
            lcb = mu - 1.96 * sigma
            next_z = candidates[np.argmin(lcb)]

            # Map to original space and evaluate
            next_x = self._project_to_original(next_z)
            next_y = objective_function(next_x)

            self._update_progress(next_y, next_x)
            X_target.append(next_z)
            y_history.append(next_y)
