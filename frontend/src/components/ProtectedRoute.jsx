import { Navigate } from "react-router-dom";
 
export default function ProtectedRoute({ children, allowedRole }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
 
  if (!user) return <Navigate to="/" replace />;
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === "staff" ? "/admin/dashboard" : "/reader/home"} replace />;
  }
  return children;
}
 