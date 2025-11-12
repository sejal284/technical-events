import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, requireAdmin = false }) {
  const token = localStorage.getItem("token");
  const userType = localStorage.getItem("userType");

  if (!token) {
    return <Navigate to="/login" />;
  }

  // If admin access is required but user is not admin
  if (requireAdmin && userType !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

export default ProtectedRoute;
