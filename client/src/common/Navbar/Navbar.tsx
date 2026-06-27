import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";
import { useState } from "react";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <header className={styles.navbar}>
      {/* Logo */}
      <Link to="/" className={styles.logo}>
        VotingSystem
      </Link>

      {/* Navigation Links */}
      <nav className={styles.navLinks}>
        <Link to="/">Home</Link>
        <Link to="/results">Results</Link>

        {isLoggedIn && <Link to="/profile">Profile</Link>}

        {isLoggedIn ? (
          <button onClick={handleLogout} className={styles.loginBtn}>
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            className={styles.loginBtn}
            onClick={() => setIsLoggedIn(true)}
          >
            Login
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
