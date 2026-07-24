import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Button from "../../common/Button/Button";
import styles from "./Login.module.css";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/authService";
import SignUp from "../../assets/SignUp.jpg";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await authService.login({ username, password });
      login(user);
      const isAdmin = [
        "SUPER_ADMIN",
        "ORGANIZATION_ADMIN",
        "ELECTION_MANAGER",
        "ADMIN",
      ].includes(user.role);
      navigate(isAdmin ? "/admin/dashboard" : "/organizations");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Left Visual Banner */}
      <div className={styles.left}>
        <img src={SignUp} alt="Sign In Visual" />
        <div className={styles.overlay}>
          <h3>Welcome back</h3>
          <p>Sign in to access your dashboard and participate in active elections.</p>
        </div>
      </div>

      {/* Right Form Section */}
      <div className={styles.right}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.header}>
            <h2>Sign in</h2>
            <p className={styles.subtitle}>
              Please enter your details to access your account
            </p>
          </div>

          <div className={styles.inputGroup}>
            <input
              id="login-username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.passwordWrapper}>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <Button
            text={loading ? "Signing in..." : "Login"}
            type="submit"
            disabled={loading}
          />

          <p className={styles.registerText}>
            Don't have an account?
            <Link to="/" className={styles.registerLink}>
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;