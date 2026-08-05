import numpy as np

def sphere_function(x: np.ndarray) -> float:
    """
    Computes Sphere function: f(x) = sum(x_i^2).
    Global minimum is 0 at [0, 0, ..., 0].
    Search domain is typically [-5.12, 5.12]^d.
    """
    x = np.asarray(x)
    return float(np.sum(x ** 2))
