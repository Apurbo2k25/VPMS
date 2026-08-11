require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db.js");
const cors = require("cors");
const path = require("path");

require("./models/user.js");
require("./models/Visitor.js");

const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173", "https://vpms-portal.netlify.app"],
    credentials: true,
  }),
);

app.use(express.json());
// Serve uploaded images as static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const autRoutes = require("./routes/authRoutes.js");
app.use("/api/auth", autRoutes);
const userRoutes = require("./routes/userRoutes.js");
app.use("/api/users", userRoutes);

const visitorRoutes = require("./routes/visitorRoutes.js");
app.use("/api/visitors", visitorRoutes);

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
