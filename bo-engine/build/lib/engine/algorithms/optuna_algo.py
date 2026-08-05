import numpy as np
from typing import Callable
import optuna
import logging
from .base import BaseOptimizer

# Suppress optuna logs so they don't clutter the server output
optuna.logging.set_verbosity(optuna.logging.WARNING)

class OptunaOptimizer(BaseOptimizer):
    def optimize(self, objective_function: Callable[[np.ndarray], float]) -> None:
        low, high = self.bounds
        
        def objective(trial):
            # Create the vector for this trial
            x = np.zeros(self.n_dimensions)
            for i in range(self.n_dimensions):
                x[i] = trial.suggest_float(f"x_{i}", low, high)
                
            # Evaluate
            y = objective_function(x)
            
            # Update history (we hook into our base class tracking)
            self._update_progress(y, x)
            return y

        # Create study and run optimization
        # TPESampler is Optuna's default Tree-structured Parzen Estimator algorithm
        study = optuna.create_study(direction="minimize", sampler=optuna.samplers.TPESampler(seed=42))
        study.optimize(objective, n_trials=self.evaluation_budget)
