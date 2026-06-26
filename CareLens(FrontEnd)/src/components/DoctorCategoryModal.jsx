import { useContext, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import prepareRequest from "../services/RequestService";

/* ─── Framer variants ────────────────────────────────────────── */
const slide = {
  initial: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (dir) => ({
    opacity: 0,
    x: dir > 0 ? -60 : 60,
    transition: { duration: 0.25 },
  }),
};

const TOTAL_STEPS = 4;

/* ─── Specialization icons ───────────────────────────────────── */
const SPEC_ICONS = {
  Cardiology: "favorite",
  Neurology: "neurology",
  Pediatrics: "child_care",
  Oncology: "science",
  Orthopedics: "accessibility",
  Dermatology: "healing",
  default: "stethoscope",
};

export default function DoctorCategoryModal() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  /* ── auth guard ─────────────────────────────────────────────── */
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "doctor") {
      navigate("/forbidden", { replace: true });
      return;
    }

    if (user.category_id) {
      navigate("/forbidden", { replace: true });
    }
  }, [user, authLoading]);

  /* ── wizard state ───────────────────────────────────────────── */
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // +1 forward, -1 back

  /* ── form & errors ──────────────────────────────────────────── */
  const [form, setForm] = useState({ category_id: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  /* ── async state ─────────────────────────────────────────────── */
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState(null);
  const [savingCategory, setSavingCategory] = useState(false);
  const [requestingVerification, setRequestingVerification] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [done, setDone] = useState(false);

  /* ── fetch categories ONCE ───────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setCatLoading(true);
      setCatError(null);
      try {
        const res = await axios.get("/api/doctor/categories/get");
        if (res.status === 200) setCategories(res.data);
      } catch {
        if (!cancelled)
          setCatError("Could not load specializations. Please refresh.");
      } finally {
        if (!cancelled) setCatLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []); // ← empty array: runs only once

  /* ── handleChange ────────────────────────────────────────────── */
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
      setTouched((prev) => ({ ...prev, [name]: true }));
      // clear field error on change
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    },
    [errors],
  );

  /* ── validation ──────────────────────────────────────────────── */
  const validate = useCallback(() => {
    const errs = {};
    if (step === 2 && !form.category_id) {
      errs.category_id = "Please select a specialization to continue.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [step, form]);

  /* ── navigation ──────────────────────────────────────────────── */
  const requestVerification = async () => {
    setRequestingVerification(true);
    setErrorMsg("");
    try {
      const token = prepareRequest();
      await axios.post(
        "/api/doctor/verification/request",
        {},
        {
          headers: {
            "X-XSRF-TOKEN": decodeURIComponent(token),
          },
        }
      );
      setSuccessMsg("Verification request sent successfully!");
      setTimeout(() => {
        navigate("/doctor-dashboard", { replace: true });
      }, 1500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to request verification.");
      setRequestingVerification(false);
    }
  };

  const next = () => {
    if (!validate()) return;
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const back = () => {
    setDirection(-1);
    setErrors({});
    setStep((s) => Math.max(s - 1, 1));
  };

  /* ── submit ──────────────────────────────────────────────────── */
  const saveCategory = async () => {
    const token = prepareRequest();
    setSavingCategory(true);
    setSubmitError(null);
    try {
      await axios.put(
        "/api/doctor/category/update",
        {
          category_id: Number(form.category_id),
        },
        {
          headers: {
            "X-XSRF-TOKEN": decodeURIComponent(token),
          },
        },
      );
      next();
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setSavingCategory(false);
    }
  };

  /* ── helpers ─────────────────────────────────────────────────── */
  const selectedCat = categories.find(
    (c) => String(c.id) === String(form.category_id),
  );
  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  /* ════════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════ */
  return (
    <>
      {/* ── Inline styles ────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@400,0..1&display=swap');

        :root {
          --primary: #00796b;
          --primary-light: #37978c;
          --primary-hover: #00695C;
          --primary-subtle: rgba(0,121,107,.08);
          --charcoal: #263238;
          --border: #e0e8e7;
          --text-sec: #546e7a;
          --error-bg: #fef2f2;
          --surface-muted: #E0F2F1;
          --error: #dc2626;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .wz-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          font-family: 'Manrope', sans-serif;
          background: #f0f4f3;
          position: relative;
          overflow: hidden;
        }

        /* decorative blobs */
        .wz-blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }
        .wz-blob-1 {
          width: 500px; height: 500px;
          background: rgba(0,121,107,.15);
          top: -120px; left: -120px;
        }
        .wz-blob-2 {
          width: 400px; height: 400px;
          background: rgba(0,121,107,.10);
          bottom: -100px; right: -100px;
        }

        /* ── Card ── */
        .wz-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 480px;
          background: #fff;
          border-radius: 28px;
          box-shadow: 0 24px 64px rgba(38,50,56,.14), 0 2px 8px rgba(0,0,0,.06);
          overflow: hidden;
        }

        /* ── Header strip ── */
        .wz-header {
          background: linear-gradient(135deg, #00796b 0%, #009688 100%);
          padding: 2rem 2rem 1.5rem;
          color: #fff;
          position: relative;
          overflow: hidden;
        }
        .wz-header::after {
          content: '';
          position: absolute;
          right: -40px; bottom: -40px;
          width: 160px; height: 160px;
          background: rgba(255,255,255,.06);
          border-radius: 50%;
        }
        .wz-header::before {
          content: '';
          position: absolute;
          right: 40px; bottom: -70px;
          width: 100px; height: 100px;
          background: rgba(255,255,255,.04);
          border-radius: 50%;
        }
        .wz-brand {
          font-size: 1.4rem;
          font-weight: 800;
          letter-spacing: -.02em;
          opacity: .95;
          margin-bottom: .25rem;
        }
        .wz-step-label {
          font-size: .75rem;
          font-weight: 600;
          opacity: .7;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        /* ── Progress track ── */
        .wz-track {
          height: 4px;
          background: rgba(255,255,255,.2);
          border-radius: 2px;
          margin-top: 1.25rem;
          overflow: hidden;
        }
        .wz-track-fill {
          height: 100%;
          border-radius: 2px;
          background: rgba(255,255,255,.85);
          transition: width .5s cubic-bezier(.22,1,.36,1);
        }

        /* ── Step dots ── */
        .wz-dots {
          display: flex;
          gap: .5rem;
          margin-top: .875rem;
          align-items: center;
        }
        .wz-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,.3);
          transition: all .3s;
        }
        .wz-dot.active {
          width: 24px;
          border-radius: 4px;
          background: rgba(255,255,255,.9);
        }
        .wz-dot.done {
          background: rgba(255,255,255,.6);
        }

        /* ── Body ── */
        .wz-body {
          padding: 2rem;
          min-height: 320px;
          display: flex;
          flex-direction: column;
        }

        /* ── Step title ── */
        .wz-step-title {
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--charcoal);
          margin-bottom: .4rem;
          letter-spacing: -.02em;
        }
        .wz-step-sub {
          font-size: .875rem;
          color: var(--text-sec);
          margin-bottom: 1.75rem;
          line-height: 1.5;
        }

        /* ── Select grid ── */
        .wz-spec-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: .75rem;
          flex: 1;
        }
        .wz-spec-item {
          position: relative;
          cursor: pointer;
        }
        .wz-spec-item input[type="radio"] {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }
        .wz-spec-tile {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: .4rem;
          padding: .875rem .5rem;
          border-radius: 14px;
          border: 2px solid var(--border);
          background: #fafafa;
          transition: all .2s;
          text-align: center;
          height: 90px;
          cursor: pointer;
        }
        .wz-spec-item input:checked + .wz-spec-tile {
          border-color: var(--primary);
          background: var(--primary-subtle);
          box-shadow: 0 0 0 4px rgba(0,121,107,.1);
        }
        .wz-spec-item:hover input:not(:checked) + .wz-spec-tile {
          border-color: var(--primary-light);
          background: #f0f9f8;
        }
        .wz-spec-icon {
          font-size: 1.4rem;
          color: var(--primary);
        }
        .wz-spec-name {
          font-size: .72rem;
          font-weight: 700;
          color: var(--charcoal);
          line-height: 1.2;
        }

        /* fallback select for many categories */
        .wz-select {
          width: 100%;
          padding: .875rem 1rem;
          border-radius: 12px;
          border: 2px solid var(--border);
          background: #fafafa;
          font-family: 'Manrope', sans-serif;
          font-size: .875rem;
          font-weight: 600;
          color: var(--charcoal);
          outline: none;
          cursor: pointer;
          transition: border-color .2s;
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2300796b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          padding-right: 2.5rem;
        }

        .wz-select:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(0,121,107,.1);
        }

        /* ── Error ── */
        .wz-error {
          display: flex;
          align-items: center;
          gap: .4rem;
          margin-top: .625rem;
          padding: .625rem .875rem;
          border-radius: 10px;
          background: var(--error-bg);
          border: 1px solid #fecaca;
          font-size: .8rem;
          font-weight: 600;
          color: var(--error);
        }
        .wz-error .material-symbols-outlined { font-size: 1rem; }

        /* ── Confirm card ── */
        .wz-confirm {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
          border-radius: 16px;
          background: var(--primary-subtle);
          border: 2px solid rgba(0,121,107,.15);
          margin-bottom: 1.5rem;
          flex: 1;
          align-self: stretch;
        }
        .wz-confirm-icon-wrap {
          width: 48px; height: 48px;
          border-radius: 14px;
          background: var(--primary);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          color: #fff;
        }
        .wz-confirm-label {
          font-size: .7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .08em;
          color: var(--primary);
          margin-bottom: .2rem;
        }
        .wz-confirm-name {
          font-size: 1rem;
          font-weight: 800;
          color: var(--charcoal);
        }

        /* ── Buttons ── */
        .wz-actions {
          display: flex;
          gap: .75rem;
          margin-top: auto;
          padding-top: 1.5rem;
        }
        .wz-btn {
          flex: 1;
          padding: .875rem 1rem;
          border-radius: 14px;
          font-family: 'Manrope', sans-serif;
          font-size: .9rem;
          font-weight: 700;
          cursor: pointer;
          border: none;
          transition: all .2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: .4rem;
        }
        .wz-btn-primary {
          background: var(--primary);
          color: #fff;
          box-shadow: 0 6px 20px rgba(0,121,107,.3);
        }
        .wz-btn-primary:hover:not(:disabled) {
          background: var(--primary-hover);
          transform: translateY(-1px);
          box-shadow: 0 10px 28px rgba(0,121,107,.35);
        }
        .wz-btn-primary:active:not(:disabled) { transform: scale(.98); }
        .wz-btn-primary:disabled {
          opacity: .5;
          cursor: not-allowed;
          box-shadow: none;
        }
        .wz-btn-secondary {
          background: transparent;
          color: var(--text-sec);
          border: 2px solid var(--border);
        }
        .wz-btn-secondary:hover {
          border-color: var(--primary-light);
          color: var(--primary);
          background: var(--primary-subtle);
        }
        .wz-btn-full { flex: unset; width: 100%; }

        /* ── Success state ── */
        .wz-success {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          text-align: center;
          gap: 1rem;
          padding: 1rem 0 .5rem;
        }
        .wz-success-ring {
          width: 72px; height: 72px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00796b, #4db6ac);
          display: flex; align-items: center; justify-content: center;
          color: #fff;
          box-shadow: 0 12px 32px rgba(0,121,107,.35);
          animation: pop .4s cubic-bezier(.22,1,.36,1);
        }
        @keyframes pop {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        .wz-success-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--charcoal);
        }
        .wz-success-sub {
          font-size: .875rem;
          color: var(--text-sec);
        }

        /* ── Loading skeleton ── */
        .wz-skeleton {
          height: 90px;
          border-radius: 14px;
          background: linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .mat-icon { font-family: 'Material Symbols Outlined'; font-variation-settings: "'FILL' 1"; font-size: 1.3rem; user-select: none; }
      `}</style>

      <div className="wz-page">
        <div className="wz-blob wz-blob-1" />
        <div className="wz-blob wz-blob-2" />

        <div className="wz-card">
          {/* ── Header ── */}
          <div className="wz-header">
            <div className="wz-brand">CareLens</div>
            <div className="wz-step-label">
              {done
                ? "Setup Complete"
                : `Step ${step} of ${TOTAL_STEPS} — Doctor Onboarding`}
            </div>
            <div className="wz-track">
              <div
                className="wz-track-fill"
                style={{ width: done ? "100%" : `${progress}%` }}
              />
            </div>
            <div className="wz-dots">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <span
                  key={i}
                  className={`wz-dot${i + 1 === step ? " active" : i + 1 < step ? " done" : ""}`}
                />
              ))}
            </div>
          </div>

          {/* ── Body ── */}
          <div className="wz-body">
            <AnimatePresence mode="wait" custom={direction}>
              {/* ─── SUCCESS ─── */}
              {done && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="wz-success"
                >
                  <div className="wz-success-ring">
                    <span className="mat-icon" style={{ fontSize: "2rem" }}>
                      check_circle
                    </span>
                  </div>
                  <div>
                    <div className="wz-success-title">You're all set! 🎉</div>
                    <div className="wz-success-sub">
                      Redirecting to your dashboard…
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ─── STEP 1 ─── */}
              {!done && step === 1 && (
                <motion.div
                  key="step1"
                  custom={direction}
                  variants={slide}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  style={{ display: "flex", flexDirection: "column", flex: 1 }}
                >
                  <div className="wz-step-title">Welcome, Doctor </div>
                  <div className="wz-step-sub">
                    Let's build your professional profile in just a few steps so
                    your patients can find and trust you.
                  </div>

                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: ".75rem",
                      justifyContent: "center",
                    }}
                  >
                    {[
                      { icon: "badge", label: "Set your specialization" },
                      { icon: "verified", label: "Get verified by CareLens" },
                      { icon: "group", label: "Connect with your patients" },
                    ].map((item, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: ".875rem",
                          padding: ".875rem 1rem",
                          borderRadius: "14px",
                          background: "#f7fafa",
                          border: "1px solid #e0eeed",
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "10px",
                            background: "var(--primary-subtle)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <span
                            className="mat-icon"
                            style={{
                              color: "var(--primary)",
                              fontSize: "1.1rem",
                            }}
                          >
                            {item.icon}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: ".875rem",
                            fontWeight: 600,
                            color: "var(--charcoal)",
                          }}
                        >
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="wz-actions">
                    <button
                      className="wz-btn wz-btn-primary wz-btn-full"
                      onClick={next}
                    >
                      Get Started
                      <span
                        className="mat-icon"
                        style={{
                          fontVariationSettings: "'FILL' 0",
                          fontSize: "1.1rem",
                        }}
                      >
                        arrow_forward
                      </span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ─── STEP 2 ─── */}
              {!done && step === 2 && (
                <motion.div
                  key="step2"
                  custom={direction}
                  variants={slide}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  style={{ display: "flex", flexDirection: "column", flex: 1 }}
                >
                  <div className="wz-step-title">Select Specialization</div>
                  <div className="wz-step-sub">
                    Choose the medical field that best describes your practice.
                  </div>

                  {catError && (
                    <div className="wz-error">
                      <span className="material-symbols-outlined">error</span>
                      {catError}
                    </div>
                  )}

                  {catLoading ? (
                    <div className="wz-spec-grid">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="wz-skeleton" />
                      ))}
                    </div>
                  ) : categories.length <= 8 ? (
                    <div className="wz-spec-grid">
                      {categories.map((cat) => (
                        <label key={cat.id} className="wz-spec-item">
                          <input
                            type="radio"
                            name="category_id"
                            value={cat.id}
                            checked={
                              String(form.category_id) === String(cat.id)
                            }
                            onChange={handleChange}
                          />
                          <div className="wz-spec-tile">
                            <span className="mat-icon wz-spec-icon">
                              {SPEC_ICONS[cat.name] || SPEC_ICONS.default}
                            </span>
                            <span className="wz-spec-name">{cat.name}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <select
                      name="category_id"
                      value={form.category_id}
                      onChange={handleChange}
                      className="wz-select"
                    >
                      <option value="">Choose specialization…</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  )}

                  {errors.category_id && touched.category_id && (
                    <div className="wz-error">
                      <span className="material-symbols-outlined">error</span>
                      {errors.category_id}
                    </div>
                  )}

                  <div className="wz-actions">
                    <button className="wz-btn wz-btn-secondary" onClick={back}>
                      <span
                        className="mat-icon"
                        style={{
                          fontVariationSettings: "'FILL' 0",
                          fontSize: "1.1rem",
                        }}
                      >
                        arrow_back
                      </span>
                      Back
                    </button>
                    <button
                      className="wz-btn wz-btn-primary"
                      onClick={saveCategory}
                      disabled={!form.category_id || savingCategory}
                    >
                      {savingCategory ? "Saving..." : "Next"}
                      <span
                        className="mat-icon"
                        style={{
                          fontVariationSettings: "'FILL' 0",
                          fontSize: "1.1rem",
                        }}
                      >
                        arrow_forward
                      </span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ─── STEP 3 ─── */}
              {!done && step === 3 && (
                <motion.div
                  key="step3"
                  custom={direction}
                  variants={slide}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  style={{ display: "flex", flexDirection: "column", flex: 1 }}
                >
                  <div className="wz-step-title">Confirm Selection</div>
                  <div className="wz-step-sub">
                    Review your specialty selection before proceeding.
                  </div>

                  {selectedCat && (
                    <div className="wz-confirm">
                      <div className="wz-confirm-icon-wrap">
                        <span
                          className="mat-icon"
                          style={{ fontSize: "1.5rem" }}
                        >
                          {SPEC_ICONS[selectedCat.name] || SPEC_ICONS.default}
                        </span>
                      </div>
                      <div>
                        <div className="wz-confirm-label">Specialization</div>
                        <div className="wz-confirm-name">
                          {selectedCat.name}
                        </div>
                      </div>
                    </div>
                  )}

                  {submitError && (
                    <div className="wz-error">
                      <span className="material-symbols-outlined">error</span>
                      {submitError}
                    </div>
                  )}

                  <div className="wz-actions">
                    <button className="wz-btn wz-btn-secondary" onClick={back}>
                      <span
                        className="mat-icon"
                        style={{
                          fontVariationSettings: "'FILL' 0",
                          fontSize: "1.1rem",
                        }}
                      >
                        arrow_back
                      </span>
                      Back
                    </button>
                    <button
                      className="wz-btn wz-btn-primary"
                      onClick={next}
                      disabled={submitting}
                    >
                      Next
                      <span
                        className="mat-icon"
                        style={{
                          fontVariationSettings: "'FILL' 0",
                          fontSize: "1.1rem",
                        }}
                      >
                        arrow_forward
                      </span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ─── STEP 4: VERIFICATION ─── */}
              {!done && step === 4 && (
                <motion.div
                  key="step4"
                  custom={direction}
                  variants={slide}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  style={{ display: "flex", flexDirection: "column", flex: 1 }}
                >
                  <div className="wz-step-title">Account Verification</div>
                  <div className="wz-step-sub">
                    Get the CareLens Verified badge to build trust with patients.
                  </div>

                  <div
                    className="wz-confirm"
                    style={{
                      background: "#f0fdf4",
                      borderColor: "#bbf7d0",
                      flexDirection: "column",
                      textAlign: "center",
                      padding: "2rem",
                    }}
                  >
                    <div
                      className="wz-confirm-icon-wrap"
                      style={{
                        background: "#22c55e",
                        width: 64,
                        height: 64,
                        margin: "0 auto",
                      }}
                    >
                      <span
                        className="mat-icon"
                        style={{ fontSize: "2rem", color: "#fff" }}
                      >
                        verified
                      </span>
                    </div>
                    <h3 className="wz-confirm-name mt-3" style={{ fontSize: "1.2rem" }}>
                      Request Verification Badge
                    </h3>
                    <p className="wz-step-sub mb-0 mt-2">
                      Submitting a verification request will notify the CareLens admin team. Once your medical credentials are confirmed, a badge will appear on your profile.
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="wz-error mb-3">
                      <span className="material-symbols-outlined">error</span>
                      {errorMsg}
                    </div>
                  )}
                  {successMsg && (
                    <div className="wz-error mb-3" style={{ background: "#d1fae5", color: "#065f46", borderColor: "#a7f3d0" }}>
                      <span className="material-symbols-outlined">check_circle</span>
                      {successMsg}
                    </div>
                  )}

                  <div className="wz-actions mt-auto">
                    <button
                      className="wz-btn wz-btn-secondary"
                      onClick={() => {
                        setDone(true);
                        setTimeout(() => navigate("/home", { replace: true }), 1500);
                      }}
                      disabled={requestingVerification}
                    >
                      Skip for Now
                    </button>
                    <button
                      className="wz-btn wz-btn-primary"
                      style={{ background: "#059669" }}
                      onClick={requestVerification}
                      disabled={requestingVerification}
                    >
                      {requestingVerification ? (
                        <>
                          <span
                            style={{
                              width: 16,
                              height: 16,
                              border: "2px solid rgba(255,255,255,.4)",
                              borderTopColor: "#fff",
                              borderRadius: "50%",
                              display: "inline-block",
                              animation: "spin .7s linear infinite",
                            }}
                          />
                          Sending...
                        </>
                      ) : (
                        <>
                          <span className="mat-icon" style={{ fontSize: "1.1rem" }}>
                            verified
                          </span>
                          Request Verification
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
