import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import NavBar from "../components/navBar";
import Scroll from "../hooks/Scroll";
import prepareRequest from "../services/RequestService";
import NotificationToast from "../components/NotificationToast";

const CHART_COLORS = ["#00796b", "#e11d48", "#f59e0b", "#8b5cf6", "#0ea5e9"];

const severityColor = (s) =>
  s <= 3
    ? { bg: "#d1fae5", color: "#065f46" }
    : s <= 6
    ? { bg: "#fef3c7", color: "#92400e" }
    : { bg: "#fee2e2", color: "#7f1d1d" };

const severityLabel = (s) =>
  s <= 3 ? "Mild" : s <= 6 ? "Moderate" : "Severe";

export default function SymptomTracker() {
  const navigate = useNavigate();
  const scrolled = Scroll();

  const [symptoms, setSymptoms]         = useState([]);
  const [chartData, setChartData]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [notification, setNotification] = useState(null);
  const [showForm, setShowForm]         = useState(false);
  const [selectedSymptom, setSelectedSymptom] = useState("");
  const [severity, setSeverity]         = useState(5);
  const [symptomNames, setSymptomNames] = useState([]);
  const [deletingId, setDeletingId]     = useState(null);
  const [submitting, setSubmitting]     = useState(false);

  const processChartData = (data) => {
    const grouped = {};
    data.forEach((log) => {
      const date = new Date(log.logged_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!grouped[date]) grouped[date] = { date };
      grouped[date][log.symptom_name] = log.severity;
    });
    setChartData(Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date)));
  };

  const load = async () => {
    try {
      const token = prepareRequest();
      const res   = await axios.get("/api/symptoms/logs", {
        headers: { "X-XSRF-TOKEN": decodeURIComponent(token) },
      });
      setSymptoms(res.data);
      processChartData(res.data);
      setSymptomNames([...new Set(res.data.map((s) => s.symptom_name))]);
    } catch {
      setNotification({ type: "error", title: "Load Failed", message: "Could not load your symptom logs" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSymptom.trim()) {
      setNotification({ type: "error", title: "Invalid Input", message: "Please enter a symptom name" });
      return;
    }
    setSubmitting(true);
    try {
      const token = prepareRequest();
      await axios.post("/api/symptoms/log",
        { symptom_name: selectedSymptom, severity },
        { headers: { "X-XSRF-TOKEN": decodeURIComponent(token) } }
      );
      setNotification({ type: "success", title: "Logged", message: "Symptom logged successfully" });
      setSelectedSymptom(""); setSeverity(5); setShowForm(false);
      await load();
    } catch {
      setNotification({ type: "error", title: "Error", message: "Failed to log symptom" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const token = prepareRequest();
      await axios.delete(`/api/symptoms/logs/${id}`, {
        headers: { "X-XSRF-TOKEN": decodeURIComponent(token) },
      });
      const updated = symptoms.filter((s) => s.id !== id);
      setSymptoms(updated);
      processChartData(updated);
      setSymptomNames([...new Set(updated.map((s) => s.symptom_name))]);
      setNotification({ type: "success", title: "Deleted", message: "Symptom log removed" });
    } catch {
      setNotification({ type: "error", title: "Error", message: "Could not delete the log" });
    } finally {
      setDeletingId(null);
    }
  };

  const sidebarItems = [
    { key: "dashboard",  label: "Dashboard",       icon: "dashboard",    path: "/patient-dashboard" },
    { key: "doctors",    label: "Doctors",          icon: "stethoscope",  path: "/doctors" },
    { key: "medications",label: "Medications",      icon: "pill",         path: "/medications" },
    { key: "symptoms",   label: "Symptom Tracker",  icon: "query_stats",  path: "/symptoms" },
    { key: "articles",   label: "Blogs",            icon: "library_books",path: "/articles" },
  ];

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f0f4f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <NavBar scrolled={scrolled} />
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            border: "3px solid #e0f2f1", borderTopColor: "#00796b",
            animation: "spin 0.8s linear infinite", margin: "0 auto 12px",
          }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ color: "#607d8b" }}>Loading symptom data...</p>
        </div>
      </div>
    );
  }

  /* ── Shared styles ── */
  const card = {
    background: "#fff", borderRadius: "20px",
    boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
    border: "1px solid #f0f4f5",
  };

  return (
    <div style={{ background: "#f0f4f5", minHeight: "100vh" }}>
      <NavBar scrolled={scrolled} />

      <NotificationToast open={!!notification} notification={notification} onClose={() => setNotification(null)} />

      {/* ── Sidebar ── */}
      <aside style={{
        position: "fixed", top: 0, left: 0, bottom: 0, width: "240px",
        background: "#fff", borderRight: "1px solid #e8f0ef",
        display: "flex", flexDirection: "column", padding: "1.5rem 1rem",
        zIndex: 100, boxShadow: "2px 0 12px rgba(0,0,0,0.04)",
      }}>
        <div style={{ marginBottom: "2rem", paddingLeft: "0.5rem" }}>
          <span style={{ fontWeight: 800, fontSize: "1.3rem", color: "#00796b", fontFamily: "'Manrope', sans-serif" }}>
            CareLens
          </span>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
          {sidebarItems.map((item) => {
            const active = item.key === "symptoms";
            return (
              <button
                key={item.key}
                onClick={() => navigate(item.path)}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "0.7rem 1rem", borderRadius: "12px", border: "none",
                  background: active ? "#e0f2f1" : "transparent",
                  color: active ? "#00796b" : "#607d8b",
                  fontWeight: active ? 700 : 500, fontSize: "0.88rem",
                  cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#f5f9f8"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── Main ── */}
      <main style={{ marginLeft: "0px", paddingTop: "40px", padding: "100px 2rem 3rem 260px" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>

          {/* ── Page header ── */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1.9rem", color: "#1a2e2b", margin: 0 }}>
                Symptom Tracker
              </h1>
              <p style={{ color: "#607d8b", margin: "4px 0 0", fontSize: "0.95rem" }}>
                Monitor and track your health progress over time
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              style={{
                background: showForm ? "#f0f4f5" : "#00796b",
                color: showForm ? "#607d8b" : "#fff",
                border: showForm ? "1.5px solid #cfd8dc" : "none",
                borderRadius: "12px", padding: "0.7rem 1.4rem",
                fontWeight: 700, fontSize: "0.9rem", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "8px",
                transition: "all 0.2s",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>
                {showForm ? "close" : "add"}
              </span>
              {showForm ? "Cancel" : "Log Symptom"}
            </button>
          </div>

          {/* ── Stats row ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "1.75rem" }}>
            {[
              { label: "Total logs",      value: symptoms.length,                                             icon: "list_alt",    color: "#00796b", bg: "#e0f2f1" },
              { label: "Unique symptoms", value: symptomNames.length,                                         icon: "category",    color: "#7c3aed", bg: "#ede9fe" },
              { label: "Avg severity",    value: symptoms.length ? (symptoms.reduce((a, s) => a + s.severity, 0) / symptoms.length).toFixed(1) : "—", icon: "speed", color: "#b45309", bg: "#fef3c7" },
              { label: "Latest log",      value: symptoms[0] ? new Date(symptoms[0].logged_at).toLocaleDateString("en-US",{month:"short",day:"numeric"}) : "—", icon: "calendar_today", color: "#0369a1", bg: "#e0f2fe" },
            ].map((stat) => (
              <div key={stat.label} style={{ ...card, padding: "1.1rem 1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <div style={{ width: 34, height: 34, borderRadius: "10px", background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "1.1rem", color: stat.color }}>{stat.icon}</span>
                  </div>
                  <span style={{ fontSize: "0.78rem", color: "#90a4ae", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</span>
                </div>
                <p style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800, color: "#1a2e2b", fontFamily: "'Manrope', sans-serif" }}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* ── Log form ── */}
          {showForm && (
            <div style={{ ...card, padding: "1.75rem 2rem", marginBottom: "1.75rem", borderLeft: "4px solid #00796b" }}>
              <h2 style={{ fontWeight: 700, fontSize: "1.05rem", color: "#1a2e2b", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="material-symbols-outlined" style={{ color: "#00796b", fontSize: "1.2rem" }}>add_circle</span>
                Log new symptom
              </h2>
              <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
                  {/* Symptom name */}
                  <div>
                    <label style={{ display: "block", fontWeight: 600, fontSize: "0.83rem", color: "#455a64", marginBottom: "6px" }}>
                      Symptom name *
                    </label>
                    <input
                      type="text"
                      value={selectedSymptom}
                      onChange={(e) => setSelectedSymptom(e.target.value)}
                      placeholder="e.g. Headache, Fever, Cough"
                      style={{
                        width: "100%", padding: "0.7rem 1rem",
                        border: "1.5px solid #e0e8e7", borderRadius: "10px",
                        fontSize: "0.9rem", outline: "none", boxSizing: "border-box",
                        fontFamily: "inherit", color: "#263238",
                      }}
                      onFocus={e => e.target.style.borderColor = "#00796b"}
                      onBlur={e => e.target.style.borderColor = "#e0e8e7"}
                      required
                    />
                  </div>

                  {/* Severity */}
                  <div>
                    <label style={{ display: "block", fontWeight: 600, fontSize: "0.83rem", color: "#455a64", marginBottom: "6px" }}>
                      Severity — <span style={{ color: severityColor(severity).color, fontWeight: 700 }}>{severity}/10 ({severityLabel(severity)})</span>
                    </label>
                    <input
                      type="range" min="1" max="10" step="1"
                      value={severity}
                      onChange={(e) => setSeverity(parseInt(e.target.value))}
                      style={{ width: "100%", marginTop: "10px", accentColor: "#00796b" }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#90a4ae", marginTop: "4px" }}>
                      <span>1 — Minimal</span><span>10 — Severe</span>
                    </div>
                  </div>
                </div>

                {/* Severity preview pill */}
                <div style={{ marginBottom: "1.25rem" }}>
                  <span style={{
                    display: "inline-block", padding: "4px 14px", borderRadius: "20px",
                    background: severityColor(severity).bg, color: severityColor(severity).color,
                    fontSize: "0.82rem", fontWeight: 700,
                  }}>
                    {severityLabel(severity)} — {severity}/10
                  </span>
                </div>

                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      background: submitting ? "#94a3b8" : "#00796b", color: "#fff",
                      border: "none", borderRadius: "10px",
                      padding: "0.7rem 1.5rem", fontWeight: 700,
                      fontSize: "0.9rem", cursor: submitting ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", gap: "6px",
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>
                      {submitting ? "hourglass_empty" : "save"}
                    </span>
                    {submitting ? "Saving..." : "Save log"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── Chart ── */}
          {chartData.length > 0 && (
            <div style={{ ...card, padding: "1.75rem 2rem", marginBottom: "1.75rem" }}>
              <h2 style={{ fontWeight: 700, fontSize: "1.05rem", color: "#1a2e2b", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="material-symbols-outlined" style={{ color: "#00796b", fontSize: "1.2rem" }}>show_chart</span>
                Symptom trends
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f4f5" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#90a4ae" }} axisLine={false} tickLine={false} dy={8} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: "#90a4ae" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v, name) => [`${v}/10`, name]}
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: "0.85rem" }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: "16px", fontSize: "0.83rem" }} />
                  {symptomNames.map((name, i) => (
                    <Line
                      key={name} type="monotone" dataKey={name}
                      stroke={CHART_COLORS[i % CHART_COLORS.length]}
                      strokeWidth={2.5}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── Logs list ── */}
          {symptoms.length > 0 ? (
            <div style={{ ...card, padding: "1.75rem 2rem" }}>
              <h2 style={{ fontWeight: 700, fontSize: "1.05rem", color: "#1a2e2b", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="material-symbols-outlined" style={{ color: "#00796b", fontSize: "1.2rem" }}>list_alt</span>
                Recent logs
                <span style={{ background: "#e0f2f1", color: "#00796b", borderRadius: "20px", padding: "2px 10px", fontSize: "0.78rem", fontWeight: 700 }}>
                  {symptoms.length}
                </span>
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {symptoms.map((log) => {
                  const sc = severityColor(log.severity);
                  return (
                    <div key={log.id} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "1rem 1.25rem", borderRadius: "14px",
                      background: "#f8fafb", border: "1px solid #ecf0f1",
                      transition: "border-color 0.15s",
                    }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "#b2dfdb"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "#ecf0f1"}
                    >
                      {/* Left */}
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: "12px",
                          background: sc.bg, display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "1.1rem", color: sc.color }}>
                            {log.severity <= 3 ? "sentiment_satisfied" : log.severity <= 6 ? "sentiment_neutral" : "sentiment_very_dissatisfied"}
                          </span>
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: "0.95rem", color: "#263238" }}>{log.symptom_name}</p>
                          <p style={{ margin: 0, fontSize: "0.78rem", color: "#90a4ae", marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                            <span className="material-symbols-outlined" style={{ fontSize: "0.9rem" }}>calendar_today</span>
                            {new Date(log.logged_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                          </p>
                        </div>
                      </div>

                      {/* Right */}
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{
                          padding: "4px 14px", borderRadius: "20px",
                          background: sc.bg, color: sc.color,
                          fontSize: "0.8rem", fontWeight: 700,
                        }}>
                          {severityLabel(log.severity)} · {log.severity}/10
                        </span>
                        <button
                          onClick={() => handleDelete(log.id)}
                          disabled={deletingId === log.id}
                          style={{
                            width: 34, height: 34, borderRadius: "10px",
                            background: "rgba(239,68,68,0.08)", border: "none",
                            color: "#ef4444", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.16)"}
                          onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
                        >
                          {deletingId === log.id
                            ? <span className="spinner-border spinner-border-sm" role="status" style={{ width: "14px", height: "14px", borderWidth: "2px" }} />
                            : <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>delete</span>
                          }
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : !showForm && (
            /* ── Empty state ── */
            <div style={{ ...card, padding: "4rem 2rem", textAlign: "center" }}>
              <div style={{
                width: 72, height: 72, borderRadius: "20px",
                background: "#e0f2f1", display: "flex", alignItems: "center",
                justifyContent: "center", margin: "0 auto 1.25rem",
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: "2.2rem", color: "#00796b" }}>monitor_heart</span>
              </div>
              <h3 style={{ fontWeight: 700, fontSize: "1.15rem", color: "#1a2e2b", margin: "0 0 8px" }}>No symptoms logged yet</h3>
              <p style={{ color: "#90a4ae", fontSize: "0.9rem", maxWidth: "280px", margin: "0 auto 1.5rem" }}>
                Start tracking your symptoms to visualize health trends over time.
              </p>
              <button
                onClick={() => setShowForm(true)}
                style={{
                  background: "#00796b", color: "#fff", border: "none",
                  borderRadius: "12px", padding: "0.75rem 1.75rem",
                  fontWeight: 700, fontSize: "0.9rem", cursor: "pointer",
                  display: "inline-flex", alignItems: "center", gap: "8px",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>add</span>
                Log your first symptom
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}