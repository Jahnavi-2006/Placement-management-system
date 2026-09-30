import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

const Drives = () => {
  const [drives, setDrives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [applications, setApplications] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal / Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentDrive, setCurrentDrive] = useState(null);

  const [formData, setFormData] = useState({
    company_id: "",
    drive_date: "",
    package_lpa: "",
  });

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const studentId = localStorage.getItem("studentid");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchDrivesData = async () => {
    try {
      // Fetch placement drives, companies, and applications concurrently
      const [drivesRes, companiesRes, appsRes] = await Promise.all([
        axios.get("http://localhost:5000/drives", { headers }),
        axios.get("http://localhost:5000/companies", { headers }),
        axios.get("http://localhost:5000/applications", { headers }),
      ]);

      setDrives(drivesRes.data);
      setCompanies(companiesRes.data);
      setApplications(appsRes.data);

      if (companiesRes.data.length > 0) {
        setFormData((prev) => ({ ...prev, company_id: companiesRes.data[0].company_id.toString() }));
      }

      // If user is student, fetch their profile to check eligibility
      if (role === "Student" && studentId) {
        const studentRes = await axios.get(`http://localhost:5000/students/${studentId}`, { headers });
        setStudentProfile(studentRes.data);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch placement drives details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivesData();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/drives",
        {
          company_id: parseInt(formData.company_id),
          drive_date: formData.drive_date,
          package_lpa: parseFloat(formData.package_lpa),
        },
        { headers }
      );
      alert("Placement drive scheduled successfully");
      setShowAddModal(false);
      setFormData({ company_id: companies[0]?.company_id.toString() || "", drive_date: "", package_lpa: "" });
      fetchDrivesData();
    } catch (err) {
      console.error(err);
      alert("Failed to schedule placement drive");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/drives/${currentDrive.drive_id}`,
        {
          company_id: parseInt(formData.company_id),
          drive_date: formData.drive_date,
          package_lpa: parseFloat(formData.package_lpa),
        },
        { headers }
      );
      alert("Placement drive updated successfully! Audit log registered.");
      setShowEditModal(false);
      fetchDrivesData();
    } catch (err) {
      console.error(err);
      alert("Failed to update placement drive");
    }
  };

  const handleDelete = async (driveId) => {
    if (!window.confirm("Are you sure you want to cancel this drive? This will delete all student applications for this drive.")) {
      return;
    }
    try {
      await axios.delete(`http://localhost:5000/drives/${driveId}`, { headers });
      alert("Placement drive cancelled successfully");
      fetchDrivesData();
    } catch (err) {
      console.error(err);
      alert("Failed to cancel placement drive");
    }
  };

  const handleApply = async (driveId) => {
    try {
      await axios.post(
        "http://localhost:5000/applications",
        { drive_id: driveId },
        { headers }
      );
      alert("Applied successfully!");
      fetchDrivesData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Application submission failed.");
    }
  };

  const openAddModal = () => {
    setFormData({
      company_id: companies[0]?.company_id.toString() || "",
      drive_date: "",
      package_lpa: "",
    });
    setShowAddModal(true);
  };

  const openEditModal = (drive) => {
    setCurrentDrive(drive);
    // Format date to YYYY-MM-DD
    const rawDate = drive.drive_date ? new Date(drive.drive_date) : null;
    const formattedDate = rawDate ? rawDate.toISOString().split("T")[0] : "";
    
    setFormData({
      company_id: drive.company_id.toString(),
      drive_date: formattedDate,
      package_lpa: drive.package_lpa.toString(),
    });
    setShowEditModal(true);
  };

  // Helper: check if student already applied for a drive
  const hasApplied = (driveId) => {
    return applications.some(
      (app) => app.drive_id === driveId && String(app.student_id) === String(studentId)
    );
  };

  // Helper: get application status for a drive
  const getApplicationStatus = (driveId) => {
    const app = applications.find(
      (app) => app.drive_id === driveId && String(app.student_id) === String(studentId)
    );
    return app ? app.status : null;
  };

  // Helper: Check student CGPA eligibility
  const checkEligibility = (minCgpa) => {
    if (!studentProfile || !minCgpa) return { eligible: true }; // default to eligible if profile not loaded
    const studentCgpa = parseFloat(studentProfile.cgpa) || 0;
    const requiredCgpa = parseFloat(minCgpa) || 0;
    
    if (studentCgpa < requiredCgpa) {
      return { eligible: false, reason: `CGPA ${studentCgpa} is below required ${requiredCgpa}` };
    }
    return { eligible: true };
  };

  return (
    <Layout>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        {/* HEADER AREA */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0, color: "#1e293b" }}>Scheduled Recruitment Drives</h2>
            <p style={{ margin: "0.25rem 0 0 0", color: "#64748b", fontSize: "0.85rem" }}>
              Explore visiting schedules, packages, and eligibility criteria
            </p>
          </div>
          
          {(role === "Admin" || role === "Officer") && (
            <button
              onClick={openAddModal}
              style={{
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                padding: "0.6rem 1.25rem",
                borderRadius: "8px",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.2)",
              }}
            >
              📅 Schedule Drive
            </button>
          )}
        </div>

        {/* DRIVES GRID VIEW */}
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>Loading scheduled drives...</div>
        ) : drives.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>No placement drives scheduled yet.</div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {drives.map((drive) => {
              const driveDate = drive.drive_date ? new Date(drive.drive_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }) : "TBD";

              // Check eligibility for students
              const applied = role === "Student" ? hasApplied(drive.drive_id) : false;
              const appStatus = role === "Student" ? getApplicationStatus(drive.drive_id) : null;
              
              // Check if student is already placed in another company
              const isStudentPlaced = role === "Student" ? applications.some(
                (app) => String(app.student_id) === String(studentId) && app.status?.toLowerCase() === "placed"
              ) : false;

              let eligibility = role === "Student" ? checkEligibility(drive.min_cgpa_required) : { eligible: true };
              
              if (isStudentPlaced && !applied) {
                eligibility = { eligible: false, reason: "You have already been PLACED in a company and cannot apply for further drives." };
              }

              return (
                <div
                  key={drive.drive_id}
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "1.25rem",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  {/* Top Header Card */}
                  <div style={{ padding: "1.5rem 1.5rem 1rem 1.5rem", backgroundColor: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700 }}>DRIVE #{drive.drive_id}</span>
                      {role === "Student" && (
                        <div>
                          {applied ? (
                            <span
                              style={{
                                backgroundColor: appStatus?.toLowerCase() === "placed" ? "#22c55e" : "#3b82f6",
                                color: "white",
                                padding: "0.2rem 0.6rem",
                                borderRadius: "20px",
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                textTransform: "uppercase",
                              }}
                            >
                              {appStatus}
                            </span>
                          ) : isStudentPlaced ? (
                            <span style={{ backgroundColor: "#fee2e2", color: "#991b1b", padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.7rem", fontWeight: 700 }}>
                              Placed
                            </span>
                          ) : eligibility.eligible ? (
                            <span style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.7rem", fontWeight: 700 }}>
                              Eligible
                            </span>
                          ) : (
                            <span style={{ backgroundColor: "#fee2e2", color: "#991b1b", padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.7rem", fontWeight: 700 }} title={eligibility.reason}>
                              Ineligible
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <h3 style={{ margin: 0, color: "#0f172a", fontSize: "1.2rem", fontWeight: 700 }}>
                      {drive.company_name}
                    </h3>
                    <p style={{ margin: "0.25rem 0 0 0", color: "#64748b", fontSize: "0.8rem" }}>
                      Sector: {drive.industry || "General"}
                    </p>
                  </div>

                  {/* Body Card */}
                  <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                      <span style={{ color: "#64748b" }}>Package Offer:</span>
                      <span style={{ fontWeight: 800, color: "#10b981", fontSize: "0.95rem" }}>{drive.package_lpa} LPA</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                      <span style={{ color: "#64748b" }}>Criteria:</span>
                      <span style={{ fontWeight: 700, color: "#334155" }}>Min CGPA {drive.min_cgpa_required || "None"}</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                      <span style={{ color: "#64748b" }}>Drive Date:</span>
                      <span style={{ fontWeight: 600, color: "#334155" }}>📅 {driveDate}</span>
                    </div>

                    {/* Ineligibility notice for student */}
                    {role === "Student" && !eligibility.eligible && !applied && (
                      <div style={{ color: "#ef4444", fontSize: "0.75rem", fontWeight: 600, marginTop: "0.5rem", backgroundColor: "#fef2f2", padding: "0.5rem", borderRadius: "6px", border: "1px solid #fee2e2" }}>
                        ⚠️ {eligibility.reason}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div style={{ padding: "1rem 1.5rem 1.5rem 1.5rem", borderTop: "1px solid #f1f5f9", display: "flex", gap: "0.5rem" }}>
                    {role === "Student" ? (
                      <button
                        disabled={applied || !eligibility.eligible}
                        onClick={() => handleApply(drive.drive_id)}
                        style={{
                          width: "100%",
                          backgroundColor: applied ? "#94a3b8" : !eligibility.eligible ? "#e2e8f0" : "#3b82f6",
                          color: applied ? "#ffffff" : !eligibility.eligible ? "#94a3b8" : "#ffffff",
                          border: "none",
                          padding: "0.6rem",
                          borderRadius: "8px",
                          fontWeight: 700,
                          cursor: applied || !eligibility.eligible ? "not-allowed" : "pointer",
                          transition: "background-color 0.2s",
                        }}
                      >
                        {applied 
                          ? "Already Applied" 
                          : isStudentPlaced 
                            ? "Locked (Already Placed)" 
                            : !eligibility.eligible 
                              ? "Locked (Ineligible)" 
                              : "Apply Now"
                        }
                      </button>
                    ) : (role === "Admin" || role === "Officer") ? (
                      <>
                        <button
                          onClick={() => openEditModal(drive)}
                          style={{
                            flex: 1,
                            backgroundColor: "#f59e0b",
                            color: "white",
                            border: "none",
                            padding: "0.5rem",
                            borderRadius: "6px",
                            fontWeight: 600,
                            cursor: "pointer",
                            fontSize: "0.8rem",
                          }}
                        >
                          ✏️ Modify Package
                        </button>
                        {role === "Admin" && (
                          <button
                            onClick={() => handleDelete(drive.drive_id)}
                            style={{
                              backgroundColor: "#ef4444",
                              color: "white",
                              border: "none",
                              padding: "0.5rem 0.75rem",
                              borderRadius: "6px",
                              fontWeight: 600,
                              cursor: "pointer",
                              fontSize: "0.8rem",
                            }}
                          >
                            🗑️ Cancel
                          </button>
                        )}
                      </>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ADD DRIVE MODAL */}
        {showAddModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 200,
            }}
          >
            <div style={{ backgroundColor: "#ffffff", padding: "2rem", borderRadius: "1.25rem", width: "400px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
              <h3 style={{ margin: "0 0 1.5rem 0" }}>Schedule Placement Slot</h3>
              
              {companies.length === 0 ? (
                <div>
                  <p style={{ color: "#ef4444" }}>No companies registered. Create a company profile first.</p>
                  <button onClick={() => setShowAddModal(false)} style={{ background: "#cbd5e1", border: "none", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer" }}>Close</button>
                </div>
              ) : (
                <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "#64748b", fontWeight: 600, marginBottom: "0.25rem" }}>SELECT COMPANY</label>
                    <select
                      value={formData.company_id}
                      onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                      style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", height: "38px" }}
                    >
                      {companies.map((company) => (
                        <option key={company.company_id} value={company.company_id}>
                          {company.company_name} (Min CGPA: {company.min_cgpa_required || "None"})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "#64748b", fontWeight: 600, marginBottom: "0.25rem" }}>DRIVE DATE</label>
                    <input
                      type="date"
                      required
                      value={formData.drive_date}
                      onChange={(e) => setFormData({ ...formData, drive_date: e.target.value })}
                      style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "#64748b", fontWeight: 600, marginBottom: "0.25rem" }}>PACKAGE CTC (LPA)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 10.50"
                      required
                      value={formData.package_lpa}
                      onChange={(e) => setFormData({ ...formData, package_lpa: e.target.value })}
                      style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      style={{ background: "#e2e8f0", border: "none", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ background: "#3b82f6", color: "white", border: "none", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}
                    >
                      Schedule Drive
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* EDIT DRIVE MODAL */}
        {showEditModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 200,
            }}
          >
            <div style={{ backgroundColor: "#ffffff", padding: "2rem", borderRadius: "1.25rem", width: "400px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
              <h3 style={{ margin: "0 0 1.5rem 0" }}>Modify Scheduled Drive</h3>
              <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#64748b", fontWeight: 600, marginBottom: "0.25rem" }}>COMPANY</label>
                  <select
                    disabled
                    value={formData.company_id}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", height: "38px", backgroundColor: "#f1f5f9" }}
                  >
                    {companies.map((company) => (
                      <option key={company.company_id} value={company.company_id}>
                        {company.company_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#64748b", fontWeight: 600, marginBottom: "0.25rem" }}>DRIVE DATE</label>
                  <input
                    type="date"
                    required
                    value={formData.drive_date}
                    onChange={(e) => setFormData({ ...formData, drive_date: e.target.value })}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#64748b", fontWeight: 600, marginBottom: "0.25rem" }}>PACKAGE CTC (LPA)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.package_lpa}
                    onChange={(e) => setFormData({ ...formData, package_lpa: e.target.value })}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    style={{ background: "#e2e8f0", border: "none", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ background: "#3b82f6", color: "white", border: "none", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default Drives;