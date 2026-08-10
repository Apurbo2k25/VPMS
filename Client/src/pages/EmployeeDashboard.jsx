import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";

function EmployeeDashboard() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    checkedIn: 0,
    checkedOut: 0,
  });

  const fetchVisitors = async () => {
    try {
      const res = await api.get("/visitors");
      const data = res.data.visitors || res.data || [];
      setVisitors(data);

      setStats({
        total: data.length,
        pending: data.filter((v) => v.status === "Pending").length,
        approved: data.filter((v) => v.status === "Approved").length,
        rejected: data.filter((v) => v.status === "Rejected").length,
        checkedIn: data.filter((v) => v.status === "CheckedIn").length,
        checkedOut: data.filter((v) => v.status === "CheckedOut").length,
      });
    } catch (err) {
      console.error("Failed to fetch visitors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const handleApprove = async (id) => {
    try {
      setLoading(id);

      await api.put(`/visitors/${id}/approve`);

      fetchVisitors();
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(null);
    }
  };
  const handleReject = async (id) => {
    try {
      setLoading(id);

      await api.put(`/visitors/${id}/reject`);

      fetchVisitors();
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(null);
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Approved":
      case "CheckedIn":
        return "bg-emerald-100 text-emerald-700";
      case "CheckedOut":
        return "bg-indigo-100 text-indigo-700";
      case "Rejected":
        return "bg-rose-100 text-rose-700";
      default:
        return "bg-amber-100 text-amber-700";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">
            Employee Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Visitors registered for you.
          </p>
        </div>

        {/* Stats Grid Placement */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {[
            {
              label: "Total",
              value: stats.total,
              color: "bg-blue-50 text-blue-700 border-blue-200",
            },
            {
              label: "Pending",
              value: stats.pending,
              color: "bg-yellow-50 text-yellow-700 border-yellow-200",
            },
            {
              label: "Approved",
              value: stats.approved,
              color: "bg-green-50 text-green-700 border-green-200",
            },
            {
              label: "Rejected",
              value: stats.rejected,
              color: "bg-red-50 text-red-700 border-red-200",
            },
            {
              label: "Checked In",
              value: stats.checkedIn,
              color: "bg-indigo-50 text-indigo-700 border-indigo-200",
            },
            {
              label: "Checked Out",
              value: stats.checkedOut,
              color: "bg-gray-100 text-gray-700 border-gray-200",
            },
          ].map((card, i) => (
            <div key={i} className={`p-4 rounded-lg border ${card.color}`}>
              <p className="text-xs font-semibold uppercase">{card.label}</p>
              <p className="text-2xl font-bold mt-1">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <p className="p-6 text-slate-500 text-center text-sm">
              Loading visitors...
            </p>
          ) : visitors.length === 0 ? (
            <p className="p-6 text-slate-500 text-center text-sm">
              No visitors found.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {visitors.map((visitor) => {
                const status = visitor.status || "Pending";

                return (
                  <div
                    key={visitor._id}
                    className="p-4 flex justify-between items-center hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-4">
                      {visitor.photo ? (
                        <img
                          src={`${import.meta.env.VITE_API_URL.replace("/api", "")}/uploads/${v.photo}`}
                          alt={visitor.name}
                          className="w-12 h-12 rounded-full object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-500 border border-slate-200">
                          N/A
                        </div>
                      )}

                      <div>
                        <h3 className="font-semibold text-slate-800">
                          {visitor.name}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {visitor.email} • {visitor.phone}
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                          <span className="font-medium">Purpose:</span>{" "}
                          {visitor.purpose}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadgeStyle(
                          status,
                        )}`}
                      >
                        {status}
                      </span>

                      {status === "Pending" && (
                        <div className="flex items-center gap-2">
                          <button
                            disabled={loading === visitor._id}
                            onClick={() => handleApprove(visitor._id)}
                            className={`px-4 py-2 rounded-lg text-white
    ${
      loading === visitor._id
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-emerald-600 hover:bg-emerald-700"
    }`}
                          >
                            {loading === visitor._id
                              ? "Approving..."
                              : "Approve"}
                          </button>
                          <button
                            disabled={loading === visitor._id}
                            onClick={() => handleReject(visitor._id)}
                            className={`px-4 py-2 rounded-lg text-white
    ${
      loading === visitor._id
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-red-400 hover:bg-red-500"
    }`}
                          >
                            {loading === visitor._id
                              ? "Rejecting..."
                              : "Rejected"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default EmployeeDashboard;
