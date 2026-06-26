import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../components/AuthContext";
import prepareRequest from "../services/RequestService";
import VerificationStatusBanner from "../components/VerificationStatusBanner";
import ArticleEditorModal from "../components/ArticleEditorModal";
import NotificationToast from "../components/NotificationToast";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("dashboard");
  const { user } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState({
    lastChat: null,
    medicationsToday: [],
    recentSymptomLog: null,
    upcomingMedications: [],
  });
  const [loading, setLoading] = useState(true);

  /* ── Articles (blogs tab) ─────────────────────────────────── */
  const [articles, setArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 4200);
    return () => clearTimeout(t);
  }, [notification]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const token = prepareRequest();
        const response = await axios.get("/api/dashboard/overview", {
          headers: { "X-XSRF-TOKEN": decodeURIComponent(token) },
        });
        setDashboardData(response.data);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) loadDashboard();
    else Promise.resolve().then(() => setLoading(false));
  }, [user]);

  const loadArticles = async () => {
    setArticlesLoading(true);
    try {
      const token = prepareRequest();
      const res = await axios.get("/api/articles/doctor/mine", {
        headers: { "X-XSRF-TOKEN": decodeURIComponent(token) },
      });
      setArticles(res.data || []);
    } catch {
      setNotification({ type: "error", title: "Error", message: "Failed to load articles." });
    } finally {
      setArticlesLoading(false);
    }
  };

  useEffect(() => {
    if (activeNav === "blogs") loadArticles();
  }, [activeNav]);

  const handleDeleteArticle = async (id) => {
    if (!window.confirm("Delete this article?")) return;
    try {
      const token = prepareRequest();
      await axios.delete(`/api/articles/${id}`, {
        headers: { "X-XSRF-TOKEN": decodeURIComponent(token) },
      });
      setArticles((prev) => prev.filter((a) => a.id !== id));
      setNotification({ type: "success", title: "Deleted", message: "Article removed." });
    } catch {
      setNotification({ type: "error", title: "Error", message: "Failed to delete." });
    }
  };

  if (loading) {
    return (
      <div className="cl-body">
        <div className="d-flex align-items-center justify-content-center vh-100">
          <div className="text-center">
            <div className="spinner-border text-primary-custom mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-secondary-custom">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Sidebar nav items ───────────────────────────────────── */
  const navItems = [
    { key: "dashboard", icon: "dashboard", label: "Dashboard" },
    { key: "patients", icon: "group", label: "Patients" },
    { key: "treatment", icon: "assignment", label: "Treatment Plans" },
    { key: "blogs", icon: "library_books", label: "Your Blogs" },
    { key: "verification", icon: "verified", label: "Verification" },
  ];

  return (
    <div className="cl-body">
      <NotificationToast
        open={!!notification}
        notification={notification}
        onClose={() => setNotification(null)}
      />

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="mb-4">
          <span className="sidebar-brand">CareLens</span>
        </div>
        <nav className="d-flex flex-column gap-1 flex-grow-1">
          {navItems.map((item) => (
            <a
              key={item.key}
              href="#"
              id={`nav-${item.key}`}
              className={`nav-link-item${activeNav === item.key ? " active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                if (item.key === "treatment") {
                  navigate("/treatment-followup");
                } else {
                  setActiveNav(item.key);
                }
              }}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="mt-auto pt-4 border-top">
          <div className="sidebar-support">
            <p className="fw-bold mb-1 text-xs" style={{ letterSpacing: ".08em", textTransform: "uppercase" }}>
              Pro Support
            </p>
            <p className="mb-2 text-sm">Priority clinician support line active.</p>
            <button className="btn btn-sm w-100 fw-bold text-white" style={{ background: "#0d9488" }}>
              Contact Specialist
            </button>
          </div>
        </div>
      </aside>

      {/* ── Topbar ──────────────────────────────────────────── */}
      <header className="topbar">
        <h1 className="mb-0 text-primary-custom" style={{ fontFamily: "'Manrope',sans-serif", fontSize: "1.1rem", fontWeight: 700 }}>
          Welcome back, Dr. {user?.name?.split(" ")[0] || "Doctor"}
        </h1>
        <div className="d-flex align-items-center gap-4">
          <div className="position-relative">
            <span className="material-symbols-outlined text-secondary" style={{ cursor: "pointer" }}>notifications</span>
            <span className="position-absolute top-0 end-0 rounded-circle bg-danger border border-white" style={{ width: "8px", height: "8px", display: "block" }} />
          </div>
          <div className="d-flex align-items-center gap-2 ps-3 border-start">
            <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
              style={{ width: 40, height: 40, background: "#0d9488", fontSize: "1rem" }}>
              {user?.name?.[0]?.toUpperCase() || "D"}
            </div>
            <div>
              <div className="text-sm fw-semibold">Dr. {user?.name?.split(" ")[0] || "Doctor"}</div>
              <button className="btn btn-link p-0 text-sm" style={{ color: "#94a3b8" }}>Logout</button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────── */}
      <main className="main-content">
        <div className="d-flex flex-column gap-5">

          {/* ── DASHBOARD TAB ─────────────────────────────────── */}
          {activeNav === "dashboard" && (
            <>
              {/* Verification Banner */}
              <VerificationStatusBanner />

              {/* Stats */}
              <div className="row g-4">
                <div className="col-12 col-sm-6 col-lg-3">
                  <div className="bg-white p-4 rounded-3 border stat-card soft-elevation">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="p-2 rounded-3" style={{ background: "#f0fdfa", color: "#0d9488" }}>
                        <span className="material-symbols-outlined">person_add</span>
                      </div>
                      <span className="badge rounded-pill text-xs" style={{ background: "rgba(0,104,95,.1)", color: "var(--primary)" }}>+12%</span>
                    </div>
                    <p className="mb-1" style={{ fontFamily: "'Manrope',sans-serif", fontSize: "1.3rem", fontWeight: 700 }}>12 New Patients</p>
                    <p className="text-secondary mb-0 text-sm">Awaiting initial consultation</p>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-lg-3">
                  <div className="bg-white p-4 rounded-3 border stat-card soft-elevation">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="p-2 rounded-3" style={{ background: "var(--surface-container-low)", color: "var(--on-surface)" }}>
                        <span className="material-symbols-outlined">assignment</span>
                      </div>
                    </div>
                    <p className="mb-1" style={{ fontFamily: "'Manrope',sans-serif", fontSize: "1.3rem", fontWeight: 700 }}>Active Plans</p>
                    <p className="text-secondary mb-0 text-sm">
                      <a href="#" onClick={(e) => { e.preventDefault(); navigate("/treatment-followup"); }} style={{ color: "#0d9488", textDecoration: "none" }}>
                        Manage treatment plans →
                      </a>
                    </p>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-lg-3">
                  <div className="bg-white p-4 rounded-3 border stat-card soft-elevation">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="p-2 rounded-3" style={{ background: "#f0fdfa", color: "#0d9488" }}>
                        <span className="material-symbols-outlined">schedule</span>
                      </div>
                    </div>
                    <p className="mb-1" style={{ fontFamily: "'Manrope',sans-serif", fontSize: "1.3rem", fontWeight: 700 }}>8 Appointments</p>
                    <p className="text-secondary mb-0 text-sm">Next: Today at 10:30 AM</p>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-lg-3">
                  <div className="bg-white p-4 rounded-3 border stat-card soft-elevation">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="p-2 rounded-3" style={{ background: "#dce9ff", color: "var(--on-surface)" }}>
                        <span className="material-symbols-outlined">verified_user</span>
                      </div>
                    </div>
                    <p className="mb-1" style={{ fontFamily: "'Manrope',sans-serif", fontSize: "1.3rem", fontWeight: 700 }}>98.4% Accuracy</p>
                    <p className="text-secondary mb-0 text-sm">AI Diagnostic support rating</p>
                  </div>
                </div>
              </div>

              {/* AI Chat + Active Patients */}
              <div className="row g-4">
                <div className="col-12 col-lg-8">
                  <div className="bg-white rounded-3 border soft-elevation overflow-hidden d-flex flex-column flex-md-row h-100">
                    <div className="p-4 p-xl-5 d-flex flex-column justify-content-between" style={{ flex: 1 }}>
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-4">
                          <span className="rounded-circle glow-active" style={{ width: "8px", height: "8px", background: "var(--primary)", display: "inline-block" }} />
                          <span className="badge rounded-pill fw-bold d-flex align-items-center gap-1" style={{ background: "#0d9488", color: "#fff", fontSize: "10px", letterSpacing: ".06em" }}>
                            <span className="material-symbols-outlined" style={{ fontSize: ".9rem" }}>bolt</span> POWERED BY AI
                          </span>
                        </div>
                        <h3 className="mb-3" style={{ fontFamily: "'Manrope',sans-serif", fontSize: "1.6rem", fontWeight: 700 }}>
                          AI Chat Consultation
                        </h3>
                        <p className="text-secondary mb-4">
                          Get instant diagnostic suggestions and research summaries tailored to your patient's symptoms.
                        </p>
                      </div>
                      <button
                        onClick={() => navigate("/chat-ai/new")}
                        className="btn fw-bold text-white d-flex align-items-center gap-2 w-auto"
                        style={{ background: "#0d9488", padding: ".75rem 1.5rem", borderRadius: ".75rem" }}
                      >
                        Start New Session <span className="material-symbols-outlined">arrow_forward</span>
                      </button>
                    </div>
                    <div className="p-4 d-flex align-items-center" style={{ flex: 1 }}>
                      <div className="glass-card rounded-3 p-4 w-100 shadow d-flex flex-column gap-3">
                        <div className="d-flex gap-3 align-items-start">
                          <div className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0" style={{ width: "32px", height: "32px", background: "#0d9488" }}>
                            <span className="material-symbols-outlined" style={{ fontSize: ".9rem" }}>smart_toy</span>
                          </div>
                          <div className="bg-white p-3 rounded-3 border shadow-sm text-sm">
                            Based on the ECG data, I suggest reviewing atrial fibrillation markers...
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-lg-4">
                  <h5 className="mb-3" style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700 }}>Active Patients</h5>
                  <div className="d-flex flex-column gap-3">
                    {[
                      { name: "Linda Thompson", condition: "Post-Op Recovery", status: "STABLE", badge: "badge-stable" },
                      { name: "Robert Greene", condition: "Hypertension", status: "MONITORING", badge: "badge-monitoring" },
                      { name: "Kevin Park", condition: "T1 Diabetes", status: "URGENT", badge: "badge-urgent" },
                    ].map((p) => (
                      <div key={p.name} className="d-flex align-items-center justify-content-between p-3 glass-card rounded-3 shadow-sm">
                        <div className="d-flex align-items-center gap-3">
                          <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                            style={{ width: 48, height: 48, background: "#0d9488", fontSize: "1rem" }}>
                            {p.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div>
                            <div className="fw-bold text-sm">{p.name}</div>
                            <small className="text-muted">{p.condition}</small>
                          </div>
                        </div>
                        <div className="text-end">
                          <span className={`badge ${p.badge} rounded-pill fw-bold mb-1 d-block`} style={{ fontSize: "9px", letterSpacing: ".05em" }}>{p.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Today's Schedule */}
              <section>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0" style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700 }}>Today's Schedule</h5>
                  <button className="btn btn-link fw-bold p-0 text-decoration-none text-primary-custom">View Calendar</button>
                </div>
                <div className="d-flex gap-3 overflow-auto pb-2">
                  {[
                    { time: "09:30 AM", name: "David Chen", type: "Annual Physical", color: "var(--primary)" },
                    { time: "10:15 AM", name: "Sarah Miller", type: "Follow-up: Lab Results", color: "var(--secondary)" },
                    { time: "11:00 AM", name: "Michael Scott", type: "Prescription Refill", color: "var(--outline)" },
                  ].map((appt) => (
                    <div key={appt.time} className="appt-card glass-card p-4 rounded-3 border-bottom border-4 flex-shrink-0" style={{ borderBottomColor: appt.color }}>
                      <p className="fw-bold mb-1 text-xs" style={{ color: appt.color }}>{appt.time}</p>
                      <p className="fw-bold mb-1">{appt.name}</p>
                      <p className="text-muted mb-3" style={{ fontSize: ".8rem" }}>{appt.type}</p>
                      <div className="d-flex align-items-center justify-content-center rounded-circle border fw-bold"
                        style={{ width: "28px", height: "28px", background: "#e2e8f0", fontSize: "10px" }}>
                        {appt.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* ── VERIFICATION TAB ─────────────────────────────── */}
          {activeNav === "verification" && (
            <div>
              <h2 style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 800, marginBottom: "1rem" }}>Verification Status</h2>
              <p className="text-secondary mb-4">
                Manage your CareLens doctor verification. Once approved, a badge will appear on your profile visible to all patients.
              </p>
              <VerificationStatusBanner />
              <div className="bg-white rounded-3 border p-4 soft-elevation mt-3">
                <h5 style={{ fontWeight: 700 }}>What happens after verification?</h5>
                <ul className="mt-3" style={{ lineHeight: 2, color: "#546e7a" }}>
                  <li>A <strong>Verified</strong> badge appears on your doctor profile</li>
                  <li>Patients can search and find verified doctors more easily</li>
                  <li>You gain access to advanced clinical features</li>
                  <li>Your articles are marked as coming from a verified medical professional</li>
                </ul>
              </div>
            </div>
          )}

          {/* ── BLOGS TAB ────────────────────────────────────── */}
          {activeNav === "blogs" && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h2 style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 800, marginBottom: "0.25rem" }}>Your Articles</h2>
                  <p className="text-secondary mb-0">Manage the medical articles you've published on CareLens.</p>
                </div>
                <button
                  id="btn-write-article"
                  onClick={() => { setEditingArticle(null); setEditorOpen(true); }}
                  className="btn fw-bold text-white d-flex align-items-center gap-2"
                  style={{ background: "#0d9488", padding: "0.6rem 1.25rem", borderRadius: "10px" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>add</span>
                  Write Article
                </button>
              </div>

              {articlesLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary-custom" role="status" />
                </div>
              ) : articles.length === 0 ? (
                <div className="bg-white rounded-3 border p-5 text-center soft-elevation">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: "3rem" }}>library_books</span>
                  <h5 className="mt-3" style={{ fontWeight: 700 }}>No articles yet</h5>
                  <p className="text-secondary">Share your medical expertise with patients on CareLens.</p>
                  <button
                    onClick={() => { setEditingArticle(null); setEditorOpen(true); }}
                    className="btn fw-bold text-white mt-2"
                    style={{ background: "#0d9488", borderRadius: "10px", padding: "0.6rem 1.5rem" }}
                  >
                    Write your first article
                  </button>
                </div>
              ) : (
                <div className="row g-4">
                  {articles.map((article) => (
                    <div key={article.id} className="col-12 col-md-6 col-lg-4">
                      <div className="bg-white rounded-3 border soft-elevation overflow-hidden d-flex flex-column h-100">
                        {article.image && (
                          <img src={article.image} alt={article.title} style={{ width: "100%", height: "140px", objectFit: "cover" }} />
                        )}
                        <div className="p-4 d-flex flex-column flex-grow-1">
                          <span className="badge rounded-pill mb-2 align-self-start" style={{ background: "#e0f2fe", color: "#0369a1", fontSize: "0.7rem" }}>
                            {article.category}
                          </span>
                          <h6 className="fw-bold mb-2" style={{ fontSize: "0.95rem" }}>{article.title}</h6>
                          <p className="text-secondary text-sm flex-grow-1" style={{ fontSize: "0.82rem" }}>
                            {article.content?.substring(0, 80)}…
                          </p>
                          <div className="d-flex gap-2 mt-3 pt-3 border-top">
                            <button
                              id={`btn-edit-article-${article.id}`}
                              onClick={() => { setEditingArticle(article); setEditorOpen(true); }}
                              className="btn btn-sm fw-bold"
                              style={{ flex: 1, border: "1.5px solid #0d9488", color: "#0d9488", borderRadius: "8px" }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: "1rem", verticalAlign: "middle" }}>edit</span> Edit
                            </button>
                            <button
                              id={`btn-delete-article-${article.id}`}
                              onClick={() => handleDeleteArticle(article.id)}
                              className="btn btn-sm fw-bold"
                              style={{ flex: 1, border: "1.5px solid #ef4444", color: "#ef4444", borderRadius: "8px" }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: "1rem", verticalAlign: "middle" }}>delete</span> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PATIENTS TAB ─────────────────────────────────── */}
          {activeNav === "patients" && (
            <div>
              <h2 style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 800, marginBottom: "1rem" }}>Patients</h2>
              <p className="text-secondary mb-4">Patient management features are coming soon.</p>
              <button
                onClick={() => navigate("/treatment-followup")}
                className="btn fw-bold text-white"
                style={{ background: "#0d9488", borderRadius: "10px", padding: "0.7rem 1.5rem" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "1.1rem", verticalAlign: "middle", marginRight: 4 }}>assignment</span>
                View Treatment Plans
              </button>
            </div>
          )}

        </div>
      </main>

      {/* ── Article Editor Modal ─────────────────────────────── */}
      <ArticleEditorModal
        open={editorOpen}
        article={editingArticle}
        onClose={() => setEditorOpen(false)}
        onSaved={(saved) => {
          if (editingArticle) {
            setArticles((prev) => prev.map((a) => (a.id === saved.id ? saved : a)));
          } else {
            setArticles((prev) => [saved, ...prev]);
          }
        }}
      />

      <button className="fab" onClick={() => navigate("/chat-ai/new")}>
        <span className="material-symbols-outlined" style={{ fontSize: "1.5rem" }}>smart_toy</span>
        Ask AI
      </button>
    </div>
  );
}
