import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import RoleDashboard from "../pages/RoleDashboard";
import ProgressTracker from "../pages/ProgressTracker";
import ConsistencyTracker from "../pages/ConsistencyTracker";
import CompletedSkills from "../pages/CompletedSkills";
import MySkills from "../pages/MySkills";
import SkillDetails from "../pages/SkillDetails";
import Profile from "../pages/Profile";
import SkillAnalytics from "../pages/SkillAnalytics";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import AdminLogin from "../admin/AdminLogin";
import AdminDashboard from "../admin/AdminDashboard";
import SkillCatalog from "../admin/SkillCatalog";
import AdminProtectedRoute from "../admin/AdminProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";
import RoleProtectedRoute from "./RoleProtectedRoute";
import Employees from"../admin/Employees";
import EmployeeDetails from "../admin/EmployeeDetails";
import InviteEmployee from "../admin/InviteEmployee";
import Progress from "../admin/Progress";
import AdminProfile from "../admin/AdminProfile";
import AssignSkill from "../admin/AssignSkill";
import AttemptTest from "../pages/AttemptTest";


import DashboardLayout from "../layouts/DashboardLayout";
import Analytics from "../admin/Analytics";
import { ROLES, WORKFORCE_ROLES } from "../utils/roles";

const DashboardEntry = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.role === 'ADMIN') {
    return <AdminDashboard />;
  }
  return <RoleDashboard />;
};

const UnifiedLayoutWrapper = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.role === 'ADMIN') {
    return <AdminLayout />;
  }
  return <DashboardLayout />;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} /> 
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} /> 
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/resetPassword" element={<ResetPassword/>}/>

        {/* Admin Legacy Login Route */}
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Unified Dashboard Layout Routes */}
        <Route
          element={
            <RoleProtectedRoute allowedRoles={['ADMIN', ...WORKFORCE_ROLES]}>
              <UnifiedLayoutWrapper />
            </RoleProtectedRoute>
          }
        >
          {/* The Single Unified Dashboard Route */}
          <Route path="/dashboard" element={<DashboardEntry />} />

          {/* Admin Routes */}
          <Route path="/admin/skills" element={<SkillCatalog />} />
          <Route path="/admin/assign-skills" element={<AssignSkill />} />
          <Route path="/admin/employees" element={<Employees />} />
          <Route path="/admin/employees/:id" element={<EmployeeDetails />} />
          <Route path="/admin/invite" element={<InviteEmployee />} />
          <Route path="/admin/progress" element={<Progress />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="/admin/profile" element={<AdminProfile />} />

          {/* Employee Routes */}
          <Route path="/MySkills" element={<MySkills />} />
          <Route path="/MySkills/:skillId" element={<SkillDetails />} />
          <Route path="/progress" element={<ProgressTracker />} />
          <Route path="/consistency" element={<ConsistencyTracker />} />
          <Route path="/analytics" element={<SkillAnalytics />} />
          <Route path="/completed" element={<CompletedSkills />} />
          <Route path="/test/:assignmentId" element={<AttemptTest />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
