import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  HiOutlineViewGrid,
  HiOutlineDocumentText,
  HiOutlineLogout,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineShieldCheck,
  HiOutlineUser,
} from "react-icons/hi";
import { useAuth } from "../../hooks/useAuth";
import { organizationService } from "../../services/organizationService";
import styles from "./AdminLayout.module.css";

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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

  const currentPageTitle = location.pathname.includes("/elections")
    ? "Elections Management"
    : "Overview & Analytics";

  return (
    <div className={`${styles.layout} ${collapsed ? styles.layoutCollapsed : ""}`}>
      {/* Sidebar Navigation */}
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
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}
            title="Overview"
          >
            <HiOutlineViewGrid />
            {!collapsed && <span>Overview</span>}
          </NavLink>

          <NavLink
            to="/admin/elections"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}
            title="Elections"
          >
            <HiOutlineDocumentText />
            {!collapsed && <span>Elections</span>}
          </NavLink>
        </nav>

        {/* Footer & Logout Section */}
        <div className={styles.sidebarFooter}>
          {/* User Profile Summary */}
          {!collapsed && user && (
            <div className={styles.userCard}>
              <div className={styles.avatar}>
                <HiOutlineUser />
              </div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>
                  {[user.firstName, user.lastName].filter(Boolean).join(" ") || user.username}
                </span>
                <span className={styles.userEmail}>{user.email}</span>
              </div>
            </div>
          )}

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

      {/* Main Content Area */}
      <div className={styles.mainViewport}>
        {/* Top Header Bar */}
        <header className={styles.header}>
          <div className={styles.breadcrumb}>
            <span className={styles.breadcrumbRoot}>Admin</span>
            <span className={styles.breadcrumbDivider}>/</span>
            <span className={styles.breadcrumbCurrent}>{currentPageTitle}</span>
          </div>

          <div className={styles.headerStatus} title="System operational">
            <span className={styles.statusDot}></span>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;