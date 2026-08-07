const User = require("../models/user.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET;

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Fill all the required informations!",
      });
    }
    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(401).json({
        message: "Email already exists!",
      });
    }
    //Hashing the Password//
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      message: "User signed up successfully!",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.log("Error details:", err);
    res.status(500).json({
      message: "Signup API is not working!",
      error: err.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Fill all the required informations!",
      });
    }
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "No account found with this email!" });
    }
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      return res.status(401).json({ message: "Incorrect password!" });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "User Logged successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.log("Error details:", err);
    res.status(500).json({
      message: "Login API is not working!",
      error: err.message,
    });
  }
};
