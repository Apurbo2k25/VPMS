import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api.js";
import Papa from "papaparse";
import { saveAs } from "file-saver";

function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    checkedIn: 0,
    checkedOut: 0,
  });

  const [visitors, setVisitors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    api
      .get("/visitors")
      .then((res) => {
        const data = res.data.visitors || [];
        setVisitors(data);

        setStats({
          total: data.length,
          pending: data.filter((v) => v.status === "Pending").length,
          approved: data.filter((v) => v.status === "Approved").length,
          rejected: data.filter((v) => v.status === "Rejected").length,
          checkedIn: data.filter((v) => v.status === "CheckedIn").length,
          checkedOut: data.filter((v) => v.status === "CheckedOut").length,
        });
      })
      .catch((err) => console.error(err));
  }, []);

  // Filter visitors by name, host employee, purpose, or status
  const filteredVisitors = visitors.filter((v) => {
    const query = searchQuery.toLowerCase();
    const name = v.name?.toLowerCase() || "";
    const host = v.hostEmployee?.name?.toLowerCase() || "";
    const purpose = v.purpose?.toLowerCase() || "";
    const status = v.status?.toLowerCase() || "";

    return (
      name.includes(query) ||
      host.includes(query) ||
      purpose.includes(query) ||
      status.includes(query)
    );
  });
  //CSV exportation logic
  const exportCSV = () => {
    const csvData = filteredVisitors.map((v) => ({
      Name: v.name,
      Email: v.email,
      Phone: "'" + v.phone,
      Employee: v.hostEmployee?.name || "N/A",
      Purpose: v.purpose,
      Status: v.status,
      EntryTime: v.checkInTime ? new Date(v.checkInTime).toLocaleString() : "-",
      ExitTime: v.checkOutTime
        ? new Date(v.checkOutTime).toLocaleString()
        : "-",
      VisitDate: v.visitDate ? new Date(v.visitDate).toLocaleDateString() : "-",
    }));

    const csv = Papa.unparse(csvData);

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    saveAs(blob, "Visitor_Report.csv");
  };

  return (
    <div>
      <Navbar />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome to the Admin portal.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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

        {/* Search Bar */}
        <div className="flex justify-between items-center">
          <input
            type="text"
            placeholder="Search by name, host, purpose, or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={exportCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Export CSV
          </button>
        </div>

        {/* Visitors Table */}
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b text-gray-700 uppercase text-xs">
              <tr>
                <th className="p-3">Picture</th>
                <th className="p-3">Name</th>
                <th className="p-3">Host Employee</th>
                <th className="p-3">Purpose</th>
                <th className="p-3">Status</th>
                <th className="p-3">Entry/Exit</th>
              </tr>
            </thead>
            <tbody>
              {filteredVisitors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-400">
                    No visitor records found.
                  </td>
                </tr>
              ) : (
                filteredVisitors.map((v) => (
                  <tr key={v._id || v.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      {v.photo ? (
                        <img
                          src={`${import.meta.env.VITE_API_URL.replace("/api", "")}/uploads/${v.photo}`}
                          alt={v.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                          N/A
                        </div>
                      )}
                    </td>
                    <td className="p-3 font-medium text-gray-900">{v.name}</td>
                    <td className="p-3 font-medium">
                      {v.hostEmployee?.name || "--"}
                    </td>
                    <td className="p-3 font-medium">{v.purpose}</td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded font-medium ${
                          v.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : v.status === "Approved"
                              ? "bg-green-100 text-green-700"
                              : v.status === "Rejected"
                                ? "bg-red-100 text-red-700"
                                : v.status === "CheckedIn" ||
                                    v.status === "Checked In"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td className="p-3 font-medium">
                      {v.checkInTime
                        ? new Date(v.checkInTime).toLocaleString()
                        : "--"}
                      {" / "}
                      {v.checkOutTime
                        ? new Date(v.checkOutTime).toLocaleString()
                        : "--"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
