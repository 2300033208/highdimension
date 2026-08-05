from abc import ABC, abstractmethod
import time
from typing import Callable, List, Tuple, Dict, Any
import numpy as np

class BaseOptimizer(ABC):
    def __init__(self, n_dimensions: int, bounds: Tuple[float, float], evaluation_budget: int):
        self.n_dimensions = n_dimensions
        self.bounds = bounds
        self.evaluation_budget = evaluation_budget
        
        self.best_value = float('inf')
        self.convergence_curve: List[float] = []
        self.n_evaluations = 0
        self.start_time = 0.0
        self.end_time = 0.0
        self.final_incumbent: Dict[str, Any] = {}

    def _update_progress(self, current_value: float, current_params: np.ndarray):
        if current_value < self.best_value:
            self.best_value = current_value
            self.final_incumbent = {f"x{i}": float(v) for i, v in enumerate(current_params)}
        self.convergence_curve.append(self.best_value)
        self.n_evaluations += 1

    @abstractmethod
    def optimize(self, objective_function: Callable[[np.ndarray], float]) -> dict:
        """
        Runs the optimization loop.
        Returns a dictionary with the results.
        """
        pass
        
    def run(self, objective_function: Callable[[np.ndarray], float]) -> dict:
        self.start_time = time.time()
        self.optimize(objective_function)
        self.end_time = time.time()
        
        return {
            "best_value": self.best_value,
            "convergence_curve": self.convergence_curve,
            "wall_clock_time": self.end_time - self.start_time,
            "n_evaluations": self.n_evaluations,
            "final_incumbent": self.final_incumbent
        }
