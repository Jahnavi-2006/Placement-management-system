const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

// Get all drives with company details - open to all authenticated users
router.get("/", authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT pd.*, c.company_name, c.min_cgpa_required, c.industry 
      FROM placement_drives pd 
      LEFT JOIN companies c ON pd.company_id = c.company_id 
      ORDER BY pd.drive_date DESC, pd.drive_id DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching drives:", err);
    res.status(500).json({ error: "Database error fetching placement drives" });
  }
});

// Get single drive details
router.get("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT pd.*, c.company_name, c.min_cgpa_required, c.industry 
      FROM placement_drives pd 
      LEFT JOIN companies c ON pd.company_id = c.company_id 
      WHERE pd.drive_id = $1
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Placement drive not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching drive details:", err);
    res.status(500).json({ error: "Database error fetching placement drive details" });
  }
});

// Create drive - Admin and Officer
router.post("/", authenticateToken, authorizeRoles("Admin", "Officer"), async (req, res) => {
  const { company_id, drive_date, package_lpa } = req.body;
  if (!company_id || !drive_date || !package_lpa) {
    return res.status(400).json({ error: "Company, Date, and Package are required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO placement_drives (company_id, drive_date, package_lpa) VALUES ($1, $2, $3) RETURNING *",
      [parseInt(company_id), drive_date, parseFloat(package_lpa)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating drive:", err);
    res.status(500).json({ error: "Database error creating placement drive" });
  }
});

// Update drive - Admin and Officer
// Note: Changing package_lpa will automatically trigger database function 'log_package_update'
// and write a record to 'package_history_log'.
router.put("/:id", authenticateToken, authorizeRoles("Admin", "Officer"), async (req, res) => {
  const { id } = req.params;
  const { company_id, drive_date, package_lpa } = req.body;

  if (!company_id || !drive_date || !package_lpa) {
    return res.status(400).json({ error: "Company, Date, and Package are required" });
  }

  try {
    const result = await pool.query(
      "UPDATE placement_drives SET company_id = $1, drive_date = $2, package_lpa = $3 WHERE drive_id = $4 RETURNING *",
      [parseInt(company_id), drive_date, parseFloat(package_lpa), id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Placement drive not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating drive:", err);
    res.status(500).json({ error: "Database error updating placement drive" });
  }
});

// Delete drive - Admin only
router.delete("/:id", authenticateToken, authorizeRoles("Admin"), async (req, res) => {
  const { id } = req.params;
  try {
    // Delete dependent references
    await pool.query("DELETE FROM applications WHERE drive_id = $1", [id]);
    await pool.query("DELETE FROM package_history_log WHERE drive_id = $1", [id]);

    const result = await pool.query("DELETE FROM placement_drives WHERE drive_id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Placement drive not found" });
    }
    res.json({ message: "Placement drive deleted successfully", drive: result.rows[0] });
  } catch (err) {
    console.error("Error deleting drive:", err);
    res.status(500).json({ error: "Database error deleting placement drive" });
  }
});

module.exports = router;