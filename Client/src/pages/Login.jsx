import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Reset error state on new submit

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      const role = response.data.user?.role?.toLowerCase();
      if (role === "admin") navigate("/admin");
      else if (role === "employee") navigate("/employee");
      else if (role === "security") navigate("/security");
      else navigate("/");
    } catch (error) {
      // Captures the exact message sent from Express res.status().json({ message: "..." })
      const message =
        error.response?.data?.message ||
        "Something went wrong. Please try again.";

      setError(message);
    }
  };
  return (
    <div className=" bg-slate-50 w-full min-h-screen flex items-center justify-center p-4">
      <div className="absolute top-4 left-4">
        <Link
          to="/"
          className="bg-indigo-600 hover:bg-indigo-700 text-white border border-slate-300 px-4 py-2 rounded-lg font-medium  shadow-sm"
        >
          ← Back to Home
        </Link>
      </div>
      <form
        onSubmit={handleLogin}
        className="bg-white border p-8 rounded-lg shadow-lg w-full max-w-sm flex flex-col gap-4"
      >
        {/* 📍 General Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm mb-4">
            ⚠️ {error}
          </div>
        )}
        <h1 className="font-bold text-3xl  text-center">Login</h1>
        <input
          className="bg-white border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="email"
          placeholder="Enter Your Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="bg-white border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="password"
          placeholder="Enter Your Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
        >
          Log In
        </button>
        <div className="mt-4 text-center">
          <p> Don't have an employee account?</p>

          <Link
            to="/register"
            className="text-sm text-indigo-600 hover:underline"
          >
            Register as a Visitor
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Login;
