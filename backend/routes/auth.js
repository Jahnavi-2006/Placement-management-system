const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { JWT_SECRET } = require("../middleware/auth");

console.log("AUTH ROUTES LOADED");

router.get("/test", (req, res) => {
  res.send("AUTH WORKING");
});

// Login route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  try {
    // 1. Fetch user from database
    const userRes = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = userRes.rows[0];

    // 2. Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // 3. Generate JWT token
    const token = jwt.sign(
      { username: user.username, role: user.role, studentid: user.studentid },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // 4. Return token and user details to frontend
    res.json({
      token,
      role: user.role,
      username: user.username,
      studentid: user.studentid,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Database error during login" });
  }
});

// Register route (Student sign up)
router.post("/register", async (req, res) => {
  const { username, password, email, name, dept_id, cgpa } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ error: "Username, password, and email are required" });
  }

  try {
    // 1. Check if username already exists
    const checkUser = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // 2. Insert new student record
    const studentRes = await pool.query(
      "INSERT INTO students (name, email, cgpa, dept_id) VALUES ($1, $2, $3, $4) RETURNING student_id",
      [
        name || username,
        email,
        cgpa ? parseFloat(cgpa) : 7.0,
        dept_id ? parseInt(dept_id) : null,
      ]
    );
    const newStudentId = studentRes.rows[0].student_id;

    // 3. Hash password and insert user login record
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (username, password, role, studentid) VALUES ($1, $2, $3, $4)",
      [username, hashedPassword, "Student", newStudentId]
    );

    res.status(201).json({ message: "User registered successfully", studentid: newStudentId });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Database error during registration" });
  }
});

module.exports = router;