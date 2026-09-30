import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Home = () => {
  const navigate = useNavigate();
  const [placedStudents, setPlacedStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const isLoggedIn = !!localStorage.getItem("token");
  const username = localStorage.getItem("username") || "";

  useEffect(() => {
    // Fetch placed students list dynamically
    axios
      .get("http://localhost:5000/students/placed")
      .then((res) => {
        setPlacedStudents(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching placed students:", err);
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("studentid");
    navigate("/login");
  };

  return (
    <div className="w-full" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      
      {/* 1. Navbar Layer */}
      <nav className="nav-container">
        <div className="nav-logo">
          PLACEMENT<span style={{ color: "#3b82f6" }}>PRO</span>
        </div>
        <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <Link to="/" className="tab-btn active" style={{ textDecoration: "none" }}>
            Home
          </Link>
          
          <Link to={isLoggedIn ? "/students" : "/login"} className="tab-btn" style={{ textDecoration: "none" }}>
            Students
          </Link>
          
          <Link to={isLoggedIn ? "/companies" : "/login"} className="tab-btn" style={{ textDecoration: "none" }}>
            Companies
          </Link>
          
          <Link to={isLoggedIn ? "/drives" : "/login"} className="tab-btn" style={{ textDecoration: "none" }}>
            Drives
          </Link>
          
          <Link to={isLoggedIn ? "/applications" : "/login"} className="tab-btn" style={{ textDecoration: "none" }}>
            Applications
          </Link>

          {isLoggedIn ? (
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <Link
                to="/dashboard"
                style={{
                  background: "#3b82f6",
                  color: "#ffffff",
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  textDecoration: "none",
                }}
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  background: "none",
                  border: "none",
                  color: "#f87171",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  cursor: "pointer",
                }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              style={{
                background: "#3b82f6",
                color: "#ffffff",
                padding: "0.5rem 1.25rem",
                borderRadius: "6px",
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                textDecoration: "none",
              }}
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>

      {/* 2. Hero Header Container - Title Perfectly Visible in Middle over Blurred Image */}
      <div className="hero-container">
        <img
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1470"
          className="hero-bg-img"
          alt="Placement Portal"
        />
        <div className="hero-overlay"></div>

        <div className="hero-content">
          <p className="hero-subtitle">University Recruitment Portal</p>
          <h1 className="hero-title">
            PLACEMENT<br />ANALYSIS SYSTEM
          </h1>
          {isLoggedIn ? (
            <div style={{ marginTop: "2rem" }}>
              <Link
                to="/dashboard"
                style={{
                  background: "#2563eb",
                  color: "#ffffff",
                  padding: "0.85rem 2rem",
                  borderRadius: "30px",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  textDecoration: "none",
                  boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.4)",
                  display: "inline-block",
                  transition: "background-color 0.2s",
                }}
              >
                Go to Dashboard ({username})
              </Link>
            </div>
          ) : (
            <div style={{ marginTop: "2rem" }}>
              <Link
                to="/login"
                style={{
                  background: "#2563eb",
                  color: "#ffffff",
                  padding: "0.85rem 2rem",
                  borderRadius: "30px",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  textDecoration: "none",
                  boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.4)",
                  display: "inline-block",
                  transition: "background-color 0.2s",
                }}
              >
                Access Portal Login
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 3. Details and Dynamic Placed Wall */}
      <div className="details-section">
        
        {/* Main description box */}
        <div className="details-box" style={{ marginBottom: "3rem" }}>
          <h2 className="section-title">Campus Recruitment Portal Overview</h2>
          <p style={{ color: "#64748b", lineHeight: "1.7", fontSize: "1.05rem" }}>
            Welcome to the central information portal. This interface aggregates structural evaluation data, tracking candidate performance indexes and scheduling loops. If you are a student, placement officer, or administrator, please sign in to access your customized dashboard, manage eligibility records, run drive schedules, or submit applications.
          </p>
        </div>

        {/* Dynamic Placed Students Wall of Fame Section */}
        <div className="details-box" style={{ borderLeft: "4px solid #22c55e" }}>
          <h2 className="section-title">🏆 Recruited Students Wall of Fame</h2>
          <p style={{ color: "#64748b", lineHeight: "1.6", marginBottom: "2rem" }}>
            Celebrating our top achievers! Below are the students who have secured job offers during this academic recruitment season.
          </p>

          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "#64748b", fontWeight: 600 }}>
              Loading Wall of Fame...
            </div>
          ) : placedStudents.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem 1rem",
                background: "#f8fafc",
                borderRadius: "12px",
                color: "#64748b",
              }}
            >
              No placements have been officially logged yet for this season.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {placedStudents.map((student) => (
                <div
                  key={student.student_id}
                  style={{
                    background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                    padding: "1.5rem",
                    borderRadius: "1rem",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Decorative badge */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      backgroundColor: "#22c55e",
                      color: "#ffffff",
                      fontSize: "0.65rem",
                      fontWeight: 800,
                      padding: "0.25rem 0.75rem",
                      borderBottomLeftRadius: "8px",
                      textTransform: "uppercase",
                    }}
                  >
                    Placed
                  </div>

                  <h3 style={{ margin: "0 0 0.5rem 0", color: "#1e293b", fontSize: "1.1rem" }}>{student.name}</h3>
                  <div style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600, marginBottom: "1rem" }}>
                    🎓 {student.dept_name} Dept | CGPA: {student.cgpa}
                  </div>

                  <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "0.75rem" }}>
                    <div style={{ fontSize: "0.85rem", color: "#475569" }}>
                      Hired by: <b style={{ color: "#0f172a" }}>{student.company_name}</b>
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#475569", marginTop: "0.25rem" }}>
                      Salary Package: <b style={{ color: "#10b981" }}>{student.package_lpa} LPA</b>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 5. Clean Integrated Contact Cards */}
        <div className="contact-footer">
          <div>
            <h3 style={{ margin: "0 0 1rem 0", color: "#fb923c", fontSize: "1.25rem" }}>Get In Touch</h3>
            <p style={{ color: "#94a3b8", fontSize: "0.875rem", lineHeight: "1.5", margin: 0 }}>
              Have inquiries about specific eligibility criteria thresholds, active company schedules, or analytical backlog metrics? Reach our administration workspace directly.
            </p>
          </div>
          <div style={{ fontSize: "0.875rem", color: "#cbd5e1", display: "flex", flexDirection: "column", gap: "0.5rem", justifyContent: "center" }}>
            <div>📍 <b>Address:</b> Dr.AIT, Kengeri ring road, Bangalore, Karnataka 560072</div>
            <div>📞 <b>Mobile Number:</b> 944XXXXXXX</div>
            <div>✉️ <b>Email:</b> placementcontact@gmail.com</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;