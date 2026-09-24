import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  HiOutlineShieldCheck,
  HiOutlineUser,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineCheckCircle,
  HiOutlineSparkles,
} from "react-icons/hi";
import Button from "../../common/Button/Button";
import Input from "../../components/ui/Input";
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
    <div className="min-h-screen w-full flex bg-[#F9FAFB] font-sans">
      {/* Left Visual Brand Panel (Split Screen) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#1E1B4B] via-[#2E2880] to-[#5651D8] text-white flex-col justify-between p-12 overflow-hidden">
        {/* Background decorative artwork / overlay */}
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
            Trustworthy, Auditable &amp; Modern Voting
          </h1>
          <p className="text-base text-gray-200/90 leading-relaxed font-normal">
            Sign in to access your multi-tenant election portal, manage candidates, and cast encrypted digital ballots with complete auditability.
          </p>

          {/* Value Props */}
          <div className="pt-4 space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-200">
              <HiOutlineCheckCircle className="w-5 h-5 text-[#8ef0b3] flex-shrink-0" />
              <span>Multi-tenant organization isolation and access control</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-200">
              <HiOutlineCheckCircle className="w-5 h-5 text-[#8ef0b3] flex-shrink-0" />
              <span>Encrypted ballot submission with cryptographically verifiable receipts</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-200">
              <HiOutlineCheckCircle className="w-5 h-5 text-[#8ef0b3] flex-shrink-0" />
              <span>Real-time turnout analytics and automated PDF/Excel reporting</span>
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-[#E0E0E0] shadow-sm">
          {/* Header */}
          <div className="text-left space-y-2">
            <div className="lg:hidden flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-lg bg-[#5651D8] flex items-center justify-center text-white">
                <HiOutlineShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900 font-heading">
                Vote<span className="text-[#5651D8]">Secure</span>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 font-heading">
              Welcome back
            </h2>
            <p className="text-sm text-gray-500">
              Enter your credentials to access your account and active ballots.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600 flex items-start gap-2.5 animate-fadeIn">
                <span className="font-medium">{error}</span>
              </div>
            )}

            <div>
              <Input
                id="login-username"
                label="Username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                icon={<HiOutlineUser className="w-4 h-4" />}
                required
                autoComplete="username"
              />
            </div>

            <div>
              <Input
                id="login-password"
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<HiOutlineLockClosed className="w-4 h-4" />}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="p-1 text-gray-400 hover:text-[#5651D8] transition-colors focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <HiOutlineEyeOff className="w-4 h-4" />
                    ) : (
                      <HiOutlineEye className="w-4 h-4" />
                    )}
                  </button>
                }
                required
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              text={loading ? "Signing in..." : "Sign In to Account"}
              disabled={loading}
              loading={loading}
              fullWidth
              size="lg"
            />
          </form>

          {/* Bottom navigation */}
          <div className="pt-2 text-center text-sm text-gray-500 border-t border-[#E0E0E0]/80">
            Don't have an account?{" "}
            <Link
              to="/"
              className="font-semibold text-[#5651D8] hover:text-[#4843c2] hover:underline"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;