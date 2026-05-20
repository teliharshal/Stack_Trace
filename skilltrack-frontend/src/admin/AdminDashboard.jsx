import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  FaUsers,
  FaCheckCircle,
  FaChartLine,
  FaExclamationTriangle,
  FaArrowUp,
  FaEllipsisH,
  FaBookOpen
} from "react-icons/fa";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

import { Bar, Doughnut } from "react-chartjs-2";
import toast,{Toaster} from "react-hot-toast";


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const AdminDashboard = () => {

  const navigate = useNavigate();
  const { search = "" } = useOutletContext() || {};

  const [stats, setStats] = useState({
    employees: 0,
    completed: 0,
    inProgress: 0
  });

// const [showFilter, setShowFilter] = useState(false);

// const [filters, setFilters] = useState({
//   status: "",
//   category: "",
//   search: "",
// });

  const [employees, setEmployees] = useState([]);
  const normalizedSearch = search.trim().toLowerCase();
  const [downloading, setDownloading] = useState(false);

const handleDownloadAll = async () => {
  const loadingToast = toast.loading("Preparing report...");

  try {
    setDownloading(true); // ✅ ADD THIS

    const user = JSON.parse(localStorage.getItem("user"));

    const res = await axios.get(
      "http://localhost:8080/api/admin/reports/employees",
      {
        responseType: "blob",
        auth: {
          username: user.email,
          password: user.password
        }
      }
    );

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "all_employees_report.xlsx");

    document.body.appendChild(link);
    link.click();
    link.remove();

    toast.success("Report downloaded ✅", { id: loadingToast });

  } catch (err) {
    console.error(err);
    toast.error("Download failed ❌", { id: loadingToast });
  } finally {
    setDownloading(false); // ✅ ADD THIS
  }
};

  // 🔥 FETCH STATS
 const fetchStats = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));

    const [empRes, completedRes, inProgressRes] = await Promise.all([
      axios.get("http://localhost:8080/api/admin/employees/count", {
        auth: {
          username: user.email,
          password: user.password
        }
      }),
      axios.get("http://localhost:8080/api/admin/skills/completed/count", {
        auth: {
          username: user.email,
          password: user.password
        }
      }),
      axios.get("http://localhost:8080/api/admin/skills/in-progress/count", {
        auth: {
          username: user.email,
          password: user.password
        }
      }),
    ]);

    setStats({
      employees: empRes.data,
      completed: completedRes.data,
      inProgress: inProgressRes.data
    });

  } catch (error) {
    console.error("Stats Error:", error);
  }
};

  // 🔥 FETCH EMPLOYEE DATA
  const fetchEmployees = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));

    const res = await axios.get(
      "http://localhost:8080/api/admin/employees/overview",
      {
        auth: {
          username: user.email,
          password: user.password
        }
      }
    );

    setEmployees(res.data);

  } catch (err) {
    console.error(err);
  }
};

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      fetchStats();
      fetchEmployees();
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, []);

  const filteredEmployees = employees.filter((employee) => {
    if (!normalizedSearch) {
      return true;
    }

    const name = (employee.name || "").toLowerCase();
    const email = (employee.email || "").toLowerCase();
    const skills = (employee.currentSkills || []).join(" ").toLowerCase();

    return (
      name.includes(normalizedSearch) ||
      email.includes(normalizedSearch) ||
      skills.includes(normalizedSearch)
    );
  });

  // 🔥 CHART LOGIC

  const skillMap = {};

  filteredEmployees.forEach(emp => {
    emp.currentSkills?.forEach(skill => {
      skillMap[skill] = (skillMap[skill] || 0) + 1;
    });
  });

  const skillLabels = Object.keys(skillMap);
  const skillCounts = Object.values(skillMap);

  // 📊 Learning Distribution
  const barData = {
    labels: skillLabels,
    datasets: [
      {
        label: "Employees Learning",
        data: skillCounts,
        backgroundColor: "#3B82F6",
        borderRadius: 8
      }
    ]
  };

  // 🥧 Progress Split
  const doughnutData = {
    labels: ["Completed", "In Progress"],
    datasets: [
      {
        data: [stats.completed, stats.inProgress],
        backgroundColor: ["#22C55E", "#F59E0B"],
        cutout: "65%"
      }
    ]
  };

  // 📊 Top Employees
  const topEmployees = [...filteredEmployees]
    .sort((a, b) => b.totalSkills - a.totalSkills)
    .slice(0, 5);

  const topEmpData = {
    labels: topEmployees.map(e => e.name),
    datasets: [
      {
        label: "Total Skills",
        data: topEmployees.map(e => e.totalSkills),
        backgroundColor: "#8B5CF6",
        borderRadius: 8
      }
    ]
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1f2937',
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 13 },
        bodyFont: { size: 12 }
      }
    },
    scales: {
        x: { grid: { display: false }, border: { display: false } },
        y: { grid: { color: '#f3f4f6' }, border: { display: false }, ticks: { padding: 10 } }
    }
  };

  const statCards = [
    {
      title: "Total Employees",
      value: stats.employees,
      icon: <FaUsers />,
      color: "blue",
      trend: "+12%",
      onClick: () => navigate("/admin/employees"),
      label: "View employees"
    },
    {
      title: "Employees with Completed Skills",
      value: stats.completed,
      icon: <FaCheckCircle />,
      color: "green",
      trend: "+5%",
      onClick: () => navigate("/admin/progress"),
      label: "View progress details"
    },
    {
      title: "Active Learners",
      value: stats.inProgress,
      icon: <FaChartLine />,
      color: "yellow",
      trend: "+8%",
      onClick: () => navigate("/admin/analytics"),
      label: "View analytics"
    },
    {
      title: "Needs Attention",
      value: stats.employees - stats.inProgress,
      icon: <FaExclamationTriangle />,
      color: "red",
      trend: "-2%",
      onClick: () => navigate("/admin/employees"),
      label: "Review employees needing attention"
    },
    {
      title: "Skill Catalog",
      value: "Manage",
      icon: <FaBookOpen />,
      color: "blue",
      trend: "Admin",
      onClick: () => navigate("/admin/skills"),
      label: "Manage catalog skills"
    }
  ];

  return (
    <div className="p-8 min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
        <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-1">Overview</h1>
            <p className="text-gray-500 dark:text-gray-400">Track team performance and skill acquisition.</p>
            {normalizedSearch && (
              <p className="mt-2 text-sm font-medium text-teal-700 dark:text-teal-400">
                Showing results for "{search}"
              </p>
            )}
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
            <button
             onClick={() => navigate("/admin/skills")}
             className="px-4 py-2 border border-teal-200 text-teal-900 bg-white rounded-lg text-sm font-medium shadow-sm hover:bg-teal-50 transition">
                Manage Skills
            </button>
            <button
  onClick={handleDownloadAll}
  disabled={downloading}
  className="px-4 py-2 bg-teal-900 text-white rounded-lg text-sm font-medium shadow-md hover:bg-teal-950 transition disabled:opacity-50"
>
  {downloading ? "⏳ Preparing Report..." : "Download Report"}
</button>
        </div>
      </div>

      {/* 🔥 STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        {statCards.map((card) => (
          <StatsCard key={card.title} {...card} />
        ))}
      </div>

      {/* 🔥 CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Learning Distribution (Bar) */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">Learning Distribution</h3>
                <button className="text-gray-400 hover:text-gray-600"><FaEllipsisH /></button>
            </div>
            <div className="h-72">
                <Bar data={barData} options={commonOptions} />
            </div>
        </div>

        {/* Progress (Doughnut) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">Completion Rate</h3>
                <button className="text-gray-400 hover:text-gray-600"><FaEllipsisH /></button>
            </div>
            <div className="h-64 flex justify-center relative">
                <Doughnut data={doughnutData} options={{ cutout: '75%', plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } } }} />
            </div>
        </div>

        {/* Top Employees (Horizontal Bar) */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">Top Performers</h3>
                <button 
                onClick={() => navigate("/admin/employees")}
                className="text-teal-900 text-sm font-medium hover:underline">View All Employees</button>
            </div>
            <div className="h-64">
                 <Bar data={topEmpData} options={{ ...commonOptions, indexAxis: 'y' }} />
            </div>
        </div>
      </div>

    </div>
  );
};

// 🔥 NEW STATS CARD COMPONENT
const StatsCard = ({ title, value, icon, color, trend, onClick, label }) => {
  const styles = {
      blue: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-600 dark:text-blue-400", ring: "ring-blue-100 dark:ring-blue-900" },
      green: { bg: "bg-green-50 dark:bg-green-900/20", text: "text-green-600 dark:text-green-400", ring: "ring-green-100 dark:ring-green-900" },
      yellow: { bg: "bg-yellow-50 dark:bg-yellow-900/20", text: "text-yellow-600 dark:text-yellow-400", ring: "ring-yellow-100 dark:ring-yellow-900" },
      red: { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-600 dark:text-red-400", ring: "ring-red-100 dark:ring-red-900" },
  };

  const s = styles[color] || styles.blue;
  const isPositive = trend && trend.startsWith('+');

  return (
      <button
        type="button"
        onClick={onClick}
        aria-label={label || title}
        className="group w-full text-left bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-transparent active:scale-[0.99]"
      >
          <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${s.bg} ${s.text} ring-1 ${s.ring}`}>
                  <div className="text-xl">{icon}</div>
              </div>
              {trend && <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {isPositive ? <FaArrowUp size={10} className="mr-1" /> : null}
                  {trend}
              </div>}
          </div>
          <div>
              <h4 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1 group-hover:text-teal-900 transition-colors">{value}</h4>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          </div>
      </button>
  );
};

export default AdminDashboard;
