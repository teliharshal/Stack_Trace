import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowRight, FaEye, FaEyeSlash, FaLock, FaMoon, FaSun } from "react-icons/fa";
import stackTraceDark from "../assets/StackTrace.png";
import stackTraceLight from "../assets/StackTrackLight.png";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") !== "light");
  const [formData, setFormData] = useState({
    email: location.state?.email || "",
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });

  const emailHint = useMemo(
    () => location.state?.email || "No email found from the previous step",
    [location.state?.email]
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleReset = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await axios.post("http://localhost:8080/api/auth/verify-otp", {
        email: formData.email,
        otp: formData.otp
      });

      await axios.post("http://localhost:8080/api/auth/reset-password", {
        email: formData.email,
        newPassword: formData.newPassword
      });

      toast.success("Password reset successful");
      setTimeout(() => navigate("/login"), 1200);
    } catch {
      toast.error("Invalid OTP or unable to reset password");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white px-4 py-8 sm:px-6 lg:px-8">
      <Toaster position="top-right" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.22),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.22),_transparent_30%),linear-gradient(135deg,_#020617_0%,_#0f172a_60%,_#111827_100%)]" />
      <div className="absolute -left-16 top-20 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
      <div className="absolute -right-10 bottom-0 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />

      <button
        type="button"
        onClick={() => setDarkMode((value) => !value)}
        className="absolute right-4 top-4 z-20  items-center gap-2 rounded-full  border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-xl transition hover:bg-white/20 sm:right-6 sm:top-6"
        aria-label="Toggle theme"
      >
        {darkMode ? <FaSun className="text-sm" /> : <FaMoon className="text-sm" />}
        {/* <span>{darkMode ? "Light mode" : "Dark mode"}</span> */}
      </button>

      <div className="relative z-10 mx-auto flex w-full max-w-2xl items-center justify-center py-6 sm:py-10">
        <section className="w-full rounded-[1.5rem] border border-white/10 bg-white/95 px-5 py-6 text-slate-900 shadow-2xl shadow-black/30 backdrop-blur-xl dark:bg-slate-950/90 dark:text-white sm:px-8 sm:py-7">
          <div className="mx-auto flex w-full max-w-xl flex-col">
            <div className="mb-5 text-center">
              <div className="mb-3 flex justify-center">
                <img
                  src={darkMode ? stackTraceDark : stackTraceLight}
                  alt="StackTrace logo"
                  className="h-14 w-auto object-contain sm:h-16"
                />
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                <FaLock className="text-[10px]" />
                Reset Password
              </div>
              <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-[2rem]">
                Choose a new password
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Enter the OTP sent to your email and confirm your new password.
              </p>
            </div>

            <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Account:</span>{" "}
              {emailHint}
            </div>

            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  OTP
                </label>
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter OTP"
                  value={formData.otp}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="relative">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="newPassword"
                      placeholder="Enter new password"
                      value={formData.newPassword}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:bg-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
                      aria-label={showPassword ? "Hide new password" : "Show new password"}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:bg-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-6 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                Passwords must match before reset is submitted.
              </div>

              <button
                type="submit"
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-3 font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:from-indigo-500 hover:to-fuchsia-500"
              >
                Reset Password
                <FaArrowRight className="text-sm" />
              </button>
            </form>

            <div className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
              Need another OTP? Return to the forgot password flow and request a fresh code.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ResetPassword;
