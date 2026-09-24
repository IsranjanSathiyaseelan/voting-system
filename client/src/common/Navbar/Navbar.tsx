import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  HiOutlineLogout,
  HiOutlineLockClosed,
  HiOutlineShieldCheck,
  HiArrowRight,
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

        {/* Floating Pill Navigation Area */}
        <nav className={styles.pillNavContainer}>
          {user ? (
            <>
              <div className={styles.pillMenu}>
                <NavLink
                  to="/elections"
                  className={({ isActive }) =>
                    `${styles.pillItem} ${isActive ? styles.pillActive : ""}`
                  }
                >
                  <FaVoteYea className={styles.linkIcon} />
                  <span>Elections</span>
                </NavLink>

                {isAdmin && (
                  <NavLink
                    to="/admin/dashboard"
                    className={({ isActive }) =>
                      `${styles.pillItem} ${isActive ? styles.pillActive : ""}`
                    }
                  >
                    <HiOutlineShieldCheck className={styles.linkIcon} />
                    <span>Admin Panel</span>
                  </NavLink>
                )}
              </div>

              {/* User Controls & Action */}
              <div className={styles.userControls}>
                <div className={styles.profileChip}>
                  <div className={styles.avatar}>
                    {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className={styles.userName}>{user.username}</span>
                </div>

                <button
                  onClick={handleLogout}
                  className={styles.darkActionBtn}
                  title="Sign out of your account"
                >
                  <span>Logout</span>
                  <div className={styles.actionIconCircle}>
                    <HiOutlineLogout />
                  </div>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className={styles.pillMenu}>
                <Link to="/" className={`${styles.pillItem} ${styles.pillActive}`}>
                  Home
                </Link>
                <Link to="/elections" className={styles.pillItem}>
                  Elections
                </Link>
                <Link to="#features" className={styles.pillItem}>
                  Features
                </Link>
                <Link to="#pricing" className={styles.pillItem}>
                  Pricing
                </Link>
                <Link to="#about" className={styles.pillItem}>
                  About
                </Link>
              </div>

              <Link to="/" className={styles.darkActionBtn}>
                <span>Get started</span>
                <div className={styles.actionIconCircle}>
                  <HiArrowRight />
                </div>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;