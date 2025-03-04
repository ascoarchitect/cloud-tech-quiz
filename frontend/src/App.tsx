import { useEffect, useState } from "react";
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
import {
  getCurrentUser,
  isUserInGroup,
  getCurrentSession,
} from "./services/auth";
import "./App.css";

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  // Check authentication on component mount
  useEffect(() => {
    async function checkAuth() {
      try {
        // With the simplified approach, we don't need to manually exchange the code
        // The Cognito SDK will handle retrieving and storing the session from the code

        // First, check if there's a code in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const authCode = urlParams.get("code");

        if (authCode) {
          // Remove the code from the URL to avoid issues on refresh
          const newUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }

        // Check if we have a valid user session
        const user = getCurrentUser();

        if (!user) {
          setIsAdmin(false);
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Get the user's session to verify it's valid
        try {
          const session = await getCurrentSession();

          if (!session || !session.isValid()) {
            console.log("Session invalid or expired");
            setIsAdmin(false);
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
          }

          // User is authenticated
          setIsAuthenticated(true);

          // Check if user is an admin
          const adminStatus = await isUserInGroup("Admin");
          setIsAdmin(adminStatus);
        } catch (sessionError) {
          console.error("Error getting session:", sessionError);
          setIsAdmin(false);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.log("Not authenticated", error);
        setIsAdmin(false);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();

    // Poll for auth changes every 5 minutes
    const interval = setInterval(checkAuth, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  // Check if URL is a test taking page and don't show header/footer
  const isTestPage =
    location.pathname.startsWith("/test/") &&
    location.pathname.includes("/take");

  return (
    <div className="app-container">
      {!isTestPage && (
        <Header isAdmin={isAdmin} isAuthenticated={isAuthenticated} />
      )}

      <main className="main-content">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/test/:testId/take" element={<TestPage />} />
          <Route
            path="/test/:testId/results/:responseId"
            element={<ResultsPage />}
          />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={isAdmin ? <AdminDashboard /> : <Navigate to="/" />}
          />
          <Route
            path="/admin/tests/create"
            element={isAdmin ? <AdminTestCreate /> : <Navigate to="/" />}
          />
          <Route
            path="/admin/questions"
            element={
              isAdmin ? <AdminQuestionManagement /> : <Navigate to="/" />
            }
          />
          <Route
            path="/admin/tests/:testId"
            element={isAdmin ? <AdminTestManagement /> : <Navigate to="/" />}
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {!isTestPage && <Footer />}
    </div>
  );
}

export default App;
