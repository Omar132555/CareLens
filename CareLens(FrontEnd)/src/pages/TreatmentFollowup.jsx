import { useEffect, useState, useContext } from "react";
import NotificationToast from "../components/NotificationToast.jsx";
import prepareRequest from "../services/RequestService";
import axios from "axios";
import { AuthContext } from "../components/AuthContext";
import NavBar from "../components/navBar";

/* ── helpers ─────────────────────────────────────────────────── */
const token = () => prepareRequest();
const hdr = () => ({ "X-XSRF-TOKEN": decodeURIComponent(token()) });

export default function TreatmentFollowup() {
  const { user } = useContext(AuthContext);
  const isDoctor = user?.role === "doctor";

  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [logs, setLogs] = useState([]);
  const [dailyLog, setDailyLog] = useState({ compliance: "yes", symptomScore: 5, notes: "" });
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);

  /* doctor-only modal state */
  const [showCreate, setShowCreate] = useState(false);
  const [newPlan, setNewPlan] = useState({ title: "", instructions: "", patient_email: "", start_date: "", end_date: "", medications: [{ name: "", dosage: "", timing: "" }] });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 4200);
    return () => clearTimeout(t);
  }, [notification]);

  const fetchPlans = async () => {
    try {
      const res = await axios.get("/api/treatment-plans", { headers: hdr() });
      setPlans(res.data || []);
    } catch {
      setNotification({ type: "error", title: "Error", message: "Could not load treatment plans." });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchPlans(); }, []);

  const loadLogs = async (plan) => {
    setSelectedPlan(plan);
    if (!isDoctor) return;
    setLogsLoading(true);
    try {
      const res = await axios.get(`/api/treatment-plans/${plan.id}/logs`, { headers: hdr() });
      setLogs(res.data || []);
    } catch { setLogs([]); }
    finally { setLogsLoading(false); }
  };

  const handleSubmitLog = async (e) => {
    e.preventDefault();
    if (!selectedPlan) return;
    try {
      await axios.post(`/api/treatment-plans/${selectedPlan.id}/log`,
        { compliance: dailyLog.compliance, symptom_score: dailyLog.symptomScore, notes: dailyLog.notes },
        { headers: hdr() });
      setNotification({ type: "success", title: "Log Submitted", message: "Daily log saved successfully." });
      setDailyLog({ compliance: "yes", symptomScore: 5, notes: "" });
    } catch (err) {
      setNotification({ type: "error", title: "Failed", message: err.response?.data?.message || "Failed to submit log." });
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await axios.post("/api/treatment-plans", { ...newPlan }, { headers: hdr() });
      setPlans((p) => [res.data, ...p]);
      setShowCreate(false);
      setNewPlan({ title: "", instructions: "", patient_email: "", start_date: "", end_date: "", medications: [{ name: "", dosage: "", timing: "" }] });
      setNotification({ type: "success", title: "Plan Created", message: "Treatment plan created successfully." });
    } catch (err) {
      setNotification({ type: "error", title: "Error", message: err.response?.data?.message || "Failed to create plan." });
    } finally { setCreating(false); }
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm("Delete this treatment plan?")) return;
    try {
      await axios.delete(`/api/treatment-plans/${id}`, { headers: hdr() });
      setPlans((p) => p.filter((pl) => pl.id !== id));
      if (selectedPlan?.id === id) { setSelectedPlan(null); setLogs([]); }
      setNotification({ type: "success", title: "Deleted", message: "Treatment plan removed." });
    } catch {
      setNotification({ type: "error", title: "Error", message: "Failed to delete." });
    }
  };

  const addMedRow = () => setNewPlan((p) => ({ ...p, medications: [...p.medications, { name: "", dosage: "", timing: "" }] }));
  const removeMedRow = (i) => setNewPlan((p) => ({ ...p, medications: p.medications.filter((_, idx) => idx !== i) }));
  const updateMed = (i, field, val) => setNewPlan((p) => {
    const meds = [...p.medications];
    meds[i] = { ...meds[i], [field]: val };
    return { ...p, medications: meds };
  });

  if (loading) return (
    <div className="cl-body">
      <NavBar scrolled={false} />
      <div className="d-flex align-items-center justify-content-center vh-100">
        <div className="spinner-border text-primary-custom" role="status" />
      </div>
    </div>
  );

  const fieldStyle = { width: "100%", padding: "0.65rem 0.9rem", border: "1.5px solid #e0e8e7", borderRadius: "10px", fontSize: "0.88rem", fontFamily: "'Inter',sans-serif", outline: "none", boxSizing: "border-box" };
  const labelStyle = { display: "block", fontWeight: 600, fontSize: "0.82rem", marginBottom: "0.35rem", color: "#263238" };

  return (
    <div className="cl-body">
      <NavBar scrolled={false} />
      <div className="container-lg py-5" style={{ marginTop: "80px" }}>
        <NotificationToast open={!!notification} notification={notification} onClose={() => setNotification(null)} />

        {/* Header */}
        <div className="row mb-4 align-items-center">
          <div className="col">
            <h1 className="text-charcoal fw-bold mb-1">
              {isDoctor ? "Treatment Plans" : "Treatment Follow-up"}
            </h1>
            <p className="text-secondary-custom mb-0">
              {isDoctor ? "Create and manage structured treatment plans for your patients." : "Track your daily compliance and symptoms."}
            </p>
          </div>
          {isDoctor && (
            <div className="col-auto">
              <button id="btn-create-plan" onClick={() => setShowCreate(true)}
                className="btn fw-bold text-white d-flex align-items-center gap-2"
                style={{ background: "#00796b", borderRadius: "10px", padding: "0.65rem 1.25rem" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>add</span>
                Create Plan
              </button>
            </div>
          )}
        </div>

        {plans.length === 0 ? (
          <div className="cl-card">
            <div className="cl-card-content text-center py-5">
              <span className="material-symbols-outlined text-secondary-custom" style={{ fontSize: "3rem", display: "block", marginBottom: "1rem" }}>assignment</span>
              <p className="text-secondary-custom mb-0">
                {isDoctor ? "No treatment plans yet. Create one to get started." : "No active treatment plans. Contact your doctor to create one."}
              </p>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {/* Plan List */}
            <div className="col-md-4">
              <div className="cl-card">
                <div className="cl-card-content">
                  <h3 className="text-sm fw-bold mb-3">{isDoctor ? "Your Plans" : "Active Plans"}</h3>
                  <div className="d-flex flex-column gap-2">
                    {plans.map((plan) => (
                      <div key={plan.id}
                        className={`p-3 rounded-3 border transition-all ${selectedPlan?.id === plan.id ? "border-primary-custom bg-secondary-custom" : "border-custom bg-white"}`}
                        style={{ cursor: "pointer" }}
                        onClick={() => loadLogs(plan)}>
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <p className="fw-bold text-sm mb-1">{plan.title}</p>
                            <p className="text-xs text-secondary-custom mb-0">
                              {isDoctor ? `Patient: ${plan.patient_name || "—"}` : `By Dr. ${plan.doctor_name}`}
                            </p>
                          </div>
                          {isDoctor && (
                            <button onClick={(e) => { e.stopPropagation(); handleDeletePlan(plan.id); }}
                              style={{ border: "none", background: "none", color: "#ef4444", cursor: "pointer", padding: 0 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Detail Panel */}
            <div className="col-md-8">
              {!selectedPlan ? (
                <div className="cl-card"><div className="cl-card-content text-center py-5"><p className="text-secondary-custom">Select a plan to view details.</p></div></div>
              ) : isDoctor ? (
                /* Doctor view: logs + adherence */
                <div className="cl-card">
                  <div className="cl-card-content">
                    <h3 className="fw-bold mb-1" style={{ fontSize: "1.1rem" }}>{selectedPlan.title}</h3>
                    <p className="text-secondary-custom text-sm mb-4">{selectedPlan.instructions}</p>

                    <h5 className="fw-bold mb-3" style={{ fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "#546e7a" }}>Patient Compliance Logs</h5>
                    {logsLoading ? (
                      <div className="text-center py-3"><div className="spinner-border spinner-border-sm text-primary-custom" /></div>
                    ) : logs.length === 0 ? (
                      <p className="text-secondary-custom text-sm">No logs submitted yet.</p>
                    ) : (
                      <div className="d-flex flex-column gap-3">
                        {logs.map((log) => (
                          <div key={log.id} className="p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="fw-bold text-sm">{new Date(log.created_at).toLocaleDateString()}</span>
                              <span className={`badge rounded-pill fw-bold`}
                                style={{ background: log.compliance === "yes" ? "#d1fae5" : log.compliance === "partial" ? "#fef9c3" : "#fee2e2", color: log.compliance === "yes" ? "#065f46" : log.compliance === "partial" ? "#854d0e" : "#991b1b", fontSize: "0.7rem", padding: "4px 8px" }}>
                                {log.compliance === "yes" ? "✓ Compliant" : log.compliance === "partial" ? "~ Partial" : "✗ Missed"}
                              </span>
                            </div>
                            <div className="d-flex gap-4">
                              <div>
                                <span className="text-xs text-secondary-custom">Symptom Score</span>
                                <div className="fw-bold">{log.symptom_score ?? log.symptomScore}/10</div>
                              </div>
                              {log.notes && <div><span className="text-xs text-secondary-custom">Notes</span><div className="text-sm">{log.notes}</div></div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Patient view: log form */
                <div className="cl-card">
                  <div className="cl-card-content">
                    <h3 className="text-sm fw-bold mb-4">{selectedPlan.title}</h3>

                    {selectedPlan.medications?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-secondary-custom fw-bold mb-2">MEDICATIONS</p>
                        {selectedPlan.medications.map((med, idx) => (
                          <div key={idx} className="p-3 mb-2 rounded-3" style={{ background: "#f0f9f8" }}>
                            <p className="fw-bold text-sm mb-1">{med.name}</p>
                            <p className="text-xs text-secondary-custom">{med.dosage} • {med.timing}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <form onSubmit={handleSubmitLog}>
                      <div className="cl-field">
                        <label className="cl-field-label">Did you take your medications today?</label>
                        <select className="cl-input" value={dailyLog.compliance}
                          onChange={(e) => setDailyLog({ ...dailyLog, compliance: e.target.value })}>
                          <option value="yes">Yes, all on time</option>
                          <option value="partial">Partial compliance</option>
                          <option value="no">No, missed doses</option>
                        </select>
                      </div>
                      <div className="cl-field">
                        <label className="cl-field-label">Symptom severity (1-10)</label>
                        <input type="range" min="1" max="10" className="w-100"
                          value={dailyLog.symptomScore}
                          onChange={(e) => setDailyLog({ ...dailyLog, symptomScore: parseInt(e.target.value) })} />
                        <p className="text-center text-secondary-custom text-sm mt-2">Score: {dailyLog.symptomScore}/10</p>
                      </div>
                      <div className="cl-field">
                        <label className="cl-field-label">Additional notes</label>
                        <textarea className="cl-input" rows="4" placeholder="How are you feeling? Any side effects?"
                          value={dailyLog.notes}
                          onChange={(e) => setDailyLog({ ...dailyLog, notes: e.target.value })} />
                      </div>
                      <button className="cl-btn-submit mt-4" type="submit">
                        Submit Daily Log <span className="cl-arrow">→</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Create Plan Modal (doctor only) ───────────────────── */}
        {showCreate && (
          <>
            <div onClick={() => setShowCreate(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1040, backdropFilter: "blur(4px)" }} />
            <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 1050, background: "#fff", borderRadius: "20px", boxShadow: "0 24px 64px rgba(0,0,0,0.18)", width: "min(96vw,600px)", maxHeight: "90vh", overflowY: "auto", padding: "2rem", fontFamily: "'Inter',sans-serif" }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 style={{ margin: 0, fontWeight: 800, fontSize: "1.3rem", color: "#0b1c30" }}>Create Treatment Plan</h2>
                <button onClick={() => setShowCreate(false)} style={{ border: "none", background: "#f1f5f9", borderRadius: "10px", width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "1.1rem", color: "#546e7a" }}>close</span>
                </button>
              </div>

              <form onSubmit={handleCreatePlan} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div><label style={labelStyle}>Plan Title *</label>
                  <input id="plan-title" style={fieldStyle} value={newPlan.title} onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })} placeholder="e.g. Hypertension Management" required /></div>

                <div><label style={labelStyle}>Patient Email *</label>
                  <input id="plan-patient-email" type="email" style={fieldStyle} value={newPlan.patient_email} onChange={(e) => setNewPlan({ ...newPlan, patient_email: e.target.value })} placeholder="patient@email.com" required /></div>

                <div className="row g-3">
                  <div className="col"><label style={labelStyle}>Start Date</label>
                    <input type="date" style={fieldStyle} value={newPlan.start_date} onChange={(e) => setNewPlan({ ...newPlan, start_date: e.target.value })} /></div>
                  <div className="col"><label style={labelStyle}>End Date</label>
                    <input type="date" style={fieldStyle} value={newPlan.end_date} onChange={(e) => setNewPlan({ ...newPlan, end_date: e.target.value })} /></div>
                </div>

                <div><label style={labelStyle}>Instructions</label>
                  <textarea style={{ ...fieldStyle, resize: "vertical" }} rows={3} value={newPlan.instructions} onChange={(e) => setNewPlan({ ...newPlan, instructions: e.target.value })} placeholder="General instructions for the patient…" /></div>

                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Medications</label>
                    <button type="button" onClick={addMedRow} style={{ border: "none", background: "none", color: "#00796b", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>+ Add Row</button>
                  </div>
                  {newPlan.medications.map((med, i) => (
                    <div key={i} className="d-flex gap-2 mb-2 align-items-center">
                      <input style={{ ...fieldStyle, flex: 2 }} placeholder="Name" value={med.name} onChange={(e) => updateMed(i, "name", e.target.value)} />
                      <input style={{ ...fieldStyle, flex: 1 }} placeholder="Dosage" value={med.dosage} onChange={(e) => updateMed(i, "dosage", e.target.value)} />
                      <input style={{ ...fieldStyle, flex: 1 }} placeholder="Timing" value={med.timing} onChange={(e) => updateMed(i, "timing", e.target.value)} />
                      {newPlan.medications.length > 1 && (
                        <button type="button" onClick={() => removeMedRow(i)} style={{ border: "none", background: "none", color: "#ef4444", cursor: "pointer" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>close</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="d-flex gap-3 justify-content-end mt-2">
                  <button type="button" onClick={() => setShowCreate(false)} style={{ padding: "0.7rem 1.5rem", borderRadius: "10px", border: "1.5px solid #e0e8e7", background: "transparent", fontWeight: 700, cursor: "pointer", color: "#546e7a" }}>Cancel</button>
                  <button id="btn-submit-plan" type="submit" disabled={creating} style={{ padding: "0.7rem 1.5rem", borderRadius: "10px", border: "none", background: creating ? "#94a3b8" : "#00796b", color: "#fff", fontWeight: 700, cursor: creating ? "not-allowed" : "pointer" }}>
                    {creating ? "Creating…" : "Create Plan"}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
