import numpy as np

def levy_function(x: np.ndarray) -> float:
    """
    Levy benchmark function.
    Global minimum is 0 at [1, 1, ..., 1].
    Search domain is [-10.0, 10.0]^d.
    """
    x = np.asarray(x)
    d = len(x)
    w = 1.0 + (x - 1.0) / 4.0
    term1 = np.sin(np.pi * w[0]) ** 2
    term3 = (w[-1] - 1.0) ** 2 * (1.0 + np.sin(2.0 * np.pi * w[-1]) ** 2)
    
    if d > 1:
        term2 = np.sum((w[:-1] - 1.0) ** 2 * (1.0 + 10.0 * np.sin(np.pi * w[:-1] + 1.0) ** 2))
    else:
        term2 = 0.0
        
    return float(term1 + term2 + term3)
