import { Link, useNavigate } from "react-router-dom";
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
        VotingSystem
      </Link>

      <nav className={styles.navLinks}>
        {user ? (
          <>
            <Link to="/Home">Home</Link>
            <Link to="/vote">Vote</Link>
            <Link to="/results">Results</Link>
            {user.role === "ADMIN" ? (
              <Link to="/admin/dashboard">Admin</Link>
            ) : null}
            <span className={styles.userLabel}>Hi, {user.username}</span>
            <button onClick={handleLogout} className={styles.loginBtn}>
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
