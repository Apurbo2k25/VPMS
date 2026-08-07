const Visitor = require("../models/Visitor.js");
const qrcode = require("qrcode");
require("../models/user.js");
const sendEmail = require("../utils/sendEmail.js");

exports.registerVisitors = async (req, res) => {
  try {
    const { name, email, phone, hostEmployee, purpose, visitDate } = req.body;

    const photo = req.file ? req.file.filename : "";
    if (!name || !email || !phone || !hostEmployee || !purpose) {
      return res.status(400).json({
        message: "Fill all the required information!",
      });
    }

    const checkRegistration = await Visitor.findOne({
      phone,
      status: "Pending",
    });
    if (checkRegistration) {
      return res.status(409).json({
        message:
          "You already have a pending visitor request. Please wait for approval.",
      });
    }
    const phoneRegex = /^\d{10}$/;

    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        message: "Phone number must be exactly 10 digits!",
      });
    }
    const newVisitor = await Visitor.create({
      name,
      email,
      phone,
      hostEmployee,
      purpose,
      photo,
      status: "Pending",
      visitDate: visitDate || new Date(),
    });
    res.status(201).json({
      message: "Visitor registered successfully!",
      visitor: newVisitor,
    });
  } catch (err) {
    console.log("Error details:", err);
    res.status(500).json({
      message: "Visitor registration failed!",
      error: err.message,
    });
  }
};

exports.getAllVisitors = async (req, res) => {
  try {
    let visitors;

    if (req.user.role === "Admin") {
      visitors = await Visitor.find().populate({
        path: "hostEmployee",
        select: "name email",
      });
    } else if (req.user.role === "Employee") {
      visitors = await Visitor.find({
        hostEmployee: req.user.id,
      }).populate({
        path: "hostEmployee",
        select: "name email",
      });
    } else if (req.user.role === "Security") {
      visitors = await Visitor.find({
        status: { $in: ["Approved", "CheckedIn"] },
      }).populate({
        path: "hostEmployee",
        select: "name email",
      });
    }

    return res.status(200).json({ visitors });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Failed to fetch visitors",
      error: err.message,
    });
  }
};

exports.getVisitorById = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      return res.status(404).json({
        message: "Visitor Not Found",
      });
    }
    return res.status(200).json({ visitor });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to fetch the visitors data!" });
  }
};

exports.approveVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      return res.status(404).json({
        message: "Visitor Not Found",
      });
    }
    if (visitor.status !== "Pending") {
      return res.status(400).json({
        message: `Cannot approve visitor with status '${visitor.status}'`,
      });
    }
    visitor.qrCode = await qrcode.toDataURL(visitor._id.toString());

    visitor.status = "Approved";
    await visitor.save();
    try {
      await sendEmail(
        visitor.email,
        "Visitor Request Approved",
        `Hello ${visitor.name},

Your visitor request has been approved.

Please open your Visitor Room to download your QR Pass.`,
      );
      console.log("Email sent successfully");
    } catch (err) {
      console.error("Email failed:", err.message);
    }
    return res.status(200).json({
      message: "Visitor Status Approved!",
      visitor,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to Approve the visitor request!",
      error: err.message,
    });
  }
};

exports.checkInVisitor = async (req, res) => {
  console.log("CHECK IN API HIT");
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      return res.status(404).json({
        message: "Visitor Not Found",
      });
    }
    if (visitor.status !== "Approved") {
      return res.status(400).json({
        message: `Cannot Check In the visitor with status '${visitor.status}'`,
      });
    }
    visitor.status = "CheckedIn";
    visitor.checkInTime = new Date();

    await visitor.save();
    return res.status(200).json({
      message: "Visitor Checked In successfully!",
      visitor,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to Check In the visitor request!",
      error: err.message,
    });
  }
};

exports.checkOutVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      return res.status(404).json({
        message: "Visitor Not Found",
      });
    }
    if (visitor.status !== "CheckedIn") {
      return res.status(400).json({
        message: `Cannot Check Out the visitor with status '${visitor.status}'`,
      });
    }
    visitor.status = "CheckedOut";
    visitor.checkOutTime = new Date();

    await visitor.save();
    return res.status(200).json({
      message: "Visitor Checked Out successfully!",
      visitor,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to Check Out the visitor request!",
      error: err.message,
    });
  }
};

exports.rejectVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      return res.status(404).json({
        message: "Visitor Not Found",
      });
    }
    if (visitor.status !== "Pending") {
      return res.status(400).json({
        message: `Cannot Reject visitor with status '${visitor.status}'`,
      });
    }
    visitor.status = "Rejected";

    await visitor.save();
    try {
      await sendEmail(
        visitor.email,
        "Visitor Request Rejected",
        `Hello ${visitor.name},

Unfortunately, your visitor request has been rejected by the host employee.

Status: Rejected

Thank you,
VPMS Team`,
      );
    } catch (err) {
      console.error("Email failed:", err.message);
    }
    return res.status(200).json({
      message: "Visitor Status Rejected!",
      visitor,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to Reject the visitor request!",
      error: err.message,
    });
  }
};
