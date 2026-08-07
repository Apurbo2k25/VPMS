import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { AlertCircle, Camera } from "lucide-react";
function RegisterVisitor() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    hostEmployee: "",
    purpose: "",
  });
  const [photo, setPhoto] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset state

    const { name, email, phone, hostEmployee, purpose } = formData;

    if (!purpose || purpose.trim().length < 10) {
      setError(
        "Purpose cannot be blank and must be at least 10 characters long!",
      );
      return;
    }

    if (!photo) {
      setError("Photo is mandatory for Security Purposes!");
      return;
    }

    try {
      // 2. Single FormData instance
      const data = new FormData();
      data.append("name", name);
      data.append("email", email);
      data.append("phone", phone);
      data.append("hostEmployee", hostEmployee);
      data.append("purpose", purpose);
      data.append("photo", photo);

      const response = await api.post("/visitors/register", data);
      const visitorId = response.data.visitor?._id || response.data._id;

      localStorage.setItem("visitorId", visitorId);
      navigate(`/visitor-room/${visitorId}`);
    } catch (err) {
      setError(err.response?.data?.message || "Registration Failed!");
    }
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get("/users/employees");
        setEmployees(res.data.employees || res.data);
      } catch (err) {
        console.error("Failed to fetch employees:", err);
      }
    };
    fetchEmployees();
  }, []);
  useEffect(() => {
    const visitorId = localStorage.getItem("visitorId");

    if (visitorId) {
      navigate(`/visitor-room/${visitorId}`);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="fixed top-4 left-4">
        <Link
          to="/"
          className="bg-indigo-600 hover:bg-indigo-700 text-white border border-slate-300 px-4 py-2 rounded-lg font-medium shadow-sm"
        >
          ← Back to Home
        </Link>
      </div>

      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm w-full max-w-md">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm mb-4">
            ⚠️ {error}
          </div>
        )}
        <h1 className="text-2xl font-bold text-slate-800 text-center mb-1">
          Register Visitor
        </h1>
        <p className="text-slate-500 text-sm text-center mb-6">
          Enter visitor details to generate a pass.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              placeholder="+1 234 567 890"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium flex items-center gap-2">
              <Camera className="w-4 h-4" /> Upload Visitor Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files[0])}
              className="border p-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Host / Person to Visit
            </label>
            <select
              className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              name="hostEmployee"
              value={formData.hostEmployee}
              onChange={handleChange}
              required
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Purpose of Visit
            </label>
            <textarea
              name="purpose"
              rows="3"
              placeholder="e.g. Interview, Business Meeting"
              value={formData.purpose}
              onChange={handleChange}
              required
              className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>

          {/* Removed onClick={handleRegister} so only form onSubmit runs */}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition"
          >
            Submit Registration
          </button>

          <div className="mt-4 text-center">
            <p className="text-sm text-slate-500">Already an employee?</p>
            <Link
              to="/login"
              className="text-sm text-indigo-600 hover:underline font-medium"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterVisitor;
