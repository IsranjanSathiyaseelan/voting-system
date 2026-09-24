import { useEffect, useState, useRef } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  HiOutlineViewGrid,
  HiOutlineDocumentText,
  HiOutlineUserGroup,
  HiOutlineLogout,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineShieldCheck,
  HiOutlineClipboardList,
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineDocumentReport,
  HiOutlineSearch,
  HiOutlineBell,
  HiOutlineExternalLink,
  HiOutlinePhone,
  HiOutlineUser,
} from "react-icons/hi";
import { useAuth } from "../../hooks/useAuth";
import styles from "./AdminLayout.module.css";

const navCls = (isActive: boolean, extraStyles?: string) =>
  `${styles.navItem} ${isActive ? styles.active : ""} ${extraStyles ?? ""}`.trim();

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(3);
  const [searchQuery, setSearchQuery] = useState("");

  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentView =
    new URLSearchParams(location.search).get("view") ?? "dashboard";
  const breadcrumbMap: Record<string, string> = {
    dashboard: "Dashboard",
    members: "Organization Members",
    elections: "Elections Status",
    analytics: "Voting Analytics",
    polls: "Polls",
    reports: "Reports & Exports",
  };
  const currentPageTitle = location.pathname.includes("/admin/elections")
    ? "Elections"
    : location.pathname.includes("/admin/candidates")
      ? "Candidates"
      : (breadcrumbMap[currentView] ?? "Dashboard");

  const isDashboardView = (view: string) =>
    location.pathname === "/admin/dashboard" && currentView === view;

  return (
    <div
      className={`${styles.layout} ${collapsed ? styles.layoutCollapsed : ""}`}
    >
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""}`}
      >
        <div className={styles.brandBlock}>
          <div className={styles.logoRow}>
            {!collapsed && (
              <div className={styles.brandText}>
                <h1>
                  Vote<span style={{ color: "#5651D8" }}>Secure</span>
                </h1>
                <span className={styles.badge}>ADMIN WORKSPACE</span>
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

        <nav className={styles.nav} aria-label="Admin navigation">
          <div className={styles.navSectionLabel}>
            {!collapsed && <span>MAIN NAVIGATION</span>}
          </div>

          <NavLink
            to="/admin/dashboard"
            end
            className={() =>
              navCls(
                isDashboardView("dashboard") ||
                  (location.pathname === "/admin/dashboard" &&
                    !location.search),
              )
            }
            title="Dashboard Overview"
          >
            <HiOutlineViewGrid className={styles.navIcon} />
            {!collapsed && <span>Dashboard</span>}
          </NavLink>

          <NavLink
            to="/admin/elections"
            className={({ isActive }) => navCls(isActive)}
            title="Elections"
          >
            <HiOutlineDocumentText className={styles.navIcon} />
            {!collapsed && <span>Elections</span>}
          </NavLink>

          <NavLink
            to="/admin/candidates"
            className={({ isActive }) => navCls(isActive)}
            title="Candidates"
          >
            <HiOutlineUserGroup className={styles.navIcon} />
            {!collapsed && <span>Candidates</span>}
          </NavLink>

          <NavLink
            to="/admin/dashboard?view=polls"
            className={() => navCls(isDashboardView("polls"))}
            title="Polls"
          >
            <HiOutlineClipboardList className={styles.navIcon} />
            {!collapsed && <span>Polls</span>}
          </NavLink>

          <NavLink
            to="/admin/dashboard?view=members"
            className={() => navCls(isDashboardView("members"))}
            title="Organization Members"
          >
            <HiOutlineUsers className={styles.navIcon} />
            {!collapsed && <span>Members</span>}
          </NavLink>

          <NavLink
            to="/admin/dashboard?view=analytics"
            className={() => navCls(isDashboardView("analytics"))}
            title="Voting Analytics"
          >
            <HiOutlineChartBar className={styles.navIcon} />
            {!collapsed && <span>Analytics</span>}
          </NavLink>

          <NavLink
            to="/admin/dashboard?view=reports"
            className={() => navCls(isDashboardView("reports"))}
            title="Reports & Exports"
          >
            <HiOutlineDocumentReport className={styles.navIcon} />
            {!collapsed && <span>Reports</span>}
          </NavLink>

          <div className={styles.navDivider} />

          <NavLink
            to="/elections"
            className={({ isActive }) => navCls(isActive)}
            title="Switch to Voter Portal"
          >
            <HiOutlineExternalLink className={styles.navIcon} />
            {!collapsed && <span>Voter Portal</span>}
          </NavLink>
        </nav>

        <div className={styles.sidebarFooter}>
          {!collapsed && user && (
            <div className={styles.userCard}>
              <div className={styles.avatar}>
                {user.username ? user.username.charAt(0).toUpperCase() : "A"}
              </div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>
                  {[user.firstName, user.lastName].filter(Boolean).join(" ") ||
                    user.username}
                </span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Content Area ────────────────────────────────────────────── */}
      <div className={styles.mainViewport}>
        {/* Top Utility Bar matching image reference */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.pageTitle}>{currentPageTitle}</h1>
          </div>

          {/* Right Circular Utilities */}
          <div className={styles.headerRight}>
            <div className={styles.profileWrapper} ref={profileMenuRef}>
              <button
                type="button"
                className={styles.circleIconBtn}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                title="Profile Menu"
              >
                <HiOutlineUser />
              </button>

              {showProfileMenu && (
                <div className={styles.profileDropdown}>
                  <div className={styles.profileDropdownHeader}>
                    <span>{user?.email}</span>
                  </div>
                  <div className={styles.profileDropdownDivider} />
                  <button
                    type="button"
                    className={`${styles.profileDropdownItem} ${styles.profileLogout}`}
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                  >
                    <HiOutlineLogout /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
