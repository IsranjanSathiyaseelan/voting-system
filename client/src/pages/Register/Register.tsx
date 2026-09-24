import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  HiOutlineShieldCheck,
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineOfficeBuilding,
  HiOutlineCheck,
  HiOutlineCheckCircle,
  HiOutlineSparkles,
} from "react-icons/hi";
import Button from "../../common/Button/Button";
import Input from "../../components/ui/Input";
import { useAuth } from "../../hooks/useAuth";
import { userService } from "../../services/userService";
import { authService } from "../../services/authService";
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
          const data: Organization[] = await userService.getOrganizations();
          setOrganizations(data);
        } catch {
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
      await userService.register({
        username,
        email,
        password,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        organizationId: parsedOrgId,
        newOrganizationName:
          orgMode === "create" ? newOrganizationName.trim() : undefined,
      });

      // Automatically authenticate the registered user to acquire JWT token and establish session
      const loggedInUser = await authService.login({ username, password });
      login(loggedInUser);
      const isAdmin = [
        "SUPER_ADMIN",
        "ORGANIZATION_ADMIN",
        "ELECTION_MANAGER",
        "ADMIN",
      ].includes(loggedInUser.role);

      navigate(isAdmin ? "/admin/dashboard" : "/organizations");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  };

  const isStep1Complete = username.trim() !== "" && email.trim() !== "" && password.trim() !== "";

  return (
    <div className="min-h-screen w-full flex bg-[#F9FAFB] font-sans">
      {/* Left Visual Brand Panel (Split Screen) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#1E1B4B] via-[#2E2880] to-[#5651D8] text-white flex-col justify-between p-12 overflow-hidden">
        {/* Background artwork */}
        <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay">
          <img
            src={SignUp}
            alt="VoteSecure Background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#5651D8]/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#7c75f8]/30 rounded-full blur-3xl pointer-events-none" />

        {/* Top Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner">
            <HiOutlineShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white font-heading">
            Vote<span className="text-[#a5a0fb]">Secure</span>
          </span>
        </div>

        {/* Center Content / Highlights */}
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold uppercase tracking-wider text-[#d6d3fc]">
            <HiOutlineSparkles className="w-4 h-4 text-[#ffd166]" />
            Enterprise Election Platform
          </div>
          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight text-white font-heading">
            Empower Your Community with Verifiable Votes
          </h1>
          <p className="text-base text-gray-200/90 leading-relaxed font-normal">
            Create your account to cast verified votes in organization polls or launch your own multi-candidate elections with full governance tools.
          </p>

          {/* Value Props */}
          <div className="pt-4 space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-200">
              <HiOutlineCheckCircle className="w-5 h-5 text-[#8ef0b3] flex-shrink-0" />
              <span>Independent tenant workspaces for universities, unions, &amp; companies</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-200">
              <HiOutlineCheckCircle className="w-5 h-5 text-[#8ef0b3] flex-shrink-0" />
              <span>Cryptographic ballot receipt token generation for audit verification</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-200">
              <HiOutlineCheckCircle className="w-5 h-5 text-[#8ef0b3] flex-shrink-0" />
              <span>One-click voter status management and exportable compliance reports</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-gray-300/80 border-t border-white/10 pt-6">
          <span>&copy; {new Date().getFullYear()} VoteSecure Inc. All rights reserved.</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            System Operational
          </span>
        </div>
      </div>

      {/* Right Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-14 overflow-y-auto">
        <div className="w-full max-w-lg space-y-7 bg-white p-8 sm:p-10 rounded-2xl border border-[#E0E0E0] shadow-sm my-auto">
          {/* Header */}
          <div className="text-left space-y-2">
            <div className="lg:hidden flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[#5651D8] flex items-center justify-center text-white">
                <HiOutlineShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900 font-heading">
                Vote<span className="text-[#5651D8]">Secure</span>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 font-heading">
              Create Account
            </h2>
            <p className="text-sm text-gray-500">
              Set up your profile to participate in elections or manage an organization.
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="bg-[#F9FAFB] p-3.5 rounded-xl border border-[#E0E0E0]">
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="flex items-center gap-1.5 text-[#5651D8]">
                <span className="w-5 h-5 rounded-full bg-[#5651D8] text-white flex items-center justify-center text-[10px] font-bold">
                  {isStep1Complete ? <HiOutlineCheck className="w-3.5 h-3.5" /> : "1"}
                </span>
                Account Credentials
              </span>
              <span className="h-0.5 flex-1 mx-3 bg-[#E0E0E0] relative">
                <span
                  className="absolute left-0 top-0 h-full bg-[#5651D8] transition-all duration-300"
                  style={{ width: isStep1Complete ? "100%" : "30%" }}
                />
              </span>
              <span
                className={`flex items-center gap-1.5 ${
                  orgMode !== "none" ? "text-[#5651D8]" : "text-gray-500"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    orgMode !== "none"
                      ? "bg-[#5651D8] text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  2
                </span>
                Organization
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600 flex items-start gap-2.5 animate-fadeIn">
                <span className="font-medium">{error}</span>
              </div>
            )}

            <div className="space-y-3.5">
              <Input
                id="reg-username"
                label="Username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                icon={<HiOutlineUser className="w-4 h-4" />}
                required
              />

              <Input
                id="reg-email"
                label="Email Address"
                type="email"
                placeholder="name@organization.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<HiOutlineMail className="w-4 h-4" />}
                required
              />

              <Input
                id="reg-password"
                label="Password"
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<HiOutlineLockClosed className="w-4 h-4" />}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  id="reg-firstname"
                  label="First Name (optional)"
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <Input
                  id="reg-lastname"
                  label="Last Name (optional)"
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            {/* Organization Segment Toggle */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Organization Affiliation
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F9FAFB] rounded-xl border border-[#E0E0E0]">
                <button
                  type="button"
                  onClick={() => {
                    setOrgMode("none");
                    setSelectedOrgId("");
                    setNewOrganizationName("");
                  }}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                    orgMode === "none"
                      ? "bg-[#5651D8] text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white"
                  }`}
                >
                  None
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOrgMode("join");
                    setNewOrganizationName("");
                  }}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                    orgMode === "join"
                      ? "bg-[#5651D8] text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white"
                  }`}
                >
                  Join Existing
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOrgMode("create");
                    setSelectedOrgId("");
                  }}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                    orgMode === "create"
                      ? "bg-[#5651D8] text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white"
                  }`}
                >
                  Create New
                </button>
              </div>
            </div>

            {/* Dynamic Field: Join Organization Dropdown */}
            {orgMode === "join" && (
              <div className="p-3.5 bg-[#EEF0FD]/60 rounded-xl border border-[#5651D8]/20 space-y-2 animate-fadeIn">
                <label
                  htmlFor="reg-org-select"
                  className="block text-xs font-semibold text-[#5651D8] uppercase tracking-wider"
                >
                  Select Organization
                </label>
                <div className="relative">
                  <select
                    id="reg-org-select"
                    value={selectedOrgId}
                    onChange={(e) => setSelectedOrgId(e.target.value)}
                    disabled={fetchingOrgs}
                    required
                    className="w-full rounded-lg border border-[#E0E0E0] bg-white text-gray-900 text-sm px-3.5 py-2.5 transition-all focus:outline-none focus:border-[#5651D8] focus:ring-2 focus:ring-[#5651D8]/20 disabled:bg-gray-100"
                  >
                    <option value="" disabled>
                      {fetchingOrgs
                        ? "Loading organizations..."
                        : "Select your organization"}
                    </option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-gray-500">
                  You will register as a voter member in this organization.
                </p>
              </div>
            )}

            {/* Dynamic Field: Create Organization Input */}
            {orgMode === "create" && (
              <div className="p-3.5 bg-[#EEF0FD]/60 rounded-xl border border-[#5651D8]/20 space-y-2 animate-fadeIn">
                <Input
                  id="reg-org-name"
                  label="New Organization Name"
                  type="text"
                  placeholder="e.g., Acme Corp, Engineering Council"
                  value={newOrganizationName}
                  onChange={(e) => setNewOrganizationName(e.target.value)}
                  icon={<HiOutlineOfficeBuilding className="w-4 h-4" />}
                  required
                />
                <p className="text-xs text-[#5651D8] font-medium">
                  ✓ You will be automatically granted Organization Admin privileges.
                </p>
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                text={loading ? "Creating account..." : "Complete Registration"}
                disabled={loading}
                loading={loading}
                fullWidth
                size="lg"
              />
            </div>
          </form>

          {/* Footer Navigation */}
          <div className="pt-2 text-center text-sm text-gray-500 border-t border-[#E0E0E0]/80">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#5651D8] hover:text-[#4843c2] hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
