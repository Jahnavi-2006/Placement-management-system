import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchApplications = async () => {
    try {
      const res = await axios.get("http://localhost:5000/applications", { headers });
      setApplications(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch applications logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      // API call to update status
      await axios.put(
        `http://localhost:5000/applications/${appId}`,
        { status: newStatus },
        { headers }
      );
      
      alert(`Application status updated to '${newStatus}'`);
      fetchApplications(); // refresh to show updated values and cascade rejections if any
    } catch (err) {
      console.error(err);
      alert("Failed to update application status");
    }
  };

  const handleDelete = async (appId) => {
    if (!window.confirm("Are you sure you want to delete this application record?")) {
      return;
    }
    try {
      await axios.delete(`http://localhost:5000/applications/${appId}`, { headers });
      alert("Application record removed");
      fetchApplications();
    } catch (err) {
      console.error(err);
      alert("Failed to delete application");
    }
  };

  const getStatusBadgeStyle = (status) => {
    const s = status ? status.toLowerCase() : "";
    let bgColor = "#f1f5f9";
    let textColor = "#475569";

    if (s === "placed") {
      bgColor = "#dcfce7";
      textColor = "#15803d";
    } else if (s === "rejected") {
      bgColor = "#fee2e2";
      textColor = "#b91c1c";
    } else if (s === "interviewing") {
      bgColor = "#dbeafe";
      textColor = "#1d4ed8";
    } else if (s === "shortlisted") {
      bgColor = "#f3e8ff";
      textColor = "#7e22ce";
    } else if (s === "applied" || s === "pending") {
      bgColor = "#fef3c7";
      textColor = "#b45309";
    }

    return {
      backgroundColor: bgColor,
      color: textColor,
      padding: "0.3rem 0.75rem",
      borderRadius: "20px",
      fontSize: "0.8rem",
      fontWeight: 700,
      textTransform: "uppercase",
      display: "inline-block",
    };
  };

  return (
    <Layout>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        {/* HEADER */}
        <div>
          <h2 style={{ margin: 0, color: "#1e293b" }}>
            {role === "Student" ? "My Applied Positions" : "Candidates Applications Log"}
          </h2>
          <p style={{ margin: "0.25rem 0 0 0", color: "#64748b", fontSize: "0.85rem" }}>
            {role === "Student"
              ? "Track your recruitment process progress in real-time"
              : "Review, shortlist, interview, or hire applicant candidates"}
          </p>
        </div>

        {/* LOG DATA TABLE */}
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
            <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>Loading application logs...</div>
          ) : applications.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
              {role === "Student"
                ? "You haven't applied for any placement drives yet."
                : "No applications have been logged in the system yet."}
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontWeight: 700 }}>
                  <th style={{ padding: "1rem 1.5rem" }}>App ID</th>
                  {role !== "Student" && <th style={{ padding: "1rem 1.5rem" }}>Student</th>}
                  {role !== "Student" && <th style={{ padding: "1rem 1.5rem" }}>CGPA</th>}
                  <th style={{ padding: "1rem 1.5rem" }}>Company</th>
                  <th style={{ padding: "1rem 1.5rem" }}>Offer CTC</th>
                  <th style={{ padding: "1rem 1.5rem" }}>Schedule Date</th>
                  <th style={{ padding: "1rem 1.5rem" }}>Status</th>
                  {(role === "Admin" || role === "Officer") && (
                    <th style={{ padding: "1rem 1.5rem", textAlign: "center" }}>Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => {
                  const dateStr = app.drive_date
                    ? new Date(app.drive_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                    : "-";
                  
                  return (
                    <tr key={app.app_id} style={{ borderBottom: "1px solid #f1f5f9", color: "#334155" }}>
                      <td style={{ padding: "1rem 1.5rem", fontWeight: "bold" }}>{app.app_id}</td>
                      {role !== "Student" && (
                        <td style={{ padding: "1rem 1.5rem" }}>
                          <div style={{ fontWeight: 600 }}>{app.student_name}</div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{app.student_email}</div>
                          <span style={{ fontSize: "0.7rem", backgroundColor: "#f1f5f9", padding: "0.1rem 0.3rem", borderRadius: "4px" }}>
                            {app.dept_name}
                          </span>
                        </td>
                      )}
                      {role !== "Student" && (
                        <td style={{ padding: "1rem 1.5rem", fontWeight: 700 }}>{app.cgpa}</td>
                      )}
                      <td style={{ padding: "1rem 1.5rem", fontWeight: 600 }}>{app.company_name}</td>
                      <td style={{ padding: "1rem 1.5rem", fontWeight: 700, color: "#10b981" }}>{app.package_lpa} LPA</td>
                      <td style={{ padding: "1rem 1.5rem" }}>{dateStr}</td>
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <span style={getStatusBadgeStyle(app.status)}>{app.status}</span>
                      </td>
                      
                      {(role === "Admin" || role === "Officer") && (
                        <td style={{ padding: "1rem 1.5rem", display: "flex", gap: "0.5rem", justifyContent: "center", alignItems: "center" }}>
                          {/* Status update selector */}
                          <select
                            value={app.status || "Applied"}
                            onChange={(e) => handleStatusChange(app.app_id, e.target.value)}
                            style={{
                              padding: "0.35rem 0.5rem",
                              borderRadius: "6px",
                              border: "1px solid #cbd5e1",
                              outline: "none",
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            <option value="Applied">Applied</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Interviewing">Interviewing</option>
                            <option value="Placed">Placed</option>
                            <option value="Rejected">Rejected</option>
                          </select>

                          {role === "Admin" && (
                            <button
                              onClick={() => handleDelete(app.app_id)}
                              style={{
                                backgroundColor: "#ef4444",
                                color: "white",
                                border: "none",
                                padding: "0.35rem 0.6rem",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "0.8rem",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              title="Delete application"
                            >
                              🗑️
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </Layout>
  );
};

export default Applications;