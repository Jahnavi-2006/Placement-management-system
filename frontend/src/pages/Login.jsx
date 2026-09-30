import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [selectedRole, setSelectedRole] = useState("Student"); // Student, Officer, Admin

  // Form states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [deptId, setDeptId] = useState("1"); // Default CSE
  const [cgpa, setCgpa] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/auth/login", {
        username,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("username", res.data.username);
      if (res.data.studentid) {
        localStorage.setItem("studentid", res.data.studentid);
      }

      // Check if logged in role matches chosen role (for guidance, but accept whatever role user has in DB)
      if (res.data.role !== selectedRole && !(res.data.role === "Officer" && selectedRole === "Placement Officer")) {
        // Just warning, but let them login anyway
        console.log("Logged in with role:", res.data.role);
      }

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Login failed. Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !password || !email) {
      setError("Username, password, and email are required");
      return;
    }
    setError("");
    setLoading(true);

    try {
      await axios.post("http://localhost:5000/auth/register", {
        username,
        password,
        email,
        name,
        dept_id: deptId,
        cgpa: cgpa ? parseFloat(cgpa) : 7.0,
      });

      alert("Registration successful! You can now log in.");
      setIsRegister(false);
      setUsername("");
      setPassword("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        padding: "1rem",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%", maxWidth: "450px" }}>
        
        {/* Logo and title */}
        <div style={{ textAlign: "center", color: "#ffffff" }}>
          <h2 style={{ margin: 0, fontSize: "2rem", fontWeight: 800 }}>
            PLACEMENT<span style={{ color: "#3b82f6" }}>PRO</span>
          </h2>
          <p style={{ margin: "0.5rem 0 0 0", color: "#94a3b8", fontSize: "0.9rem" }}>
            Campus Recruitment Portal & Analytics
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            backgroundColor: "rgba(30, 41, 59, 0.7)",
            backdropFilter: "blur(12px)",
            borderRadius: "1.5rem",
            padding: "2.5rem",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            color: "#ffffff",
          }}
        >
          {/* Header tabs */}
          {!isRegister && (
            <div
              style={{
                display: "flex",
                backgroundColor: "rgba(15, 23, 42, 0.5)",
                padding: "0.25rem",
                borderRadius: "0.75rem",
                marginBottom: "2rem",
              }}
            >
              {["Student", "Officer", "Admin"].map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  style={{
                    flex: 1,
                    padding: "0.5rem 0.25rem",
                    border: "none",
                    borderRadius: "0.5rem",
                    backgroundColor: selectedRole === role ? "#3b82f6" : "transparent",
                    color: selectedRole === role ? "#ffffff" : "#94a3b8",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {role === "Officer" ? "Officer" : role}
                </button>
              ))}
            </div>
          )}

          <h3 style={{ marginTop: 0, marginBottom: "1.5rem", fontSize: "1.25rem", fontWeight: 700 }}>
            {isRegister ? "Student Registration" : `${selectedRole} Login`}
          </h3>

          {error && (
            <div
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#f87171",
                padding: "0.75rem 1rem",
                borderRadius: "0.75rem",
                marginBottom: "1.5rem",
                fontSize: "0.85rem",
                lineHeight: 1.4,
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {isRegister ? (
            /* Student registration form */
            <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600, marginBottom: "0.5rem" }}>USERNAME</label>
                <input
                  type="text"
                  placeholder="e.g. s_rahul"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "0.75rem",
                    backgroundColor: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#ffffff",
                    fontSize: "0.9rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600, marginBottom: "0.5rem" }}>PASSWORD</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "0.75rem",
                    backgroundColor: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#ffffff",
                    fontSize: "0.9rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600, marginBottom: "0.5rem" }}>EMAIL ADDRESS</label>
                <input
                  type="email"
                  placeholder="rahul@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "0.75rem",
                    backgroundColor: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#ffffff",
                    fontSize: "0.9rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600, marginBottom: "0.5rem" }}>FULL NAME (Optional)</label>
                <input
                  type="text"
                  placeholder="Rahul Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "0.75rem",
                    backgroundColor: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#ffffff",
                    fontSize: "0.9rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600, marginBottom: "0.5rem" }}>DEPT ID (Optional)</label>
                  <select
                    value={deptId}
                    onChange={(e) => setDeptId(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      borderRadius: "0.75rem",
                      backgroundColor: "#0f172a",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "#ffffff",
                      fontSize: "0.9rem",
                      outline: "none",
                      boxSizing: "border-box",
                      height: "42px",
                    }}
                  >
                    <option value="1">1 - CSE</option>
                    <option value="2">2 - ISE</option>
                    <option value="3">3 - ECE</option>
                    <option value="4">4 - EEE</option>
                    <option value="5">5 - Mech</option>
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600, marginBottom: "0.5rem" }}>CGPA (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 8.2"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      borderRadius: "0.75rem",
                      backgroundColor: "rgba(15, 23, 42, 0.6)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "#ffffff",
                      fontSize: "0.9rem",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "0.75rem",
                  backgroundColor: "#3b82f6",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: 650,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  marginTop: "0.5rem",
                  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                  transition: "background-color 0.2s",
                }}
              >
                {loading ? "Registering..." : "Create Account"}
              </button>

              <div style={{ textAlign: "center", marginTop: "0.5rem", fontSize: "0.85rem", color: "#94a3b8" }}>
                Already registered?{" "}
                <span
                  onClick={() => setIsRegister(false)}
                  style={{ color: "#3b82f6", cursor: "pointer", fontWeight: 600 }}
                >
                  Log In
                </span>
              </div>
            </form>
          ) : (
            /* Login Form */
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600, marginBottom: "0.5rem" }}>USERNAME</label>
                <input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "0.75rem",
                    backgroundColor: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#ffffff",
                    fontSize: "0.9rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600, marginBottom: "0.5rem" }}>PASSWORD</label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "0.75rem",
                    backgroundColor: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#ffffff",
                    fontSize: "0.9rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "0.75rem",
                  backgroundColor: "#3b82f6",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: 650,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  marginTop: "0.5rem",
                  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                  transition: "background-color 0.2s",
                }}
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>

              {selectedRole === "Student" && (
                <div style={{ textAlign: "center", marginTop: "0.5rem", fontSize: "0.85rem", color: "#94a3b8" }}>
                  New student?{" "}
                  <span
                    onClick={() => setIsRegister(true)}
                    style={{ color: "#3b82f6", cursor: "pointer", fontWeight: 600 }}
                  >
                    Register here
                  </span>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Credentials Box */}
        <div
          style={{
            backgroundColor: "rgba(30, 41, 59, 0.4)",
            borderRadius: "1rem",
            padding: "1rem 1.5rem",
            fontSize: "0.8rem",
            color: "#94a3b8",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            lineHeight: 1.5,
          }}
        >
          <div style={{ fontWeight: "bold", color: "#e2e8f0", marginBottom: "0.5rem" }}>💡 Testing Credentials:</div>
          <div>• <b>Admin:</b> admin / admin123</div>
          <div>• <b>Officer:</b> officer / officer123</div>
          <div>• <b>Student:</b> student1 / student123 (or student2 / student223)</div>
        </div>

      </div>
    </div>
  );
}

export default Login;