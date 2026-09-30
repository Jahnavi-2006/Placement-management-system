import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../components/Layout";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        
        const [statsRes, chartsRes] = await Promise.all([
          axios.get("http://localhost:5000/analytics/stats", { headers }),
          axios.get("http://localhost:5000/analytics/charts", { headers }),
        ]);

        setStats(statsRes.data);
        setChartData(chartsRes.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to retrieve dashboard analytics.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  if (loading) {
    return (
      <Layout>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
          <div style={{ fontSize: "1.2rem", fontWeight: 600, color: "#64748b" }}>Loading Analytics Dashboard...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fee2e2", color: "#ef4444", padding: "1.5rem", borderRadius: "12px" }}>
          <h3>⚠️ Error</h3>
          <p>{error}</p>
        </div>
      </Layout>
    );
  }

  // Calculate colors for chart items
  const statusColors = {
    Placed: "#22c55e",
    Interviewing: "#3b82f6",
    Shortlisted: "#a855f7",
    Applied: "#f59e0b",
    Rejected: "#ef4444",
    pending: "#64748b",
  };

  const getStatusColor = (status) => {
    const key = Object.keys(statusColors).find(
      (k) => k.toLowerCase() === status.toLowerCase()
    );
    return key ? statusColors[key] : "#64748b";
  };

  return (
    <Layout>
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        
        {/* STATS CARDS LIST */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {/* Card 1: Placement Rate */}
          <div
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
              color: "#ffffff",
              padding: "1.5rem",
              borderRadius: "1.25rem",
              boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.3)",
            }}
          >
            <div style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", opacity: 0.8 }}>Placement Rate</div>
            <div style={{ fontSize: "2.5rem", fontWeight: 900, margin: "0.5rem 0" }}>{stats?.placementRate}%</div>
            <div style={{ fontSize: "0.85rem", opacity: 0.9 }}>
              {stats?.placedStudents} of {stats?.totalStudents} students placed
            </div>
          </div>

          {/* Card 2: Average Package */}
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "1.5rem",
              borderRadius: "1.25rem",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", color: "#64748b" }}>Average Package</div>
            <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "#0f172a", margin: "0.5rem 0" }}>
              {stats?.avgPackage} <span style={{ fontSize: "1.2rem", fontWeight: 600 }}>LPA</span>
            </div>
            <div style={{ fontSize: "0.85rem", color: "#22c55e", fontWeight: 600 }}>
              📈 Maximum CTC: {stats?.maxPackage} LPA
            </div>
          </div>

          {/* Card 3: Drives Scheduled */}
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "1.5rem",
              borderRadius: "1.25rem",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", color: "#64748b" }}>Active Drives</div>
            <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "#0f172a", margin: "0.5rem 0" }}>{stats?.totalDrives}</div>
            <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
              Representing {stats?.totalCompanies} companies visiting
            </div>
          </div>

          {/* Card 4: Total Applications */}
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "1.5rem",
              borderRadius: "1.25rem",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", color: "#64748b" }}>Processed Applications</div>
            <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "#0f172a", margin: "0.5rem 0" }}>{stats?.totalApps}</div>
            <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
              {stats?.unplacedStudents} candidates actively seeking roles
            </div>
          </div>
        </section>

        {/* CHARTS GRID CONTAINER */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
            gap: "2rem",
          }}
        >
          
          {/* Chart 1: Department Placements (Bar Chart) */}
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "2rem",
              borderRadius: "1.5rem",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
              border: "1px solid #e2e8f0",
            }}
          >
            <h3 style={{ margin: "0 0 1.5rem 0", color: "#1e293b", fontSize: "1.1rem", fontWeight: 700 }}>
              Department-wise Placement Analysis
            </h3>
            
            {/* SVG Bar Chart */}
            <div style={{ width: "100%", overflowX: "auto" }}>
              <svg width="400" height="240" viewBox="0 0 400 240" style={{ display: "block", margin: "0 auto" }}>
                {/* Gridlines */}
                <line x1="50" y1="40" x2="380" y2="40" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="50" y1="90" x2="380" y2="90" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="50" y1="140" x2="380" y2="140" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="50" y1="190" x2="380" y2="190" stroke="#cbd5e1" strokeWidth="1.5" />

                {/* Y Axis labels */}
                <text x="40" y="45" fill="#64748b" fontSize="10" textAnchor="end">100%</text>
                <text x="40" y="95" fill="#64748b" fontSize="10" textAnchor="end">50%</text>
                <text x="40" y="145" fill="#64748b" fontSize="10" textAnchor="end">25%</text>
                <text x="40" y="195" fill="#64748b" fontSize="10" textAnchor="end">0%</text>

                {/* Bars rendering */}
                {chartData?.departments.map((dept, index) => {
                  const barWidth = 32;
                  const gap = 24;
                  const x = 70 + index * (barWidth + gap);
                  
                  // Compute placement rate height
                  const rate = dept.total > 0 ? (dept.placed / dept.total) * 100 : 0;
                  const barHeight = Math.min(150, (rate / 100) * 150);
                  const y = 190 - barHeight;

                  return (
                    <g key={dept.name}>
                      {/* Background Bar */}
                      <rect
                        x={x}
                        y="40"
                        width={barWidth}
                        height="150"
                        fill="#f8fafc"
                        rx="4"
                      />
                      {/* Placement Bar */}
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        fill="#3b82f6"
                        rx="4"
                        style={{ transition: "all 0.5s ease" }}
                      />
                      {/* Text value above bar */}
                      <text x={x + barWidth / 2} y={y - 8} fill="#1e293b" fontSize="10" fontWeight="bold" textAnchor="middle">
                        {Math.round(rate)}%
                      </text>
                      {/* X Axis Label */}
                      <text x={x + barWidth / 2} y="212" fill="#475569" fontSize="11" fontWeight="600" textAnchor="middle">
                        {dept.name}
                      </text>
                      {/* Sub-label showing absolute values */}
                      <text x={x + barWidth / 2} y="226" fill="#94a3b8" fontSize="8" textAnchor="middle">
                        {dept.placed}/{dept.total} Placed
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Chart 2: Package Distribution (Salary Ranges) */}
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "2rem",
              borderRadius: "1.5rem",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
              border: "1px solid #e2e8f0",
            }}
          >
            <h3 style={{ margin: "0 0 1.5rem 0", color: "#1e293b", fontSize: "1.1rem", fontWeight: 700 }}>
              Package Distribution (LPA)
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
              {chartData?.packages.length === 0 ? (
                <div style={{ textAlign: "center", color: "#64748b", padding: "3rem 0" }}>No salary statistics available yet.</div>
              ) : (
                chartData?.packages.map((pkg) => {
                  // Find total placed to compute percentage
                  const totalPlaced = chartData.packages.reduce((sum, item) => sum + item.count, 0);
                  const percentage = totalPlaced > 0 ? (pkg.count / totalPlaced) * 100 : 0;
                  
                  return (
                    <div key={pkg.range} style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>
                        <span>{pkg.range}</span>
                        <span>{pkg.count} Students ({Math.round(percentage)}%)</span>
                      </div>
                      
                      {/* Bar indicator */}
                      <div style={{ width: "100%", height: "10px", backgroundColor: "#f1f5f9", borderRadius: "5px", overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${percentage}%`,
                            height: "100%",
                            backgroundColor: "#10b981",
                            borderRadius: "5px",
                            transition: "width 0.5s ease-out",
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chart 3: Application Funnel Statuses */}
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "2rem",
              borderRadius: "1.5rem",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
              border: "1px solid #e2e8f0",
            }}
          >
            <h3 style={{ margin: "0 0 1.5rem 0", color: "#1e293b", fontSize: "1.1rem", fontWeight: 700 }}>
              Application Funnel Stages
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {chartData?.applicationStatuses.length === 0 ? (
                <div style={{ textAlign: "center", color: "#64748b", padding: "3rem 0" }}>No applications logged yet.</div>
              ) : (
                chartData?.applicationStatuses.map((app) => {
                  const maxCount = Math.max(...chartData.applicationStatuses.map(item => item.value), 1);
                  const barWidth = (app.value / maxCount) * 100;
                  const color = getStatusColor(app.label);

                  return (
                    <div key={app.label} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <div style={{ width: "110px", fontSize: "0.85rem", fontWeight: 700, color: "#475569" }}>
                        {app.label}
                      </div>
                      
                      {/* Horizontal Funnel Bar */}
                      <div style={{ flex: 1, height: "24px", backgroundColor: "#f8fafc", borderRadius: "6px", position: "relative" }}>
                        <div
                          style={{
                            width: `${barWidth}%`,
                            height: "100%",
                            backgroundColor: color,
                            borderRadius: "6px",
                            transition: "width 0.5s ease",
                          }}
                        ></div>
                        <span style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "0.8rem", fontWeight: 800, color: app.value > 0 ? "#1e293b" : "#94a3b8" }}>
                          {app.value} apps
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chart 4: Top Recruiting Companies */}
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "2rem",
              borderRadius: "1.5rem",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
              border: "1px solid #e2e8f0",
            }}
          >
            <h3 style={{ margin: "0 0 1.5rem 0", color: "#1e293b", fontSize: "1.1rem", fontWeight: 700 }}>
              Top Hiring Corporations
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {chartData?.topCompanies.length === 0 ? (
                <div style={{ textAlign: "center", color: "#64748b", padding: "3rem 0" }}>No students marked as placed yet.</div>
              ) : (
                chartData?.topCompanies.map((item, index) => {
                  return (
                    <div
                      key={item.company}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.75rem 1rem",
                        backgroundColor: "#f8fafc",
                        borderRadius: "10px",
                        borderLeft: `4px solid ${["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#64748b"][index % 6]}`,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{ fontWeight: 800, color: "#64748b" }}>#{index + 1}</span>
                        <span style={{ fontWeight: 700, color: "#1e293b" }}>{item.company}</span>
                      </div>
                      <div style={{ fontWeight: 800, color: "#10b981", fontSize: "0.95rem" }}>
                        🎉 {item.count} Placements
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </section>

      </div>
    </Layout>
  );
};

export default Dashboard;
