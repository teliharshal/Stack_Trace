import React from "react";
import axios from "axios";
import { FaDownload, FaUsers, FaChartBar } from "react-icons/fa";

const Reports = () => {

  // 🔥 Download All Employees
  const handleDownloadAll = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/api/admin/reports/employees",
        { responseType: "blob" }
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

  // 🔥 Download Top Performers
  const handleDownloadTop = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/api/admin/reports/top-performers",
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", "top_performers_report.xlsx");

      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Reports & Analytics
      </h1>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 🔥 All Employees Report */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow hover:shadow-lg transition">
          <div className="flex items-center gap-4 mb-4">
            <FaUsers className="text-blue-500 text-2xl" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              All Employees Report
            </h2>
          </div>

          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            Download complete report of all employees including skills, progress and performance.
          </p>

          <button
            onClick={handleDownloadAll}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <FaDownload />
            Download Excel
          </button>
        </div>

        {/* 🔥 Top Performers */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow hover:shadow-lg transition">
          <div className="flex items-center gap-4 mb-4">
            <FaChartBar className="text-green-500 text-2xl" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Top Performers Report
            </h2>
          </div>

          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            Download report of top performing employees based on skill completion.
          </p>

          <button
            onClick={handleDownloadTop}
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
          >
            <FaDownload />
            Download Excel
          </button>
        </div>

      </div>

      {/* 🔥 Future Section */}
      <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
          Coming Soon 🚀
        </h2>
        <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
          <li>• Filter reports by department</li>
          <li>• Date range reports</li>
          <li>• Monthly progress analytics</li>
        </ul>
      </div>

    </div>
  );
};

export default Reports;
