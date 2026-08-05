from typing import Callable, Tuple, Dict, Any
import numpy as np
from .ackley import ackley_function
from .rosenbrock import rosenbrock_function
from .sphere import sphere_function
from .rastrigin import rastrigin_function
from .levy import levy_function

BENCHMARK_FUNCTIONS: Dict[str, Dict[str, Any]] = {
    "ackley": {
        "fn": ackley_function,
        "default_bounds": (-32.768, 32.768),
        "optimum": 0.0,
        "name": "Ackley Function",
        "description": "Multimodal test function with nearly flat outer region and central hole."
    },
    "rosenbrock": {
        "fn": rosenbrock_function,
        "default_bounds": (-5.0, 10.0),
        "optimum": 0.0,
        "name": "Rosenbrock Function",
        "description": "Non-convex banana valley function with narrow curved valley."
    },
    "sphere": {
        "fn": sphere_function,
        "default_bounds": (-5.12, 5.12),
        "optimum": 0.0,
        "name": "Sphere Function",
        "description": "Smooth, convex, unimodal baseline function."
    },
    "rastrigin": {
        "fn": rastrigin_function,
        "default_bounds": (-5.12, 5.12),
        "optimum": 0.0,
        "name": "Rastrigin Function",
        "description": "Highly multimodal function with regularly distributed local minima."
    },
    "levy": {
        "fn": levy_function,
        "default_bounds": (-10.0, 10.0),
        "optimum": 0.0,
        "name": "Levy Function",
        "description": "Multimodal benchmark function with challenging landscapes in higher dimensions."
    }
}

def get_test_function(name: str):
    key = name.lower()
    for k in BENCHMARK_FUNCTIONS:
        if k in key:
            return BENCHMARK_FUNCTIONS[k]
    return BENCHMARK_FUNCTIONS["ackley"]
