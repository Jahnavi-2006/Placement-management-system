import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search and Sort
  const [searchTerm, setSearchTerm] = useState("");
  const [sortByCgpa, setSortByCgpa] = useState("default"); // default, asc, desc

  // Modal / Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentCompany, setCurrentCompany] = useState(null);

  const [formData, setFormData] = useState({
    company_name: "",
    min_cgpa_required: "",
    industry: "",
  });

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchCompanies = async () => {
    try {
      const res = await axios.get("http://localhost:5000/companies", { headers });
      setCompanies(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch companies list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/companies",
        {
          company_name: formData.company_name,
          min_cgpa_required: formData.min_cgpa_required ? parseFloat(formData.min_cgpa_required) : null,
          industry: formData.industry || null,
        },
        { headers }
      );
      alert("Company profile created successfully");
      setShowAddModal(false);
      setFormData({ company_name: "", min_cgpa_required: "", industry: "" });
      fetchCompanies();
    } catch (err) {
      console.error(err);
      alert("Failed to add company");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/companies/${currentCompany.company_id}`,
        {
          company_name: formData.company_name,
          min_cgpa_required: formData.min_cgpa_required ? parseFloat(formData.min_cgpa_required) : null,
          industry: formData.industry || null,
        },
        { headers }
      );
      alert("Company profile updated successfully");
      setShowEditModal(false);
      fetchCompanies();
    } catch (err) {
      console.error(err);
      alert("Failed to update company profile");
    }
  };

  const handleDelete = async (companyId) => {
    if (!window.confirm("Are you sure you want to delete this company? This will also cancel all recruitment drives and applications associated with it!")) {
      return;
    }
    try {
      await axios.delete(`http://localhost:5000/companies/${companyId}`, { headers });
      alert("Company deleted successfully");
      fetchCompanies();
    } catch (err) {
      console.error(err);
      alert("Failed to delete company");
    }
  };

  const openAddModal = () => {
    setFormData({ company_name: "", min_cgpa_required: "", industry: "" });
    setShowAddModal(true);
  };

  const openEditModal = (company) => {
    setCurrentCompany(company);
    setFormData({
      company_name: company.company_name,
      min_cgpa_required: company.min_cgpa_required ? company.min_cgpa_required.toString() : "",
      industry: company.industry || "",
    });
    setShowEditModal(true);
  };

  // Filter and Sort Companies
  let processedCompanies = companies.filter((company) => {
    const matchesSearch =
      company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.industry && company.industry.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  if (sortByCgpa === "asc") {
    processedCompanies.sort((a, b) => {
      const valA = parseFloat(a.min_cgpa_required) || 0;
      const valB = parseFloat(b.min_cgpa_required) || 0;
      return valA - valB;
    });
  } else if (sortByCgpa === "desc") {
    processedCompanies.sort((a, b) => {
      const valA = parseFloat(a.min_cgpa_required) || 0;
      const valB = parseFloat(b.min_cgpa_required) || 0;
      return valB - valA;
    });
  }

  return (
    <Layout>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        {/* HEADER FILTERS AND CONTROLS */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", flex: 1 }}>
            <input
              type="text"
              placeholder="🔍 Search company or industry..."
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
              value={sortByCgpa}
              onChange={(e) => setSortByCgpa(e.target.value)}
              style={{
                padding: "0.6rem 1rem",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                outline: "none",
                backgroundColor: "#ffffff",
              }}
            >
              <option value="default">Sort by Min CGPA: Default</option>
              <option value="asc">Min CGPA: Low to High</option>
              <option value="desc">Min CGPA: High to Low</option>
            </select>
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
              ➕ Add Company
            </button>
          )}
        </div>

        {/* COMPANIES GRID CARD VIEW */}
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>Loading companies...</div>
        ) : processedCompanies.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>No companies match search criteria.</div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {processedCompanies.map((company) => (
              <div
                key={company.company_id}
                style={{
                  backgroundColor: "#ffffff",
                  padding: "1.75rem",
                  borderRadius: "1.25rem",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                    <h3 style={{ margin: 0, color: "#0f172a", fontSize: "1.2rem", fontWeight: 700 }}>
                      {company.company_name}
                    </h3>
                    <span
                      style={{
                        backgroundColor: "#eff6ff",
                        color: "#3b82f6",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "20px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                      }}
                    >
                      {company.industry || "General"}
                    </span>
                  </div>

                  <div style={{ fontSize: "0.9rem", color: "#475569", marginBottom: "1.5rem" }}>
                    🎯 Min CGPA Required: <b style={{ color: "#3b82f6" }}>{company.min_cgpa_required || "No limit"}</b>
                  </div>
                </div>

                {(role === "Admin" || role === "Officer") && (
                  <div style={{ display: "flex", gap: "0.5rem", borderTop: "1px solid #f1f5f9", paddingTop: "1rem" }}>
                    <button
                      onClick={() => openEditModal(company)}
                      style={{
                        flex: 1,
                        backgroundColor: "#f59e0b",
                        color: "white",
                        border: "none",
                        padding: "0.45rem",
                        borderRadius: "6px",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontSize: "0.8rem",
                      }}
                    >
                      ✏️ Edit
                    </button>
                    {role === "Admin" && (
                      <button
                        onClick={() => handleDelete(company.company_id)}
                        style={{
                          flex: 1,
                          backgroundColor: "#ef4444",
                          color: "white",
                          border: "none",
                          padding: "0.45rem",
                          borderRadius: "6px",
                          fontWeight: 600,
                          cursor: "pointer",
                          fontSize: "0.8rem",
                        }}
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ADD COMPANY MODAL */}
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
              <h3 style={{ margin: "0 0 1.5rem 0" }}>Register Visiting Company</h3>
              <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#64748b", fontWeight: 600, marginBottom: "0.25rem" }}>COMPANY NAME</label>
                  <input
                    type="text"
                    required
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
                
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#64748b", fontWeight: 600, marginBottom: "0.25rem" }}>MIN CGPA REQUIRED</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 7.50"
                    value={formData.min_cgpa_required}
                    onChange={(e) => setFormData({ ...formData, min_cgpa_required: e.target.value })}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#64748b", fontWeight: 600, marginBottom: "0.25rem" }}>INDUSTRY SECTOR</label>
                  <input
                    type="text"
                    placeholder="e.g. Software, Finance, Core"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
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
                    Register Company
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT COMPANY MODAL */}
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
              <h3 style={{ margin: "0 0 1.5rem 0" }}>Edit Company Profile</h3>
              <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#64748b", fontWeight: 600, marginBottom: "0.25rem" }}>COMPANY NAME</label>
                  <input
                    type="text"
                    required
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
                
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#64748b", fontWeight: 600, marginBottom: "0.25rem" }}>MIN CGPA REQUIRED</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.min_cgpa_required}
                    onChange={(e) => setFormData({ ...formData, min_cgpa_required: e.target.value })}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#64748b", fontWeight: 600, marginBottom: "0.25rem" }}>INDUSTRY SECTOR</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
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

export default Companies;