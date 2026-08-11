import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ extraButtons }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
      <Link to="/" className="text-xl font-bold text-indigo-600">
        VPMS
      </Link>

      <div className="flex items-center gap-3">
        {extraButtons}
        {token ? (
          <button
            onClick={handleLogout}
            className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition"
          >
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition"
          >
            Log In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
