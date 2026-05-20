import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  FaChartLine, FaFire, FaCheckCircle, FaCode, FaPlus, FaRocket, FaLayerGroup 
} from "react-icons/fa";
import { 
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, 
  PointElement, LineElement, Tooltip, Legend, Filler 
} from "chart.js";
import { Bar, Doughnut, Line, Pie } from "react-chartjs-2";
import { findCatalogSkillMatch } from "../utils/skillCatalog";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement, 
  PointElement, LineElement, Tooltip, Legend, Filler
);

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [skills, setSkills] = useState([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDark, setIsDark] = useState(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );

  const safeParseJson = (value, fallback = {}) => {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? parsed : fallback;
    } catch {
      return fallback;
    }
  };

  const user = safeParseJson(localStorage.getItem("user"), {});
  const employeeId = localStorage.getItem("employeeId") ? Number(localStorage.getItem("employeeId")) : null;
  const authHeader = useMemo(
    () => ({
      auth: {
        username: user.email,
        password: user.password
      }
    }),
    [user.email, user.password]
  );
  const hasCredentials = Boolean(employeeId && user.email && user.password);
  const normalizeKey = (value) => (value || "").trim().toLowerCase();
  const parseTopics = (value) =>
    String(value || "")
      .split(",")
      .map((topic) => topic.trim())
      .filter(Boolean);
  const getEffectiveProgress = (skill) => {
    const stored = Number(skill?.progressPercentage || 0);
    const topics = parseTopics(skill?.topics || skill?.subtopics?.join(", ") || "");
    const completed = parseTopics(skill?.completedTopics || "");
    if (!topics.length) return stored;
    const derived = Math.round((completed.length / topics.length) * 100);
    return Math.max(stored, derived);
  };
 const fetchSkills = useCallback(async () => {
  try {
    const res = await axios.get(
      `http://localhost:8080/api/employee/assignments/${employeeId}`,
      authHeader
    );

    const assignments = Array.isArray(res.data) ? res.data : [];

    const mappedSkills = assignments.map((item) => ({
      skillName: item.skill?.skillName,
      category: item.skill?.category,
      progressPercentage: item.progress || 0,
    }));

    setSkills(mappedSkills);

  } catch (err) {
    console.error("Failed to fetch dashboard skills", err);
    setSkills([]);
    setError("Unable to load your dashboard data.");
  }
}, [authHeader, employeeId]);

  const fetchStreak = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/consistency/streak/${employeeId}`, authHeader);
      setStreak(res.data || 0);
    } catch (err) {
      console.error("Failed to fetch streak", err);
      setStreak(0);
    }
  }, [authHeader, employeeId]);

  useEffect(() => {
    if (!hasCredentials) {
      return;
    }

    const loadDashboard = async () => {
      setLoading(true);
      setError("");
      await Promise.all([fetchSkills(), fetchStreak()]);
      setLoading(false);
    };

    loadDashboard();
  }, [hasCredentials, fetchSkills, fetchStreak]);

  useEffect(() => {
    const observer = new MutationObserver(() => setIsDark(document.documentElement.classList.contains("dark")));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Logic Calculations
  const totalSkills = skills.length;
  const completed = skills.filter((s) => getEffectiveProgress(s) === 100).length;
  const inProgress = skills.filter((s) => getEffectiveProgress(s) < 100).length;

  // Category mapping logic for Pie Chart
  const categoryBuckets = ["Programming", "Frontend", "Backend", "Database", "DevOps"];
  const categoryCount = categoryBuckets.reduce((acc, category) => {
    acc[category] = skills.filter((skill) => normalizeKey(skill.category) === normalizeKey(category)).length;
    return acc;
  }, {});

  // Modern Chart Color Palette
  const chartColors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  const statCards = [
    {
      title: "Total Skills",
      value: totalSkills,
      icon: <FaCode />,
      color: "indigo",
      trend: "Library",
      onClick: () => navigate("/MySkills"),
      label: "View all skills"
    },
    {
      title: "Completed",
      value: completed,
      icon: <FaCheckCircle />,
      color: "emerald",
      trend: `${Math.round((completed / totalSkills) * 100) || 0}% Rate`,
      onClick: () => navigate("/completed"),
      label: "View completed skills"
    },
    {
      title: "In Progress",
      value: inProgress,
      icon: <FaChartLine />,
      color: "amber",
      trend: "Active",
      onClick: () => navigate("/progress"),
      label: "View progress tracker"
    },
    {
      title: "Streak",
      value: `${streak} Days`,
      icon: <FaFire />,
      color: "rose",
      trend: "Focus",
      onClick: () => navigate("/consistency"),
      label: "View consistency tracker"
    }
  ];

  const lineData = {
    labels: skills.map(s => s.skillName),
    datasets: [{
      fill: true,
      label: 'Skill Progress %',
      data: skills.map((s) => getEffectiveProgress(s)),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      tension: 0.4,
    }]
  };

  const barData = {
    labels: skills.map(s => s.skillName),
    datasets: [{
      label: "Progress %",
      data: skills.map((s) => getEffectiveProgress(s)),
      backgroundColor: "#6366f1",
      borderRadius: 8,
    }]
  };

  const pieData = {
    labels: Object.keys(categoryCount),
    datasets: [{
      data: Object.values(categoryCount),
      backgroundColor: chartColors,
      borderWidth: 0,
    }]
  };

  const doughnutData = {
    labels: ["Completed", "In Progress"],
    datasets: [{
      data: [completed, inProgress],
      backgroundColor: ["#10b981", isDark ? "#334155" : "#e2e8f0"],
      borderWidth: 0,
    }]
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          color: isDark ? "#94a3b8" : "#64748b",
          font: { size: 11, weight: '600' }
        }
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] transition-colors duration-300">
      
      <header className="px-8 py-5 bg-white dark:bg-[#1e293b] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <nav className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              <span>Workspace</span>
              <span className="mx-2">/</span>
              <span className="text-teal-900">Dashboard</span>
            </nav>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Performance Insights</h1>
          </div>
          <button 
            onClick={() => navigate("/MySkills")}
            className="flex items-center justify-center gap-2 bg-teal-900 hover:bg-teal-950 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-indigo-200 dark:shadow-none active:scale-95"
          >
           View Assign Skills
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
        {!hasCredentials ? (
          <div className="rounded-2xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 p-6 text-slate-500 dark:text-slate-400">
            Please sign in again so we can load your dashboard.
          </div>
        ) : loading ? (
          <div className="rounded-2xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 p-6 text-slate-500 dark:text-slate-400">
            Loading dashboard data...
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 p-6 text-rose-500 dark:text-rose-400">
            {error}
          </div>
        ) : (
          <>
            {/* Row 1: 4 Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((card) => (
                <StatCard key={card.title} {...card} />
              ))}
            </div>

            {/* Row 2: Line and Doughnut (Progress Overview) */}
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="font-bold text-slate-800 dark:text-white mb-6">Growth Velocity</h3>
                <div className="h-72">
                  <Line data={lineData} options={commonOptions} />
                </div>
              </div>

              <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="font-bold text-slate-800 dark:text-white mb-6">Task Completion</h3>
                <div className="h-72 flex items-center justify-center">
                  <Doughnut data={doughnutData} options={{ ...commonOptions, cutout: '75%' }} />
                </div>
              </div>
            </div>

            {/* Row 3: Pie and Bar (Detailed Breakdown) */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <FaLayerGroup className="text-teal-900" />
                  <h3 className="font-bold text-slate-800 dark:text-white">Category Distribution</h3>
                </div>
                <div className="h-72 flex items-center justify-center">
                  <Pie data={pieData} options={commonOptions} />
                </div>
              </div>

              <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="font-bold text-slate-800 dark:text-white mb-6">Skill Proficiency</h3>
                <div className="h-72">
                  <Bar data={barData} options={{
                    ...commonOptions,
                    scales: {
                      y: { beginAtZero: true, max: 100, ticks: { color: isDark ? "#94a3b8" : "#64748b" } },
                      x: { ticks: { color: isDark ? "#94a3b8" : "#64748b" } }
                    }
                  }} />
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

// Reusable Components
const StatCard = ({ title, value, icon, color, trend, onClick, label }) => {
  const theme = {
    indigo: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
    emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
    amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
    rose: "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400"
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-transparent active:scale-[0.99] cursor-pointer"
      aria-label={label || title}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${theme[color]}`}>{icon}</div>
        <span className="text-[10px] font-bold py-1 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">{trend}</span>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 group-hover:text-teal-900 dark:group-hover:text-teal-900 transition-colors">{title}</p>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{value}</h2>
      </div>
    </button>
  );
};


export default EmployeeDashboard;
