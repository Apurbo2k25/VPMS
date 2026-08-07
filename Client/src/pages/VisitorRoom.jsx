import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import api from "../services/api";
import jsPDF from "jspdf";

function VisitorRoom() {
  const { visitorId } = useParams();
  const navigate = useNavigate();

  const [visitor, setVisitor] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchVisitor = async () => {
    try {
      const res = await api.get(`/visitors/${visitorId}`);
      setVisitor(res.data.visitor);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitor();
    const interval = setInterval(() => fetchVisitor(), 5000);
    return () => clearInterval(interval);
  }, [visitorId]);

  useEffect(() => {
    if (visitor?.status === "CheckedOut" || visitor?.status === "Rejected") {
      localStorage.removeItem("visitorId");
    }
  }, [visitor?.status]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!visitor) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Visitor not found.
      </div>
    );
  }

  const qrData = JSON.stringify({
    id: visitor._id,
    name: visitor.name,
    email: visitor.email,
    status: visitor.status,
  });

  // Helper to load image URL into Base64 for jsPDF
  const loadImageAsBase64 = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/jpeg"));
      };
      img.onerror = (err) => reject(err);
      img.src = url;
    });
  };

  const downloadPDF = async () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [100, 150],
    });

    // Outer Border & Header
    doc.setLineWidth(1);
    doc.setDrawColor(220, 220, 220);
    doc.rect(5, 5, 90, 140);

    doc.setFillColor(37, 99, 235);
    doc.rect(5, 5, 90, 25, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text("VISITOR PASS", 50, 20, { align: "center" });

    let currentY = 36;

    // Visitor Photo Rendering
    if (visitor.photo) {
      try {
        const photoUrl = `http://localhost:5000/uploads/${visitor.photo}`;
        const base64Photo = await loadImageAsBase64(photoUrl);
        doc.addImage(base64Photo, "JPEG", 37, currentY, 26, 26);

        doc.setLineWidth(0.5);
        doc.setDrawColor(200, 200, 200);
        doc.rect(37, currentY, 26, 26);
        currentY += 32;
      } catch (err) {
        console.error("Error adding visitor photo to PDF:", err);
      }
    }

    // Visitor Details
    const fields = [
      { label: "NAME", value: visitor.name },
      { label: "EMAIL", value: visitor.email },
      { label: "PHONE", value: visitor.phone },
      { label: "PURPOSE", value: visitor.purpose },
    ];

    fields.forEach(({ label, value }) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(120, 120, 120);
      doc.text(label, 10, currentY);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text(value || "N/A", 10, currentY + 4);

      currentY += 11;
    });

    // Render QR Code using SVG-to-Canvas conversion
    const svgElement = document.getElementById("qr-code-svg");
    if (svgElement) {
      try {
        const qrSvgString = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([qrSvgString], {
          type: "image/svg+xml;charset=utf-8",
        });
        const url = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.src = url;
        await new Promise((resolve) => (img.onload = resolve));

        const canvas = document.createElement("canvas");
        canvas.width = 180;
        canvas.height = 180;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const qrCodeDataUrl = canvas.toDataURL("image/png");
        doc.addImage(qrCodeDataUrl, "PNG", 68, currentY - 5, 22, 22);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Error generating QR code for PDF:", err);
      }
    }

    // Status Badge
    const isApproved = visitor.status?.toLowerCase() === "approved";
    doc.setFillColor(...(isApproved ? [34, 197, 94] : [234, 88, 12]));
    doc.roundedRect(10, currentY + 5, 28, 7, 2, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text((visitor.status || "PENDING").toUpperCase(), 24, currentY + 9.5, {
      align: "center",
    });

    doc.save(`${visitor.name}_VisitorPass.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-indigo-600">
          VPMS
        </Link>
        <div className="space-x-5">
          <Link to="/" className="hover:text-indigo-600">
            Home
          </Link>
          <Link to="/register" className="hover:text-indigo-600">
            Register Visitor
          </Link>
        </div>
      </nav>

      <div className="max-w-xl mx-auto mt-12 bg-white rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold text-center mb-2">Visitor Status</h1>
        <p className="text-center text-gray-500 mb-8">
          Your visitor request status will automatically update.
        </p>

        {visitor.status === "Pending" && (
          <>
            <div className="text-center text-yellow-600 text-6xl mb-4">⏳</div>
            <h2 className="text-xl font-bold text-center mb-2">
              Waiting for Approval
            </h2>
            <p className="text-center text-gray-600">
              Please wait while your host employee reviews your request.
            </p>
          </>
        )}

        {visitor.status === "Approved" && (
          <>
            <div className="text-center text-green-600 text-6xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-center mb-2">
              Request Approved
            </h2>
            <p className="text-center text-gray-600 mb-6">
              Please present this QR Code at the Security Gate.
            </p>

            <div className="flex justify-center mb-6">
              <div className="bg-white p-4 border rounded-lg">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={qrData}
                  size={180}
                  level="H"
                />
              </div>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(qrData);
                alert("QR data copied!");
              }}
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg"
            >
              Copy QR Data
            </button>

            <div className="bg-slate-100 rounded-lg p-4 mt-6 space-y-2">
              <p>
                <strong>Name:</strong> {visitor.name}
              </p>
              <p>
                <strong>Email:</strong> {visitor.email}
              </p>
              <p>
                <strong>Phone:</strong> {visitor.phone}
              </p>
              <p>
                <strong>Purpose:</strong> {visitor.purpose}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className="text-green-600 font-semibold">Approved</span>
              </p>
            </div>
            <button
              onClick={downloadPDF}
              className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition"
            >
              Download Visitor Pass (PDF)
            </button>
          </>
        )}

        {visitor.status === "CheckedIn" && (
          <>
            <div className="text-center text-blue-600 text-6xl mb-4">🏢</div>
            <h2 className="text-xl font-bold text-center">Checked In</h2>
            <p className="text-center text-gray-600 mt-2">
              Your entry has been verified successfully.
            </p>
            <p className="text-center mt-4">
              <strong>Entry Time</strong>
            </p>
            <p className="text-center text-green-600">
              {visitor.checkInTime
                ? new Date(visitor.checkInTime).toLocaleString()
                : "--"}
            </p>
          </>
        )}

        {visitor.status === "CheckedOut" && (
          <>
            <div className="text-center text-gray-600 text-6xl mb-4">👋</div>
            <h2 className="text-xl font-bold text-center">Visit Completed</h2>
            <div className="mt-6 space-y-2 text-center">
              <p>
                <strong>Entry:</strong>{" "}
                {visitor.checkInTime
                  ? new Date(visitor.checkInTime).toLocaleString()
                  : "--"}
              </p>
              <p>
                <strong>Exit:</strong>{" "}
                {visitor.checkOutTime
                  ? new Date(visitor.checkOutTime).toLocaleString()
                  : "--"}
              </p>
              <button
                className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg"
                onClick={() => navigate("/")}
              >
                Back to Home Page
              </button>
            </div>
          </>
        )}

        {visitor.status === "Rejected" && (
          <>
            <div className="text-center text-red-600 text-6xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-center">Request Rejected</h2>
            <p className="text-center text-gray-600 mt-3">
              Your host employee rejected your request.
            </p>
            <button
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg"
              onClick={() => navigate("/")}
            >
              Back to Home Page
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default VisitorRoom;
