import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  HiOutlineChartBar,
  HiOutlineLogout,
  HiOutlineUserCircle,
  HiOutlineShieldCheck,
  HiOutlineOfficeBuilding,
} from "react-icons/hi";
import { FaVoteYea } from "react-icons/fa";
import styles from "./Navbar.module.css";
import { useAuth } from "../../hooks/useAuth";
import { organizationService } from "../../services/organizationService";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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
              ? "/organizations"
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
              to="/organizations"
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              <FaVoteYea />
              Organizations
            </NavLink>

            <NavLink
              to="/organizations"
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
                {orgName && (
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#60a5fa",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <HiOutlineOfficeBuilding /> {orgName}
                  </div>
                )}
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
