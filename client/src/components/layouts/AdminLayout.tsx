import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  HiOutlineOfficeBuilding,
  HiOutlineViewGrid,
  HiOutlineUsers,
  HiOutlineDocumentText,
  HiOutlineLogout,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineShieldCheck,
} from "react-icons/hi";
import { useAuth } from "../../hooks/useAuth";
import { organizationService } from "../../services/organizationService";
import styles from "./AdminLayout.module.css";

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [orgName, setOrgName] = useState<string | null>(null);

  useEffect(() => {
    if (user?.organizationId) {
      organizationService
        .getById(user.organizationId)
        .then((org) => setOrgName(org.name))
        .catch(() => setOrgName(null));
    } else {
      setOrgName(null);
    }
  }, [user?.organizationId]);

  return (
    <div className={`${styles.layout} ${collapsed ? styles.layoutCollapsed : ""}`}>
      <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""}`}>
        {/* Brand Block */}
        <div className={styles.brandBlock}>
          <div className={styles.logoRow}>
            <div className={styles.logoIcon}>
              <HiOutlineShieldCheck />
            </div>
            {!collapsed && (
              <div className={styles.brandText}>
                <h1>VoteSecure</h1>
                <span className={styles.badge}>
                  {orgName ? orgName.toUpperCase() : "ADMIN PORTAL"}
                </span>
              </div>
            )}
          </div>
          <button
            type="button"
            className={styles.collapseToggle}
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label="Toggle navigation bar"
          >
            {collapsed ? <HiOutlineChevronRight /> : <HiOutlineChevronLeft />}
          </button>
        </div>

        {/* Navigation Rail */}
        <nav className={styles.nav} aria-label="Admin navigation">
          <NavLink
            to="/admin/dashboard"
            end
            className={({ isActive }) => (isActive ? styles.active : "")}
            title="Overview"
          >
            <HiOutlineViewGrid />
            {!collapsed && <span>Overview</span>}
          </NavLink>

          <NavLink
            to="/admin/organizations"
            className={({ isActive }) => (isActive ? styles.active : "")}
            title="Organizations"
          >
            <HiOutlineOfficeBuilding />
            {!collapsed && <span>Organizations</span>}
          </NavLink>

          <NavLink
            to="/admin/elections"
            className={({ isActive }) => (isActive ? styles.active : "")}
            title="Elections"
          >
            <HiOutlineDocumentText />
            {!collapsed && <span>Elections</span>}
          </NavLink>

          <NavLink
            to="/admin/candidates"
            className={({ isActive }) => (isActive ? styles.active : "")}
            title="Candidates"
          >
            <HiOutlineUsers />
            {!collapsed && <span>Candidates</span>}
          </NavLink>
        </nav>

        {/* Logout Action */}
        <div className={styles.logoutSection}>
          <button
            type="button"
            className={styles.logoutBtn}
            onClick={() => {
              logout();
              navigate("/admin/login");
            }}
            title="Sign out"
          >
            <HiOutlineLogout />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;