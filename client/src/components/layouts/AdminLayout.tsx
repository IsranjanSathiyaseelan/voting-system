import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  HiOutlineOfficeBuilding,
  HiOutlineViewGrid,
  HiOutlineUsers,
} from "react-icons/hi";
import Button from "../../common/Button/Button";
import { useAuth } from "../../hooks/useAuth";
import styles from "./AdminLayout.module.css";

const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brandBlock}>
          <span className={styles.badge}>Admin section</span>
          <h1>VoteSecure</h1>
          <p>Manage organizations, candidates, and live voting trends.</p>
        </div>

        <nav className={styles.nav} aria-label="Admin navigation">
          <NavLink
            to="/admin/dashboard"
            end
            className={({ isActive }) => (isActive ? styles.active : "")}
          >
            <HiOutlineViewGrid />
            Overview
          </NavLink>

          <NavLink
            to="/admin/organizations"
            className={({ isActive }) => (isActive ? styles.active : "")}
          >
            <HiOutlineOfficeBuilding />
            Organizations
          </NavLink>

          <NavLink
            to="/admin/candidates"
            className={({ isActive }) => (isActive ? styles.active : "")}
          >
            <HiOutlineUsers />
            Candidates
          </NavLink>
        </nav>

        <div className={styles.logoutSection}>
          <Button
            text="Sign out"
            onClick={() => {
              logout();
              navigate("/admin/login");
            }}
          />
        </div>
      </aside>

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;