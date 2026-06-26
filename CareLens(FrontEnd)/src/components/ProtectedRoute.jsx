import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import prepareRequest from "../services/RequestService";
import MedicalProfileModal from "./MedicalProfileModal";
import { RoleContext } from "./RoleContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useContext(AuthContext);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showMedicalProfileModal, setShowMedicalProfileModal] = useState(false);
  const { setRole } = useContext(RoleContext);
  const navigate = useNavigate();
  const location = useLocation();

  /* ── Set role in context ─────────────────────────────────── */
  useEffect(() => {
    if (user) setRole(user.role);
  }, [user]);

  /* ── Admin redirect ──────────────────────────────────────── */
  useEffect(() => {
    if (!user) return;
    if (user.role === "admin" && location.pathname !== "/admin-dashboard") {
      navigate("/admin-dashboard", { replace: true });
    }
  }, [user, location.pathname]);

  /* ── Patient medical profile check ──────────────────────── */
  useEffect(() => {
    const checkMedicalProfile = async () => {
      if (!user || user.role !== "patient") {
        setProfileLoading(false);
        return;
      }
      try {
        const token = prepareRequest();
        const response = await axios.get("/api/medical-profile/get", {
          headers: { "X-XSRF-TOKEN": decodeURIComponent(token) },
        });
        if (response.data?.[0] == false) setShowMedicalProfileModal(true);
      } catch (err) {
        console.error("Failed to check medical profile:", err);
      } finally {
        setProfileLoading(false);
      }
    };
    checkMedicalProfile();
  }, [user]);

  /* ── Doctor category check ───────────────────────────────── */
  useEffect(() => {
    if (!user || user.role !== "doctor") return;
    if (user.category_id == null || user.category_id == 0) {
      navigate("/Doctor/Category/Select");
    }
  }, [user]);

  /* ── Axios 403 interceptor ───────────────────────────────── */
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 403) navigate("/forbidden", { replace: true });
        return Promise.reject(err);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [navigate]);

  if (loading || profileLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary-custom mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-secondary-custom">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  /* ── Role guard (optional allowedRoles prop) ─────────────── */
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return (
    <>
      {children}
      <MedicalProfileModal open={showMedicalProfileModal} />
    </>
  );
}
