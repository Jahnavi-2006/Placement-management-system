const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

// Get all companies - open to all authenticated users
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM companies ORDER BY company_id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching companies:", err);
    res.status(500).json({ error: "Database error fetching companies list" });
  }
});

// Create new company - Admin and Officer
router.post("/", authenticateToken, authorizeRoles("Admin", "Officer"), async (req, res) => {
  const { company_name, min_cgpa_required, industry } = req.body;
  if (!company_name) {
    return res.status(400).json({ error: "Company name is required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO companies (company_name, min_cgpa_required, industry) VALUES ($1, $2, $3) RETURNING *",
      [company_name, min_cgpa_required ? parseFloat(min_cgpa_required) : null, industry || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating company:", err);
    res.status(500).json({ error: "Database error creating company profile" });
  }
});

// Update company - Admin and Officer
router.put("/:id", authenticateToken, authorizeRoles("Admin", "Officer"), async (req, res) => {
  const { id } = req.params;
  const { company_name, min_cgpa_required, industry } = req.body;

  if (!company_name) {
    return res.status(400).json({ error: "Company name is required" });
  }

  try {
    const result = await pool.query(
      "UPDATE companies SET company_name = $1, min_cgpa_required = $2, industry = $3 WHERE company_id = $4 RETURNING *",
      [company_name, min_cgpa_required ? parseFloat(min_cgpa_required) : null, industry || null, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Company not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating company:", err);
    res.status(500).json({ error: "Database error updating company profile" });
  }
});

// Delete company - Admin only
router.delete("/:id", authenticateToken, authorizeRoles("Admin"), async (req, res) => {
  const { id } = req.params;
  try {
    // Delete dependent placement drives first (and applications for those drives)
    const drivesRes = await pool.query("SELECT drive_id FROM placement_drives WHERE company_id = $1", [id]);
    const driveIds = drivesRes.rows.map(d => d.drive_id);
    
    if (driveIds.length > 0) {
      await pool.query("DELETE FROM applications WHERE drive_id = ANY($1)", [driveIds]);
      await pool.query("DELETE FROM package_history_log WHERE drive_id = ANY($1)", [driveIds]);
      await pool.query("DELETE FROM placement_drives WHERE company_id = $1", [id]);
    }

    const result = await pool.query("DELETE FROM companies WHERE company_id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Company not found" });
    }
    res.json({ message: "Company profile deleted successfully", company: result.rows[0] });
  } catch (err) {
    console.error("Error deleting company:", err);
    res.status(500).json({ error: "Database error deleting company profile" });
  }
});

module.exports = router;