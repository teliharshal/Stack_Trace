import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaChartLine,
  FaFire,
  FaCheckCircle,
  FaUser,
  FaChevronDown,
  FaBook,
  FaLightbulb,
  FaPlus,
  FaMoon,
  FaSun,
  FaBell,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import StackTrace_Dark from "../assets/StackTrace.png";
import StackTrace_Light from "../assets/StackTrackLight.png";
import { getRoleDashboardPath, getRoleLabel, normalizeRole } from "../utils/roles";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile toggle
  const [collapsed, setCollapsed] = useState(false);     // desktop toggle
  const [profileOpen, setProfileOpen] = useState(false);
  const [roadmapOpen, setRoadmapOpen] = useState(() => location.pathname.startsWith("/roadmap/"));
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef();
  const employeeId = Number(localStorage.getItem("employeeId"));
  const employeeName = localStorage.getItem("employeeName") || "Guest";
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const authHeader = useMemo(
    () => ({ auth: { username: user.email, password: user.password } }),
    [user.email, user.password]
  );
  const userRole = normalizeRole(user.role);
  const dashboardPath = getRoleDashboardPath(userRole);

  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;
  const isMySkillsActive = location.pathname.startsWith("/MySkills") || location.pathname === "/addSkill";
  const isRoadmapActive = location.pathname.startsWith("/roadmap/");
  const isRoadmapItemActive = (path) => location.pathname === path;

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const menuItems = [
    { name: "Dashboard", icon: <FaTachometerAlt />, path: dashboardPath },
    { name: "My Skills", icon: <FaLightbulb />, path: "/MySkills" },
  ];

  const roadmapItems = [
    { name: "Frontend", path: "/roadmap/frontend" },
    { name: "Backend", path: "/roadmap/backend" },
    { name: "DevOps", path: "/roadmap/devops" },
  ];

  const fetchNotifications = async () => {
    if (!employeeId || !user.email || !user.password) return;

    try {
      const res = await axios.get(
        `http://localhost:8080/api/notifications/${employeeId}`,
        authHeader
      );
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Notification error:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [employeeId, authHeader]);

  return (
    <div className="flex min-h-screen w-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-all duration-300">
      
      {/* 🔥 Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-teal-900 dark:bg-gray-950 z-[60]
          transition-all duration-300 ease-in-out border-r border-white/5
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0
          ${collapsed ? "md:w-20" : "md:w-64"}
          w-64
        `}
      >
        <button
          type="button"
          onClick={() => {
            if (window.innerWidth < 768) {
              setSidebarOpen(false);
            } else {
              setCollapsed((value) => !value);
            }
          }}
          className="absolute right-0 top-1/2 z-[70] flex h-11 w-11 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white text-teal-900 shadow-lg shadow-black/20 transition hover:scale-105 hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-white/60 md:flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <FaChevronRight size={14} /> : <FaChevronLeft size={14} />}
        </button>

        <div className="flex flex-col h-full p-3 pt-6">
          
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-8 shrink-0 overflow-hidden">
            <img
              src={darkMode ? StackTrace_Dark : StackTrace_Light}
              className="w-28 md:w-32 object-contain"
              alt="Logo"
            />
            {!collapsed && (
              <h2 className="text-white text-xl font-bold mt-2 tracking-tight animate-in fade-in duration-500">
                StackTrace
              </h2>
            )}
          </div>

          {/* Welcome User Section */}
          {/* <div className={`flex items-center gap-3 mb-6 p-2 rounded-xl bg-white/10 backdrop-blur-sm transition-all ${collapsed ? "justify-center" : ""}`}>
            <div className="bg-white/20 p-2.5 rounded-full shrink-0">
              <FaUser className="text-white text-sm" />
            </div>
            {!collapsed && (
              <div className="min-w-0 animate-in slide-in-from-left-2">
                <p className="text-gray-300 text-[10px] uppercase tracking-wider leading-none mb-1">Welcome,</p>
                <p className="text-white font-bold truncate text-xs">{employeeName}</p>
              </div>
            )}
          </div> */}

          <hr className="border-white/10 mb-6" />

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
            {menuItems[0] && (
              <button
                onClick={() => handleNavigation(menuItems[0].path)}
                title={collapsed ? menuItems[0].name : ""}
                className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 text-sm group
                ${collapsed ? "justify-center" : "gap-3"}
                ${isActive(menuItems[0].path) 
                  ? "bg-white text-teal-900 font-bold shadow-lg" 
                  : "text-white hover:bg-white/10"}`}
              >
                <span className={`text-lg ${isActive(menuItems[0].path) ? "scale-110" : "group-hover:scale-110"} transition-transform`}>
                  {menuItems[0].icon}
                </span>
                {!collapsed && <span className="truncate">{menuItems[0].name}</span>}
              </button>
            )}

            {/* Roadmap Dropdown */}
            { menuItems[1] && (
              <button
                onClick={() => handleNavigation(menuItems[1].path)}
                title={collapsed ? menuItems[1].name : ""}
                className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 text-sm group mt-2
                ${collapsed ? "justify-center" : "gap-3"}
                ${isMySkillsActive
                  ? "bg-white text-teal-900 font-bold shadow-lg"
                  : "text-white hover:bg-white/10"}`}
              >
                <span className={`text-lg ${isMySkillsActive ? "scale-110" : "group-hover:scale-110"} transition-transform`}>
                  {menuItems[1].icon}
                </span>
                {!collapsed && <span className="truncate">{menuItems[1].name}</span>}
              </button>
            )} 

            <button
              onClick={() => handleNavigation("/progress")}
              title={collapsed ? "Progress Tracker" : ""}
              className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 text-sm group mt-2
              ${collapsed ? "justify-center" : "gap-3"}
              ${isActive("/progress")
                ? "bg-white text-teal-900 font-bold shadow-lg"
                : "text-white hover:bg-white/10"}`}
            >
              <span className={`text-lg ${isActive("/progress") ? "scale-110" : "group-hover:scale-110"} transition-transform`}>
                <FaChartLine />
              </span>
              {!collapsed && <span className="truncate">Progress Tracker</span>}
            </button>

            <button
              onClick={() => handleNavigation("/consistency")}
              title={collapsed ? "Consistency" : ""}
              className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 text-sm group mt-2
              ${collapsed ? "justify-center" : "gap-3"}
              ${isActive("/consistency")
                ? "bg-white text-teal-900 font-bold shadow-lg"
                : "text-white hover:bg-white/10"}`}
            >
              <span className={`text-lg ${isActive("/consistency") ? "scale-110" : "group-hover:scale-110"} transition-transform`}>
                <FaFire />
              </span>
              {!collapsed && <span className="truncate">Consistency</span>}
            </button>

            <button
              onClick={() => handleNavigation("/analytics")}
              title={collapsed ? "Skill Analytics" : ""}
              className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 text-sm group mt-2
              ${collapsed ? "justify-center" : "gap-3"}
              ${isActive("/analytics")
                ? "bg-white text-teal-900 font-bold shadow-lg"
                : "text-white hover:bg-white/10"}`}
            >
              <span className={`text-lg ${isActive("/analytics") ? "scale-110" : "group-hover:scale-110"} transition-transform`}>
                <FaChartLine />
              </span>
              {!collapsed && <span className="truncate">Skill Analytics</span>}
            </button>

            <button
              onClick={() => handleNavigation("/completed")}
              title={collapsed ? "Completed Skills" : ""}
              className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 text-sm group mt-2
              ${collapsed ? "justify-center" : "gap-3"}
              ${isActive("/completed")
                ? "bg-white text-teal-900 font-bold shadow-lg"
                : "text-white hover:bg-white/10"}`}
            >
              <span className={`text-lg ${isActive("/completed") ? "scale-110" : "group-hover:scale-110"} transition-transform`}>
                <FaCheckCircle />
              </span>
              {!collapsed && <span className="truncate">Completed Skills</span>}
            </button>
          </nav>

          {/* Logout Button (Bottom) */}
          
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* 🔥 Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? "md:ml-20" : "md:ml-64"}`}>
        
        <header className={`fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-3 transition-all duration-300 ${collapsed ? "md:ml-20" : "md:ml-64"}`}>
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            
            <div className="flex items-center gap-4">
              <h2 className="hidden sm:block text-lg font-bold bg-gradient-to-r from-[#086070] to-teal-900 bg-clip-text text-transparent">
                Welcome, {employeeName}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden lg:block relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-[#086070] outline-none transition-all w-48 focus:w-64 text-sm"
                />
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDropdown((open) => !open)}
                  className="relative p-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-200 rounded-xl hover:scale-110 transition-all"
                  aria-label="Notifications"
                >
                  <FaBell size={18} />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 text-[10px] text-white font-black px-1">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-72 max-h-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 z-50">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Notifications
                    </div>
                    {notifications.length ? (
                      notifications.map((notification) => (
                        <div key={notification.id} className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 border-b last:border-b-0 dark:border-slate-800">
                          {notification.message || "New update available"}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
                        No new notifications.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button onClick={() => setDarkMode(!darkMode)} className="p-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-yellow-400 rounded-xl hover:scale-110 transition-all">
                {darkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
              </button>

              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setProfileOpen(!profileOpen)} className="p-2.5 bg-[#086070] text-white rounded-xl shadow-md transition-all active:scale-95">
                  <FaUser size={18} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50">
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Account</p>
                      <p className="text-sm font-bold truncate">{employeeName}</p>
                    </div>
                    <div className="p-2">
                      <button onClick={() => { navigate("/profile"); setProfileOpen(false); }} className="flex w-full items-center px-4 py-2.5 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">My Profile</button>
                      <button onClick={handleLogout} className="flex w-full items-center px-4 py-2.5 text-sm text-red-500 font-semibold rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Logout</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 mt-16 p-6 lg:p-10 transition-all">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {!sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="fixed left-0 top-1/2 z-[80] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-r-full bg-teal-900 text-white shadow-lg shadow-black/20 transition hover:bg-teal-950 md:hidden"
          aria-label="Open sidebar"
        >
          <FaChevronRight size={14} />
        </button>
      )}
    </div>
  );
};

export default DashboardLayout;
