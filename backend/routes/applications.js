const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

// Get all applications - filter by student if user is a Student
router.get("/", authenticateToken, async (req, res) => {
  try {
    let query = `
      SELECT a.*, 
        s.name as student_name, s.email as student_email, s.cgpa, 
        d.dept_name, 
        pd.package_lpa, pd.drive_date, 
        c.company_name 
      FROM applications a 
      JOIN students s ON a.student_id = s.student_id 
      LEFT JOIN departments d ON s.dept_id = d.dept_id 
      JOIN placement_drives pd ON a.drive_id = pd.drive_id 
      JOIN companies c ON pd.company_id = c.company_id
    `;
    let params = [];

    if (req.user.role === "Student") {
      query += " WHERE a.student_id = $1 ORDER BY a.app_id DESC";
      params.push(req.user.studentid);
    } else {
      query += " ORDER BY a.app_id DESC";
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).json({ error: "Database error fetching applications list" });
  }
});

// Post a new application - students apply for drives
router.post("/", authenticateToken, async (req, res) => {
  let { student_id, drive_id } = req.body;

  // Lock student_id to the authenticated student's profile if they are a student
  if (req.user.role === "Student") {
    student_id = req.user.studentid;
  }

  if (!student_id || !drive_id) {
    return res.status(400).json({ error: "Student ID and Drive ID are required" });
  }

  try {
    // 1. Check if student is already placed in another company
    const checkPlaced = await pool.query(
      "SELECT * FROM applications WHERE student_id = $1 AND LOWER(status) = 'placed'",
      [student_id]
    );
    if (checkPlaced.rows.length > 0) {
      return res.status(400).json({ 
        error: "Application rejected: You have already been PLACED in a company and cannot apply for further drives." 
      });
    }

    // 2. Check if application already exists
    const checkDuplicate = await pool.query(
      "SELECT * FROM applications WHERE student_id = $1 AND drive_id = $2",
      [student_id, drive_id]
    );
    if (checkDuplicate.rows.length > 0) {
      return res.status(400).json({ error: "You have already applied for this placement drive." });
    }

    // 3. Perform insert. DB Trigger 'before_application_insert' will check CGPA eligibility.
    // Initial application status is set to 'Pending'.
    const result = await pool.query(
      "INSERT INTO applications (student_id, drive_id, status) VALUES ($1, $2, 'Pending') RETURNING *",
      [student_id, drive_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Application placement error:", err);
    // Check if error is from the PG check_cgpa_eligibility trigger
    if (err.message && err.message.includes("Your CGPA is below the minimum criteria")) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Failed to apply for the drive. Database error." });
  }
});

// Update application status - Admin and Officer
router.put("/:id", authenticateToken, authorizeRoles("Admin", "Officer"), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }

  try {
    // Note: If status = 'Placed', trigger 'cascade_rejections' will reject other 'Applied' applications
    const result = await pool.query(
      "UPDATE applications SET status = $1 WHERE app_id = $2 RETURNING *",
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Application record not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating application:", err);
    res.status(500).json({ error: "Database error updating application status" });
  }
});

// Delete application - Admin only
router.delete("/:id", authenticateToken, authorizeRoles("Admin"), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM applications WHERE app_id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Application record not found" });
    }
    res.json({ message: "Application deleted successfully", application: result.rows[0] });
  } catch (err) {
    console.error("Error deleting application:", err);
    res.status(500).json({ error: "Database error deleting application" });
  }
});

module.exports = router;