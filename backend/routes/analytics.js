const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateToken } = require("../middleware/auth");

// Get high-level placement stats
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    // 1. Total registered students
    const totalStudentsRes = await pool.query("SELECT COUNT(*) FROM students");
    const totalStudents = parseInt(totalStudentsRes.rows[0].count);

    // 2. Placed students (applications with status 'Placed')
    const placedStudentsRes = await pool.query(
      "SELECT COUNT(DISTINCT student_id) FROM applications WHERE LOWER(status) = 'placed'"
    );
    const placedStudents = parseInt(placedStudentsRes.rows[0].count);

    // 3. Total companies
    const totalCompaniesRes = await pool.query("SELECT COUNT(*) FROM companies");
    const totalCompanies = parseInt(totalCompaniesRes.rows[0].count);

    // 4. Total drives
    const totalDrivesRes = await pool.query("SELECT COUNT(*) FROM placement_drives");
    const totalDrives = parseInt(totalDrivesRes.rows[0].count);

    // 5. Total applications
    const totalAppsRes = await pool.query("SELECT COUNT(*) FROM applications");
    const totalApps = parseInt(totalAppsRes.rows[0].count);

    // 6. Placement rate
    const placementRate = totalStudents > 0 ? parseFloat(((placedStudents / totalStudents) * 100).toFixed(2)) : 0;

    // 7. Max and Average Package of placed students (fallback to all drives if none placed yet)
    let avgPackage = 0;
    let maxPackage = 0;

    const packageRes = await pool.query(`
      SELECT 
        ROUND(AVG(pd.package_lpa), 2) as avg_p,
        MAX(pd.package_lpa) as max_p
      FROM placement_drives pd
      JOIN applications a ON pd.drive_id = a.drive_id
      WHERE LOWER(a.status) = 'placed'
    `);

    if (packageRes.rows[0] && packageRes.rows[0].max_p) {
      avgPackage = parseFloat(packageRes.rows[0].avg_p) || 0;
      maxPackage = parseFloat(packageRes.rows[0].max_p) || 0;
    } else {
      // Fallback
      const fallbackRes = await pool.query(
        "SELECT ROUND(AVG(package_lpa), 2) as avg_p, MAX(package_lpa) as max_p FROM placement_drives"
      );
      avgPackage = parseFloat(fallbackRes.rows[0].avg_p) || 0;
      maxPackage = parseFloat(fallbackRes.rows[0].max_p) || 0;
    }

    res.json({
      totalStudents,
      placedStudents,
      unplacedStudents: totalStudents - placedStudents,
      totalCompanies,
      totalDrives,
      totalApps,
      placementRate,
      avgPackage,
      maxPackage,
    });
  } catch (err) {
    console.error("Error generating analytics stats:", err);
    res.status(500).json({ error: "Database error compiling statistics" });
  }
});

// Get data aggregates for frontend SVG Charts
router.get("/charts", authenticateToken, async (req, res) => {
  try {
    // 1. Department-wise Placements
    const deptPlacementsQuery = `
      SELECT 
        d.dept_name, 
        COUNT(DISTINCT a.student_id) FILTER (WHERE LOWER(a.status) = 'placed') as placed_count,
        COUNT(DISTINCT s.student_id) as total_students
      FROM departments d
      LEFT JOIN students s ON d.dept_id = s.dept_id
      LEFT JOIN applications a ON s.student_id = a.student_id
      GROUP BY d.dept_name
      ORDER BY d.dept_name;
    `;
    const deptRes = await pool.query(deptPlacementsQuery);

    // 2. Application status distribution
    const statusQuery = `
      SELECT 
        COALESCE(status, 'Applied') as status_label, 
        COUNT(*) as count 
      FROM applications 
      GROUP BY COALESCE(status, 'Applied')
      ORDER BY count DESC;
    `;
    const statusRes = await pool.query(statusQuery);

    // 3. Top Hiring Companies
    const companyQuery = `
      SELECT 
        c.company_name, 
        COUNT(DISTINCT a.student_id) as count 
      FROM companies c
      JOIN placement_drives pd ON c.company_id = pd.company_id
      JOIN applications a ON pd.drive_id = a.drive_id
      WHERE LOWER(a.status) = 'placed'
      GROUP BY c.company_name
      ORDER BY count DESC
      LIMIT 6;
    `;
    const companyRes = await pool.query(companyQuery);

    // 4. Package distribution (salary ranges vs placed count)
    const packageQuery = `
      SELECT 
        CASE 
          WHEN pd.package_lpa < 6 THEN 'Under 6 LPA'
          WHEN pd.package_lpa >= 6 AND pd.package_lpa < 10 THEN '6 - 10 LPA'
          WHEN pd.package_lpa >= 10 AND pd.package_lpa < 15 THEN '10 - 15 LPA'
          ELSE '15 LPA & Above'
        END as range,
        COUNT(DISTINCT a.student_id) as count
      FROM placement_drives pd
      JOIN applications a ON pd.drive_id = a.drive_id
      WHERE LOWER(a.status) = 'placed'
      GROUP BY 
        CASE 
          WHEN pd.package_lpa < 6 THEN 'Under 6 LPA'
          WHEN pd.package_lpa >= 6 AND pd.package_lpa < 10 THEN '6 - 10 LPA'
          WHEN pd.package_lpa >= 10 AND pd.package_lpa < 15 THEN '10 - 15 LPA'
          ELSE '15 LPA & Above'
        END;
    `;
    const packageRes = await pool.query(packageQuery);

    // Sort the package ranges in JavaScript to ensure cross-database compatibility
    const rangeOrder = {
      "Under 6 LPA": 1,
      "6 - 10 LPA": 2,
      "10 - 15 LPA": 3,
      "15 LPA & Above": 4,
    };
    
    const sortedPackages = packageRes.rows.sort((a, b) => {
      return (rangeOrder[a.range] || 5) - (rangeOrder[b.range] || 5);
    });

    res.json({
      departments: deptRes.rows.map(row => ({
        name: row.dept_name,
        placed: parseInt(row.placed_count),
        total: parseInt(row.total_students),
      })),
      applicationStatuses: statusRes.rows.map(row => ({
        label: row.status_label,
        value: parseInt(row.count),
      })),
      topCompanies: companyRes.rows.map(row => ({
        company: row.company_name,
        count: parseInt(row.count),
      })),
      packages: sortedPackages.map(row => ({
        range: row.range,
        count: parseInt(row.count),
      })),
    });
  } catch (err) {
    console.error("Error generating charts data:", err);
    res.status(500).json({ error: "Database error compiling charts statistics" });
  }
});

module.exports = router;
