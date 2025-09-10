// client/src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { authService } from "../services/auth";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await authService.login(formData.email, formData.password);
      // Optional: persist email when "remember me" is checked
      if (remember) localStorage.setItem("last_email", formData.email);
      navigate("/dashboard");
    } catch (err) {
      const message =
        (err.message === "NO_TOKEN" &&
          "Server did not include a token. Check API response (data.token/accessToken).") ||
        err.response?.data?.message ||
        (err.response?.status === 401 ? "Invalid email or password" : "") ||
        err.message ||
        "Login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const last = localStorage.getItem("last_email");
    if (last) setFormData((p) => ({ ...p, email: last }));
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-500/25 blur-3xl" />
        <div className="absolute top-1/3 -left-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center px-6">
        <div className="grid w-full items-stretch gap-10 lg:grid-cols-2">
          {/* Brand / Left panel (visible on lg+) */}
          <div className="hidden flex-col justify-center lg:flex">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Taskly</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Secure, fast and delightful access.
                </p>
              </div>
            </div>

            <div className="mt-10 space-y-6">
              <div className="rounded-2xl border border-slate-200/70 bg-white/60 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-900/40">
                <p className="text-lg font-medium">Welcome back 👋</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Pick up where you left off. Your data is encrypted and protected with industry‑grade security.
                </p>
              </div>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <li>• SSO‑ready and MFA compatible</li>
                <li>• Privacy‑first with session isolation</li>
                <li>• 24/7 access on any device</li>
              </ul>
            </div>
          </div>

          {/* Auth card */}
          <div className="mx-auto w-full max-w-md">
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-semibold tracking-tight">Sign in to your account</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  New here?{" "}
                  <Link to="/register" className="font-medium text-blue-600 hover:underline">
                    Create an account
                  </Link>
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mt-0.5">
                    <path d="M11 7h2v6h-2V7zm0 8h2v2h-2v-2z" />
                    <path d="M1 21h22L12 2 1 21z" opacity=".2" />
                  </svg>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@company.com"
                      className="block w-full rounded-lg border border-slate-300 bg-white/70 py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="block w-full rounded-lg border border-slate-300 bg-white/70 py-2.5 pl-10 pr-10 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      disabled={loading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Options */}
                <div className="flex items-center justify-between">
                  <label className="flex cursor-pointer select-none items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    Remember me
                  </label>

                  <Link
                    to="/forgot"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    "Sign in"
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                <span className="text-xs uppercase tracking-wider text-slate-500">or</span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              </div>

              {/* Secondary action */}
              <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                Don’t have an account?{" "}
                <Link to="/register" className="font-medium text-blue-600 hover:underline">
                  Create one
                </Link>
              </p>
            </div>

            {/* Small legal/footnote */}
            <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-500">
              By continuing, you agree to our{" "}
              <Link to="/terms" className="underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;