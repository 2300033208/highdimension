import numpy as np
from typing import Callable, Tuple
from scipy.stats import norm
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import Matern, ConstantKernel as C
from .base import BaseOptimizer

class TuRBOOptimizer(BaseOptimizer):
    """
    Trust Region Bayesian Optimization (TuRBO-1).
    Maintains a local trust region around the best point, dynamically
    expanding or shrinking based on optimization success/failure.
    """
    def __init__(self, n_dimensions: int, bounds: Tuple[float, float], evaluation_budget: int, n_init: int = 5):
        super().__init__(n_dimensions, bounds, evaluation_budget)
        self.n_init = min(n_init, max(2, evaluation_budget // 3))
        
        # Trust region parameters
        self.length = 0.8
        self.length_min = 0.5 ** 7
        self.length_max = 1.6
        self.success_count = 0
        self.failure_count = 0
        self.success_tolerance = 3
        self.failure_tolerance = max(4, n_dimensions)

    def _update_tr_state(self, current_best: float, prev_best: float):
        if current_best < prev_best - 1e-4:
            self.success_count += 1
            self.failure_count = 0
        else:
            self.success_count = 0
            self.failure_count += 1

        if self.success_count == self.success_tolerance:
            self.length = min(self.length * 2.0, self.length_max)
            self.success_count = 0
        elif self.failure_count == self.failure_tolerance:
            self.length = self.length / 2.0
            self.failure_count = 0

    def optimize(self, objective_function: Callable[[np.ndarray], float]) -> None:
        low, high = self.bounds
        scale = high - low
        X_history = []
        y_history = []
        best_x = None

        # 1. Initial random points
        for _ in range(self.n_init):
            x = np.random.uniform(low, high, size=self.n_dimensions)
            y = objective_function(x)
            if y < self.best_value:
                best_x = x.copy()
            self._update_progress(y, x)
            X_history.append(x)
            y_history.append(y)

        # 2. Sequential TuRBO loop
        remaining = self.evaluation_budget - self.n_init
        for _ in range(remaining):
            prev_best = self.best_value

            # If trust region becomes too small, restart it
            if self.length < self.length_min:
                self.length = 0.8
                self.failure_count = 0
                self.success_count = 0

            # Define trust region bounds around current best_x
            tr_lb = np.clip(best_x - 0.5 * self.length * scale, low, high)
            tr_ub = np.clip(best_x + 0.5 * self.length * scale, low, high)

            X_arr = np.array(X_history)
            y_arr = np.array(y_history)

            kernel = C(1.0) * Matern(length_scale=np.ones(self.n_dimensions), nu=2.5)
            gp = GaussianProcessRegressor(kernel=kernel, alpha=1e-6, normalize_y=True)
            try:
                gp.fit(X_arr, y_arr)
            except Exception:
                gp = GaussianProcessRegressor(normalize_y=True)
                gp.fit(X_arr, y_arr)

            # Sample candidates within trust region with coordinate perturbation
            n_candidates = 2000
            prob_perturb = min(20.0 / self.n_dimensions, 1.0)
            candidates = np.tile(best_x, (n_candidates, 1))

            # Random mask of dimensions to perturb
            mask = np.random.rand(n_candidates, self.n_dimensions) <= prob_perturb
            mask[np.sum(mask, axis=1) == 0, np.random.randint(0, self.n_dimensions, size=np.sum(np.sum(mask, axis=1) == 0))] = True

            # Generate perturbations uniformly in the trust region
            perturbations = np.random.uniform(tr_lb, tr_ub, size=(n_candidates, self.n_dimensions))
            candidates[mask] = perturbations[mask]

            # Thompson Sampling / GP acquisition: sample posterior mean - 1.96 * std
            mu, sigma = gp.predict(candidates, return_std=True)
            lcb = mu - 1.96 * sigma
            next_x = candidates[np.argmin(lcb)]

            # Evaluate next point
            next_y = objective_function(next_x)
            if next_y < self.best_value:
                best_x = next_x.copy()

            self._update_progress(next_y, next_x)
            X_history.append(next_x)
            y_history.append(next_y)

            # Update Trust Region length
            self._update_tr_state(self.best_value, prev_best)
