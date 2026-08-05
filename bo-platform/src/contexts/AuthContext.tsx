import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type UserRole = "user" | "admin";

export interface UserData {
  id: string;
  name: string;
  institution: string;
  email: string;
  role: UserRole;
  password: string;
  registeredAt: string;
  lastLogin: string;
  status: "Active" | "Suspended";
  experiments: ExperimentData[];
  datasets: DatasetData[];
  problemStatements: ProblemStatementData[];
  reports: ReportData[];
}

export interface ExperimentData {
  id: string;
  name: string;
  mode: "dataset" | "problem-statement";
  datasetName?: string;
  problemTitle?: string;
  algorithms: string[];
  status: "Completed" | "Running" | "Queued" | "Failed";
  progress: number;
  started: string;
  duration: string;
  bestObjective: number;
  recommended?: string;
}

export interface DatasetData {
  id: string;
  name: string;
  rows: number;
  columns: number;
  features: number;
  target: string;
  sizeMb: number;
  uploaded: string;
  dimensionality: number;
  type: "CSV" | "Excel" | "JSON";
  csvContent?: string; // Store CSV content for actual dataset optimization
}

export interface ProblemStatementData {
  id: string;
  title: string;
  content: string;
  analysis: ProblemAnalysis;
  createdAt: string;
}

export interface ProblemAnalysis {
  objective: string;
  searchSpace: string;
  constraints: string[];
  dimensionality: string;
  optimizationType: "minimize" | "maximize";
  expectedOutputs: string[];
  recommendedAlgorithms: string[];
  methodology: string;
  workflow: string[];
}

export interface ReportData {
  id: string;
  experimentId: string;
  experimentName: string;
  format: string;
  generatedAt: string;
  sections: string[];
}

interface AuthState {
  user: UserData | null;
  users: UserData[];
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  googleLogin: (credential: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, institution: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  verifyRegistrationOtp: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyForgotPasswordOtp: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  resendOtp: (email: string, purpose: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<UserData>) => void;
  addExperiment: (experiment: ExperimentData) => void;
  deleteExperiment: (id: string) => void;
  addDataset: (dataset: DatasetData) => void;
  deleteDataset: (id: string) => void;
  addProblemStatement: (ps: ProblemStatementData) => void;
  addReport: (report: ReportData) => void;
  adminLogin: () => void;
  adminLogout: () => void;
}

const STORAGE_KEY = "hdbo_auth";

// Admin credentials should be configured via environment variables
// Default values are for development only - override in production via .env
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "admin@hdbobench.local";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "changeme";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api/v1";
const USER_DATA_PREFIX = "hdbo_userdata_";

function getAuthHeader() {
  const token = localStorage.getItem(STORAGE_KEY);
  return token ? ({ Authorization: `Bearer ${token}` } as HeadersInit) : ({} as HeadersInit);
}

function getStoredUserData(emailOrId?: string): {
  experiments?: ExperimentData[];
  datasets?: DatasetData[];
  problemStatements?: ProblemStatementData[];
  reports?: ReportData[];
} | null {
  if (!emailOrId) return null;
  try {
    const raw = localStorage.getItem(`${USER_DATA_PREFIX}${emailOrId.toLowerCase().trim()}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveStoredUserData(
  emailOrId?: string,
  updates?: {
    experiments?: ExperimentData[];
    datasets?: DatasetData[];
    problemStatements?: ProblemStatementData[];
    reports?: ReportData[];
  }
) {
  if (!emailOrId || !updates) return;
  try {
    const key = `${USER_DATA_PREFIX}${emailOrId.toLowerCase().trim()}`;
    const existing = getStoredUserData(emailOrId) || {};
    const merged = {
      experiments: updates.experiments ?? existing.experiments ?? [],
      datasets: updates.datasets ?? existing.datasets ?? [],
      problemStatements: updates.problemStatements ?? existing.problemStatements ?? [],
      reports: updates.reports ?? existing.reports ?? [],
    };
    localStorage.setItem(key, JSON.stringify(merged));
  } catch (err) {
    console.warn("Failed to persist user data to storage:", err);
  }
}

function buildSafeUserData(serverData: any, emailOrId?: string): UserData {
  const email = serverData.email || emailOrId || "";
  const idStr = serverData.id != null ? serverData.id.toString() : "";

  const storedByEmail = getStoredUserData(email) || {};
  const storedById = idStr ? (getStoredUserData(idStr) || {}) : {};

  // Merge items uniquely by ID
  const mergeById = (local: any[] = [], remote: any[] = []) => {
    const map = new Map<string, any>();
    (remote || []).forEach((item) => {
      if (item?.id) map.set(item.id.toString(), item);
    });
    (local || []).forEach((item) => {
      if (item?.id) map.set(item.id.toString(), item);
    });
    return Array.from(map.values());
  };

  const finalExperiments = mergeById(
    storedByEmail.experiments || storedById.experiments || [],
    serverData.experiments || []
  );
  const finalDatasets = mergeById(
    storedByEmail.datasets || storedById.datasets || [],
    serverData.datasets || []
  );
  const finalProblems = mergeById(
    storedByEmail.problemStatements || storedById.problemStatements || [],
    serverData.problemStatements || []
  );
  const finalReports = mergeById(
    storedByEmail.reports || storedById.reports || [],
    serverData.reports || []
  );

  return {
    ...serverData,
    experiments: finalExperiments,
    datasets: finalDatasets,
    problemStatements: finalProblems,
    reports: finalReports,
  };
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEY);
    if (token) {
      fetch(`${API_BASE_URL}/users/me`, { headers: getAuthHeader() })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === 200) {
            const safeUserData = buildSafeUserData(data.data, data.data.email);
            setUser(safeUserData);
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        })
        .catch(() => localStorage.removeItem(STORAGE_KEY));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      adminLogin();
      return { success: true };
    }
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.status === 200) {
        localStorage.setItem(STORAGE_KEY, data.data.token);

        // Fetch full user details
        const meRes = await fetch(`${API_BASE_URL}/users/me`, { headers: getAuthHeader() });
        const meData = await meRes.json();

        const safeUserData = buildSafeUserData(meData.data, email);
        setUser(safeUserData);
        return { success: true };
      }
      return { success: false, error: data.message || "Invalid credentials" };
    } catch (e) {
      return { success: false, error: "Network error connecting to backend" };
    }
  }, []);

  const googleLogin = useCallback(async (credential: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });
      const data = await res.json();
      if (data.status === 200) {
        localStorage.setItem(STORAGE_KEY, data.data.token);

        const meRes = await fetch(`${API_BASE_URL}/users/me`, { headers: getAuthHeader() });
        const meData = await meRes.json();

        const safeUserData = buildSafeUserData(meData.data, meData.data?.email);
        setUser(safeUserData);
        return { success: true };
      }
      return { success: false, error: data.message || "Google authentication failed" };
    } catch (e) {
      return { success: false, error: "Network error connecting to backend" };
    }
  }, []);

  const register = useCallback(async (name: string, institution: string, email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, membershipType: "Free" }),
      });
      const data = await res.json();
      if (data.status === 200 || data.status === 201) {
        // Registration now returns token directly
        if (data.data?.token) {
          localStorage.setItem(STORAGE_KEY, data.data.token);

          // Fetch full user details
          const meRes = await fetch(`${API_BASE_URL}/users/me`, { headers: getAuthHeader() });
          const meData = await meRes.json();

          const safeUserData = buildSafeUserData(meData.data, email);
          setUser(safeUserData);
        }
        return { success: true };
      }
      return { success: false, error: data.message || "Registration failed" };
    } catch (e) {
      return { success: false, error: "Network error connecting to backend" };
    }
  }, []);

  const logout = useCallback(() => {
    // Save current user's state to their specific storage before logging out
    if (user?.email) {
      saveStoredUserData(user.email, {
        experiments: user.experiments,
        datasets: user.datasets,
        problemStatements: user.problemStatements,
        reports: user.reports,
      });
    }
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, [user]);

  const verifyRegistrationOtp = useCallback(async (email: string, otp: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-registration-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otpCode: otp }),
      });
      const data = await res.json();
      if (data.status === 200 || data.status === 201) {
        return { success: true };
      }
      return { success: false, error: data.message || "Invalid OTP" };
    } catch (e) {
      return { success: false, error: "Network error connecting to backend" };
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.status === 200 || data.status === 201) {
        return { success: true };
      }
      return { success: false, error: data.message || "Failed to send reset link" };
    } catch (e) {
      return { success: false, error: "Network error connecting to backend" };
    }
  }, []);

  const verifyForgotPasswordOtp = useCallback(async (email: string, otp: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-forgot-password-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otpCode: otp }),
      });
      const data = await res.json();
      if (data.status === 200 || data.status === 201) {
        return { success: true };
      }
      return { success: false, error: data.message || "Invalid OTP" };
    } catch (e) {
      return { success: false, error: "Network error connecting to backend" };
    }
  }, []);

  const resetPassword = useCallback(async (email: string, otp: string, newPassword: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otpCode: otp, newPassword }),
      });
      const data = await res.json();
      if (data.status === 200 || data.status === 201) {
        return { success: true };
      }
      return { success: false, error: data.message || "Failed to reset password" };
    } catch (e) {
      return { success: false, error: "Network error connecting to backend" };
    }
  }, []);

  const resendOtp = useCallback(async (email: string, purpose: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose }),
      });
      const data = await res.json();
      if (data.status === 200 || data.status === 201) {
        return { success: true };
      }
      return { success: false, error: data.message || "Failed to resend OTP" };
    } catch (e) {
      return { success: false, error: "Network error connecting to backend" };
    }
  }, []);

  const updateUser = useCallback((updates: Partial<UserData>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      setUsers((u) => u.map((x) => (x.id === updated.id ? updated : x)));
      if (updated.email) {
        saveStoredUserData(updated.email, {
          experiments: updated.experiments,
          datasets: updated.datasets,
          problemStatements: updated.problemStatements,
          reports: updated.reports,
        });
      }
      return updated;
    });
  }, []);

  const addExperiment = useCallback((experiment: ExperimentData) => {
    setUser((prev) => {
      if (!prev) return null;
      const existing = prev.experiments || [];
      const updatedExperiments = existing.some((e) => e.id === experiment.id)
        ? existing.map((e) => (e.id === experiment.id ? experiment : e))
        : [experiment, ...existing];
      const updated = { ...prev, experiments: updatedExperiments };

      if (prev.email) saveStoredUserData(prev.email, { experiments: updatedExperiments });
      if (prev.id) saveStoredUserData(prev.id.toString(), { experiments: updatedExperiments });

      setUsers((u) => u.map((x) => (x.id === updated.id ? updated : x)));
      return updated;
    });

    // Optional background sync with Spring Boot backend
    if (user?.id) {
      fetch(`${API_BASE_URL}/experiments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": String(user.id),
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          name: experiment.name,
          status: experiment.status || "Completed",
          algorithms: experiment.algorithms,
        }),
      }).catch(() => {});
    }
  }, [user]);

  const deleteExperiment = useCallback((id: string) => {
    setUser((prev) => {
      if (!prev) return null;
      const updatedExperiments = (prev.experiments || []).filter((e) => e.id !== id);
      const updated = { ...prev, experiments: updatedExperiments };

      if (prev.email) saveStoredUserData(prev.email, { experiments: updatedExperiments });
      if (prev.id) saveStoredUserData(prev.id.toString(), { experiments: updatedExperiments });

      setUsers((u) => u.map((x) => (x.id === updated.id ? updated : x)));
      return updated;
    });
  }, []);

  const addDataset = useCallback((dataset: DatasetData) => {
    setUser((prev) => {
      if (!prev) return null;
      const existing = prev.datasets || [];
      const updatedDatasets = existing.some((d) => d.id === dataset.id)
        ? existing.map((d) => (d.id === dataset.id ? dataset : d))
        : [dataset, ...existing];
      const updated = { ...prev, datasets: updatedDatasets };

      if (prev.email) saveStoredUserData(prev.email, { datasets: updatedDatasets });
      if (prev.id) saveStoredUserData(prev.id.toString(), { datasets: updatedDatasets });

      setUsers((u) => u.map((x) => (x.id === updated.id ? updated : x)));
      return updated;
    });
  }, []);

  const deleteDataset = useCallback((id: string) => {
    setUser((prev) => {
      if (!prev) return null;
      const updatedDatasets = (prev.datasets || []).filter((d) => d.id !== id);
      const updated = { ...prev, datasets: updatedDatasets };

      if (prev.email) saveStoredUserData(prev.email, { datasets: updatedDatasets });
      if (prev.id) saveStoredUserData(prev.id.toString(), { datasets: updatedDatasets });

      setUsers((u) => u.map((x) => (x.id === updated.id ? updated : x)));
      return updated;
    });
  }, []);

  const addProblemStatement = useCallback((ps: ProblemStatementData) => {
    setUser((prev) => {
      if (!prev) return null;
      const existing = prev.problemStatements || [];
      const updatedProblems = existing.some((p) => p.id === ps.id)
        ? existing.map((p) => (p.id === ps.id ? ps : p))
        : [ps, ...existing];
      const updated = { ...prev, problemStatements: updatedProblems };

      if (prev.email) saveStoredUserData(prev.email, { problemStatements: updatedProblems });
      if (prev.id) saveStoredUserData(prev.id.toString(), { problemStatements: updatedProblems });

      setUsers((u) => u.map((x) => (x.id === updated.id ? updated : x)));
      return updated;
    });
  }, []);

  const addReport = useCallback((report: ReportData) => {
    setUser((prev) => {
      if (!prev) return null;
      const existing = prev.reports || [];
      const updatedReports = existing.some((r) => r.id === report.id)
        ? existing.map((r) => (r.id === report.id ? report : r))
        : [report, ...existing];
      const updated = { ...prev, reports: updatedReports };

      if (prev.email) saveStoredUserData(prev.email, { reports: updatedReports });
      if (prev.id) saveStoredUserData(prev.id.toString(), { reports: updatedReports });

      setUsers((u) => u.map((x) => (x.id === updated.id ? updated : x)));
      return updated;
    });
  }, []);

  const adminLogin = useCallback(() => {
    const adminStored = getStoredUserData(ADMIN_EMAIL) || {};
    const adminUser: UserData = {
      id: "admin",
      name: "Admin",
      institution: "Platform Administrator",
      email: ADMIN_EMAIL,
      role: "admin",
      password: ADMIN_PASSWORD,
      registeredAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      status: "Active",
      experiments: adminStored.experiments || [],
      datasets: adminStored.datasets || [],
      problemStatements: adminStored.problemStatements || [],
      reports: adminStored.reports || [],
    };
    setUser(adminUser);
  }, []);

  const adminLogout = useCallback(() => {
    if (user?.email) {
      saveStoredUserData(user.email, {
        experiments: user.experiments,
        datasets: user.datasets,
        problemStatements: user.problemStatements,
        reports: user.reports,
      });
    }
    setUser(null);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        login,
        googleLogin,
        register,
        verifyRegistrationOtp,
        forgotPassword,
        verifyForgotPasswordOtp,
        resetPassword,
        resendOtp,
        logout,
        updateUser,
        addExperiment,
        deleteExperiment,
        addDataset,
        deleteDataset,
        addProblemStatement,
        addReport,
        adminLogin,
        adminLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
