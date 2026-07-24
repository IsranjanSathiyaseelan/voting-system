import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  HiOutlineLogout,
  HiOutlineShieldCheck,
  HiOutlineLockClosed,
} from "react-icons/hi";
import { FaVoteYea } from "react-icons/fa";
import styles from "./Navbar.module.css";
import { useAuth } from "../../hooks/useAuth";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isAdmin =
    user &&
    [
      "SUPER_ADMIN",
      "ORGANIZATION_ADMIN",
      "ELECTION_MANAGER",
      "ADMIN",
    ].includes(user.role);

  return (
    <header className={styles.navbar}>
      <div className={styles.container}>
        {/* Brand / Logo */}
        <Link
          to={
            isAdmin
              ? "/admin/dashboard"
              : user
                ? "/elections"
                : "/"
          }
          className={styles.logo}
        >
          <div className={styles.logoBadge}>
            <HiOutlineLockClosed />
          </div>
          <span className={styles.logoText}>
            Vote<span className={styles.logoHighlight}>Secure</span>
          </span>
        </Link>

        {/* Navigation Area */}
        <nav className={styles.navWrapper}>
          {user ? (
            <>
              {/* Primary Navigation Links */}
              <div className={styles.navLinks}>
                <NavLink
                  to="/elections"
                  className={({ isActive }) =>
                    `${styles.navItem} ${isActive ? styles.active : ""}`
                  }
                >
                  <FaVoteYea className={styles.linkIcon} />
                  <span>Elections</span>
                </NavLink>

                {isAdmin && (
                  <NavLink
                    to="/admin/dashboard"
                    className={({ isActive }) =>
                      `${styles.navItem} ${isActive ? styles.active : ""}`
                    }
                  >
                    <HiOutlineShieldCheck className={styles.linkIcon} />
                    <span>Admin Panel</span>
                  </NavLink>
                )}
              </div>

              {/* User Profile & Actions */}
              <div className={styles.userControls}>
                <div className={styles.profileChip}>
                  <div className={styles.avatar}>
                    {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className={styles.profileDetails}>
                    <span className={styles.userName}>{user.username}</span>
                    {isAdmin && <span className={styles.roleBadge}>Admin</span>}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className={styles.logoutBtn}
                  title="Sign out of your account"
                >
                  <HiOutlineLogout className={styles.logoutIcon} />
                  <span className={styles.logoutText}>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <Link to="/" className={styles.loginBtn}>
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;