import { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { FaEye, FaEyeSlash, FaMoon, FaSun, FaArrowRight } from "react-icons/fa";
import stackTraceDark from "../assets/StackTrace.png";
import stackTraceLight from "../assets/StackTrackLight.png";

const Register = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") !== "light");
  const [form, setForm] = useState({
    password: "",
    confirmPassword: ""
  });

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
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isStrongPassword = (password) => /^(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&]).{6,}$/.test(password);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid invite link");
      return;
    }

    if (!form.password || !form.confirmPassword) {
      toast.error("Please fill password and confirm password");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!isStrongPassword(form.password)) {
      toast.error("Password must have 1 uppercase, 1 number & 1 special character");
      return;
    }

    try {
      await axios.post("http://localhost:8080/api/auth/register", { ...form, token });
      toast.success("Registered successfully!");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      console.log("Error Status:", err.response?.status);
      console.log("Error Data:", err.response?.data);

      if (err.response?.status === 403 || err.response?.status === 401) {
        toast.error("Access Denied: Backend is blocking the request");
      } else if (err.response?.data?.message === "Email already registered") {
        toast.error("User already registered");
      } else {
        toast.error(err.response?.data?.message || "Registration failed");
      }
    }
  };

  const currentLogo = darkMode ? stackTraceDark : stackTraceLight;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-950 text-white">
      <Toaster position="top-right" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.25),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.18),_transparent_32%),linear-gradient(135deg,_#020617_0%,_#0f172a_55%,_#111827_100%)]" />
      <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
      <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />

      <button
        onClick={() => setDarkMode((value) => !value)}
        className="absolute right-4 top-4 z-20 rounded-full border border-white/10 bg-white/10 p-3 text-white backdrop-blur-xl transition hover:bg-white/20 sm:right-6 sm:top-6"
        aria-label="Toggle theme"
      >
        {darkMode ? <FaSun /> : <FaMoon />}
      </button>

      <div className="relative z-10 flex h-full w-full items-center justify-center p-4">
        <section className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-white/95 p-6 text-slate-900 shadow-2xl shadow-black/40 backdrop-blur-xl dark:bg-[#0f172a]/95 dark:text-white sm:p-8">
          <div className="mx-auto flex max-w-lg flex-col">
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-6 flex items-center justify-center transition-all duration-300">
                <img
                  src={currentLogo}
                  alt="StackTrace Logo"
                  className="h-14 w-auto object-contain sm:h-16"
                />
              </div>
                           
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                Set your password
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Your profile details are already assigned by admin. Create a password to activate your account.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="********"
                      value={form.password}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-slate-900 outline-none transition focus:border-teal-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:bg-slate-800"
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="********"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-slate-900 outline-none transition focus:border-teal-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:bg-slate-800"
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                Password must include 1 uppercase letter, 1 number, and 1 special character.
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r bg-teal-900 px-4 py-3.5 font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-teal-900 hover:to-teal-950"
              >
                Sign Up
                <FaArrowRight className="text-sm" />
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-teal-900 transition hover:text-teal-950">
                Sign In
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Register;
