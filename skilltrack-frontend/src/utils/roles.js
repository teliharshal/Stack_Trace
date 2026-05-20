export const ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  TEAM_LEAD: "TEAM_LEAD",
  EMPLOYEE: "EMPLOYEE",
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: "Admin",
  [ROLES.MANAGER]: "Manager",
  [ROLES.TEAM_LEAD]: "Team Lead",
  [ROLES.EMPLOYEE]: "Employee",
};

export const ROLE_LEVELS = {
  [ROLES.ADMIN]: 5,
  [ROLES.MANAGER]: 3,
  [ROLES.TEAM_LEAD]: 2,
  [ROLES.EMPLOYEE]: 1,
};

export const WORKFORCE_ROLES = [
  ROLES.MANAGER,
  ROLES.TEAM_LEAD,
  ROLES.EMPLOYEE,
];

export const INVITE_ROLES = [
  ROLES.EMPLOYEE,
  ROLES.MANAGER,
];

export const normalizeRole = (role) => String(role || ROLES.EMPLOYEE).trim().toUpperCase().replace(/\s+/g, "_");

export const getRoleLabel = (role) => ROLE_LABELS[normalizeRole(role)] || "Employee";

export const getRoleDashboardPath = (role) => {
  return "/dashboard";
};

export const canAccessRoleLevel = (userRole, requiredRole) => {
  const userLevel = ROLE_LEVELS[normalizeRole(userRole)] || 0;
  const requiredLevel = ROLE_LEVELS[normalizeRole(requiredRole)] || 0;
  return userLevel >= requiredLevel;
};
