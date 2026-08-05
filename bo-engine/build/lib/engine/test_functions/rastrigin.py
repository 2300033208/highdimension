import numpy as np

def rastrigin_function(x: np.ndarray, a: float = 10.0) -> float:
    """
    Rastrigin highly multimodal benchmark function.
    f(x) = a * d + sum(x_i^2 - a * cos(2*pi*x_i))
    Global minimum is 0 at [0, 0, ..., 0].
    Search domain is [-5.12, 5.12]^d.
    """
    x = np.asarray(x)
    d = len(x)
    return float(a * d + np.sum(x ** 2 - a * np.cos(2 * np.pi * x)))
