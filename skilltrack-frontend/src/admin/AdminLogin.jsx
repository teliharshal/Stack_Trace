import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { FaMoon, FaSun, FaArrowRight, FaUserLock } from "react-icons/fa";
import stackTraceDark from "../assets/StackTrace.png";
import stackTraceLight from "../assets/StackTrackLight.png";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [darkMode, setDarkMode] = useState(localStorage.getItem("admin-theme") === "dark");
  const navigate = useNavigate();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("admin-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("admin-theme", "light");
    }
  }, [darkMode]);

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "http://localhost:8080/api/admin/login",
        { email, password },
        {
          auth: {
            username: email,
            password: password
          }
        }
      );

      if ((res.data.role || "").toUpperCase() !== "ADMIN") {
        localStorage.removeItem("user");
        toast.error("Access denied: admin account required");
        return;
      }

      const userData = {
        email: res.data.email,
        password: password,
        role: res.data.role
      };

      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("admin", JSON.stringify(userData));
      toast.success("Login Successful");
      navigate("/admin");
    } catch (error) {
      console.error("Login Error:", error.response?.status);

      const message = String(error.response?.data || "").toLowerCase();
      if (message.includes("access denied")) {
        toast.error("Access denied: admin account required");
      } else {
        toast.error("Invalid credentials");
      }
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-950 text-white">
      <Toaster position="top-right" />

      {/* Background elements stay the same */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.22),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.22),_transparent_30%),linear-gradient(135deg,_#020617_0%,_#0f172a_60%,_#111827_100%)]" />
      <div className="absolute -left-16 top-20 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
      <div className="absolute -right-10 bottom-0 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />

      {/* Theme Toggle Button */}
      <button
        onClick={() => setDarkMode((value) => !value)}
        className="absolute right-4 top-4 z-20 rounded-full border border-white/10 bg-white/10 p-3 text-white backdrop-blur-xl transition hover:bg-white/20 sm:right-6 sm:top-6"
        aria-label="Toggle theme"
      >
        {darkMode ? <FaSun /> : <FaMoon />}
      </button>

      {/* FIXED: Centering logic changed to use flex h-full without extra padding */}
      <div className="relative z-10 flex h-full w-full items-center justify-center p-4">
        <section className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-white/95 p-6 text-slate-900 shadow-2xl shadow-black/40 backdrop-blur-xl dark:bg-[#25343F] dark:text-white sm:p-10">
          <div className="flex flex-col">
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-6 flex items-center justify-center transition-all duration-300">
                <img
                  src={darkMode ? stackTraceDark : stackTraceLight}
                  alt="StackTrace Logo"
                  className="h-14 w-auto object-contain sm:h-16"
                />
              </div>
              {/* ... Rest of your internal form code stays the same ... */}
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                <FaUserLock className="text-[10px]" />
                Admin Login
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Use your admin email and password.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
              className="space-y-4"
            >
              {/* ... Inputs stay the same ... */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-900 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:bg-slate-800"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-900 focus:bg-white dark:border-teal-900 dark:bg-slate-900 dark:text-white dark:focus:bg-slate-800"
                />
              </div>

              <button
                type="submit"
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-900 px-4 py-3.5 font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-teal-950"
              >
                Sign In
                <FaArrowRight className="text-sm" />
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminLogin;
