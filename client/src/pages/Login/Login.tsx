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
      navigate(user.role === "ADMIN" ? "/admin/dashboard" : "/organizations");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Left Side */}
      <div className={styles.left}>
        <img src={SignUp} alt="Sign Up" />
      </div>

      {/* Right Side */}
      <div className={styles.right}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h2>Sign in</h2>
          <p className={styles.subtitle}>
            Welcome back! Please sign in to continue
          </p>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className={styles.error}>{error}</p>}

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
