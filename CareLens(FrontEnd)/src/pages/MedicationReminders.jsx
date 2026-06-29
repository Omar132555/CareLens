import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../components/AuthContext";
import NavBar from "../components/navBar";
import Scroll from "../hooks/Scroll";
import prepareRequest from "../services/RequestService";
import NotificationToast from "../components/NotificationToast";

export default function MedicationReminders() {
  const navigate = useNavigate();
  const scrolled = Scroll();
  const { user, setUser, loading } = useContext(AuthContext);
  const [medications, setMedications] = useState([]);
  const [showForm, setShowForm]       = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({ name: "", dosage: "", schedule_time: "" });

  /* normalise backend field medication_name → name */
  const normalizeMed = (m) => ({ ...m, name: m.medication_name ?? m.name });

  /* ── Browser push notifications ── */
  const checkAndNotify = (meds) => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    meds.forEach((med) => {
      if (med.schedule_time === currentTime && "Notification" in window && Notification.permission === "granted") {
        new Notification("Medication Reminder", {
          body: `Time to take ${med.name} - ${med.dosage}`,
          icon: "../../public/CareLensImage.png",
          tag: `med-${med.id}`,
          requireInteraction: true,
        });
      }
    });
  };
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
    }
    const channel = window.Echo.private(`medications.${user.id}`)

        channel.listen(".medication.due", (e) => {
            if (Notification.permission === "granted") {
                new Notification("Medication Reminder", {
                    body: `Dosage Time For ${e.medName}, Dosage is: ${e.dosage}`,
                    icon: "/CareLensImage.png",
                    tag: `med-${e.medId}`,
                    requireInteraction: true,
                });
            }

            setNotification({
                type: "info",
                title: "Medication Reminder",
                message: `Time to take ${e.medName} - ${e.dosage}`
            });
        });

    return () => window.Echo.disconnect();
}, []);
  /* ── GET /api/medications ── */
  const fetchMedications = async () => {
    try {
      const token = prepareRequest();
      const response = await axios.get("/api/medications", {
        headers: { "X-XSRF-TOKEN": decodeURIComponent(token) },
      });
      const normalized = (response.data || []).map(normalizeMed);
      setMedications(normalized);
      checkAndNotify(normalized);
    } catch {
      setNotification({ type: "error", title: "Load Failed", message: "Could not load your medications" });
    } finally {
      setLoading(false);
    }
  };

  /* ── POST / PUT ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = prepareRequest();
      if (editingId) {
        await axios.put(`/api/medications/${editingId}`, formData, {
          headers: { "X-XSRF-TOKEN": decodeURIComponent(token) },
        });
        setNotification({ type: "success", title: "Updated", message: "Medication updated successfully" });
      } else {
        await axios.post("/api/medications", formData, {
          headers: { "X-XSRF-TOKEN": decodeURIComponent(token) },
        });
        setNotification({ type: "success", title: "Added", message: "Medication reminder added successfully" });
      }
      setFormData({ name: "", dosage: "", schedule_time: "" });
      setShowForm(false);
      setEditingId(null);
      fetchMedications();
    } catch {
      setNotification({ type: "error", title: "Error", message: "Failed to save medication" });
    }
  };

  /* ── DELETE ── */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this medication?")) return;
    try {
      const token = prepareRequest();
      await axios.delete(`/api/medications/${id}`, {
        headers: { "X-XSRF-TOKEN": decodeURIComponent(token) },
      });
      setNotification({ type: "success", title: "Deleted", message: "Medication reminder deleted" });
      fetchMedications();
    } catch {
      setNotification({ type: "error", title: "Delete Failed", message: "Could not delete medication" });
    }
  };

  /* ── Edit helpers ── */
  const handleEdit = (med) => {
    setFormData({ name: med.name, dosage: med.dosage, schedule_time: med.schedule_time });
    setEditingId(med.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({ name: "", dosage: "", schedule_time: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const sidebarItems = [
    { key: "dashboard",   label: "Dashboard",       icon: "dashboard",     path: "/patient-dashboard" },
    { key: "doctors",     label: "Doctors",          icon: "stethoscope",   path: "/doctors"           },
    { key: "medications", label: "Medications",      icon: "pill",          path: "/medications"       },
    { key: "symptoms",    label: "Symptom Tracker",  icon: "query_stats",   path: "/symptoms"          },
    { key: "articles",    label: "Blogs",            icon: "library_books", path: "/articles"          },
  ];

  useEffect(() => { fetchMedications(); }, []);

  /* ── Loading ── */
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <NavBar scrolled={scrolled} />
      <div className="text-center">
        <div className="spinner-border mb-3" style={{ color: "var(--primary)" }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p style={{ color: "var(--primary)", fontWeight: 600, margin: 0 }}>Loading medications…</p>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */
  return (
    <div style={{ minHeight: "100vh", background: "var(--surface)" }}>

      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="mb-4">
          <span className="sidebar-brand">CareLens</span>
        </div>
        <nav className="d-flex flex-column gap-1 flex-grow-1">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              id={`sidebar-${item.key}`}
              type="button"
              className={`nav-link-item border-0${item.key === "medications" ? " active" : ""}`}
              style={{ background: "transparent" }}
              onClick={() => navigate(item.path)}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <NavBar scrolled={scrolled} />

      {/* ── Main ── */}
      <main style={{ marginLeft: "280px", marginTop: "80px", padding: "2rem" }}>
        <div className="container-lg">

          <NotificationToast
            open={!!notification}
            notification={notification}
            onClose={() => setNotification(null)}
          />

          {/* ── Page header ── */}
          <div
            className="cl-card d-flex justify-content-between align-items-center mb-4 p-4"
            style={{ gap: "1rem", flexWrap: "wrap" }}
          >
            <div>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--primary)", marginBottom: "0.25rem" }}>
                Medication Reminders
              </h1>
              <p style={{ color: "var(--text-sec)", margin: 0, fontSize: "0.95rem" }}>
                Manage your medications and set daily reminders
              </p>
            </div>
            <button
              onClick={() => setShowForm((v) => !v)}
              className="cl-btn-submit"
              style={{ width: "auto", padding: "0.75rem 1.5rem", borderRadius: "12px", marginTop: 0 }}
            >
              <span className="material-symbols-outlined">add</span>
              Add Medication
            </button>
          </div>

          {/* ── Add / Edit form ── */}
          {showForm && (
            <div className="cl-card cl-glass p-4 mb-4">
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--primary)", marginBottom: "1.5rem" }}>
                {editingId ? "Edit Medication" : "New Medication Reminder"}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="row g-3">

                  {/* Name */}
                  <div className="col-12 col-md-4">
                    <div className="cl-field">
                      <label className="cl-field-label">Medication Name</label>
                      <div className="cl-input-wrap">
                        <div className="cl-input-icon">
                          <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>medication</span>
                        </div>
                        <input
                          type="text"
                          className="cl-input"
                          placeholder="e.g., Aspirin"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dosage */}
                  <div className="col-12 col-md-4">
                    <div className="cl-field">
                      <label className="cl-field-label">Dosage</label>
                      <div className="cl-input-wrap">
                        <div className="cl-input-icon">
                          <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>medical_information</span>
                        </div>
                        <input
                          type="text"
                          className="cl-input"
                          placeholder="e.g., 500mg"
                          value={formData.dosage}
                          onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="col-12 col-md-4">
                    <div className="cl-field">
                      <label className="cl-field-label">Reminder Time</label>
                      <div className="cl-input-wrap">
                        <div className="cl-input-icon">
                          <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>schedule</span>
                        </div>
                        <input
                          type="time"
                          className="cl-input"
                          value={formData.schedule_time}
                          onChange={(e) => setFormData({ ...formData, schedule_time: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form actions */}
                <div className="d-flex gap-3 mt-2">
                  <button
                    type="submit"
                    className="cl-btn-submit"
                    style={{ width: "auto", padding: "0.75rem 2rem", borderRadius: "12px", marginTop: 0 }}
                  >
                    {editingId ? "Update" : "Add"} Medication
                    <span className="cl-arrow">→</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    style={{
                      padding: "0.75rem 1.5rem", borderRadius: "12px", fontWeight: 700,
                      background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.1)",
                      color: "var(--text-sec)", cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── Medication cards ── */}
          {medications.length > 0 ? (
            <div className="row g-4">
              {medications.map((med) => (
                <div key={med.id} className="col-12 col-md-6 col-lg-4">
                  <div className="cl-card cl-feat-card cl-glass p-4 h-100 d-flex flex-column">

                    {/* Card header */}
                    <div className="d-flex align-items-start justify-content-between mb-3">
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--charcoal)", marginBottom: "0.2rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {med.name}
                        </h3>
                        <p style={{ fontSize: "0.875rem", color: "var(--text-sec)", margin: 0 }}>
                          {med.dosage}
                        </p>
                      </div>
                      <div
                        className="cl-card-icon"
                        style={{ width: 44, height: 44, flexShrink: 0, background: "rgba(0,121,107,0.1)", marginLeft: "0.75rem" }}
                      >
                        <span className="material-symbols-outlined text-primary-custom">medication</span>
                      </div>
                    </div>

                    {/* Schedule time */}
                    <div
                      className="d-flex align-items-center gap-2 p-2 mb-3 rounded-3"
                      style={{ background: "#f0fdfa", border: "1px solid var(--border)" }}
                    >
                      <span className="material-symbols-outlined text-primary-custom" style={{ fontSize: "1.1rem" }}>schedule</span>
                      <span style={{ fontWeight: 700, color: "var(--charcoal)", fontSize: "0.875rem" }}>
                        {med.schedule_time}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="mt-auto d-flex gap-2">
                      <button
                        onClick={() => handleEdit(med)}
                        className="btn btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1 p-2 rounded-3"
                        style={{ background: "rgba(0,121,107,0.1)", color: "var(--primary)", border: "none", fontWeight: 700 }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>edit</span>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(med.id)}
                        className="cl-btn-alert btn-sm flex-grow-1"
                        style={{ borderRadius: "8px", padding: "0.4rem 0.75rem" }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>delete</span>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (

            /* ── Empty state ── */
            <div className="cl-card p-5 text-center d-flex flex-column align-items-center">
              <div
                className="cl-card-icon mb-4"
                style={{ width: 72, height: 72, background: "rgba(0,121,107,0.1)" }}
              >
                <span className="material-symbols-outlined text-primary-custom" style={{ fontSize: "2rem" }}>
                  medications
                </span>
              </div>
              <h3 style={{ fontWeight: 700, color: "var(--charcoal)", marginBottom: "0.5rem" }}>
                No medications yet
              </h3>
              <p style={{ color: "var(--text-sec)", marginBottom: "1.5rem" }}>
                Add your first medication reminder to get started
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="cl-btn-submit"
                style={{ width: "auto", padding: "0.75rem 1.5rem", borderRadius: "12px", marginTop: 0 }}
              >
                Add Your First Medication
                <span className="cl-arrow">→</span>
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}