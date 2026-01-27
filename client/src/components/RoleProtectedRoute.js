import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated, getUserRole } from "../utils/auth";

function RoleProtectedRoute({ allowedRoles = [], children }) {
  const location = useLocation();

  // ✅ Must be logged in
  if (!isAuthenticated()) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // ✅ Normalize role
  const role = String(getUserRole() || "").toLowerCase().trim();
  const normalizedAllowed = allowedRoles.map((r) => String(r).toLowerCase().trim());

  // ✅ Block wrong roles
  if (!normalizedAllowed.includes(role)) {
    if (role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (role === "engineer") return <Navigate to="/engineer/dashboard" replace />;
    if (role === "customer") return <Navigate to="/user/dashboard" replace />;

    return <Navigate to="/" replace />;
  }

  return children;
}

export default RoleProtectedRoute;
