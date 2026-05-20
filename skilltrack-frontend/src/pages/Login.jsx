import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { FaMoon, FaSun, FaEye, FaEyeSlash } from "react-icons/fa";
import stackTraceDark from "../assets/StackTrace.png";
import stackTraceLight from "../assets/StackTrackLight.png";
import { getRoleDashboardPath, normalizeRole } from "../utils/roles";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const [loginData, setLoginData] = useState({ email: "", password: "" });

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
    setLoginData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8080/api/auth/login", loginData);

      const role = normalizeRole(response.data.role);
      const userData = {
        id: response.data.id,
        name: response.data.name,
        email: response.data.email,
        password: loginData.password,
        role,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      if (role === "ADMIN") {
        localStorage.setItem("admin", JSON.stringify(userData));
      } else {
        localStorage.setItem("employeeName", response.data.name);
        localStorage.setItem("employeeId", response.data.id);
      }

      toast.success("Login Successful");
      setTimeout(() => {
        navigate(getRoleDashboardPath(role));
      }, 900);
    } catch (error) {
      const message = String(error?.response?.data || "").toLowerCase();

      if (message.includes("access denied")) {
        toast.error("Access denied: use the correct login for your role");
      } else {
        toast.error("Invalid Email or Password");
      }

      localStorage.removeItem("user");
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-950 text-white">
      <Toaster position="top-right" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.25),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.22),_transparent_32%),linear-gradient(135deg,_#020617_0%,_#0f172a_55%,_#111827_100%)]" />
      <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
      <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />

      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute right-4 top-4 z-20 rounded-full border border-white/10 bg-white/10 p-3 text-white backdrop-blur-xl transition hover:bg-white/20 sm:right-6 sm:top-6"
        aria-label="Toggle theme"
      >
        {darkMode ? <FaSun /> : <FaMoon />}
      </button>

      <div className="relative z-10 flex h-full w-full items-center justify-center p-4">
        <section className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-white/95 p-6 text-slate-900 shadow-2xl shadow-black/40 backdrop-blur-xl dark:bg-[#25343F] dark:text-white sm:p-8">
          <div className="mx-auto flex max-w-lg flex-col">
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-6 flex items-center justify-center transition-all duration-300">
                <img
                  src={darkMode ? stackTraceDark : stackTraceLight}
                  alt="StackTrace Logo"
                  className="h-14 w-auto object-contain sm:h-16"
                />
              </div>
              <h2 className="text-2xl font-black tracking-tight sm:text-[2.4rem]">
               Sign In
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Sign in to continue learning and managing your progress.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={loginData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-950 dark:bg-slate-900 dark:text-white dark:focus:bg-slate-800"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-slate-900 outline-none transition focus:border-teal-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:bg-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-1 text-sm">
                <button
                  type="button"
                  onClick={() => navigate("/forgotPassword")}
                  className="font-medium text-teal-900 dark:text-white transition hover:text-teal-900"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r bg-teal-900 px-4 py-3 font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:from-teal-900 hover:to-teal-950"
              >
                Sign In
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              Use the same credentials you signed up with, and you’ll land back on your dashboard.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
