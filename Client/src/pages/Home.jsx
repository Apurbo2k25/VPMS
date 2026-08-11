import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/api";

function Home() {
  const navigate = useNavigate();
  const [visitorId, setVisitorId] = useState(null);

  useEffect(() => {
    const id = localStorage.getItem("visitorId");
    if (!id) return;

    api
      .get(`/visitors/${id}`)
      .then(() => setVisitorId(id))
      .catch(() => {
        localStorage.removeItem("visitorId");
        setVisitorId(null);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <header className="bg-white border-b border-slate-200 py-4 px-8 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎫</span>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            VPMS Portal
          </h1>
        </div>

        <Link
          to="/login"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition text-sm shadow-sm"
        >
          Employee Login
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 max-w-5xl mx-auto w-full">
        {/* Active Session Alert */}
        {visitorId && (
          <div className="mb-8 w-full max-w-md bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between shadow-sm animate-fade-in">
            <div className="text-left">
              <p className="text-xs font-semibold uppercase text-emerald-600 tracking-wider">
                Active Pass Found
              </p>
              <p className="text-sm font-medium text-emerald-900">
                You have an ongoing visitor request.
              </p>
            </div>
            <button
              onClick={() => navigate(`/visitor-room/${visitorId}`)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded-lg font-semibold transition"
            >
              View Pass
            </button>
          </div>
        )}

        {/* Hero Section */}
        <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight">
          Seamless & Secure <br />
          <span className="text-indigo-600">Visitor Management</span>
        </h2>

        <p className="text-slate-600 max-w-lg mb-8 text-lg">
          Fast-track guest registration, receive real-time host approvals, and
          access instant digital QR entry passes.
        </p>

        {/* Action Buttons */}
        <div className="flex gap-4 flex-wrap justify-center mb-16">
          <Link
            to="/register"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-semibold shadow-md shadow-indigo-100 transition"
          >
            New Visitor Registration
          </Link>

          {!visitorId && (
            <Link
              to="/login"
              className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 px-8 py-3.5 rounded-xl font-semibold transition"
            >
              Host / Staff Portal
            </Link>
          )}
        </div>

        {/* How It Works Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-3xl mb-3">📝</div>
            <h3 className="font-bold text-slate-800 mb-1">
              1. Register Details
            </h3>
            <p className="text-sm text-slate-500">
              Submit your info and select your host employee in seconds.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-3xl mb-3">⏳</div>
            <h3 className="font-bold text-slate-800 mb-1">2. Get Approved</h3>
            <p className="text-sm text-slate-500">
              Hosts receive instant notifications to review and accept requests.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-3xl mb-3">📲</div>
            <h3 className="font-bold text-slate-800 mb-1">3. Scan Entry QR</h3>
            <p className="text-sm text-slate-500">
              Show your unique digital QR code at the security desk to enter.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-slate-400 text-sm border-t border-slate-200 bg-white">
        © {new Date().getFullYear()} VPMS. All rights reserved.
      </footer>
    </div>
  );
}

export default Home;
