import React, { Suspense } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { ShieldAlert } from "lucide-react";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { RouteScrollRestoration } from "@/components/layout/RouteScrollRestoration";

const Landing = React.lazy(() => import("@/pages/Landing"));
const Register = React.lazy(() => import("@/pages/Register"));
const ForgotPassword = React.lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = React.lazy(() => import("@/pages/ResetPassword"));
const Dashboard = React.lazy(() => import("@/pages/Dashboard"));
const DatasetUpload = React.lazy(() => import("@/pages/DatasetUpload"));
const ExperimentConfig = React.lazy(() => import("@/pages/ExperimentConfig"));
const BenchmarkDashboard = React.lazy(() => import("@/pages/BenchmarkDashboard"));
const Recommendation = React.lazy(() => import("@/pages/Recommendation"));
const Visualisations = React.lazy(() => import("@/pages/Visualisations"));
const Reports = React.lazy(() => import("@/pages/Reports"));
const Admin = React.lazy(() => import("@/pages/Admin"));
const Profile = React.lazy(() => import("@/pages/Profile"));
const Settings = React.lazy(() => import("@/pages/Settings"));
const ResearchInsights = React.lazy(() => import("@/pages/ResearchInsights"));
const AlgorithmExplorer = React.lazy(() => import("@/pages/AlgorithmExplorer"));
const AlgorithmDetail = React.lazy(() => import("@/pages/AlgorithmDetail"));
const ExperimentRepository = React.lazy(() => import("@/pages/ExperimentRepository"));
const BenchmarkLibrary = React.lazy(() => import("@/pages/BenchmarkLibrary"));
const BenchmarkAnalytics = React.lazy(() => import("@/pages/BenchmarkAnalytics"));
const RecommendationInsights = React.lazy(() => import("@/pages/RecommendationInsights"));
const Documentation = React.lazy(() => import("@/pages/Documentation"));
const NotFound = React.lazy(() => import("@/pages/NotFound"));

const pageTransition = {
  initial: { opacity: 0, y: 12, scale: 0.995 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.995 },
  transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
};

function Page({ children }: { children: React.ReactNode }) {
  return (
    <motion.div {...pageTransition}>
      <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-ink-dim">Loading...</div>}>
        {children}
      </Suspense>
    </motion.div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/?login=true" replace />;
  }
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/?login=true" replace />;
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-10 text-center max-w-md"
        >
          <div className="h-16 w-16 rounded-2xl bg-danger/10 border border-danger/30 flex items-center justify-center mx-auto mb-5">
            <ShieldAlert className="h-7 w-7 text-danger" />
          </div>
          <h1 className="text-xl font-semibold mb-2">Access Denied</h1>
          <p className="text-sm text-ink-dim mb-6">You do not have permission to access the Admin Dashboard. This area is restricted to platform administrators only.</p>
          <a href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 bg-accent text-white hover:opacity-90 h-10 px-5 text-sm">
            Return to Dashboard
          </a>
        </motion.div>
      </div>
    );
  }
  return <>{children}</>;
}

export default function App() {
  const location = useLocation();
  return (
    <ErrorBoundary>
      <RouteScrollRestoration />
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Page><Landing /></Page>} />
          <Route path="/login" element={<Navigate to="/?login=true" replace />} />
          <Route path="/register" element={<Page><Register /></Page>} />
          <Route path="/forgot-password" element={<Page><ForgotPassword /></Page>} />
          <Route path="/reset-password" element={<Page><ResetPassword /></Page>} />
          <Route path="/dashboard" element={<Page><ProtectedRoute><Dashboard /></ProtectedRoute></Page>} />
          <Route path="/upload" element={<Page><ProtectedRoute><DatasetUpload /></ProtectedRoute></Page>} />
          <Route path="/experiment/new" element={<Page><ProtectedRoute><ExperimentConfig /></ProtectedRoute></Page>} />
          <Route path="/benchmark" element={<Page><ProtectedRoute><BenchmarkDashboard /></ProtectedRoute></Page>} />
          <Route path="/recommendation" element={<Page><ProtectedRoute><Recommendation /></ProtectedRoute></Page>} />
          <Route path="/visualisations" element={<Page><ProtectedRoute><Visualisations /></ProtectedRoute></Page>} />
          <Route path="/reports" element={<Page><ProtectedRoute><Reports /></ProtectedRoute></Page>} />
          <Route path="/admin" element={<Page><AdminRoute><Admin /></AdminRoute></Page>} />
          <Route path="/profile" element={<Page><ProtectedRoute><Profile /></ProtectedRoute></Page>} />
          <Route path="/settings" element={<Page><ProtectedRoute><Settings /></ProtectedRoute></Page>} />
          <Route path="/research" element={<Page><ResearchInsights /></Page>} />
          <Route path="/algorithms" element={<Page><AlgorithmExplorer /></Page>} />
          <Route path="/algorithms/:id" element={<Page><AlgorithmDetail /></Page>} />
          <Route path="/experiments" element={<Page><ProtectedRoute><ExperimentRepository /></ProtectedRoute></Page>} />
          <Route path="/library" element={<Page><ProtectedRoute><BenchmarkLibrary /></ProtectedRoute></Page>} />
          <Route path="/analytics" element={<Page><ProtectedRoute><BenchmarkAnalytics /></ProtectedRoute></Page>} />
          <Route path="/insights/:experimentId" element={<Page><ProtectedRoute><RecommendationInsights /></ProtectedRoute></Page>} />
          <Route path="/docs" element={<Page><Documentation /></Page>} />
          <Route path="/docs/:section" element={<Page><Documentation /></Page>} />
          <Route path="*" element={<Page><NotFound /></Page>} />
        </Routes>
      </AnimatePresence>
    </ErrorBoundary>
  );
}
