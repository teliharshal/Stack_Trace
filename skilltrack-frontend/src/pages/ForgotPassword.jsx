import { useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { FaArrowRight, FaEnvelope, FaMoon, FaPaperPlane, FaShieldAlt, FaSun } from "react-icons/fa";
import stackTraceDark from "../assets/StackTrace.png";
import stackTraceLight from "../assets/StackTrackLight.png";
import { FaSpinner } from "react-icons/fa";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") !== "light");

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (isSendingOtp) {
      return;
    }

    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    setIsSendingOtp(true);

    try {
      await axios.post("http://localhost:8080/api/auth/send-otp", { email });
      toast.success("OTP sent successfully");

      setTimeout(() => {
        navigate("/resetPassword", { state: { email } });
      }, 1200);
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error("Email not registered");
      setIsSendingOtp(false);
    }
  };

  const currentLogo = darkMode ? stackTraceDark : stackTraceLight;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <Toaster position="top-right" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.25),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.22),_transparent_32%),linear-gradient(135deg,_#020617_0%,_#0f172a_55%,_#111827_100%)]" />
      <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
      <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />

      <button
        type="button"
        onClick={() => {
          const nextMode = !darkMode;
          setDarkMode(nextMode);
          if (nextMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
          } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
          }
        }}
        className="absolute right-4 top-4 z-20 rounded-full border border-white/10 bg-white/10 p-3 text-white backdrop-blur-xl transition hover:bg-white/20 sm:right-6 sm:top-6"
        aria-label="Toggle theme"
      >
        {darkMode ? <FaSun className="text-sm" /> : <FaMoon className="text-sm" />}
      </button>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <section className="w-full rounded-[2rem] border border-white/10 bg-white/95 p-6 text-slate-900 shadow-2xl shadow-black/40 backdrop-blur-xl dark:bg-[#0f172a]/95 dark:text-white sm:p-8">
          <div className="mx-auto flex max-w-lg flex-col">
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-5 flex items-center justify-center">
                <img
                  src={currentLogo}
                  alt="StackTrace logo"
                  className="h-14 w-auto object-contain sm:h-16"
                />
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                <FaEnvelope className="text-[10px]" />
                Forgot Password
              </div>
              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                Request a reset code
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Enter the email address linked to your account and we’ll send a one-time OTP.
              </p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-11 py-3 text-slate-900 outline-none transition focus:border-teal-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:bg-slate-800"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                We will send a one-time password to your email. Use it on the next screen to create a new password.
              </div>

              <button
                type="submit"
                disabled={isSendingOtp}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r bg-teal-900 px-4 py-3.5 font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:from-teal-950 hover:to-teal-950 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSendingOtp ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Send OTP
                    <FaArrowRight className="text-sm" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Remembered your password?{" "}
              <Link to="/login" className="font-semibold text-teal-900 transition hover:text-teal-900">
                Back to Sign In
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ForgotPassword;
