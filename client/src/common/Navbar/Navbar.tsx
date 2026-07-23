import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  HiOutlineChartBar,
  HiOutlineLogout,
  HiOutlineUserCircle,
  HiOutlineShieldCheck,
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
        <span>VoteSecure</span>
      </Link>

      <nav className={styles.navLinks}>
        {user ? (
          <>
            <NavLink
              to="/elections"
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              <FaVoteYea />
              Elections
            </NavLink>

            <NavLink
              to="/results"
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              <HiOutlineChartBar />
              Results
            </NavLink>

            {isAdmin && (
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) => (isActive ? styles.active : "")}
              >
                <HiOutlineShieldCheck />
                Admin Panel
              </NavLink>
            )}

            <div className={styles.profile}>
              <HiOutlineUserCircle />
              <div>
                <span style={{ fontWeight: 600 }}>{user.username}</span>
              </div>
            </div>

            <button onClick={handleLogout} className={styles.logoutBtn}>
              <HiOutlineLogout />
              Logout
            </button>
          </>
        ) : (
          <Link to="/" className={styles.loginBtn}>
            Login
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
