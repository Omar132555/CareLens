import { useNavigate } from "react-router-dom";

export default function AuthModal({ open, onClose }) {
  const navigate = useNavigate();

  if (!open) return null;

  const goToLogin = () => {
    onClose();
    navigate("/login");
  };

  const goToRegister = () => {
    onClose();
    navigate("/register");
  };

  return (
    <div className="cl-modal-backdrop" role="dialog" aria-modal="true">
      <div className="cl-modal">
        <div className="cl-modal-header">
          <div>
            <p className="cl-modal-subtitle">Access your account</p>
            <h2 className="cl-modal-title">Login or Register</h2>
          </div>
          <button className="cl-modal-close" onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>

        <div className="cl-modal-body">
          <div className="d-flex flex-column gap-3">
            <button type="button" className="cl-btn-primary" onClick={goToLogin}>
              Go to Login
            </button>
            <button type="button" className="cl-btn-ghost" onClick={goToRegister}>
              Go to Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
