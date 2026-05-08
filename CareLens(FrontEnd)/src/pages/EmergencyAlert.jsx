import { useNavigate } from "react-router-dom";

export default function EmergencyAlert() {
  const navigate = useNavigate();

  return (
    <div className="cl-bg-box">
      <div className="cl-bg-overlay">
        <div className="cl-bg-image" />
        <div className="cl-bg-dark" />
        <div className="cl-bg-teal" />
      </div>

      <div className="cl-wrapper">
        <div className="cl-card">
          <div className="cl-card-content">
            <div className="cl-card-header">
              <h2 style={{ color: "#b91c1c" }}>Emergency Alert</h2>
              <p style={{ color: "#991b1b" }}>
                Dangerous symptom keywords were detected. Please follow the emergency instructions below.
              </p>
            </div>

            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "18px",
                padding: "1.5rem",
                marginBottom: "1.5rem",
              }}
            >
              <p className="fw-bold mb-2">Emergency contact</p>
              <p className="mb-1">Call immediately:</p>
              <p className="fw-bold" style={{ color: "#991b1b" }}>
                +1 (800) 555-1212
              </p>
              <p className="text-secondary-custom small mb-0">
                If you experience chest pain, shortness of breath, severe bleeding, or sudden weakness, contact emergency services now.
              </p>
            </div>

            <button
              type="button"
              className="cl-btn-submit"
              style={{ background: "#b91c1c", borderColor: "#fca5a5" }}
              onClick={() => navigate("/chat-ai/new")}
            >
              Start AI Consultation
            </button>

            <button
              type="button"
              className="cl-btn-submit mt-3"
              style={{ background: "#374151", borderColor: "#cbd5e1" }}
              onClick={() => navigate(-1)}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
