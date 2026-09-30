const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

// Public / Placed list for the homepage gallery/overview dashboard
router.get("/placed", async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT ON (s.student_id) 
        s.student_id, 
        s.name, 
        s.email, 
        s.cgpa, 
        d.dept_name, 
        c.company_name, 
        pd.package_lpa 
      FROM students s
      JOIN departments d ON s.dept_id = d.dept_id
      JOIN applications a ON s.student_id = a.student_id
      JOIN placement_drives pd ON a.drive_id = pd.drive_id
      JOIN companies c ON pd.company_id = c.company_id
      WHERE LOWER(a.status) = 'placed'
      ORDER BY s.student_id, pd.package_lpa DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching placed students:", err);
    res.status(500).json({ error: "Database error fetching placed list" });
  }
});

// Get all students - open to Admin and Officer, or Student (who only receives their own record)
router.get("/", authenticateToken, async (req, res) => {
  try {
    let query = `
      SELECT s.*, d.dept_name 
      FROM students s 
      LEFT JOIN departments d ON s.dept_id = d.dept_id
    `;
    let params = [];

    if (req.user.role === "Student") {
      query += " WHERE s.student_id = $1";
      params.push(req.user.studentid);
    } else {
      query += " ORDER BY s.student_id DESC";
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ error: "Database error fetching students list" });
  }
});

// Get single student details
router.get("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  // Authorization: Student can only access their own profile
  if (req.user.role === "Student" && String(req.user.studentid) !== String(id)) {
    return res.status(403).json({ error: "Unauthorized profile access" });
  }

  try {
    const query = `
      SELECT s.*, d.dept_name 
      FROM students s 
      LEFT JOIN departments d ON s.dept_id = d.dept_id
      WHERE s.student_id = $1
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching student profile:", err);
    res.status(500).json({ error: "Database error fetching student details" });
  }
});

// Create student - Admin only
router.post("/", authenticateToken, authorizeRoles("Admin"), async (req, res) => {
  const { name, email, cgpa, dept_id } = req.body;
  if (!name || !cgpa) {
    return res.status(400).json({ error: "Name and CGPA are required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO students (name, email, cgpa, dept_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email || null, parseFloat(cgpa), dept_id ? parseInt(dept_id) : null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating student:", err);
    res.status(500).json({ error: "Database error creating student record" });
  }
});

// Update student - Admin can edit any; Student can edit their own details
router.put("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, email, cgpa, dept_id } = req.body;

  // Authorization check
  if (req.user.role === "Student" && String(req.user.studentid) !== String(id)) {
    return res.status(403).json({ error: "Unauthorized profile update" });
  }

  try {
    // If user is student, prevent them from changing CGPA or Department
    let query, params;
    if (req.user.role === "Student") {
      query = `
        UPDATE students 
        SET name = $1, email = $2 
        WHERE student_id = $3 
        RETURNING *
      `;
      params = [name, email, id];
    } else {
      // Admin/Officer updates everything
      query = `
        UPDATE students 
        SET name = $1, email = $2, cgpa = $3, dept_id = $4 
        WHERE student_id = $5 
        RETURNING *
      `;
      params = [name, email, parseFloat(cgpa), dept_id ? parseInt(dept_id) : null, id];
    }

    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating student:", err);
    res.status(500).json({ error: "Database error updating student record" });
  }
});

// Delete student - Admin only
router.delete("/:id", authenticateToken, authorizeRoles("Admin"), async (req, res) => {
  const { id } = req.params;
  try {
    // Delete associated applications and user login details first
    await pool.query("DELETE FROM applications WHERE student_id = $1", [id]);
    await pool.query("DELETE FROM users WHERE studentid = $1", [id]);
    
    const result = await pool.query("DELETE FROM students WHERE student_id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json({ message: "Student record deleted successfully", student: result.rows[0] });
  } catch (err) {
    console.error("Error deleting student:", err);
    res.status(500).json({ error: "Database error deleting student record" });
  }
});

module.exports = router;