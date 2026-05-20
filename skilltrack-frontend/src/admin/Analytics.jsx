import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { FaDownload, FaEllipsisH } from "react-icons/fa";

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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const Analytics = () => {

  const [skillData, setSkillData] = useState({});
  const [categoryData, setCategoryData] = useState({});
  const [progressData, setProgressData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const authHeader = useMemo(
    () => ({
      auth: {
        username: user.email,
        password: user.password
      }
    }),
    [user.email, user.password]
  );

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [skills, categories, progress] = await Promise.all([
        axios.get("http://localhost:8080/api/admin/analytics/skills", authHeader),
        axios.get("http://localhost:8080/api/admin/analytics/categories", authHeader),
        axios.get("http://localhost:8080/api/admin/analytics/progress", authHeader),
      ]);

      setSkillData(skills.data || {});
      setCategoryData(categories.data || {});
      setProgressData(progress.data || {});

    } catch (err) {
      console.error("Failed to load analytics", err);
      setSkillData({});
      setCategoryData({});
      setProgressData({});
      setError("Unable to load analytics data.");
    } finally {
      setLoading(false);
    }
  }, [authHeader]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // 🔥 Chart Options for SaaS look
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
            usePointStyle: true,
            padding: 20,
            color: '#9ca3af' // gray-400
        }
      },
      tooltip: {
        backgroundColor: '#1f2937', // gray-800
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 13 },
        bodyFont: { size: 12 },
        displayColors: false,
      }
    },
    scales: {
        x: { 
            grid: { display: false }, 
            border: { display: false },
            ticks: { color: '#9ca3af' }
        },
        y: { 
            grid: { color: '#f3f4f6', borderDash: [5, 5] }, 
            border: { display: false }, 
            ticks: { padding: 10, color: '#9ca3af' }
        }
    }
  };

   const handleDownloadAll = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/api/admin/reports/employees",
        { responseType: "blob", ...authHeader }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", "all_employees_report.xlsx");

      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (err) {
      console.error(err);
    }
  };

  const doughnutOptions = {
      ...commonOptions,
      scales: { x: { display: false }, y: { display: false } },
      cutout: '70%',
  };

  // 🔥 Chart Data

  const skillChart = {
    labels: Object.keys(skillData),
    datasets: [
      {
        label: "Employees",
        data: Object.values(skillData),
        backgroundColor: "#3B82F6",
        borderRadius: 6,
        barThickness: 20,
      }
    ]
  };

  const categoryChart = {
    labels: Object.keys(categoryData),
    datasets: [
      {
        data: Object.values(categoryData),
        backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444"],
        borderWidth: 0,
      }
    ]
  };

  const progressChart = {
    labels: Object.keys(progressData),
    datasets: [
      {
        data: Object.values(progressData),
        backgroundColor: ["#10B981", "#F59E0B", "#EF4444"],
        borderWidth: 0,
      }
    ]
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
        <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-1">Analytics Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">Deep insights into skill acquisition and team growth.</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
            {/* <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <FaFilter className="text-gray-400" /> Filter
            </button> */}
            <button
            onClick={handleDownloadAll}  
            className="flex items-center gap-2 px-4 py-2 bg-teal-900 text-white rounded-lg text-sm font-medium shadow-md shadow-blue-500/20 hover:bg-teal-950 transition">
                <FaDownload /> Export Report
            </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 text-gray-500 dark:text-gray-400">
          Loading analytics data...
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 text-red-500 dark:text-red-400">
          {error}
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Skill Distribution */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Skill Distribution</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Popularity of skills across the organization</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600"><FaEllipsisH /></button>
          </div>
          <div className="h-80">
            <Bar data={skillChart} options={commonOptions} />
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
          <div className="flex justify-between items-center mb-6">
             <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Categories</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Skills by domain</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600"><FaEllipsisH /></button>
          </div>
          <div className="flex-1 relative min-h-[300px] flex items-center justify-center">
            <Doughnut data={categoryChart} options={doughnutOptions} />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                    <span className="block text-3xl font-bold text-gray-800 dark:text-white">
                        {Object.values(categoryData).reduce((a, b) => Number(a) + Number(b), 0)}
                    </span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Total</span>
                </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
          <div className="flex justify-between items-center mb-6">
             <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Team Progress</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Overall completion status</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600"><FaEllipsisH /></button>
          </div>
          <div className="flex-1 relative min-h-[300px] flex items-center justify-center">
            <Doughnut data={progressChart} options={doughnutOptions} />
          </div>
        </div>

      </div>
      )}

    </div>
  );
};

export default Analytics;
