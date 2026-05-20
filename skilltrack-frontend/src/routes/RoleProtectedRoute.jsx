import { Navigate } from "react-router-dom";
import { ROLES, getRoleDashboardPath, normalizeRole } from "../utils/roles";

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userRole = normalizeRole(user?.role);
  const allowed = allowedRoles.map(normalizeRole);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowed.includes(userRole)) {
    return <Navigate to={getRoleDashboardPath(userRole)} replace />;
  }

  return children;
};

export default RoleProtectedRoute;
