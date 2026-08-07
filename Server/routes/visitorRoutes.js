const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware.js");
const upload = require("../middleware/upload");

const {
  registerVisitors,
  getAllVisitors,
  getVisitorById,
  approveVisitor,
  checkInVisitor,
  checkOutVisitor,
  rejectVisitor,
} = require("../controllers/visitorController.js");

// Public
router.post("/register", upload.single("photo"), registerVisitors);
router.get("/:id", getVisitorById); // (

// Protected
router.get("/", authenticateToken, getAllVisitors);
router.put("/:id/approve", authenticateToken, approveVisitor);
router.put("/:id/reject", authenticateToken, rejectVisitor);
router.put("/:id/checkin", authenticateToken, checkInVisitor);
router.put("/:id/checkout", authenticateToken, checkOutVisitor);

module.exports = router;
