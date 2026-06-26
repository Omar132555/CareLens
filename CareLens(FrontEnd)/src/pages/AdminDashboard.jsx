import { useState, useEffect, useContext } from "react";
import NavBar from "../components/navBar";
import { AuthContext } from "../components/AuthContext";
import prepareRequest from "../services/RequestService";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("overview");

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verifications
  const [verifications, setVerifications] = useState([]);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const token = () => prepareRequest();
  const hdr = () => ({ "X-XSRF-TOKEN": decodeURIComponent(token()) });

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") {
      navigate("/home", { replace: true });
      return;
    }
    loadStats();
  }, [user, navigate]);

  const loadStats = async () => {
    try {
      const res = await axios.get("/api/admin/dashboard/stats", { headers: hdr() });
      setStats(res.data);
    } catch {
      console.error("Failed to load admin stats");
    } finally {
      setLoading(false);
    }
  };

  const loadVerifications = async () => {
    setVerificationLoading(true);
    try {
      const res = await axios.get("/api/admin/verification/requests", { headers: hdr() });
      setVerifications(res.data || []);
    } catch {
      console.error("Failed to load verifications");
    } finally {
      setVerificationLoading(false);
    }
  };

  useEffect(() => {
    if (activeNav === "verifications") loadVerifications();
  }, [activeNav]);

  const handleApprove = async (id) => {
    if (!window.confirm("Approve this doctor's verification?")) return;
    try {
      await axios.put(`/api/admin/verification/${id}/approve`, {}, { headers: hdr() });
      setVerifications((prev) =>
        prev.map((v) => (v.id === id ? { ...v, verification_status: "approved" } : v))
      );
      if (stats) setStats({ ...stats, pending_verifications: Math.max(0, stats.pending_verifications - 1) });
    } catch {
      alert("Failed to approve verification.");
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { alert("Please provide a reason."); return; }
    try {
      await axios.put(`/api/admin/verification/${rejectId}/reject`, { reason: rejectReason }, { headers: hdr() });
      setVerifications((prev) =>
        prev.map((v) => (v.id === rejectId ? { ...v, verification_status: "rejected" } : v))
      );
      if (stats) setStats({ ...stats, pending_verifications: Math.max(0, stats.pending_verifications - 1) });
      setRejectId(null);
      setRejectReason("");
    } catch {
      alert("Failed to reject verification.");
    }
  };

  if (loading) {
    return (
      <div className="cl-body">
        <div className="d-flex align-items-center justify-content-center vh-100">
          <div className="spinner-border text-primary-custom" role="status" />
        </div>
      </div>
    );
  }

  const navItems = [
    { key: "overview", icon: "monitoring", label: "Overview" },
    { key: "verifications", icon: "verified", label: "Verifications" },
    { key: "users", icon: "group", label: "User Management" },
    { key: "articles", icon: "article", label: "Articles Review" },
  ];

  return (
    <div className="cl-body">
      <NavBar scrolled={false} />

      <div className="container-lg pt-4" style={{ marginTop: "70px" }}>
        <h1 className="fw-bold mb-4" style={{ color: "#0f172a" }}>Admin Dashboard</h1>

        <div className="row g-4">
          <div className="col-12 col-md-3">
            <div className="d-flex flex-column gap-2 p-3 bg-white border rounded-3 shadow-sm">
              <h6 className="text-secondary fw-bold text-uppercase mb-2 ms-2" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>Administration</h6>
              {navItems.map((n) => (
                <button
                  key={n.key}
                  onClick={() => setActiveNav(n.key)}
                  className={`btn d-flex align-items-center gap-3 text-start fw-bold`}
                  style={{
                    padding: "0.7rem 1rem",
                    borderRadius: "8px",
                    background: activeNav === n.key ? "#f0fdfa" : "transparent",
                    color: activeNav === n.key ? "#0d9488" : "#475569",
                    border: "none",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "1.2rem" }}>{n.icon}</span>
                  {n.label}
                </button>
              ))}
            </div>
          </div>

          <div className="col-12 col-md-9">
            {activeNav === "overview" && stats && (
              <div className="row g-4">
                <div className="col-12 col-sm-6 col-lg-4">
                  <div className="bg-white p-4 rounded-3 border shadow-sm h-100">
                    <div className="text-secondary mb-1 fw-bold text-sm">Total Users</div>
                    <div className="fs-2 fw-bold text-dark">{stats.total_users}</div>
                    <div className="d-flex gap-3 mt-3">
                      <div><small className="text-muted d-block text-xs">Patients</small><span className="fw-bold">{stats.patients}</span></div>
                      <div><small className="text-muted d-block text-xs">Doctors</small><span className="fw-bold">{stats.doctors}</span></div>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-lg-4">
                  <div className="bg-white p-4 rounded-3 border shadow-sm h-100" style={{ borderColor: stats.pending_verifications > 0 ? "#fde047" : "" }}>
                    <div className="text-secondary mb-1 fw-bold text-sm">Pending Verifications</div>
                    <div className="fs-2 fw-bold text-warning">{stats.pending_verifications}</div>
                    <button onClick={() => setActiveNav("verifications")} className="btn btn-sm btn-outline-warning mt-3">Review Requests</button>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-lg-4">
                  <div className="bg-white p-4 rounded-3 border shadow-sm h-100">
                    <div className="text-secondary mb-1 fw-bold text-sm">Articles Published</div>
                    <div className="fs-2 fw-bold" style={{ color: "#0369a1" }}>{stats.articles}</div>
                    <button onClick={() => setActiveNav("articles")} className="btn btn-sm btn-outline-primary mt-3 border-0" style={{ background: "#e0f2fe" }}>Manage Content</button>
                  </div>
                </div>
              </div>
            )}

            {activeNav === "verifications" && (
              <div className="bg-white rounded-3 border shadow-sm p-4">
                <h4 className="fw-bold mb-4">Verification Requests</h4>
                {verificationLoading ? (
                  <div className="text-center py-4"><div className="spinner-border text-primary-custom" /></div>
                ) : verifications.length === 0 ? (
                  <div className="text-center py-5 text-secondary">No pending verification requests.</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead>
                        <tr>
                          <th>Doctor</th>
                          <th>Category</th>
                          <th>Requested</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {verifications.map((v) => (
                          <tr key={v.id}>
                            <td>
                              <div className="fw-bold">{v.name}</div>
                              <div className="text-muted small">{v.email}</div>
                            </td>
                            <td>{v.category_name || "—"}</td>
                            <td>{new Date(v.verification_requested_at).toLocaleDateString()}</td>
                            <td>
                              <span className={`badge ${v.verification_status === "pending" ? "bg-warning text-dark" : v.verification_status === "approved" ? "bg-success" : "bg-danger"}`}>
                                {v.verification_status.toUpperCase()}
                              </span>
                            </td>
                            <td>
                              {v.verification_status === "pending" && (
                                <div className="d-flex gap-2">
                                  <button onClick={() => handleApprove(v.id)} className="btn btn-sm btn-success fw-bold">Approve</button>
                                  <button onClick={() => setRejectId(v.id)} className="btn btn-sm btn-danger fw-bold">Reject</button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Reject Modal */}
                {rejectId && (
                  <div className="position-fixed inset-0 d-flex align-items-center justify-content-center" style={{ top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
                    <div className="bg-white p-4 rounded-3 shadow-lg" style={{ width: "100%", maxWidth: 400 }}>
                      <h5 className="fw-bold mb-3">Reject Verification</h5>
                      <textarea
                        className="form-control mb-3"
                        rows="3"
                        placeholder="Reason for rejection (will be shown to the doctor)..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                      />
                      <div className="d-flex justify-content-end gap-2">
                        <button onClick={() => { setRejectId(null); setRejectReason(""); }} className="btn btn-secondary">Cancel</button>
                        <button onClick={handleReject} className="btn btn-danger fw-bold">Confirm Rejection</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {(activeNav === "users" || activeNav === "articles") && (
              <div className="bg-white rounded-3 border shadow-sm p-5 text-center">
                <span className="material-symbols-outlined text-secondary" style={{ fontSize: "3rem" }}>construction</span>
                <h4 className="fw-bold mt-3 text-secondary">Coming Soon</h4>
                <p className="text-muted">Full CRUD management for this section is under development.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
