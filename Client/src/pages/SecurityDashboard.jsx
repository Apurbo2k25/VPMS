import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import Navbar from "../components/Navbar";
import api from "../services/api";

function SecurityDashboard() {
  const [scanResult, setScanResult] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [qrInput, setQrInput] = useState("");

  const verifyQR = async (decodedText) => {
    if (!decodedText) return;

    setLoading(true);
    setMessage(null);

    try {
      let parsedData;
      try {
        parsedData = JSON.parse(decodedText);
      } catch {
        parsedData = { id: decodedText };
      }

      const visitorId = parsedData.id;
      const res = await api.put(`/visitors/${visitorId}/checkin`);

      setScanResult(res.data.visitor);
      setMessage({
        type: "success",
        text: "Visitor Checked In Successfully!",
      });
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Invalid or Unapproved QR Code",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!scanResult) return;

    setLoading(true);
    try {
      const res = await api.put(`/visitors/${scanResult._id}/checkout`);
      setScanResult(res.data.visitor);
      setMessage({
        type: "success",
        text: "Visitor Checked Out Successfully!",
      });
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to check out visitor",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (scanResult) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false,
    );

    scanner.render(
      async (decodedText) => {
        await verifyQR(decodedText);
        scanner.clear();
      },
      () => {},
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [scanResult]);

  const resetScanner = () => {
    setScanResult(null);
    setMessage(null);
    setQrInput("");
  };

  return (
    <div className="min-h-screen bg-slate-100 ">
      <Navbar />

      <div className="max-w-3xl mx-auto py-10 px-5">
        <h1 className="text-3xl font-bold text-slate-800">
          Security Dashboard
        </h1>

        <p className="text-slate-500 mt-2 mb-8">
          Verify visitor QR Codes before allowing entry.
        </p>

        <div className="grid grid-cols-2s md:grid-cols-2 gap-6 mb-8">
          {!scanResult && (
            <>
              <div className="bg-white rounded-xl shadow p-6 mb-8">
                <h2 className="font-semibold mb-4">Scan QR Code</h2>
                <div id="reader"></div>
              </div>

              <div className="bg-white rounded-xl shadow p-6 mb-8">
                <h2 className="font-semibold mb-4">Manual Verification</h2>
                <textarea
                  rows={5}
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  placeholder="Paste copied QR data here..."
                  className="w-full border rounded-lg p-3"
                />
                <button
                  disabled={loading}
                  onClick={() => verifyQR(qrInput)}
                  className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
                >
                  {loading ? "Verifying..." : "Verify QR"}
                </button>
              </div>
            </>
          )}

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          {scanResult && (
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center border-b pb-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold">{scanResult.name}</h2>
                  <p className="text-sm text-gray-500">{scanResult.email}</p>
                </div>

                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {scanResult.status}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <p>
                  <strong>Phone:</strong> {scanResult.phone}
                </p>
                <p>
                  <strong>Purpose:</strong> {scanResult.purpose}
                </p>
                <p>
                  <strong>Visitor ID:</strong> {scanResult._id}
                </p>
                <p>
                  <strong>Entry Time:</strong>{" "}
                  {scanResult.checkInTime
                    ? new Date(scanResult.checkInTime).toLocaleString()
                    : "--"}
                </p>
              </div>

              <div className="space-y-4">
                {scanResult.status === "CheckedIn" && (
                  <button
                    disabled={loading}
                    onClick={handleCheckout}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
                  >
                    {loading ? "Processing..." : "Check Out Visitor"}
                  </button>
                )}

                {scanResult.status === "CheckedOut" && (
                  <button
                    onClick={resetScanner}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg"
                  >
                    Scan Next Visitor
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SecurityDashboard;
