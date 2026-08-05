import numpy as np

def rosenbrock_function(x: np.ndarray) -> float:
    """
    Computes Rosenbrock (Valley/Banana) function.
    Global minimum is 0 at x = [1, 1, ..., 1].
    Search domain is typically [-5.0, 10.0]^d.
    """
    x = np.asarray(x)
    return float(np.sum(100.0 * (x[1:] - x[:-1]**2.0)**2.0 + (1.0 - x[:-1])**2.0))
