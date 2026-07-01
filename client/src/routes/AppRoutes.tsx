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

import Admin from "../pages/Admin/Admin";
import Home from "../pages/Home/Home";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* User Routes */}
      <Route element={<UserGuard />}>
        <Route element={<MainLayout />}>
          <Route path="/Home" element={<Home />} />
          <Route path="/vote" element={<Vote />} />
          <Route path="/results" element={<Results />} />
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route element={<AdminGuard />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<Admin />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
