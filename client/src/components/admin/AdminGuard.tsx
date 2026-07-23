import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const AdminGuard = () => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  const hasAdminRole = [
    "SUPER_ADMIN",
    "ORGANIZATION_ADMIN",
    "ELECTION_MANAGER",
    "ADMIN",
  ].includes(user.role);

  if (!hasAdminRole) {
    return <Navigate to="/organizations" replace />;
  }
  return <Outlet />;
};

export default AdminGuard;
