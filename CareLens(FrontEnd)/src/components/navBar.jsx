import logo from "../../public/CareLensLogo.png";
import { hasRole } from "../helpers/hasRole";
import { AuthContext } from "./AuthContext";
import UserProfile from "./UserProfile";
import { useContext, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import prepareRequest from "../services/RequestService";
import { useEcho, useEchoNotification } from "@laravel/echo-react";

// Must be defined outside NavBar to comply with React rules of hooks

function NavBar(scrolled) {
  const { user, setUser, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const token = () => prepareRequest();
  const hdr = () => ({ "X-XSRF-TOKEN": decodeURIComponent(token()) });

  useEffect(() => {
    if (!user) return;

    // Fetch initial notifications
    axios
      .get("/api/notifications")
      .then((res) => {
        // console.log(res.data);

        setNotifications(res.data || []);
      })
      .catch((err) => console.error("Error fetching notifications", err));
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      await axios.post(
        `http://localhost:8000/api/notifications/${id}/read`,
        {},
        { headers: hdr() },
      );
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Error marking notification as read", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.post(
        `http://localhost:8000/api/notifications/read-all`,
        {},
        { headers: hdr() },
      );
      setNotifications([]);
    } catch (err) {
      console.error("Error marking all notifications as read", err);
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    const channel = window.Echo.private(`App.Models.User.${user.id}`);

    channel.notification((notification) => {
      setNotifications((prev) => [notification, ...prev]);
      console.log(notification);
    });

    return () => {
      window.Echo.leave(`App.Models.User.${user.id}`);
    };
  }, [user?.id]);

  const handleApproveFollow = async (e, patientId, notificationId) => {
    e.stopPropagation();
    try {
      await axios.post(
        `http://localhost:8000/api/doctor/follow/approve`,
        { patientId },
        { headers: hdr() },
      );
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (err) {
      console.error("Error approving follow request", err);
    }
  };

  const handleDenyFollow = async (e, patientId, notificationId) => {
    e.stopPropagation();
    try {
      await axios.delete(`http://localhost:8000/api/doctor/follow/remove`, {
        data: { patientId },
        headers: hdr(),
      });
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (err) {
      console.error("Error denying follow request", err);
    }
  };

  return (
    <nav
      className="cl-nav navbar navbar-expand-lg sticky-top bg-white"
      style={{ boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,.08)" : "none" }}
    >
      <img className="cl-logo" src={logo} />
      <div className="cl-container">
        <div className="cl-nav-inner">
          <div className="cl-nav-links">
            {user && (
              <>
                <NavLink
                  to="/home"
                  className={({ isActive }) =>
                    isActive ? "cl-nav-link active" : "cl-nav-link"
                  }
                >
                  Home
                </NavLink>
                {user.role === "patient" ? (
                  <NavLink
                    to="/patient-dashboard"
                    className={({ isActive }) =>
                      isActive ? "cl-nav-link active" : "cl-nav-link"
                    }
                  >
                    Patient Dashboard
                  </NavLink>
                ) : user.role === "doctor" ? (
                  <NavLink
                    to="/doctor-dashboard"
                    className={({ isActive }) =>
                      isActive ? "cl-nav-link active" : "cl-nav-link"
                    }
                  >
                    Doctor Dashboard
                  </NavLink>
                ) : null}
                {hasRole(user,"patient") && <NavLink
                  to="/symptoms"
                  className={({ isActive }) =>
                    isActive ? "cl-nav-link active" : "cl-nav-link"
                  }
                >
                  Symptom Tracker
                </NavLink> }
                <NavLink
                  to="/treatment-followup"
                  className={({ isActive }) =>
                    isActive ? "cl-nav-link active" : "cl-nav-link"
                  }
                >
                  Treatment Plan
                </NavLink>
                {hasRole(user, "patient") && (
                  <NavLink
                    to="/medical-profile"
                    className={({ isActive }) =>
                      isActive ? "cl-nav-link active" : "cl-nav-link"
                    }
                  >
                    Medical Profile
                  </NavLink>
                )}
                {hasRole(user, "doctor") && (
                  <NavLink
                    to="/patients"
                    className={({ isActive }) =>
                      isActive ? "cl-nav-link active" : "cl-nav-link"
                    }
                  >
                    Patients
                  </NavLink>
                )}
                {hasRole(user, "patient") && (
                  <NavLink
                    to="/doctors"
                    className={({ isActive }) =>
                      isActive ? "cl-nav-link active" : "cl-nav-link"
                    }
                  >
                    Doctors
                  </NavLink>
                )}
                <div className="position-relative">
                  <span
                    className="material-symbols-outlined text-secondary"
                    style={{ cursor: "pointer", fontSize: "24px" }}
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    notifications
                  </span>
                  {notifications.length > 0 && (
                    <span
                      className="position-absolute top-0 end-0 bg-danger text-white rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: 18,
                        height: 18,
                        fontSize: "10px",
                        fontWeight: "bold",
                        transform: "translate(25%, -25%)",
                      }}
                    >
                      {notifications.length}
                    </span>
                  )}

                  {showNotifications && (
                    <div
                      className="position-absolute end-0 mt-2 p-3 rounded-4 shadow-lg border"
                      style={{
                        width: "320px",
                        maxHeight: "400px",
                        overflowY: "auto",
                        background: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(226, 232, 240, 0.8)",
                        zIndex: 1000,
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span
                          className="fw-bold text-dark"
                          style={{ fontSize: "0.95rem" }}
                        >
                          Notifications
                        </span>
                        {notifications.length > 0 && (
                          <button
                            className="cl-btn-primary"
                            style={{
                              fontSize: "0.8rem",
                              padding: "5px 10px",
                              fontWeight: 600,
                            }}
                            onClick={handleMarkAllRead}
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      {notifications.length === 0 ? (
                        <div
                          className="text-center py-4 text-muted"
                          style={{ fontSize: "0.85rem" }}
                        >
                          <span
                            className="material-symbols-outlined d-block mb-1 text-secondary"
                            style={{ fontSize: "2rem" }}
                          >
                            notifications_off
                          </span>
                          No new notifications
                        </div>
                      ) : (
                        <div className="d-flex flex-column gap-2">
                          {notifications.map((n) => {
                            const isFollowRequest =
                              n.type &&
                              n.type.includes("FollowRequestNotification");
                            const isMedicationReminder =
                              n.type?.includes("MedicationReminder") ||
                              n.data?.type === "medication_reminder";

                            const isFollowResponse =
                              n.type?.includes(
                                "FollowRequestResponseNotification",
                              ) ||
                              n.data?.type ===
                                "FollowRequestResponseNotification";
                            const data = n.data || {};
                            return (
                              <>
                                {isMedicationReminder && (
                                  <div
                                    key={n.id}
                                    className="p-2.5 rounded-3 d-flex gap-2 align-items-start hover-bg-light transition-all"
                                    style={{
                                      background: "rgba(248, 250, 252, 0.8)",
                                      border: "1px solid #f1f5f9",
                                      padding: "10px",
                                      cursor: "pointer",
                                    }}
                                    onClick={() => {
                                      handleMarkAsRead(n.id);
                                      setShowNotifications(false);
                                    }}
                                  >
                                    <span className="material-symbols-outlined text-primary-custom">medication</span>
                                    <div style={{ flex: 1 }}>
                                      <p
                                        className="mb-1 text-dark"
                                        style={{
                                          fontSize: "0.82rem",
                                          lineHeight: "1.25",
                                        }}
                                      >
                                            <span className="fw-semibold">
                                              Medication Reminder
                                            </span>
                                            Time to take {data.medName} - {data.dosage}
                                      </p>
                                      <span
                                        className="text-muted"
                                        style={{ fontSize: "0.72rem" }}
                                      >
                                        {new Date(
                                          n.created_at || Date.now(),
                                        ).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                    </div>
                                  </div>
                                
                              )}
                                {(isFollowRequest || isFollowResponse) && (
                                  <div
                                    key={n.id}
                                    className="p-2.5 rounded-3 d-flex gap-2 align-items-start hover-bg-light transition-all"
                                    style={{
                                      background: "rgba(248, 250, 252, 0.8)",
                                      border: "1px solid #f1f5f9",
                                      padding: "10px",
                                      cursor: "pointer",
                                    }}
                                    onClick={() => {
                                      handleMarkAsRead(n.id);
                                      if (isFollowRequest) {
                                        navigate("/patients");
                                      }
                                      setShowNotifications(false);
                                    }}
                                  >
                                    {data.patientPhoto || data.doctorPhoto ? (
                                      <img
                                        src={`http://localhost:8000/storage/${data.patientPhoto || data.doctorPhoto}`}
                                        alt={
                                          data.patientName || data.doctorName
                                        }
                                        className="rounded-circle"
                                        style={{
                                          width: "32px",
                                          height: "32px",
                                          objectFit: "cover",
                                        }}
                                      />
                                    ) : (
                                      <div
                                        className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white fw-bold"
                                        style={{
                                          width: "32px",
                                          height: "32px",
                                          fontSize: "0.85rem",
                                        }}
                                      >
                                        {
                                          (data.patientName ||
                                            data.doctorName ||
                                            "U")[0]
                                        }
                                      </div>
                                    )}
                                    <div style={{ flex: 1 }}>
                                      <p
                                        className="mb-1 text-dark"
                                        style={{
                                          fontSize: "0.82rem",
                                          lineHeight: "1.25",
                                        }}
                                      >
                                        {isFollowRequest && (
                                          <>
                                            <span className="fw-semibold">
                                              {data.patientName || "A patient"}
                                            </span>{" "}
                                            sent you a follow request.
                                          </>
                                        )}
                                        {isFollowResponse && (
                                          <>
                                            <span className="fw-semibold">
                                              Dr. {data.doctorName}
                                            </span>{" "}
                                            {data.action === "approved"
                                              ? "accepted"
                                              : "declined"}{" "}
                                            your follow request.
                                          </>
                                        )}
                                      </p>
                                      {isFollowRequest && (
                                        <div className="d-flex gap-2 mt-1 mb-1">
                                          <button
                                            onClick={(e) =>
                                              handleApproveFollow(
                                                e,
                                                data.patientId,
                                                n.id,
                                              )
                                            }
                                            className="btn btn-sm btn-success py-0 px-2"
                                            style={{ fontSize: "0.75rem" }}
                                          >
                                            Approve
                                          </button>
                                          <button
                                            onClick={(e) =>
                                              handleDenyFollow(
                                                e,
                                                data.patientId,
                                                n.id,
                                              )
                                            }
                                            className="btn btn-sm btn-outline-danger py-0 px-2"
                                            style={{ fontSize: "0.75rem" }}
                                          >
                                            Deny
                                          </button>
                                        </div>
                                      )}
                                      <span
                                        className="text-muted"
                                        style={{ fontSize: "0.72rem" }}
                                      >
                                        {new Date(
                                          n.created_at || Date.now(),
                                        ).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="cl-nav-btns me-auto d-flex align-items-center gap-2">
        {!user ? (
          <>
            <a href="/login" className="cl-btn-ghost text-decoration-none">
              Login
            </a>
            <a href="/register" className="cl-btn-primary text-decoration-none">
              Register
            </a>
          </>
        ) : (
          <>
            {hasRole(user, "patient") && (
              <button
                type="button"
                className="cl-btn-alert"
                onClick={() => navigate("/emergency-alert")}
              >
                <span className="material-symbols-outlined">dangerous</span>
                Emergency Alert
              </button>
            )}
            <div className="">
              <UserProfile title={user.name} user={user} />
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
export default NavBar;
