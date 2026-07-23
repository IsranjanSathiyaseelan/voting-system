import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Button from "../../common/Button/Button";
import styles from "./Register.module.css";
import { useAuth } from "../../hooks/useAuth";
import { userService } from "../../services/userService";
import { organizationService } from "../../services/organizationService";
import type { Organization } from "../../types/organization";
import SignUp from "../../assets/SignUp.jpg";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        const data = await organizationService.getAll();
        setOrganizations(data);
      } catch (err) {
        console.error("Failed to load organizations:", err);
      }
    };
    void loadOrganizations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await userService.register({
        username,
        email,
        password,
        organizationId: organizationId ? parseInt(organizationId, 10) : undefined,
        role: "VOTER",
      });
      login(user);
      navigate("/organizations");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create your account.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Left Image */}
      <div className={styles.left}>
        <img src={SignUp} alt="Sign Up" />
      </div>

      {/* Right Side */}
      <div className={styles.right}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h2>Create Account</h2>
          <p className={styles.subtitle}>Create your account to start voting</p>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <select
            value={organizationId}
            onChange={(e) => setOrganizationId(e.target.value)}
            className={styles.select}
          >
            <option value="">Select Organization (Optional)</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>

          {error && <p className={styles.error}>{error}</p>}

          <Button
            text={loading ? "Creating account..." : "Create Account"}
            type="submit"
            disabled={loading}
          />

          <p className={styles.loginText}>
            Already have an account?
            <Link to="/login" className={styles.loginLink}>
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
