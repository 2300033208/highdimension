import numpy as np

def ackley_function(x: np.ndarray, a: float = 20, b: float = 0.2, c: float = 2 * np.pi) -> float:
    """
    Computes the Ackley function for a given d-dimensional numpy array x.
    Global minimum is 0 at x = [0, 0, ..., 0].
    """
    d = len(x)
    sum_sq = np.sum(x ** 2)
    sum_cos = np.sum(np.cos(c * x))
    
    term1 = -a * np.exp(-b * np.sqrt(sum_sq / d))
    term2 = -np.exp(sum_cos / d)
    
    return float(term1 + term2 + a + np.exp(1))
