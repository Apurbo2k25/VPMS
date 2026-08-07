const User = require("../models/user.js");

exports.getEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: "Employee" }).select("_id name");
    res.status(200).json({
      employees,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetched employees",
      error: err.message,
    });
  }
};
