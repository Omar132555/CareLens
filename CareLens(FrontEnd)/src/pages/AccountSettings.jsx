import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../components/AuthContext";
import NavBar from "../components/navBar";
import Scroll from "../hooks/Scroll";
import prepareRequest from "../services/RequestService";
import NotificationToast from "../components/NotificationToast";

export default function AccountSettings() {
  const scrolled = Scroll();
  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = prepareRequest();
      const response = await axios.put(
        "/api/user/profile",
        formData,
        {
          headers: {
            "X-XSRF-TOKEN": decodeURIComponent(token),
          },
        }
      );

      setUser(response.data.user);
      setNotification({
        type: "success",
        title: "Updated",
        message: "Your account information has been updated",
      });
    } catch {
      setNotification({
        type: "error",
        title: "Error",
        message: "Failed to update account information",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (
      passwordData.new_password !== passwordData.new_password_confirmation
    ) {
      setNotification({
        type: "error",
        title: "Mismatch",
        message: "New passwords do not match",
      });
      setLoading(false);
      return;
    }

    try {
      const token = prepareRequest();
      await axios.post(
        "/api/user/change-password",
        passwordData,
        {
          headers: {
            "X-XSRF-TOKEN": decodeURIComponent(token),
          },
        }
      );

      setPasswordData({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      });
      setShowPasswordForm(false);
      setNotification({
        type: "success",
        title: "Success",
        message: "Your password has been changed successfully",
      });
    } catch {
      setNotification({
        type: "error",
        title: "Error",
        message: "Failed to change password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cl-body">
      <NavBar scrolled={scrolled} />
      <main className="tw-py-8 bg-main min-vh-100">
        <div className="tw-max-w-2xl tw-mx-auto tw-px-4">
          <NotificationToast
            open={!!notification}
            notification={notification}
            onClose={() => setNotification(null)}
          />

          <div className="tw-mb-8">
            <h1 className="text-3xl fw-bold text-charcoal mb-1">
              Account Settings
            </h1>
            <p className="text-secondary-custom">
              Manage your account details and security
            </p>
          </div>

          {/* Account Information */}
          <div className="cl-card tw-p-6 tw-mb-6">
            <h2 className="text-lg fw-bold text-charcoal tw-mb-4">
              Account Information
            </h2>

            <form onSubmit={handleAccountSubmit}>
              <div className="tw-mb-4">
                <div className="cl-field">
                  <label className="cl-field-label">Full Name</label>
                  <div className="cl-input-wrap">
                    <div className="cl-input-icon">
                      <span className="material-symbols-outlined">person</span>
                    </div>
                    <input
                      type="text"
                      className="cl-input"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="tw-mb-6">
                <div className="cl-field">
                  <label className="cl-field-label">Email Address</label>
                  <div className="cl-input-wrap">
                    <div className="cl-input-icon">
                      <span className="material-symbols-outlined">email</span>
                    </div>
                    <input
                      type="email"
                      className="cl-input"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="cl-btn-submit"
              >
                {loading ? "Saving..." : "Save Changes"}
                <span className="cl-arrow">→</span>
              </button>
            </form>
          </div>

          {/* Security */}
          <div className="cl-card tw-p-6">
            <div className="d-flex justify-content-between align-items-center tw-mb-4">
              <h2 className="text-lg fw-bold text-charcoal mb-0">
                Security
              </h2>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="cl-btn-ghost text-sm"
              >
                {showPasswordForm ? "Cancel" : "Change Password"}
              </button>
            </div>

            {showPasswordForm && (
              <form onSubmit={handlePasswordSubmit} className="tw-mt-4">
                <div className="tw-mb-4">
                  <div className="cl-field">
                    <label className="cl-field-label">Current Password</label>
                    <div className="cl-input-wrap">
                      <div className="cl-input-icon">
                        <span className="material-symbols-outlined">lock</span>
                      </div>
                      <input
                        type="password"
                        className="cl-input"
                        value={passwordData.current_password}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            current_password: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="tw-mb-4">
                  <div className="cl-field">
                    <label className="cl-field-label">New Password</label>
                    <div className="cl-input-wrap">
                      <div className="cl-input-icon">
                        <span className="material-symbols-outlined">lock</span>
                      </div>
                      <input
                        type="password"
                        className="cl-input"
                        value={passwordData.new_password}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            new_password: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="tw-mb-6">
                  <div className="cl-field">
                    <label className="cl-field-label">
                      Confirm New Password
                    </label>
                    <div className="cl-input-wrap">
                      <div className="cl-input-icon">
                        <span className="material-symbols-outlined">lock</span>
                      </div>
                      <input
                        type="password"
                        className="cl-input"
                        value={passwordData.new_password_confirmation}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            new_password_confirmation: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="cl-btn-submit"
                >
                  {loading ? "Updating..." : "Update Password"}
                  <span className="cl-arrow">→</span>
                </button>
              </form>
            )}

            {!showPasswordForm && (
              <p className="text-secondary-custom text-sm tw-mt-4">
                Keep your account secure by regularly updating your password
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
