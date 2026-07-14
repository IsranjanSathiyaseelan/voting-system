import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../common/Button/Button";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/authService";
import styles from "./AdminLogin.module.css";

const AdminLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await authService.adminLogin({ username, password });
      login(user);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to sign in as admin.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.badge}>Admin Access</span>
          <h1>Secure admin sign in</h1>
          <p>Use the administrator credentials to manage the election.</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.field}>
            <span>Username</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="admin"
              autoComplete="username"
            />
          </label>

          <label className={styles.field}>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="admin123"
              autoComplete="current-password"
            />
          </label>

          {error ? <p className={styles.error}>{error}</p> : null}

          <Button text={loading ? "Signing in..." : "Sign in"} type="submit" />
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
