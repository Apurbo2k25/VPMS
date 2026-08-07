const express = require("express");
const router = express.Router();
const { signup, login } = require("../controllers/authController.js");
const authMiddleware = require("../middleware/authMiddleware.js");
const roleMiddleware = require("../middleware/roleMiddleware.js");

router.get(
  "/admin-dashboard",
  authMiddleware,
  roleMiddleware("Admin"),
  (req, res) => {
    res.json({ message: "Welcome to Admin Dashboard." });
  },
);

router.post("/signup", signup);
router.post("/login", login);

module.exports = router;
