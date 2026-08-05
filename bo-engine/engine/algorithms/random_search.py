import numpy as np
from typing import Callable
from .base import BaseOptimizer

class RandomSearch(BaseOptimizer):
    def optimize(self, objective_function: Callable[[np.ndarray], float]) -> None:
        low, high = self.bounds
        
        for _ in range(self.evaluation_budget):
            # Sample uniformly from the search space
            x = np.random.uniform(low, high, size=self.n_dimensions)
            
            # Evaluate objective
            y = objective_function(x)
            
            # Update history
            self._update_progress(y, x)
