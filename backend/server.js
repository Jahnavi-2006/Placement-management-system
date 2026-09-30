const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const pool = require("./db");

// Import modular routes
const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/students");
const companyRoutes = require("./routes/companies");
const driveRoutes = require("./routes/drives");
const applicationRoutes = require("./routes/applications");
const analyticsRoutes = require("./routes/analytics");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Mount routes
app.use("/auth", authRoutes);
app.use("/students", studentRoutes);
app.use("/companies", companyRoutes);
app.use("/drives", driveRoutes);
app.use("/applications", applicationRoutes);
app.use("/analytics", analyticsRoutes);

// Root page route
app.get("/", (req, res) => {
  res.send("Placement Analysis System API running successfully!");
});

// Test route
app.get("/test", (req, res) => {
  res.send("Placement Analysis System Backend Working");
});

// Database Auto-Seeding function
async function seedUsers() {
  try {
    const userCountRes = await pool.query("SELECT COUNT(*) FROM users");
    const count = parseInt(userCountRes.rows[0].count);
    
    if (count === 0) {
      console.log("No user accounts found. Seeding default role-based users...");
      
      const adminPassHash = await bcrypt.hash("admin123", 10);
      const officerPassHash = await bcrypt.hash("officer123", 10);
      
      // 1. Seed Admin
      await pool.query(
        "INSERT INTO users (username, password, role, studentid) VALUES ($1, $2, $3, $4)",
        ["admin", adminPassHash, "Admin", null]
      );
      console.log("Seeded Admin user (username: admin / password: admin123)");
      
      // 2. Seed Placement Officer
      await pool.query(
        "INSERT INTO users (username, password, role, studentid) VALUES ($1, $2, $3, $4)",
        ["officer", officerPassHash, "Officer", null]
      );
      console.log("Seeded Placement Officer user (username: officer / password: officer123)");
      
      // 3. Seed Students
      // Fetch the first 3 students from the database to link user accounts
      const studentsRes = await pool.query("SELECT student_id, name FROM students ORDER BY student_id LIMIT 3");
      
      if (studentsRes.rows.length > 0) {
        const s1 = studentsRes.rows[0].student_id;
        const student1PassHash = await bcrypt.hash("student123", 10);
        await pool.query(
          "INSERT INTO users (username, password, role, studentid) VALUES ($1, $2, $3, $4)",
          ["student1", student1PassHash, "Student", s1]
        );
        console.log(`Seeded Student user 'student1' (password: student123) linked to Student ID ${s1} (${studentsRes.rows[0].name})`);
        
        if (studentsRes.rows.length > 1) {
          const s2 = studentsRes.rows[1].student_id;
          const student2PassHash = await bcrypt.hash("student223", 10);
          await pool.query(
            "INSERT INTO users (username, password, role, studentid) VALUES ($1, $2, $3, $4)",
            ["student2", student2PassHash, "Student", s2]
          );
          console.log(`Seeded Student user 'student2' (password: student223) linked to Student ID ${s2} (${studentsRes.rows[1].name})`);
        }
      } else {
        console.log("No students found in the 'students' table to link to default Student accounts.");
      }
      
      console.log("User accounts seeding completed successfully.");
    } else {
      console.log("Database already contains user accounts. Skipping auto-seeding.");
    }
  } catch (err) {
    console.error("Error running database seeding:", err);
  }
}

// Execute seeding on startup
seedUsers();

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});