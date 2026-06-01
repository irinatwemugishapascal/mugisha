import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SparePartPage from "./pages/SparePartPage";
import StockInPage from "./pages/StockInPage";
import StockOutPage from "./pages/StockOutPage";
import ReportsPage from "./pages/ReportsPage";
import { fetchCurrentUser, logoutUser } from "./api/authApi";

function ProtectedLayout({ isAuthenticated, username, onLogout }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <AppLayout onLogout={onLogout} username={username} />;
}

function PublicRoute({ isAuthenticated, children }) {
  if (isAuthenticated) {
    return <Navigate to="/spare-part" replace />;
  }
  return children;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetchCurrentUser();
        setIsAuthenticated(true);
        setUsername(r.data.username);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setIsAuthenticated(false);
    setUsername("");
  };

  if (loading) {
    return <div className="p-8 text-center text-blue-600">Checking session…</div>;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute isAuthenticated={isAuthenticated}>
            <LoginPage
              onLoginSuccess={(name) => {
                setIsAuthenticated(true);
                setUsername(name);
              }}
            />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute isAuthenticated={isAuthenticated}>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicRoute isAuthenticated={isAuthenticated}>
            <ResetPasswordPage />
          </PublicRoute>
        }
      />
      <Route
        element={
          <ProtectedLayout
            isAuthenticated={isAuthenticated}
            username={username}
            onLogout={handleLogout}
          />
        }
      >
        <Route path="/spare-part" element={<SparePartPage />} />
        <Route path="/stock-in" element={<StockInPage />} />
        <Route path="/stock-out" element={<StockOutPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/" element={<Navigate to="/spare-part" replace />} />
      </Route>
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/spare-part" : "/login"} replace />}
      />
    </Routes>
  );
}

export default App;
