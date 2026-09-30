import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");

  // Form / Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);

  // Input states for Add/Edit
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cgpa: "",
    dept_id: "1",
  });

  // Input states for Placement Action
  const [placementDriveId, setPlacementDriveId] = useState("");

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const depts = {
    1: "CSE",
    2: "ISE",
    3: "ECE",
    4: "EEE",
    5: "Mech",
    6: "Civil",
    7: "Telegraph",
    8: "Chemical",
    9: "BioTech",
    10: "Automobile",
  };

  const headers = { Authorization: `Bearer ${token}` };

  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/students", { headers });
      setStudents(res.data);
      
      // Also fetch drives to populate "Mark Placed" drive options
      const drivesRes = await axios.get("http://localhost:5000/drives", { headers });
      setDrives(drivesRes.data);
      if (drivesRes.data.length > 0) {
        setPlacementDriveId(drivesRes.data[0].drive_id.toString());
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch students data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/students",
        {
          name: formData.name,
          email: formData.email,
          cgpa: parseFloat(formData.cgpa),
          dept_id: parseInt(formData.dept_id),
        },
        { headers }
      );
      alert("Student added successfully");
      setShowAddModal(false);
      setFormData({ name: "", email: "", cgpa: "", dept_id: "1" });
      fetchStudents();
    } catch (err) {
      console.error(err);
      alert("Failed to add student");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/students/${currentStudent.student_id}`,
        {
          name: formData.name,
          email: formData.email,
          cgpa: parseFloat(formData.cgpa),
          dept_id: parseInt(formData.dept_id),
        },
        { headers }
      );
      alert("Student profile updated successfully");
      setShowEditModal(false);
      fetchStudents();
    } catch (err) {
      console.error(err);
      alert("Failed to update student profile");
    }
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this student record? This will also delete their login account and all applications.")) {
      return;
    }
    try {
      await axios.delete(`http://localhost:5000/students/${studentId}`, { headers });
      alert("Student deleted successfully");
      fetchStudents();
    } catch (err) {
      console.error(err);
      alert("Failed to delete student record");
    }
  };

  const handlePlacementSubmit = async (e) => {
    e.preventDefault();
    if (!placementDriveId) {
      alert("Please select an active recruitment drive");
      return;
    }

    try {
      // Mark student as placed by inserting or updating their application status to 'Placed'
      // We send a POST to /applications. To bypass duplicate checker or trigger, we can handle it
      // via a direct status update if application exists, or insert if not.
      // Let's check: POST /applications handles insert and checks duplicate. If student already applied,
      // we get error "You have already applied". In that case, we should find that application ID and update its status to 'Placed'!
      // So, let's look up if this student already has an application for this drive.
      
      const appsRes = await axios.get("http://localhost:5000/applications", { headers });
      const existingApp = appsRes.data.find(
        (a) => a.student_id === currentStudent.student_id && a.drive_id === parseInt(placementDriveId)
      );

      if (existingApp) {
        // Update status to Placed
        await axios.put(
          `http://localhost:5000/applications/${existingApp.app_id}`,
          { status: "Placed" },
          { headers }
        );
      } else {
        // Create new application with status 'Placed'
        // Wait, the POST /applications inserts status = 'Applied' by default, and runs the eligibility check trigger.
        // If we want to mark them as placed, we can insert, then update their status to Placed!
        const newApp = await axios.post(
          "http://localhost:5000/applications",
          { student_id: currentStudent.student_id, drive_id: parseInt(placementDriveId) },
          { headers }
        );
        
        await axios.put(
          `http://localhost:5000/applications/${newApp.data.app_id}`,
          { status: "Placed" },
          { headers }
        );
      }

      alert(`Successfully marked ${currentStudent.name} as PLACED!`);
      setShowPlaceModal(false);
      fetchStudents();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to mark student as placed. Confirm CGPA eligibility.");
    }
  };

  const openAddModal = () => {
    setFormData({ name: "", email: "", cgpa: "", dept_id: "1" });
    setShowAddModal(true);
  };

  const openEditModal = (student) => {
    setCurrentStudent(student);
    setFormData({
      name: student.name,
      email: student.email || "",
      cgpa: student.cgpa ? student.cgpa.toString() : "",
      dept_id: student.dept_id ? student.dept_id.toString() : "1",
    });
    setShowEditModal(true);
  };

  const openPlaceModal = (student) => {
    setCurrentStudent(student);
    setShowPlaceModal(true);
  };

  // Filter students based on search term and department
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      student.student_id.toString().includes(searchTerm);

    const matchesDept = selectedDept === "All" || student.dept_name === selectedDept;

    return matchesSearch && matchesDept;
  });

  return (
    <Layout>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        {/* HEADER CONTROLS */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          
          {/* Filters */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", flex: 1 }}>
            <input
              type="text"
              placeholder="🔍 Search name, email, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: "0.6rem 1rem",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                minWidth: "240px",
                outline: "none",
              }}
            />
            
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              style={{
                padding: "0.6rem 1rem",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                outline: "none",
                backgroundColor: "#ffffff",
              }}
            >
              <option value="All">All Departments</option>
              {Object.values(depts).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Actions */}
          {role === "Admin" && (
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
              ➕ Add Student
            </button>
          )}
        </div>

        {/* DATA TABLE */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "1rem",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
            border: "1px solid #e2e8f0",
            overflowX: "auto",
          }}
        >
          {loading ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>Loading students list...</div>
          ) : filteredStudents.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>No students match criteria.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontWeight: 700 }}>
                  <th style={{ padding: "1rem 1.5rem" }}>ID</th>
                  <th style={{ padding: "1rem 1.5rem" }}>Name</th>
                  <th style={{ padding: "1rem 1.5rem" }}>Email</th>
                  <th style={{ padding: "1rem 1.5rem" }}>Department</th>
                  <th style={{ padding: "1rem 1.5rem" }}>CGPA</th>
                  {(role === "Admin" || role === "Officer") && (
                    <th style={{ padding: "1rem 1.5rem", textAlign: "center" }}>Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.student_id} style={{ borderBottom: "1px solid #f1f5f9", color: "#334155" }}>
                    <td style={{ padding: "1rem 1.5rem", fontWeight: "bold" }}>{student.student_id}</td>
                    <td style={{ padding: "1rem 1.5rem", fontWeight: 600 }}>{student.name}</td>
                    <td style={{ padding: "1rem 1.5rem" }}>{student.email || "-"}</td>
                    <td style={{ padding: "1rem 1.5rem" }}>
                      <span
                        style={{
                          backgroundColor: "#f1f5f9",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          fontWeight: 500,
                          fontSize: "0.8rem",
                        }}
                      >
                        {student.dept_name || depts[student.dept_id] || "Other"}
                      </span>
                    </td>
                    <td style={{ padding: "1rem 1.5rem", fontWeight: "bold", color: parseFloat(student.cgpa) >= 8 ? "#10b981" : "#475569" }}>
                      {student.cgpa}
                    </td>
                    {(role === "Admin" || role === "Officer") && (
                      <td style={{ padding: "1rem 1.5rem", display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                        {role === "Admin" && (
                          <>
                            <button
                              onClick={() => openPlaceModal(student)}
                              style={{
                                backgroundColor: "#10b981",
                                color: "white",
                                border: "none",
                                padding: "0.35rem 0.75rem",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "0.8rem",
                                fontWeight: 600,
                              }}
                            >
                              🏆 Mark Placed
                            </button>
                            <button
                              onClick={() => openEditModal(student)}
                              style={{
                                backgroundColor: "#f59e0b",
                                color: "white",
                                border: "none",
                                padding: "0.35rem 0.75rem",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "0.8rem",
                                fontWeight: 600,
                              }}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDelete(student.student_id)}
                              style={{
                                backgroundColor: "#ef4444",
                                color: "white",
                                border: "none",
                                padding: "0.35rem 0.75rem",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "0.8rem",
                                fontWeight: 600,
                              }}
                            >
                              🗑️ Delete
                            </button>
                          </>
                        )}
                        {role === "Officer" && (
                          <span style={{ color: "#64748b", fontSize: "0.8rem" }}>ReadOnly (Admin Only)</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ADD STUDENT MODAL */}
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
              <h3 style={{ margin: "0 0 1.5rem 0" }}>Create Student Profile</h3>
              <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#64748b", fontWeight: 600, marginBottom: "0.25rem" }}>NAME</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
                
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#64748b", fontWeight: 600, marginBottom: "0.25rem" }}>EMAIL</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "#64748b", fontWeight: 600, marginBottom: "0.25rem" }}>CGPA</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.cgpa}
                      onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                      style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "#64748b", fontWeight: 600, marginBottom: "0.25rem" }}>DEPARTMENT</label>
                    <select
                      value={formData.dept_id}
                      onChange={(e) => setFormData({ ...formData, dept_id: e.target.value })}
                      style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", height: "38px" }}
                    >
                      {Object.entries(depts).map(([id, name]) => (
                        <option key={id} value={id}>{name}</option>
                      ))}
                    </select>
                  </div>
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
                    Add Student
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT STUDENT MODAL */}
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
              <h3 style={{ margin: "0 0 1.5rem 0" }}>Edit Student Profile</h3>
              <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#64748b", fontWeight: 600, marginBottom: "0.25rem" }}>NAME</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
                
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#64748b", fontWeight: 600, marginBottom: "0.25rem" }}>EMAIL</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "#64748b", fontWeight: 600, marginBottom: "0.25rem" }}>CGPA</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.cgpa}
                      onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                      style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "#64748b", fontWeight: 600, marginBottom: "0.25rem" }}>DEPARTMENT</label>
                    <select
                      value={formData.dept_id}
                      onChange={(e) => setFormData({ ...formData, dept_id: e.target.value })}
                      style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", height: "38px" }}
                    >
                      {Object.entries(depts).map(([id, name]) => (
                        <option key={id} value={id}>{name}</option>
                      ))}
                    </select>
                  </div>
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

        {/* MARK PLACED MODAL */}
        {showPlaceModal && (
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
              <h3 style={{ margin: "0 0 0.5rem 0" }}>🏆 Record Placement Offer</h3>
              <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1.5rem" }}>
                Select the recruitment drive in which <b>{currentStudent?.name}</b> was selected.
              </p>
              
              <form onSubmit={handlePlacementSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#64748b", fontWeight: 600, marginBottom: "0.25rem" }}>SELECT PLACEMENT DRIVE</label>
                  <select
                    value={placementDriveId}
                    onChange={(e) => setPlacementDriveId(e.target.value)}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", height: "38px" }}
                  >
                    {drives.map((drive) => (
                      <option key={drive.drive_id} value={drive.drive_id}>
                        Drive #{drive.drive_id} - {drive.company_name} ({drive.package_lpa} LPA)
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                  <button
                    type="button"
                    onClick={() => setShowPlaceModal(false)}
                    style={{ background: "#e2e8f0", border: "none", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ background: "#10b981", color: "white", border: "none", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}
                  >
                    Record Placement
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

export default Students;