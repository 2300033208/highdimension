from typing import Dict, Type
from .base import BaseOptimizer
from .random_search import RandomSearch
from .optuna_algo import OptunaOptimizer
from .vanilla_bo import VanillaBO
from .turbo import TuRBOOptimizer
from .saasbo import SAASBOOptimizer
from .baxus import BAxUSOptimizer
from .hebo_algo import HEBOOptimizer

AVAILABLE_ALGORITHMS: Dict[str, Type[BaseOptimizer]] = {
    "random-search": RandomSearch,
    "optuna": OptunaOptimizer,
    "vanilla-bo": VanillaBO,
    "turbo": TuRBOOptimizer,
    "saasbo": SAASBOOptimizer,
    "baxus": BAxUSOptimizer,
    "hebo": HEBOOptimizer
}

ALGORITHM_METADATA = {
    "random-search": {
        "name": "Random Search",
        "family": "Baseline",
        "bestFor": "Initial baseline exploration and low-budget sanity checking",
        "complexity": "O(1)"
    },
    "optuna": {
        "name": "Optuna (TPE)",
        "family": "Kernel Density",
        "bestFor": "Mixed parameter types, fast iterations, hyperparameter tuning",
        "complexity": "O(n)"
    },
    "vanilla-bo": {
        "name": "Vanilla GP-BO",
        "family": "Gaussian Process",
        "bestFor": "Low dimensions (d <= 10), continuous smooth expensive functions",
        "complexity": "O(n^3)"
    },
    "turbo": {
        "name": "TuRBO",
        "family": "Trust Region BO",
        "bestFor": "Medium to high dimensions (d: 10 - 200), local multimodal surfaces",
        "complexity": "O(n^3 local)"
    },
    "saasbo": {
        "name": "SAASBO",
        "family": "Sparse Subspace GP",
        "bestFor": "High dimensions (d: 20 - 500) where few active dimensions drive variance",
        "complexity": "O(n^3 active)"
    },
    "baxus": {
        "name": "BAxUS",
        "family": "Adaptive Subspace BO",
        "bestFor": "Very high dimensions (d: 50 - 1000+), expanding target embeddings",
        "complexity": "O(n^3 target)"
    },
    "hebo": {
        "name": "HEBO",
        "family": "Heteroscedastic MACE",
        "bestFor": "Noisy, warped, heteroscedastic response surfaces, multi-acquisition",
        "complexity": "O(n^3)"
    }
}
