// src/App.tsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import TestPage from "./pages/TestPage";
import ResultsPage from "./pages/ResultsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTestCreate from "./pages/admin/AdminTestCreate";
import AdminQuestionManagement from "./pages/admin/AdminQuestionManagement";
import AdminTestManagement from "./pages/admin/AdminTestManagement";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { AuthProvider } from "./auth/context";
import AuthGuard from "./auth/authguard";
import "./App.css";

function App() {
  const location = useLocation();

  // Check if URL is a test taking page and don't show header/footer
  const isTestPage =
    location.pathname.startsWith("/test/") &&
    location.pathname.includes("/take");

  return (
    <AuthProvider>
      <div className="app-container">
        {!isTestPage && <Header />}

        <main className="main-content">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />

            {/* Protected routes */}
            <Route
              path="/test/:testId/take"
              element={
                <AuthGuard>
                  <TestPage />
                </AuthGuard>
              }
            />
            <Route
              path="/test/:testId/results/:responseId"
              element={
                <AuthGuard>
                  <ResultsPage />
                </AuthGuard>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <AuthGuard requireAdmin>
                  <AdminDashboard />
                </AuthGuard>
              }
            />
            <Route
              path="/admin/tests/create"
              element={
                <AuthGuard requireAdmin>
                  <AdminTestCreate />
                </AuthGuard>
              }
            />
            <Route
              path="/admin/questions"
              element={
                <AuthGuard requireAdmin>
                  <AdminQuestionManagement />
                </AuthGuard>
              }
            />
            <Route
              path="/admin/tests/:testId"
              element={
                <AuthGuard requireAdmin>
                  <AdminTestManagement />
                </AuthGuard>
              }
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        {!isTestPage && <Footer />}
      </div>
    </AuthProvider>
  );
}

export default App;
