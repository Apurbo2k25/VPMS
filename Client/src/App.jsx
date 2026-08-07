import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import EmployeeDashboard from "./pages/EmployeeDashboard.jsx";
import Login from "./pages/Login.jsx";
import RegisterVisitor from "./pages/RegisterVisitor.jsx";
import SecurityDashboard from "./pages/SecurityDashboard.jsx";
import Home from "./pages/Home.jsx";
import VisitorRoom from "./pages/VisitorRoom.jsx";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Public Route */}
        <Route path="/login" element={<Login />} />
        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute allowedRole="Admin" />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
        {/* Protected Employee Routes */}
        <Route element={<ProtectedRoute allowedRole="Employee" />}>
          <Route path="/employee" element={<EmployeeDashboard />} />
        </Route>
        {/* Protected Security Routes */}
        <Route element={<ProtectedRoute allowedRole="Security" />}>
          <Route path="/security" element={<SecurityDashboard />} />
        </Route>
        <Route path="/register" element={<RegisterVisitor />} />
        {/* Change this line: */}
        <Route path="/visitor-room/:visitorId" element={<VisitorRoom />} />{" "}
      </Routes>
    </>
  );
}

export default App;
