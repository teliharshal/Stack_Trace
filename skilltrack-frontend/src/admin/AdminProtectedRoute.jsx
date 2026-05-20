import { Navigate } from "react-router-dom";
import { normalizeRole, ROLES } from "../utils/roles";

const AdminProtectedRoute = ({ children }) => {

  const user = JSON.parse(localStorage.getItem("user"));

  // ✅ check role properly
  if (!user || normalizeRole(user.role) !== ROLES.ADMIN) {
    return <Navigate to="/admin-login" />;
  }

  return children;
};

export default AdminProtectedRoute;
