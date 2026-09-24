import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/authService";

const UserGuard = () => {
  const { user } = useAuth();
  const token = authService.getStoredToken();

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default UserGuard;
