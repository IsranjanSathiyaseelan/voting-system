import { Navigate, Route, Routes } from "react-router-dom";

// layouts
import MainLayout from "../components/layouts/MainLayout";
import AdminLayout from "../components/layouts/AdminLayout";

// guards
import AdminGuard from "../components/admin/AdminGuard";
import UserGuard from "../components/user/UserGuard";

// pages
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";

import Elections from "../pages/Elections/Elections";
import Vote from "../pages/Vote/Vote";
import Results from "../pages/Results/Results";

import AdminDashboard from "../pages/Admin/AdminDashboard";
import AdminElections from "../pages/Admin/AdminElections";
import AdminLogin from "../pages/Admin/AdminLogin";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* User Routes */}
      <Route element={<UserGuard />}>
        <Route element={<MainLayout />}>
          <Route path="/elections" element={<Elections />} />
          <Route path="/vote/:electionId" element={<Vote />} />
          <Route path="/vote" element={<Vote />} />
          <Route path="/results/:electionId" element={<Results />} />
          <Route path="/results" element={<Results />} />
          <Route
            path="/organizations"
            element={<Navigate to="/elections" replace />}
          />
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route element={<AdminGuard />}>
        <Route element={<AdminLayout />}>
          <Route
            path="/admin"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/elections" element={<AdminElections />} />
          <Route
            path="/admin/organizations"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route
            path="/admin/candidates"
            element={<Navigate to="/admin/dashboard" replace />}
          />
        </Route>
      </Route>

      {/* Wildcard Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
