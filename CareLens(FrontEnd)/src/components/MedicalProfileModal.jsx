import { useNavigate } from "react-router-dom";

export default function MedicalProfileModal({ open }) {
  const navigate = useNavigate();

  if (!open) {
    return null;
  }
  const handleComplete = () => {
    navigate("/medical-profile");
  };

  return (
    <div className="cl-modal-backdrop" role="dialog" aria-modal="true" style={{ pointerEvents: "auto" }}>
      <div className="cl-modal">
        <div className="cl-modal-header">
          <div>
            <p className="cl-modal-subtitle">Medical Profile Required</p>
            <h2 className="cl-modal-title">Complete your medical profile</h2>
          </div>
        </div>

        <div className="cl-modal-body">
          <p>
            We need your medical profile to enable medication reminders, symptom tracking, and personalized care
            suggestions.
          </p>
          <p>
            Complete your medical profile now to unlock the full CareLens experience.
          </p>
        </div>

        <div className="cl-modal-footer d-flex justify-content-center">
          <button type="button" className="cl-btn-primary" onClick={handleComplete}>
            Complete Medical Profile
          </button>
        </div>
      </div>
    </div>
  );
}
