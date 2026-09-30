const express = require("express");
const cors = require("cors");

const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// ROUTES
const authRoutes = require("./routes/auth");
const applicationRoutes = require("./routes/applications");

app.use("/auth", authRoutes);
app.use("/applications", applicationRoutes);

// TEST
app.get("/test", (req, res) => {
  res.send("Backend working");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});