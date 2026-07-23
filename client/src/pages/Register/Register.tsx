import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Button from "../../common/Button/Button";
import styles from "./Register.module.css";
import { useAuth } from "../../hooks/useAuth";
import { userService } from "../../services/userService";
import SignUp from "../../assets/SignUp.jpg";

type OrgMode = "none" | "join" | "create";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [orgMode, setOrgMode] = useState<OrgMode>("none");
  const [organizationId, setOrganizationId] = useState("");
  const [newOrganizationName, setNewOrganizationName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (orgMode === "join" && !organizationId.trim()) {
      setError("Please enter an Organization ID to join.");
      return;
    }
    if (orgMode === "create" && !newOrganizationName.trim()) {
      setError("Please enter a name for your new organization.");
      return;
    }

    const parsedOrgId =
      orgMode === "join" && organizationId.trim()
        ? parseInt(organizationId.trim(), 10)
        : undefined;

    if (orgMode === "join" && parsedOrgId !== undefined && isNaN(parsedOrgId)) {
      setError("Organization ID must be a valid number.");
      return;
    }

    setLoading(true);

    try {
      const user = await userService.register({
        username,
        email,
        password,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        organizationId: parsedOrgId,
        newOrganizationName:
          orgMode === "create" ? newOrganizationName.trim() : undefined,
      });

      login(user);
      const isAdmin = [
        "SUPER_ADMIN",
        "ORGANIZATION_ADMIN",
        "ELECTION_MANAGER",
        "ADMIN",
      ].includes(user.role);
      navigate(isAdmin ? "/admin/dashboard" : "/organizations");
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
            id="reg-username"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            id="reg-email"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            id="reg-password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className={styles.nameRow}>
            <input
              id="reg-firstname"
              type="text"
              placeholder="First name (optional)"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <input
              id="reg-lastname"
              type="text"
              placeholder="Last name (optional)"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          {/* Organization Mode Toggle */}
          <div className={styles.orgToggle}>
            <button
              type="button"
              className={`${styles.orgBtn} ${orgMode === "none" ? styles.orgBtnActive : ""}`}
              onClick={() => {
                setOrgMode("none");
                setOrganizationId("");
                setNewOrganizationName("");
              }}
            >
              No Organization
            </button>
            <button
              type="button"
              className={`${styles.orgBtn} ${orgMode === "join" ? styles.orgBtnActive : ""}`}
              onClick={() => {
                setOrgMode("join");
                setNewOrganizationName("");
              }}
            >
              Join Existing
            </button>
            <button
              type="button"
              className={`${styles.orgBtn} ${orgMode === "create" ? styles.orgBtnActive : ""}`}
              onClick={() => {
                setOrgMode("create");
                setOrganizationId("");
              }}
            >
              Create New
            </button>
          </div>

          {orgMode === "join" && (
            <div className={styles.orgField}>
              <input
                id="reg-org-id"
                type="number"
                placeholder="Enter Organization ID (ask your admin)"
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                min="1"
              />
              <p className={styles.hint}>
                Contact your organization administrator to get the Organization ID.
              </p>
            </div>
          )}

          {orgMode === "create" && (
            <div className={styles.orgField}>
              <input
                id="reg-org-name"
                type="text"
                placeholder="New organization name"
                value={newOrganizationName}
                onChange={(e) => setNewOrganizationName(e.target.value)}
              />
              <p className={styles.hint}>
                You will be registered as the Organization Admin.
              </p>
            </div>
          )}

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
