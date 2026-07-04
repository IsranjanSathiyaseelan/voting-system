import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  HiOutlineHome,
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

  return (
    <header className={styles.navbar}>
      <Link to={user ? "/Home" : "/"} className={styles.logo}>
        <FaVoteYea />
        <span>VoteSecure</span>
      </Link>

      <nav className={styles.navLinks}>
        {user ? (
          <>
            <NavLink
              to="/Home"
              className={({ isActive }) =>
                isActive ? styles.active : ""
              }
            >
              <HiOutlineHome />
              Home
            </NavLink>

            <NavLink
              to="/vote"
              className={({ isActive }) =>
                isActive ? styles.active : ""
              }
            >
              <FaVoteYea />
              Vote
            </NavLink>

            <NavLink
              to="/results"
              className={({ isActive }) =>
                isActive ? styles.active : ""
              }
            >
              <HiOutlineChartBar />
              Results
            </NavLink>

            {user.role === "ADMIN" && (
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) =>
                  isActive ? styles.active : ""
                }
              >
                <HiOutlineShieldCheck />
                Admin
              </NavLink>
            )}

            <div className={styles.profile}>
              <HiOutlineUserCircle />
              <span>{user.username}</span>
            </div>

            <button
              onClick={handleLogout}
              className={styles.logoutBtn}
            >
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