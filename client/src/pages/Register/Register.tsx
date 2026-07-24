import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Button from "../../common/Button/Button";
import styles from "./Register.module.css";
import { useAuth } from "../../hooks/useAuth";
import { userService } from "../../services/userService";
import SignUp from "../../assets/SignUp.jpg";

type OrgMode = "none" | "join" | "create";

interface Organization {
  id: number;
  name: string;
}

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [orgMode, setOrgMode] = useState<OrgMode>("none");

  // Organization state
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [fetchingOrgs, setFetchingOrgs] = useState(false);
  const [newOrganizationName, setNewOrganizationName] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Fetch available organizations when user switches to "join" mode
  useEffect(() => {
    if (orgMode === "join" && organizations.length === 0) {
      const fetchOrgs = async () => {
        setFetchingOrgs(true);
        try {
          // Replace with your actual service call to fetch organizations list
          // Example: const data = await organizationService.getAll();
          const data: Organization[] = await userService.getOrganizations();
          setOrganizations(data);
        } catch (err) {
          setError("Failed to load available organizations.");
        } finally {
          setFetchingOrgs(false);
        }
      };

      fetchOrgs();
    }
  }, [orgMode, organizations.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (orgMode === "join" && !selectedOrgId) {
      setError("Please select an organization to join.");
      return;
    }
    if (orgMode === "create" && !newOrganizationName.trim()) {
      setError("Please enter a name for your new organization.");
      return;
    }

    const parsedOrgId =
      orgMode === "join" ? parseInt(selectedOrgId, 10) : undefined;

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
      {/* Left Image Section */}
      <div className={styles.left}>
        <img src={SignUp} alt="Sign Up Visual" />
        <div className={styles.overlay}>
          <h3>Shape your future</h3>
          <p>Join organized elections and submit your votes seamlessly.</p>
        </div>
      </div>

      {/* Right Form Section */}
      <div className={styles.right}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.header}>
            <h2>Create Account</h2>
            <p className={styles.subtitle}>
              Create your account to start voting
            </p>
          </div>

          <div className={styles.inputGroup}>
            <input
              id="reg-username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <input
              id="reg-email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <input
              id="reg-password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

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

          {/* Organization Segment Toggle */}
          <div className={styles.orgSection}>
            <label className={styles.sectionLabel}>
              Organization Membership
            </label>
            <div className={styles.orgToggle}>
              <button
                type="button"
                className={`${styles.orgBtn} ${orgMode === "none" ? styles.orgBtnActive : ""}`}
                onClick={() => {
                  setOrgMode("none");
                  setSelectedOrgId("");
                  setNewOrganizationName("");
                }}
              >
                None
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
                  setSelectedOrgId("");
                }}
              >
                Create New
              </button>
            </div>
          </div>

          {/* Dynamic Field: Join Organization Dropdown */}
          {orgMode === "join" && (
            <div className={styles.orgField}>
              <select
                id="reg-org-select"
                className={styles.select}
                value={selectedOrgId}
                onChange={(e) => setSelectedOrgId(e.target.value)}
                disabled={fetchingOrgs}
                required
              >
                <option value="" disabled>
                  {fetchingOrgs
                    ? "Loading organizations..."
                    : "Select an organization"}
                </option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
              <p className={styles.hint}>
                Select the organisation you are affiliated with.
              </p>
            </div>
          )}

          {/* Dynamic Field: Create Organization Input */}
          {orgMode === "create" && (
            <div className={styles.orgField}>
              <input
                id="reg-org-name"
                type="text"
                placeholder="New organization name"
                value={newOrganizationName}
                onChange={(e) => setNewOrganizationName(e.target.value)}
                required
              />
              <p className={styles.hint}>
                You will be registered as the Organization Admin.
              </p>
            </div>
          )}

          {error && <div className={styles.error}>{error}</div>}

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
