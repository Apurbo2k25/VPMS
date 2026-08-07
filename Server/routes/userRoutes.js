const express = require("express");
const router = express.Router();
const { getEmployees } = require("../controllers/userController.js");
router.get("/employees", getEmployees);

module.exports = router;
