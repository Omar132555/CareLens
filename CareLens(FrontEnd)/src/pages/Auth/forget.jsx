import { useEffect, useState } from "react";
import axios from "axios";
import NotificationToast from "../../components/NotificationToast.jsx";
import prepareRequest from "../../services/RequestService";

export default function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 4200);
    return () => clearTimeout(timer);
  }, [notification]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setNotification(null);

    try {
      const token = prepareRequest();
      const res = await axios.post(
        "http://localhost:8000/api/forgot-password",
        { email },
        {
          headers: {
            "X-XSRF-TOKEN": decodeURIComponent(token),
          },
        },
      );
      if (res.data.error) {
        setNotification({
          type: "error",
          title: "Request Failed",
          message: res.data.error,
        });
      } else {
        setNotification({
          type: "success",
          title: "Link Sent",
          message: res.data.message,
        });
      }
    } catch (err) {
      const responseData = err.response?.data;
      if (responseData?.errors) {
        setErrors(responseData.errors);
        setNotification({
          type: "error",
          title: "Validation Error",
          message: "Please check the email field and try again.",
        });
      } else {
        setNotification({
          type: "error",
          title: "Unable to Send",
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
          <p className="cl-logo-subtitle">Reset your account password</p>
        </div>

        <div className="cl-card">
          <div className="cl-card-content">
            <div className="cl-card-header">
              <h2>Forgot Password</h2>
              <p>Enter your email to receive a reset link.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="cl-field">
                <label className="cl-field-label">Email Address</label>
                <div className="cl-input-wrap">
                  <div className="cl-input-icon">
                    <span className="material-symbols-outlined">email</span>
                  </div>
                  <input
                    name="email"
                    type="email"
                    className="cl-input"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {errors.email && (
                  <p className="text-danger m-2">{errors.email[0]}</p>
                )}
              </div>

              <button className="cl-btn-submit mt-4" type="submit">
                Send Reset Link
                <span className="cl-arrow">→</span>
              </button>
            </form>

            <div className="cl-card-footer">
              <p>
                Remembered your password?
                <a href="/login">Back to login</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
