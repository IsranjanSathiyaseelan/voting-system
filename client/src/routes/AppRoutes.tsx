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

import Vote from "../pages/Vote/Vote";
import Results from "../pages/Results/Results";
import Organizations from "../pages/Organizations/Organizations";

import AdminDashboard from "../pages/Admin/AdminDashboard";
import AdminCandidates from "../pages/Admin/AdminCandidates";
import AdminOrganizations from "../pages/Admin/AdminOrganizations";
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
          <Route path="/organizations" element={<Organizations />} />
          <Route path="/vote/:organizationId" element={<Vote />} />
          <Route path="/results/:organizationId" element={<Results />} />
          <Route
            path="/vote"
            element={<Navigate to="/organizations" replace />}
          />
          <Route
            path="/results"
            element={<Navigate to="/organizations" replace />}
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
          <Route path="/admin/organizations" element={<AdminOrganizations />} />
          <Route path="/admin/candidates" element={<AdminCandidates />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
