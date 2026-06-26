import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import prepareRequest from "../services/RequestService";

const STATUS_CONFIG = {
  none: {
    label: "Not Verified",
    icon: "shield_question",
    color: "#64748b",
    bg: "#f1f5f9",
    border: "#cbd5e1",
    desc: "Send a verification request to get your CareLens Verified badge.",
  },
  pending: {
    label: "Pending Review",
    icon: "pending",
    color: "#b45309",
    bg: "#fffbeb",
    border: "#fde68a",
    desc: "Your verification request is under review. We'll notify you once processed.",
  },
  approved: {
    label: "Verified",
    icon: "verified",
    color: "#065f46",
    bg: "#d1fae5",
    border: "#6ee7b7",
    desc: "You're a CareLens Verified Doctor. Your badge is visible to patients.",
  },
  rejected: {
    label: "Request Rejected",
    icon: "cancel",
    color: "#991b1b",
    bg: "#fee2e2",
    border: "#fca5a5",
    desc: "Your verification was rejected. You may submit a new request.",
  },
};

export default function VerificationStatusBanner() {
  const [status, setStatus] = useState(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadStatus = useCallback(async () => {
    try {
      const token = prepareRequest();
      const res = await axios.get("/api/doctor/verification/status", {
        headers: { "X-XSRF-TOKEN": decodeURIComponent(token) },
      });
      setStatus(res.data.verification_status || "none");
      setNotes(res.data.verification_notes || "");
    } catch {
      setStatus("none");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    if (!success && !error) return;
    const t = setTimeout(() => { setSuccess(null); setError(null); }, 4000);
    return () => clearTimeout(t);
  }, [success, error]);

  const requestVerification = async () => {
    setActing(true);
    setError(null);
    try {
      const token = prepareRequest();
      await axios.post("/api/doctor/verification/request", {}, {
        headers: { "X-XSRF-TOKEN": decodeURIComponent(token) },
      });
      setStatus("pending");
      setSuccess("Verification request sent! Admin will review shortly.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send request.");
    } finally {
      setActing(false);
    }
  };

  const cancelVerification = async () => {
    setActing(true);
    setError(null);
    try {
      const token = prepareRequest();
      await axios.delete("/api/doctor/verification/cancel", {
        headers: { "X-XSRF-TOKEN": decodeURIComponent(token) },
      });
      setStatus("none");
      setSuccess("Verification request cancelled.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to cancel request.");
    } finally {
      setActing(false);
    }
  };

  if (loading) return null;

  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.none;

  return (
    <div
      style={{
        background: cfg.bg,
        border: `1.5px solid ${cfg.border}`,
        borderRadius: "16px",
        padding: "1.25rem 1.5rem",
        marginBottom: "1.5rem",
        display: "flex",
        alignItems: "flex-start",
        gap: "1rem",
        flexWrap: "wrap",
      }}
      id="verification-banner"
    >
      {/* Icon */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "12px",
          background: cfg.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{ color: "#fff", fontSize: "1.4rem", fontVariationSettings: "'FILL' 1" }}
        >
          {cfg.icon}
        </span>
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
          <span style={{ fontWeight: 700, fontSize: "0.9rem", color: cfg.color }}>
            {cfg.label}
          </span>
          {status === "approved" && (
            <span
              style={{
                background: "#065f46",
                color: "#fff",
                fontSize: "0.65rem",
                padding: "2px 8px",
                borderRadius: "999px",
                fontWeight: 700,
                letterSpacing: "0.05em",
              }}
            >
              ✓ VERIFIED
            </span>
          )}
        </div>
        <p style={{ margin: 0, fontSize: "0.82rem", color: "#374151", lineHeight: 1.5 }}>
          {cfg.desc}
        </p>
        {status === "rejected" && notes && (
          <p style={{ margin: "0.4rem 0 0", fontSize: "0.78rem", color: "#991b1b", fontStyle: "italic" }}>
            Admin note: "{notes}"
          </p>
        )}
        {/* Alert messages */}
        {success && (
          <p style={{ margin: "0.4rem 0 0", fontSize: "0.78rem", color: "#065f46", fontWeight: 600 }}>
            ✓ {success}
          </p>
        )}
        {error && (
          <p style={{ margin: "0.4rem 0 0", fontSize: "0.78rem", color: "#991b1b", fontWeight: 600 }}>
            ✗ {error}
          </p>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexShrink: 0 }}>
        {(status === "none" || status === "rejected") && (
          <button
            id="btn-request-verification"
            onClick={requestVerification}
            disabled={acting}
            style={{
              background: "#00796b",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "0.5rem 1rem",
              fontWeight: 700,
              fontSize: "0.82rem",
              cursor: acting ? "not-allowed" : "pointer",
              opacity: acting ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              transition: "all 0.2s",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>
              {acting ? "hourglass_empty" : "send"}
            </span>
            {acting ? "Sending…" : "Request Verification"}
          </button>
        )}
        {status === "pending" && (
          <button
            id="btn-cancel-verification"
            onClick={cancelVerification}
            disabled={acting}
            style={{
              background: "transparent",
              color: "#b45309",
              border: "1.5px solid #fde68a",
              borderRadius: "10px",
              padding: "0.5rem 1rem",
              fontWeight: 700,
              fontSize: "0.82rem",
              cursor: acting ? "not-allowed" : "pointer",
              opacity: acting ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              transition: "all 0.2s",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>close</span>
            {acting ? "Cancelling…" : "Cancel Request"}
          </button>
        )}
      </div>
    </div>
  );
}
