import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaChartLine,
  FaCheckCircle,
  FaEnvelope,
  FaGlobe,
  FaLayerGroup,
  FaSignOutAlt,
  FaTachometerAlt,
  FaUserShield,
  FaUsers,
  FaSpinner
} from "react-icons/fa";

const AdminProfile = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeSkills: 0,
    completedSkills: 0,
    inProgressSkills: 0
  });

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("admin") || localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const authHeader = useMemo(
    () => ({
      auth: {
        username: storedUser?.email || "",
        password: storedUser?.password || ""
      }
    }),
    [storedUser?.email, storedUser?.password]
  );

  useEffect(() => {
    const load = async () => {
      if (!storedUser?.email) {
        setError("Please sign in again to view admin profile.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const [employeesRes, skillsRes, completedRes, inProgressRes] = await Promise.all([
          axios.get("http://localhost:8080/api/admin/employees/count", authHeader),
          axios.get("http://localhost:8080/api/admin/skills/count", authHeader),
          axios.get("http://localhost:8080/api/admin/skills/completed/count", authHeader),
          axios.get("http://localhost:8080/api/admin/skills/in-progress/count", authHeader)
        ]);

        setAdmin({
          email: storedUser.email,
          role: storedUser.role || "ADMIN",
          name: storedUser.name || storedUser.email?.split("@")?.[0] || "Admin"
        });

        setStats({
          totalEmployees: Number(employeesRes.data || 0),
          activeSkills: Number(skillsRes.data || 0),
          completedSkills: Number(completedRes.data || 0),
          inProgressSkills: Number(inProgressRes.data || 0)
        });
      } catch (err) {
        console.error("Admin profile load error:", err);
        setAdmin({
          email: storedUser.email,
          role: storedUser.role || "ADMIN",
          name: storedUser.name || storedUser.email?.split("@")?.[0] || "Admin"
        });
        setError("Unable to load live admin stats right now.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [authHeader, storedUser.email, storedUser.name, storedUser.role]);

  const handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
          <div className="bg-[radial-gradient(circle_at_top_left,_rgba(13,148,136,0.18),_transparent_35%),linear-gradient(135deg,_#0f172a_0%,_#111827_45%,_#134e4a_100%)] px-6 py-8 sm:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-white/80 backdrop-blur">
                  <FaUserShield className="text-[10px]" />
                  Admin Profile
                </div>
                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                  {admin?.name || "Administrator"}
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
                  A live overview of your admin account, platform health, and the key operational numbers you manage every day.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
                <button
                  type="button"
                  onClick={() => navigate("/admin")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-teal-900 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-teal-50"
                >
                  <FaTachometerAlt className="text-xs" />
                  Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/admin/employees")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-emerald-600"
                >
                  <FaUsers className="text-xs" />
                  Employees
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/admin/analytics")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15"
                >
                  <FaChartLine className="text-xs" />
                  Analytics
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 px-6 py-6 sm:px-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950/60">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-teal-900 text-4xl font-black text-white shadow-lg shadow-teal-900/20">
                  {admin?.name?.charAt(0)?.toUpperCase() || "A"}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-extrabold">{admin?.name || "Admin"}</h2>
                    <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-black uppercase tracking-widest text-teal-900 dark:bg-teal-900/30 dark:text-teal-300">
                      System Admin
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <span>{admin?.email || "admin@email.com"}</span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span>{admin?.role || "ADMIN"}</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => navigate("/admin/skills")}
                      className="rounded-xl bg-teal-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-950"
                    >
                      Manage Catalog
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <InfoCard label="Email" value={admin?.email || "Not available"} icon={<FaEnvelope />} />
                <InfoCard label="Role" value={admin?.role || "ADMIN"} icon={<FaUserShield />} />
              </div>

              <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Profile status</span>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase tracking-widest text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    Active session
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  This profile is connected to the currently signed-in admin account and refreshes live dashboard metrics from the backend.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Platform Health</p>
                  <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">Live Summary</h3>
                </div>
                {loading ? (
                  <FaSpinner className="animate-spin text-teal-900 dark:text-teal-300" />
                ) : (
                  <FaLayerGroup className="text-teal-900 dark:text-teal-300" />
                )}
              </div>

              {error && (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/10 dark:text-amber-200">
                  {error}
                </div>
              )}

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <MetricCard title="Total Employees" value={stats.totalEmployees} tone="teal" />
                <MetricCard title="Catalog Skills" value={stats.activeSkills} tone="indigo" />
                <MetricCard title="Completed Skills" value={stats.completedSkills} tone="emerald" />
                <MetricCard title="In Progress" value={stats.inProgressSkills} tone="amber" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const InfoCard = ({ label, value, icon }) => (
  <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
    <div className="flex items-center gap-2">
      <span className="text-teal-900 dark:text-teal-300">{icon}</span>
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
    </div>
    <p className="mt-2 break-words text-sm font-semibold text-slate-800 dark:text-slate-100">{value}</p>
  </div>
);

const MetricCard = ({ title, value, tone }) => {
  const tones = {
    teal: "bg-teal-50 text-teal-900 dark:bg-teal-900/20 dark:text-teal-300",
    indigo: "bg-indigo-50 text-indigo-900 dark:bg-indigo-900/20 dark:text-indigo-300",
    emerald: "bg-emerald-50 text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-300",
    amber: "bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:text-amber-300"
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{title}</p>
      <div className={`mt-2 inline-flex rounded-xl px-3 py-2 text-2xl font-black ${tones[tone] || tones.teal}`}>
        {value}
      </div>
    </div>
  );
};

export default AdminProfile;
