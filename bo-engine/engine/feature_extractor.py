import numpy as np
import pandas as pd
from typing import Dict, Any, Union

def extract_features_from_spec(
    n_dimensions: int,
    n_continuous: int,
    n_integer: int,
    n_categorical: int,
    bounds_range: float = 10.0,
    evaluation_budget: int = 50,
    is_noisy: bool = False
) -> Dict[str, Any]:
    """
    Extracts numerical and categorical meta-features from an optimization problem specification.
    """
    total_dims = max(n_dimensions, n_continuous + n_integer + n_categorical, 1)
    cont_ratio = n_continuous / total_dims
    cat_ratio = n_categorical / total_dims
    int_ratio = n_integer / total_dims
    budget_per_dim = evaluation_budget / total_dims

    if total_dims <= 5:
        dim_class = "low"
    elif total_dims <= 20:
        dim_class = "medium"
    elif total_dims <= 100:
        dim_class = "high"
    else:
        dim_class = "extreme"

    log_volume = total_dims * np.log(max(bounds_range, 1e-4))

    return {
        "n_dimensions": total_dims,
        "n_continuous": n_continuous,
        "n_integer": n_integer,
        "n_categorical": n_categorical,
        "continuous_ratio": round(float(cont_ratio), 4),
        "categorical_ratio": round(float(cat_ratio), 4),
        "integer_ratio": round(float(int_ratio), 4),
        "search_space_volume": round(float(log_volume), 4),
        "evaluation_budget": evaluation_budget,
        "budget_per_dim": round(float(budget_per_dim), 4),
        "is_noisy": is_noisy,
        "dimensionality_class": dim_class
    }

def extract_features_from_dataset(df: pd.DataFrame, target_column: str = None) -> Dict[str, Any]:
    """
    Extracts meta-features from an uploaded CSV dataframe.
    """
    if target_column and target_column in df.columns:
        features_df = df.drop(columns=[target_column])
    else:
        # Default assumption: last column is the objective target
        features_df = df.iloc[:, :-1]

    n_dimensions = features_df.shape[1]
    evaluation_budget = min(features_df.shape[0], 200)

    n_continuous = 0
    n_integer = 0
    n_categorical = 0

    for col in features_df.columns:
        if pd.api.types.is_float_dtype(features_df[col]):
            n_continuous += 1
        elif pd.api.types.is_integer_dtype(features_df[col]):
            n_integer += 1
        else:
            n_categorical += 1

    # Approximate search range
    numeric_cols = features_df.select_dtypes(include=[np.number])
    if not numeric_cols.empty:
        ranges = (numeric_cols.max() - numeric_cols.min()).replace(0, 1.0)
        mean_range = float(ranges.mean())
    else:
        mean_range = 10.0

    return extract_features_from_spec(
        n_dimensions=n_dimensions,
        n_continuous=n_continuous,
        n_integer=n_integer,
        n_categorical=n_categorical,
        bounds_range=mean_range,
        evaluation_budget=evaluation_budget,
        is_noisy=False
    )
