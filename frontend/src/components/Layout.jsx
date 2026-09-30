import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = localStorage.getItem("role") || "Guest";
  const username = localStorage.getItem("username") || "User";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("studentid");
    navigate("/login");
  };

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: "📊" },
    { label: "Students", path: "/students", icon: "🎓" },
    { label: "Companies", path: "/companies", icon: "🏢" },
    { label: "Drives", path: "/drives", icon: "📅" },
    { label: "Applications", path: "/applications", icon: "📝" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* 1. Sidebar for Desktop */}
      <aside
        className={`sidebar ${mobileOpen ? "open" : ""}`}
        style={{
          width: "260px",
          backgroundColor: "#1e293b",
          color: "#ffffff",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 100,
          transition: "transform 0.3s ease",
          boxShadow: "4px 0 25px rgba(0, 0, 0, 0.15)",
        }}
      >
        {/* Sidebar Header */}
        <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.05em" }}>
            PLACEMENT<span style={{ color: "#3b82f6" }}>PRO</span>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="mobile-close-btn"
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              fontSize: "1.5rem",
              cursor: "pointer",
              display: "none",
            }}
          >
            &times;
          </button>
        </div>

        {/* Profile Info */}
        <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid #334155" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.2rem" }}>
              {username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.95rem", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "140px" }}>{username}</div>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", backgroundColor: "#334155", padding: "0.15rem 0.5rem", borderRadius: "4px", display: "inline-block", marginTop: "0.25rem" }}>
                {role}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ flex: 1, padding: "1.5rem 1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  color: isActive ? "#ffffff" : "#94a3b8",
                  backgroundColor: isActive ? "#3b82f6" : "transparent",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  transition: "all 0.2s ease",
                }}
                className={isActive ? "" : "sidebar-link-hover"}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div style={{ padding: "1.5rem 1rem", borderTop: "1px solid #334155", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              color: "#94a3b8",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "0.9rem",
            }}
          >
            🏠 Public Site
          </Link>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              color: "#f87171",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.9rem",
              textAlign: "left",
              width: "100%",
            }}
          >
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* 2. Main Content Container */}
      <div style={{ flex: 1, marginLeft: "260px", display: "flex", flexDirection: "column", minWidth: 0 }} className="main-content-layout">
        {/* Top Navbar */}
        <header
          style={{
            height: "70px",
            backgroundColor: "#ffffff",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 2rem",
            position: "sticky",
            top: 0,
            zIndex: 90,
          }}
        >
          {/* Hamburger button for Mobile */}
          <button
            onClick={() => setMobileOpen(true)}
            className="hamburger-btn"
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "#1e293b",
              display: "none",
            }}
          >
            ☰
          </button>

          <div style={{ fontWeight: 600, fontSize: "1.1rem", color: "#1e293b" }}>
            {location.pathname === "/dashboard"
              ? "Dashboard Overview"
              : location.pathname.substring(1).charAt(0).toUpperCase() + location.pathname.substring(2) + " Management"}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontSize: "0.85rem", color: "#64748b" }}>Academic Year: 2025-2026</span>
            <div style={{ width: "1px", height: "20px", backgroundColor: "#cbd5e1" }}></div>
            <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#334155" }}>
              Welcome, <span style={{ color: "#3b82f6" }}>{username}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: "2rem", flex: 1 }}>{children}</main>
      </div>
    </div>
  );
};

export default Layout;
