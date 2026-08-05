import os
import numpy as np
import pandas as pd

out_dir = os.path.abspath("sample_datasets")
os.makedirs(out_dir, exist_ok=True)
np.random.seed(42)

# 1. Low-Dimensional: Airfoil Aerodynamic Design (5D)
n_samples = 150
freq = np.random.uniform(200, 20000, n_samples)
angle = np.random.uniform(0, 22.2, n_samples)
chord = np.random.uniform(0.025, 0.30, n_samples)
velocity = np.random.uniform(31.7, 71.3, n_samples)
displacement = np.random.uniform(0.0004, 0.058, n_samples)

# Non-linear sound pressure level (target to minimize)
sound_db = (
    120.0
    - 0.001 * freq
    + 1.5 * angle
    - 20.0 * chord
    + 0.2 * velocity
    + 150.0 * displacement
    + np.random.normal(0, 2.0, n_samples)
)

df_airfoil = pd.DataFrame({
    "frequency_hz": np.round(freq, 1),
    "angle_of_attack_deg": np.round(angle, 2),
    "chord_length_m": np.round(chord, 4),
    "free_stream_velocity_ms": np.round(velocity, 2),
    "suction_displacement_thickness": np.round(displacement, 5),
    "sound_pressure_level_db": np.round(sound_db, 2)
})
df_airfoil.to_csv(os.path.join(out_dir, "airfoil_aerodynamic_noise_5D.csv"), index=False)
print("Created airfoil_aerodynamic_noise_5D.csv")

# 2. Medium-Dimensional: ML Model Hyperparameter Tuning (10D)
n_samples = 200
df_hp = pd.DataFrame({
    "learning_rate": np.round(np.random.uniform(0.001, 0.3, n_samples), 4),
    "max_depth": np.random.randint(2, 16, n_samples),
    "min_child_weight": np.random.randint(1, 10, n_samples),
    "subsample": np.round(np.random.uniform(0.5, 1.0, n_samples), 3),
    "colsample_bytree": np.round(np.random.uniform(0.4, 1.0, n_samples), 3),
    "gamma": np.round(np.random.uniform(0.0, 5.0, n_samples), 3),
    "reg_alpha": np.round(np.random.uniform(0.0, 2.0, n_samples), 3),
    "reg_lambda": np.round(np.random.uniform(0.1, 5.0, n_samples), 3),
    "scale_pos_weight": np.round(np.random.uniform(1.0, 10.0, n_samples), 2),
    "n_estimators": np.random.randint(50, 500, n_samples)
})
# Validation loss (target to minimize)
val_loss = (
    0.35 
    + 0.5 * (df_hp["learning_rate"] - 0.05)**2 
    + 0.002 * (df_hp["max_depth"] - 6)**2 
    + 0.1 * (1.0 - df_hp["subsample"])**2
    + np.random.normal(0, 0.02, n_samples)
)
df_hp["validation_loss"] = np.round(val_loss, 4)
df_hp.to_csv(os.path.join(out_dir, "xgboost_hyperparameters_10D.csv"), index=False)
print("Created xgboost_hyperparameters_10D.csv")

# 3. Medium-High Dimensional: Naval Propulsion Gas Turbine (16D)
n_samples = 250
naval_cols = {}
for i in range(1, 16):
    naval_cols[f"sensor_param_{i}"] = np.round(np.random.uniform(1.0, 100.0, n_samples), 3)

# Add decay coefficient target
decay = 0.95 + 0.001 * (naval_cols["sensor_param_1"] - 50.0) - 0.0005 * naval_cols["sensor_param_5"] + np.random.normal(0, 0.005, n_samples)
naval_cols["compressor_decay_state"] = np.round(decay, 4)
df_naval = pd.DataFrame(naval_cols)
df_naval.to_csv(os.path.join(out_dir, "naval_propulsion_turbines_16D.csv"), index=False)
print("Created naval_propulsion_turbines_16D.csv")

# 4. High-Dimensional: Materials Bandgap Sweep (30D)
n_samples = 300
mat_cols = {}
for i in range(1, 31):
    mat_cols[f"composition_ratio_{i}"] = np.round(np.random.uniform(0.0, 1.0, n_samples), 4)

# Bandgap energy deviation (target to minimize towards target 1.5 eV)
bg_target = 1.5
sim_bg = (
    1.1 
    + 0.8 * mat_cols["composition_ratio_3"] 
    - 0.5 * mat_cols["composition_ratio_7"] 
    + 1.2 * mat_cols["composition_ratio_12"]**2
    + np.random.normal(0, 0.05, n_samples)
)
mat_cols["bandgap_deviation_eV"] = np.round(np.abs(sim_bg - bg_target), 4)
df_mat = pd.DataFrame(mat_cols)
df_mat.to_csv(os.path.join(out_dir, "materials_bandgap_sweep_30D.csv"), index=False)
print("Created materials_bandgap_sweep_30D.csv")

# 5. Ultra High-Dimensional: Superconductor Critical Temperature (80D)
n_samples = 300
sc_cols = {}
for i in range(1, 81):
    sc_cols[f"atomic_feature_{i}"] = np.round(np.random.uniform(0.01, 50.0, n_samples), 3)

# Critical Temperature Tc (K) (objective to maximize or minimize regret)
tc = (
    45.0 
    + 1.2 * sc_cols["atomic_feature_4"] 
    - 0.8 * sc_cols["atomic_feature_18"] 
    + 2.1 * np.sqrt(sc_cols["atomic_feature_25"])
    + np.random.normal(0, 3.0, n_samples)
)
sc_cols["critical_temperature_k"] = np.round(np.maximum(tc, 0.1), 2)
df_sc = pd.DataFrame(sc_cols)
df_sc.to_csv(os.path.join(out_dir, "superconductor_critical_temp_80D.csv"), index=False)
print("Created superconductor_critical_temp_80D.csv")
