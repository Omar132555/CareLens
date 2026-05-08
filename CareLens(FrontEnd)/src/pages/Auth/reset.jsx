import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import NotificationToast from "../../components/NotificationToast.jsx";
import prepareRequest from "../../services/RequestService";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState({});
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const resetToken = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";
  const [notification, setNotification] = useState(
    resetToken && email
      ? null
      : {
          type: "error",
          title: "Invalid Link",
          message:
            "Reset token or email missing from the URL. Please use the link sent to your email.",
        },
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setNotification(null);

    if (!resetToken) {
      setNotification({
        type: "error",
        title: "Invalid Link",
        message: "Unable to reset password because the link is missing a token.",
      });
      return;
    }

    try {
      const tokenHeader = prepareRequest();
      const res = await axios.post(
        "/api/reset-password",
        {
          token: resetToken,
          email,
          password,
          password_confirmation: passwordConfirmation,
        },
        {
          headers: {
            "X-XSRF-TOKEN": decodeURIComponent(tokenHeader),
          },
        },
      );

      if (res.data.error) {
        setNotification({
          type: "error",
          title: "Reset Failed",
          message: res.data.error,
        });
      } else {
        setNotification({
          type: "success",
          title: "Password Updated",
          message: res.data.message || "Your password has been reset successfully.",
        });
        setTimeout(() => navigate("/login"), 2400);
      }
    } catch (err) {
      const responseData = err.response?.data;
      if (responseData?.errors) {
        setErrors(responseData.errors);
        setNotification({
          type: "error",
          title: "Validation Error",
          message: "Please fix the highlighted fields and try again.",
        });
      } else if (responseData?.error) {
        setNotification({
          type: "error",
          title: "Reset Failed",
          message: responseData.error,
        });
      } else {
        setNotification({
          type: "error",
          title: "Unable to Reset",
          message: "Something went wrong. Please try again later.",
        });
      }
    }
  };

  return (
    <div className="cl-bg-box">
      <div className="cl-bg-overlay">
        <div className="cl-bg-image" />
        <div className="cl-bg-dark" />
        <div className="cl-bg-teal" />
      </div>

      <div className="cl-wrapper">
        <NotificationToast
          open={!!notification}
          notification={notification}
          onClose={() => setNotification(null)}
        />

        <div className="cl-logo-area">
          <div className="cl-logo-icon">
            <img
              src="../../public/CareLensImage.png"
              alt="CareLens"
              className="object-fit-cover mt-1"
              width="110"
              height="110"
            />
          </div>
          <h1 className="cl-logo-title">CareLens</h1>
          <p className="cl-logo-subtitle">Reset your password securely</p>
        </div>

        <div className="cl-card">
          <div className="cl-card-content">
            <div className="cl-card-header">
              <h2>Reset Password</h2>
            </div>

            <form onSubmit={handleSubmit}>
              {email && (
                <p className="text-secondary small mb-4">
                  Reset link received for <strong>{email}</strong>
                </p>
              )}

              <div className="cl-field">
                <label className="cl-field-label">New Password</label>
                <div className="cl-input-wrap">
                  <div className="cl-input-icon">
                    <span className="material-symbols-outlined">lock</span>
                  </div>
                  <input
                    name="password"
                    type="password"
                    className="cl-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {errors.password && <p className="text-danger m-2">{errors.password[0]}</p>}
              </div>

              <div className="cl-field">
                <label className="cl-field-label">Confirm Password</label>
                <div className="cl-input-wrap">
                  <div className="cl-input-icon">
                    <span className="material-symbols-outlined">lock</span>
                  </div>
                  <input
                    name="password_confirmation"
                    type="password"
                    className="cl-input"
                    placeholder="••••••••"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                  />
                </div>
                {errors.password_confirmation && (
                  <p className="text-danger m-2">{errors.password_confirmation[0]}</p>
                )}
              </div>

              <button className="cl-btn-submit mt-4" type="submit">
                Reset Password
                <span className="cl-arrow">→</span>
              </button>
            </form>

            <div className="cl-card-footer">
              <p>
                Remembered it?
                <a href="/login">Back to login</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
