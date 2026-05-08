import { useEffect } from "react";

/**
 * EmergencyAlertModal
 *
 * A full-screen blocking red modal shown when the backend detects
 * a dangerous symptom keyword in the user's message.
 *
 * Props:
 *   isOpen    – boolean  – controls visibility
 *   keyword   – string   – the matched keyword returned by the API
 *   onClose   – function – called when the user dismisses the modal
 */
export default function EmergencyAlertModal({ isOpen, keyword, onClose }) {
  // Prevent background scrolling while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="emergency-overlay"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="emergency-title"
    >
      {/* Backdrop */}
      <div className="emergency-backdrop" />

      {/* Modal card */}
      <div className="emergency-card">
        {/* Pulsing siren icon */}
        <div className="emergency-icon-wrapper">
          <span className="emergency-icon" aria-hidden="true">
            🚨
          </span>
        </div>

        <h1 id="emergency-title" className="emergency-title">
          Emergency Alert
        </h1>

        <p className="emergency-description">
          We detected a potentially life-threatening symptom in your message:
        </p>

        {keyword && (
          <div className="emergency-keyword">&ldquo;{keyword}&rdquo;</div>
        )}
        <div className="doctor-keyword">Please Don't be worry, We Notified Your Doctors</div>

        <p className="emergency-instruction">
          Please <strong>do not wait</strong> for an AI response. Call emergency
          services <strong>immediately</strong>.
        </p>

        {/* Emergency number — update to match your region */}
        <a href="tel:123" className="emergency-call-btn">
          📞 Call Emergency: 123
        </a>

        <p className="emergency-sub">
          If you or someone around you is in danger, hang up and call now.
        </p>

        <button className="emergency-dismiss-btn" onClick={onClose}>
          I understand — continue to AI chat
        </button>
      </div>

      <style>{`
        .emergency-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        .emergency-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(180, 0, 0, 0.92);
          animation: pulseBackground 1.8s ease-in-out infinite;
        }

        @keyframes pulseBackground {
          0%, 100% { background: rgba(180, 0, 0, 0.92); }
          50%       { background: rgba(220, 0, 0, 0.97); }
        }

        .emergency-card {
          position: relative;
          background: #fff;
          border-radius: 16px;
          padding: 40px 32px;
          max-width: 480px;
          width: 100%;
          text-align: center;
          box-shadow: 0 0 60px rgba(0,0,0,0.5);
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from { transform: translateY(-30px); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }

        .emergency-icon-wrapper {
          margin-bottom: 12px;
        }

        .emergency-icon {
          font-size: 56px;
          animation: shake 0.5s ease-in-out infinite alternate;
          display: inline-block;
        }

        @keyframes shake {
          from { transform: rotate(-8deg) scale(1);   }
          to   { transform: rotate(8deg)  scale(1.1); }
        }

        .emergency-title {
          font-size: 28px;
          font-weight: 800;
          color: #b00000;
          margin: 0 0 12px;
          letter-spacing: -0.5px;
        }

        .emergency-description {
          font-size: 15px;
          color: #444;
          margin: 0 0 10px;
        }

        .emergency-keyword {
          background: #fff0f0;
          border: 2px solid #b00000;
          border-radius: 8px;
          padding: 8px 16px;
          font-weight: 700;
          font-size: 15px;
          color: #b00000;
          margin: 0 0 16px;
          text-transform: capitalize;
        }
        .doctor-keyword {
          background: #f0fcff;
          border: 2px solid #00b0b0;
          border-radius: 8px;
          padding: 8px 16px;
          font-weight: 700;
          font-size: 15px;
          color: #007bb0;
          margin: 0 0 16px;
          text-transform: capitalize;
        }

        .emergency-instruction {
          font-size: 15px;
          color: #333;
          margin: 0 0 24px;
          line-height: 1.5;
        }

        .emergency-call-btn {
          display: block;
          background: #b00000;
          color: #fff;
          font-size: 20px;
          font-weight: 700;
          padding: 14px 24px;
          border-radius: 10px;
          text-decoration: none;
          margin: 0 0 12px;
          transition: background 0.2s;
          letter-spacing: 0.3px;
        }

        .emergency-call-btn:hover {
          background: #8a0000;
        }

        .emergency-sub {
          font-size: 13px;
          color: #888;
          margin: 0 0 24px;
        }

        .emergency-dismiss-btn {
          background: none;
          border: 1px solid #ccc;
          border-radius: 8px;
          padding: 10px 20px;
          font-size: 13px;
          color: #777;
          cursor: pointer;
          transition: all 0.2s;
        }

        .emergency-dismiss-btn:hover {
          border-color: #b00000;
          color: #b00000;
        }
      `}</style>
    </div>
  );
}
