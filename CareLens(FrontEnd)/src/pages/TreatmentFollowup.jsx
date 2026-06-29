import { useEffect, useState, useContext } from "react";
import NotificationToast from "../components/NotificationToast.jsx";
import prepareRequest from "../services/RequestService";
import axios from "axios";
import { AuthContext } from "../components/AuthContext";
import NavBar from "../components/navBar";

const token = () => prepareRequest();
const hdr = () => ({ "X-XSRF-TOKEN": decodeURIComponent(token()) });

export default function TreatmentFollowup() {
  const { user } = useContext(AuthContext);
  const isDoctor = user?.role === "doctor";

  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  /* Create modal */
  const [showCreate, setShowCreate] = useState(false);
  const [newPlan, setNewPlan] = useState({
    title: "", instructions: "", patient_id: "",
    start_date: "", end_date: "",
    medications: [{ name: "", dosage: "", timing: "" }],
  });
  const [creating, setCreating] = useState(false);
  const [doctorPatients, setDoctorPatients] = useState([]);

  /* Edit modal — PUT /doctor/treatment-plans/{id} */
  const [showEdit, setShowEdit] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 4200);
    return () => clearTimeout(t);
  }, [notification]);

  /* ── GET /treatment-plans ── */
  const fetchPlans = async () => {
    try {
      const res = await axios.get("/api/treatment-plans", { headers: hdr() });
      setPlans(res.data || []);
    } catch {
      setNotification({ type: "error", title: "Error", message: "Could not load treatment plans." });
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    if (!isDoctor) return;
    try {
      const res = await axios.get("/api/doctor/patients", { headers: hdr() });
      setDoctorPatients(res.data || []);
    } catch (e) {
      console.error("Could not load patients", e);
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchPatients();
  }, [isDoctor]);

  /* ── GET /treatment-plans/{id} ── */
  const loadPlanDetail = async (plan) => {
    setPlanLoading(true);
    setSelectedPlan(plan);
    try {
      const detailRes = await axios.get(`/api/treatment-plans/${plan.id}`, { headers: hdr() });
      setSelectedPlan(detailRes.data);
    } catch {
      setNotification({ type: "error", title: "Error", message: "Could not load plan details." });
    } finally {
      setPlanLoading(false);
    }
  };

  /* ── POST /doctor/treatment-plans ── */
  const handleCreatePlan = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await axios.post("/api/doctor/treatment-plans", { ...newPlan }, { headers: hdr() });
      setPlans((p) => [res.data, ...p]);
      setShowCreate(false);
      setNewPlan({ title: "", instructions: "", patient_id: "", start_date: "", end_date: "", medications: [{ name: "", dosage: "", timing: "" }] });
      setNotification({ type: "success", title: "Plan Created", message: "Treatment plan created successfully." });
    } catch (err) {
      setNotification({ type: "error", title: "Error", message: err.response?.data?.message || "Failed to create plan." });
    } finally {
      setCreating(false);
    }
  };

  /* ── PUT /doctor/treatment-plans/{id} ── */
  const openEdit = (plan) => {
    setEditPlan({
      id: plan.id,
      title: plan.title || "",
      instructions: plan.instructions || "",
      start_date: plan.start_date || "",
      end_date: plan.end_date || "",
      medications: plan.medications?.length
        ? plan.medications.map((m) => ({ name: m.name || "", dosage: m.dosage || "", timing: m.timing || "" }))
        : [{ name: "", dosage: "", timing: "" }],
    });
    setShowEdit(true);
  };

  const handleUpdatePlan = async (e) => {
    e.preventDefault();
    setEditing(true);
    try {
      const res = await axios.put(
        `/api/doctor/treatment-plans/${editPlan.id}`,
        { title: editPlan.title, instructions: editPlan.instructions, start_date: editPlan.start_date, end_date: editPlan.end_date, medications: editPlan.medications },
        { headers: hdr() }
      );
      setPlans((p) => p.map((pl) => (pl.id === editPlan.id ? { ...pl, ...res.data } : pl)));
      if (selectedPlan?.id === editPlan.id) setSelectedPlan((prev) => ({ ...prev, ...res.data }));
      setShowEdit(false);
      setEditPlan(null);
      setNotification({ type: "success", title: "Plan Updated", message: "Treatment plan saved." });
    } catch (err) {
      setNotification({ type: "error", title: "Error", message: err.response?.data?.message || "Failed to update plan." });
    } finally {
      setEditing(false);
    }
  };

  const addEditMedRow = () =>
    setEditPlan((p) => ({ ...p, medications: [...p.medications, { name: "", dosage: "", timing: "" }] }));

  const removeEditMedRow = (i) =>
    setEditPlan((p) => ({ ...p, medications: p.medications.filter((_, idx) => idx !== i) }));

  const updateEditMed = (i, field, val) =>
    setEditPlan((p) => {
      const meds = [...p.medications];
      meds[i] = { ...meds[i], [field]: val };
      return { ...p, medications: meds };
    });

  /* ── DELETE /doctor/treatment-plans/{id} ── */
  const handleDeletePlan = async (id) => {
    if (!window.confirm("Delete this treatment plan?")) return;
    try {
      await axios.delete(`/api/doctor/treatment-plans/${id}`, { headers: hdr() });
      setPlans((p) => p.filter((pl) => pl.id !== id));
      if (selectedPlan?.id === id) setSelectedPlan(null);
      setNotification({ type: "success", title: "Deleted", message: "Treatment plan removed." });
    } catch {
      setNotification({ type: "error", title: "Error", message: "Failed to delete." });
    }
  };

  /* ── Helpers ── */
  const addMedRow = () =>
    setNewPlan((p) => ({ ...p, medications: [...p.medications, { name: "", dosage: "", timing: "" }] }));
  const removeMedRow = (i) =>
    setNewPlan((p) => ({ ...p, medications: p.medications.filter((_, idx) => idx !== i) }));
  const updateMed = (i, field, val) =>
    setNewPlan((p) => {
      const meds = [...p.medications];
      meds[i] = { ...meds[i], [field]: val };
      return { ...p, medications: meds };
    });

  /* ── Medication form block (reused in create & edit modals) ── */
  const MedRows = ({ meds, onAdd, onRemove, onUpdate }) => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <label style={{ ...s.fieldLabel, marginBottom: 0 }}>Medications</label>
        <button type="button" onClick={onAdd} style={s.addRowBtn}>+ Add row</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {meds.map((med, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 8, alignItems: "center" }}>
            <input style={s.input} placeholder="Drug name"  value={med.name}   onChange={(e) => onUpdate(i, "name",   e.target.value)} />
            <input style={s.input} placeholder="Dosage"     value={med.dosage} onChange={(e) => onUpdate(i, "dosage", e.target.value)} />
            <input style={s.input} placeholder="Timing"     value={med.timing} onChange={(e) => onUpdate(i, "timing", e.target.value)} />
            {meds.length > 1 && (
              <button type="button" onClick={() => onRemove(i)} style={s.removeBtn}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  /* ── Loading screen ── */
  if (loading) return (
    <div style={s.loadingWrap}>
      <NavBar scrolled={false} />
      <div style={s.loadingInner}><div style={s.spinner} /></div>
    </div>
  );

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */
  return (
    <div style={s.page}>
      <NavBar scrolled={false} />
      <NotificationToast open={!!notification} notification={notification} onClose={() => setNotification(null)} />

      <div style={s.pageInner}>

        {/* ── Page header ── */}
        <div style={s.pageHeader}>
          <div>
            <h1 style={s.pageTitle}>
              {isDoctor ? "Treatment Plans" : "My Treatment Follow-up"}
            </h1>
            <p style={s.pageSub}>
              {isDoctor
                ? "Create and manage structured treatment plans for your patients."
                : "View your active treatment plans and prescribed medications."}
            </p>
          </div>
          {isDoctor && (
            <button id="btn-create-plan" style={s.btnPrimary} onClick={() => setShowCreate(true)}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
              Create Plan
            </button>
          )}
        </div>

        {/* ── Empty state ── */}
        {plans.length === 0 ? (
          <div style={s.emptyCard}>
            <span className="material-symbols-outlined" style={{ fontSize: 40, color: "#B2DFDB" }}>assignment</span>
            <p style={s.emptyTitle}>No treatment plans yet</p>
            <p style={s.emptySub}>
              {isDoctor ? "Create a plan to get started." : "Your doctor hasn't added a plan yet."}
            </p>
          </div>
        ) : (
          <div style={s.grid}>

            {/* ── Plan list ── */}
            <div style={s.panel}>
              <div style={s.panelHead}>
                <span style={s.panelTitle}>{isDoctor ? "All Plans" : "Active Plans"}</span>
                <span style={s.planCount}>{plans.length}</span>
              </div>
              <div style={s.planList}>
                {plans.map((plan) => {
                  const active = selectedPlan?.id === plan.id;
                  return (
                    <div
                      key={plan.id}
                      style={{ ...s.planItem, ...(active ? s.planItemActive : {}) }}
                      onClick={() => loadPlanDetail(plan)}
                    >
                      <div style={s.planItemRow}>
                        <div style={{ flex: 1 }}>
                          <p style={s.planName}>{plan.title}</p>
                          <p style={s.planMeta}>
                            <span className="material-symbols-outlined" style={{ fontSize: 13, verticalAlign: "middle" }}>
                              {isDoctor ? "person" : "stethoscope"}
                            </span>{" "}
                            {isDoctor ? (plan.patient_name || "—") : `Dr. ${plan.doctor_name}`}
                          </p>
                        </div>
                        {isDoctor && (
                          <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                            <button
                              style={s.iconBtn}
                              title="Edit plan"
                              onClick={(e) => { e.stopPropagation(); loadPlanDetail(plan).then(() => openEdit(plan)); }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                            </button>
                            <button
                              style={{ ...s.iconBtn, ...s.iconBtnDanger }}
                              title="Delete plan"
                              onClick={(e) => { e.stopPropagation(); handleDeletePlan(plan.id); }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Detail panel ── */}
            <div style={s.panel}>
              {!selectedPlan ? (
                <div style={s.emptyDetail}>
                  <span className="material-symbols-outlined" style={{ fontSize: 36, color: "#B2DFDB" }}>ads_click</span>
                  <p style={s.emptyDetailText}>Select a plan to view details</p>
                </div>
              ) : planLoading ? (
                <div style={{ ...s.emptyDetail }}>
                  <div style={s.spinner} />
                </div>
              ) : isDoctor ? (

                /* ══ Doctor: plan detail ══ */
                <div>
                  <div style={s.detailHead}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                      <h2 style={s.detailTitle}>{selectedPlan.title}</h2>
                      <button style={s.btnOutline} onClick={() => openEdit(selectedPlan)}>
                        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>edit</span>
                        Edit Plan
                      </button>
                    </div>
                    {selectedPlan.patient_name && (
                      <span style={s.detailBadge}>
                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>person</span>
                        {selectedPlan.patient_name}
                      </span>
                    )}
                  </div>

                  <div style={s.detailBody}>
                    <div style={s.instructionsBox}>
                      <p style={s.sectionLabel}>Instructions</p>
                      <p style={s.instructionsText}>{selectedPlan.instructions || "No instructions provided."}</p>
                    </div>

                    {selectedPlan.medications?.length > 0 && (
                      <div>
                        <p style={s.sectionLabel}>Medications</p>
                        <div style={s.medsGrid}>
                          {selectedPlan.medications.map((med, idx) => (
                            <div key={idx} style={s.medCard}>
                              <span className="material-symbols-outlined" style={{ fontSize: 22, color: "#00796B", marginBottom: 6 }}>medication</span>
                              <p style={s.medName}>{med.name}</p>
                              <p style={s.medDose}>{med.dosage}</p>
                              <span style={s.medTiming}>{med.timing}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              ) : (

                /* ══ Patient: plan detail ══ */
                <div>
                  <div style={s.detailHead}>
                    <h2 style={s.detailTitle}>{selectedPlan.title}</h2>
                    <span style={s.detailBadge}>
                      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>stethoscope</span>
                      Dr. {selectedPlan.doctor_name}
                    </span>
                  </div>

                  <div style={s.detailBody}>

                    {selectedPlan.medications?.length > 0 && (
                      <div>
                        <p style={s.sectionLabel}>Prescribed Medications</p>
                        <div style={s.medsGrid}>
                          {selectedPlan.medications.map((med, idx) => (
                            <div key={idx} style={s.medCard}>
                              <span className="material-symbols-outlined" style={{ fontSize: 22, color: "#00796B", marginBottom: 6 }}>medication</span>
                              <p style={s.medName}>{med.name}</p>
                              <p style={s.medDose}>{med.dosage}</p>
                              <span style={s.medTiming}>{med.timing}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedPlan.instructions && (
                      <div style={s.instructionsBox}>
                        <p style={s.sectionLabel}>Instructions</p>
                        <p style={s.instructionsText}>{selectedPlan.instructions}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════
          CREATE PLAN MODAL
      ════════════════════════════════════════════ */}
      {showCreate && (
        <>
          <div style={s.backdrop} onClick={() => setShowCreate(false)} />
          <div style={s.modal}>
            <div style={s.modalHead}>
              <div>
                <h2 style={s.modalTitle}>New Treatment Plan</h2>
                <p style={s.modalSub}>Fill in the details below to create a plan.</p>
              </div>
              <button style={s.modalClose} onClick={() => setShowCreate(false)}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
              </button>
            </div>
            <form onSubmit={handleCreatePlan} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={s.fieldLabel}>Plan title</label>
                <input id="plan-title" style={s.input} value={newPlan.title} onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })} placeholder="e.g. Hypertension Management" required />
              </div>
              <div>
                <label style={s.fieldLabel}>Patient</label>
                <select id="plan-patient-id" style={s.input} value={newPlan.patient_id} onChange={(e) => setNewPlan({ ...newPlan, patient_id: e.target.value })} required>
                  <option value="" disabled>Select a patient</option>
                  {doctorPatients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={s.fieldLabel}>Start date</label>
                  <input type="date" style={s.input} value={newPlan.start_date} onChange={(e) => setNewPlan({ ...newPlan, start_date: e.target.value })} />
                </div>
                <div>
                  <label style={s.fieldLabel}>End date</label>
                  <input type="date" style={s.input} value={newPlan.end_date} onChange={(e) => setNewPlan({ ...newPlan, end_date: e.target.value })} />
                </div>
              </div>
              <div>
                <label style={s.fieldLabel}>Instructions</label>
                <textarea style={{ ...s.input, resize: "vertical", minHeight: 80 }} rows={3} value={newPlan.instructions} onChange={(e) => setNewPlan({ ...newPlan, instructions: e.target.value })} placeholder="General instructions for the patient…" />
              </div>
              <MedRows meds={newPlan.medications} onAdd={addMedRow} onRemove={removeMedRow} onUpdate={updateMed} />
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
                <button type="button" onClick={() => setShowCreate(false)} style={s.btnGhost}>Cancel</button>
                <button id="btn-submit-plan" type="submit" disabled={creating} style={{ ...s.btnPrimary, opacity: creating ? 0.6 : 1, cursor: creating ? "not-allowed" : "pointer" }}>
                  {creating ? "Creating…" : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════
          EDIT PLAN MODAL  — PUT /doctor/treatment-plans/{id}
      ════════════════════════════════════════════ */}
      {showEdit && editPlan && (
        <>
          <div style={s.backdrop} onClick={() => setShowEdit(false)} />
          <div style={s.modal}>
            <div style={s.modalHead}>
              <div>
                <h2 style={s.modalTitle}>Edit Treatment Plan</h2>
                <p style={s.modalSub}>Changes are saved to the patient's active plan.</p>
              </div>
              <button style={s.modalClose} onClick={() => setShowEdit(false)}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
              </button>
            </div>
            <form onSubmit={handleUpdatePlan} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={s.fieldLabel}>Plan title</label>
                <input style={s.input} value={editPlan.title} onChange={(e) => setEditPlan({ ...editPlan, title: e.target.value })} placeholder="e.g. Hypertension Management" required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={s.fieldLabel}>Start date</label>
                  <input type="date" style={s.input} value={editPlan.start_date} onChange={(e) => setEditPlan({ ...editPlan, start_date: e.target.value })} />
                </div>
                <div>
                  <label style={s.fieldLabel}>End date</label>
                  <input type="date" style={s.input} value={editPlan.end_date} onChange={(e) => setEditPlan({ ...editPlan, end_date: e.target.value })} />
                </div>
              </div>
              <div>
                <label style={s.fieldLabel}>Instructions</label>
                <textarea style={{ ...s.input, resize: "vertical", minHeight: 80 }} rows={3} value={editPlan.instructions} onChange={(e) => setEditPlan({ ...editPlan, instructions: e.target.value })} placeholder="General instructions for the patient…" />
              </div>
              <MedRows meds={editPlan.medications} onAdd={addEditMedRow} onRemove={removeEditMedRow} onUpdate={updateEditMed} />
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
                <button type="button" onClick={() => setShowEdit(false)} style={s.btnGhost}>Cancel</button>
                <button type="submit" disabled={editing} style={{ ...s.btnPrimary, opacity: editing ? 0.6 : 1, cursor: editing ? "not-allowed" : "pointer" }}>
                  {editing ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   STYLES
════════════════════════════════════════════ */
const s = {
  page: { minHeight: "100vh", background: "#F0F4F3", fontFamily: "'Inter', sans-serif" },
  pageInner: { maxWidth: 1100, margin: "0 auto", padding: "108px 28px 60px", display: "flex", flexDirection: "column", gap: 28 },
  loadingWrap: { minHeight: "100vh", background: "#F0F4F3" },
  loadingInner: { display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" },
  spinner: { width: 36, height: 36, border: "3px solid #B2DFDB", borderTop: "3px solid #00796B", borderRadius: "50%", animation: "spin 0.8s linear infinite" },

  pageHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 },
  pageTitle: { fontSize: 28, fontWeight: 800, color: "#0D1F1D", letterSpacing: "-0.5px", margin: 0 },
  pageSub: { fontSize: 14, color: "#4A6460", marginTop: 4, marginBottom: 0 },

  btnPrimary: { display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", background: "#00796B", color: "#fff", border: "none", borderRadius: 12, fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap" },
  btnOutline: { display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 14px", background: "transparent", color: "#00796B", border: "1.5px solid #00796B", borderRadius: 10, fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap" },
  btnGhost: { padding: "10px 20px", border: "1.5px solid #D6E6E4", background: "transparent", borderRadius: 12, fontSize: 13.5, fontWeight: 600, color: "#4A6460", cursor: "pointer", fontFamily: "'Inter', sans-serif" },

  iconBtn: { background: "none", border: "none", cursor: "pointer", color: "#8AA49F", padding: 5, borderRadius: 7, display: "flex", alignItems: "center" },
  iconBtnDanger: { color: "#B2DFDB" },

  emptyCard: { background: "#fff", border: "1px solid #D6E6E4", borderRadius: 20, padding: "60px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center" },
  emptyTitle: { fontSize: 16, fontWeight: 700, color: "#4A6460", margin: 0 },
  emptySub: { fontSize: 13, color: "#8AA49F", margin: 0 },

  grid: { display: "grid", gridTemplateColumns: "290px 1fr", gap: 20, alignItems: "start" },
  panel: { background: "#fff", border: "1px solid #D6E6E4", borderRadius: 20, overflow: "hidden" },
  panelHead: { padding: "16px 20px", borderBottom: "1px solid #E0F2F1", display: "flex", alignItems: "center", justifyContent: "space-between" },
  panelTitle: { fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8AA49F" },
  planCount: { fontSize: 11, fontWeight: 700, background: "#E0F2F1", color: "#00695C", padding: "2px 8px", borderRadius: 99 },

  planList: { padding: 10, display: "flex", flexDirection: "column", gap: 4 },
  planItem: { padding: "12px 14px", borderRadius: 12, cursor: "pointer", border: "1.5px solid transparent", transition: "all 0.15s" },
  planItemActive: { background: "#E0F2F1", border: "1.5px solid #B2DFDB" },
  planItemRow: { display: "flex", alignItems: "flex-start", gap: 8 },
  planName: { fontSize: 13.5, fontWeight: 600, color: "#0D1F1D", margin: "0 0 4px" },
  planMeta: { fontSize: 12, color: "#8AA49F", margin: 0, display: "flex", alignItems: "center", gap: 4 },

  detailHead: { padding: "22px 26px 18px", borderBottom: "1px solid #E0F2F1", background: "linear-gradient(135deg, #fafffe, #E0F2F1)", display: "flex", flexDirection: "column", gap: 8 },
  detailTitle: { fontSize: 20, fontWeight: 800, color: "#0D1F1D", letterSpacing: "-0.4px", margin: 0 },
  detailBadge: { display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 8, background: "rgba(0,121,107,0.1)", color: "#00695C", fontSize: 12, fontWeight: 600, alignSelf: "flex-start" },
  detailBody: { padding: "22px 26px", display: "flex", flexDirection: "column", gap: 22 },

  emptyDetail: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: "60px 24px", textAlign: "center" },
  emptyDetailText: { fontSize: 14, color: "#8AA49F", fontWeight: 600, margin: 0 },

  sectionLabel: { fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#8AA49F", marginBottom: 10, margin: 0 },

  instructionsBox: { background: "#F0F4F3", border: "1px solid #D6E6E4", borderLeft: "3px solid #00796B", borderRadius: "0 10px 10px 0", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 6 },
  instructionsText: { fontSize: 13.5, color: "#4A6460", lineHeight: 1.6, margin: 0 },

  medsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 },
  medCard: { background: "#F0F4F3", border: "1px solid #D6E6E4", borderRadius: 12, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 2 },
  medName: { fontSize: 13, fontWeight: 700, color: "#0D1F1D", margin: 0 },
  medDose: { fontSize: 12, color: "#4A6460", margin: 0 },
  medTiming: { fontSize: 11, fontWeight: 600, color: "#00796B", background: "#E0F2F1", padding: "2px 8px", borderRadius: 6, display: "inline-block", marginTop: 4 },

  fieldLabel: { display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#4A6460", marginBottom: 6 },

  textarea: { width: "100%", border: "1.5px solid #D6E6E4", borderRadius: 10, padding: "10px 14px", fontSize: 14, fontFamily: "'Inter', sans-serif", color: "#0D1F1D", background: "#F0F4F3", outline: "none", resize: "vertical", boxSizing: "border-box" },
  input: { width: "100%", border: "1.5px solid #D6E6E4", borderRadius: 10, padding: "10px 14px", fontSize: 13.5, fontFamily: "'Inter', sans-serif", color: "#0D1F1D", background: "#F0F4F3", outline: "none", boxSizing: "border-box" },

  backdrop: { position: "fixed", inset: 0, background: "rgba(13,31,29,0.5)", backdropFilter: "blur(4px)", zIndex: 1040 },
  modal: { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 1050, background: "#fff", borderRadius: 20, width: "min(95vw, 580px)", maxHeight: "90vh", overflowY: "auto", padding: "28px 32px", fontFamily: "'Inter', sans-serif" },
  modalHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  modalTitle: { fontSize: 19, fontWeight: 800, color: "#0D1F1D", letterSpacing: "-0.4px", margin: "0 0 4px" },
  modalSub: { fontSize: 13, color: "#4A6460", margin: 0 },
  modalClose: { border: "none", background: "#F0F4F3", borderRadius: 10, width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },

  addRowBtn: { border: "none", background: "none", color: "#00796B", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  removeBtn: { border: "none", background: "none", color: "#B2DFDB", cursor: "pointer", display: "flex", alignItems: "center", padding: 4 },
};