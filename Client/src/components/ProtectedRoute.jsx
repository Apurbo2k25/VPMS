import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRole }) => {
  try {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || user?.role !== allowedRole) {
      return <Navigate to="/login" replace />;
    }

    return <Outlet />;
  } catch (err) {
    console.log("Error in ProtectedRoute:", err);
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
