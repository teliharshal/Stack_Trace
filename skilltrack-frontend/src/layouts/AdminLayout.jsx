import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FaTachometerAlt,
  FaUsers,
  FaChartLine,
  FaChartPie,
  FaBookOpen,
  FaSearch,
  FaMoon,
  FaSun,
  FaUserCircle,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaUser
} from "react-icons/fa";

import StackTrace_Dark from "../assets/StackTrace.png";
import StackTrace_Light from "../assets/StackTrackLight.png";

const AdminLayout = () => {
  const navigate = useNavigate();

  // Responsive sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [search, setSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  
  // 🌙 Dark Mode State
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("admin-theme") === "dark";
  });

  // Handle Dark Mode Toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("admin-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("admin-theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".profile-dropdown")) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const linkClass = "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200";
  const activeClass = "bg-white text-teal-800 font-bold shadow-md";
  const inactiveClass = "text-white hover:bg-white/10";

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">

      {/* 🔥 SIDEBAR - Fixed Overlay on Mobile, Static on Desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-teal-900 dark:bg-gray-950 text-white p-5 flex flex-col transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0 lg:w-20"}`}
      >
        <button
          type="button"
          onClick={() => setSidebarOpen((value) => !value)}
          className="absolute right-0 top-1/2 z-[70] flex h-11 w-11 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white text-teal-900 shadow-lg shadow-black/20 transition hover:scale-105 hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-white/60"
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? <FaChevronLeft size={14} /> : <FaChevronRight size={14} />}
        </button>

        {/* Mobile Close Button */}
        <button 
          className="lg:hidden absolute right-4 top-4 text-white"
          onClick={() => setSidebarOpen(false)}
        >
          <FaTimes size={20} />
        </button>

        {/* LOGO */}
        <div className="flex flex-col items-center mb-10 mt-4 lg:mt-0">
          <img
            src={darkMode ? StackTrace_Dark : StackTrace_Light}
            className="w-28 md:w-32 object-contain"
            alt="Logo"
          />
          {(sidebarOpen || window.innerWidth < 1024) && (
            <h2 className="text-xl font-bold mt-2 tracking-tight">StackTrace</h2>
          )}
        </div>

        {/* MENU */}
        <nav className="p-3 md:p-4i flex flex-col gap-2 overflow-y-auto custom-scrollbar">
          {[
            { to: "/dashboard", icon: <FaTachometerAlt />, label: "Dashboard" },
            { to: "/admin/employees", icon: <FaUsers />, label: "Employees" },
            { to: "/admin/skills", icon: <FaBookOpen />, label: "Skill Catalog" },
            {to:"/admin/assign-skills",icon: <FaUser/>, label: "Assign Skills"},
            { to: "/admin/invite", icon: <FaUserCircle />, label: "Invite Employee" },
            // { to: "/admin/employees/:id", icon: <FaCode />, label: "Details" },
            { to: "/admin/progress", icon: <FaChartLine />, label: "Progress" },
            { to: "/admin/analytics", icon: <FaChartPie />, label: "Analytics" },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dashboard"} 
              onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : inactiveClass}`
              }
            >
              <span className="text-lg">{item.icon}</span>
              {(sidebarOpen || window.innerWidth < 1024) && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 🔥 MAIN AREA */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"}`}>

        {/* 🔥 TOP NAVBAR */}
        <header className="bg-white dark:bg-gray-800 px-4 md:px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-30 transition-colors">
          
          <div className="flex items-center gap-3">
            <h1 className="text-sm md:text-lg font-semibold text-gray-700 dark:text-white truncate">
              Welcome, <span className="text-teal-600 dark:text-teal-400">Admin</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* SEARCH - Hidden on small mobile */}
            <div className="hidden sm:flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-xl">
              <FaSearch className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none text-sm dark:text-white w-24 md:w-40"
              />
            </div>

            {/* DARK MODE TOGGLE */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-yellow-400 rounded-full hover:scale-110 transition-all"
            >
              {darkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
            </button>

            <div className="relative profile-dropdown">
           <FaUserCircle
           onClick={() => setProfileOpen(!profileOpen)}
           className="text-2xl md:text-3xl text-teal-700 dark:text-teal-400 cursor-pointer"
           />

  {/* Dropdown */}
  {profileOpen && (
    <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border dark:border-gray-700 z-50">

      {/* Profile */}
      <button
        onClick={() => {
          navigate("/admin/profile");
          setProfileOpen(false);
        }}
        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        👤 Profile
      </button>

      {/* Logout */}
      <button
        onClick={() => {
          handleLogout();
          setProfileOpen(false);
        }}
        className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        🚪 Logout
      </button>

    </div>
  )}
</div>
          </div>
        </header>

        {/* 🔥 PAGE CONTENT */}
        <main className="p-4 md:p-6 overflow-y-auto flex-1 bg-gray-100 dark:bg-gray-900 transition-colors">
          <div className="max-w-7xl mx-auto">
            <Outlet context={{ search, setSearch }} />
          </div>
        </main>

      </div>

      {!sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="fixed left-0 top-1/2 z-[80] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-r-full bg-teal-900 text-white shadow-lg shadow-black/20 transition hover:bg-teal-950 lg:hidden"
          aria-label="Open sidebar"
        >
          <FaChevronRight size={14} />
        </button>
      )}
    </div>
  );
};

export default AdminLayout;
