import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import Button from "../../common/Button/Button";
import styles from "./Login.module.css";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/authService";

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
      navigate(user.role === "ADMIN" ? "/admin/dashboard" : "/Home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2>Welcome back</h2>
        <p className={styles.subtitle}>Sign in to continue voting</p>

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

        {error ? <p className={styles.error}>{error}</p> : null}

        <Button
          text={loading ? "Signing in..." : "Login"}
          type="submit"
          disabled={loading}
        />

        <p className={styles.registerText}>
          Don't have an account?{" "}
          <Link to="/register" className={styles.registerLink}>
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
