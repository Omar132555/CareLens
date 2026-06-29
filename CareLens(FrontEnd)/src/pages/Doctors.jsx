import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavBar from "../components/navBar";
import Scroll from "../hooks/Scroll";
import prepareRequest from "../services/RequestService";
import NotificationToast from "../components/NotificationToast";
/* ────────────────────────────────────────────────────────────
   Helper – follow-state display
──────────────────────────────────────────────────────────── */
function FollowButton({ doctorId, followState, onToggle, loading }) {
  const isLoading = loading === doctorId;
  if (followState === "approved") {
    return (
      <button
        id={`unfollow-btn-${doctorId}`}
        className="follow-btn follow-btn--unfollow"
        onClick={() => onToggle(doctorId, followState)}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="spinner-border spinner-border-sm" role="status" />
        ) : (
          <>
            <span className="material-symbols-outlined">person_remove</span>
            Unfollow
          </>
        )}
      </button>
    );
  }
  if (followState === "pending") {
    return (
      <button
        id={`cancel-request-btn-${doctorId}`}
        className="follow-btn follow-btn--pending"
        onClick={() => onToggle(doctorId, followState)}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="spinner-border spinner-border-sm" role="status" />
        ) : (
          <>
            <span className="material-symbols-outlined">schedule</span>
            Cancel Request
          </>
        )}
      </button>
    );
  }
  // null / no request
  return (
    <button
      id={`follow-btn-${doctorId}`}
      className="follow-btn follow-btn--follow"
      onClick={() => onToggle(doctorId, followState)}
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="spinner-border spinner-border-sm" role="status" />
      ) : (
        <>
          <span className="material-symbols-outlined">person_add</span>
          Follow
        </>
      )}
    </button>
  );
}
/* ────────────────────────────────────────────────────────────
   Doctor Card
──────────────────────────────────────────────────────────── */
function DoctorCard({ doctor, onToggle, loadingId }) {
  const initials = doctor.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const verificationBadge = {
    approved: { label: "Verified", color: "#059669", bg: "#d1fae5" },
    pending: { label: "Unverified", color: "#b45309", bg: "#fef3c7" },
    none: { label: "Unverified", color: "#6b7280", bg: "#f3f4f6" },
  }[doctor.verification_status] || { label: "—", color: "#6b7280", bg: "#f3f4f6" };
  return (
    <div className="doctor-card" id={`doctor-card-${doctor.id}`}>
      {/* Avatar */}
      <div className="doctor-card__avatar-wrap">
        {doctor.profile_photo ? (
          <img
            src={`/storage/${doctor.profile_photo}`}
            alt={doctor.name}
            className="doctor-card__avatar"
          />
        ) : (
          <div className="doctor-card__avatar doctor-card__avatar--initials">
            {initials}
          </div>
        )}
        {doctor.verification_status === "approved" && (
          <span className="doctor-card__verified-dot" title="Verified Doctor">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
              verified
            </span>
          </span>
        )}
      </div>
      {/* Info */}
      <div className="doctor-card__body">
        <h3 className="doctor-card__name">Dr. {doctor.name}</h3>
        <div className="doctor-card__specialty">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
            stethoscope
          </span>
          {doctor.category?.name || "General"}
        </div>
        <div className="doctor-card__meta">
          <span
            className="doctor-card__badge"
            style={{ color: verificationBadge.color, background: verificationBadge.bg }}
          >
            {verificationBadge.label}
          </span>
          {doctor.email && (
            <span className="doctor-card__email">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                mail
              </span>
              {doctor.email}
            </span>
          )}
        </div>
      </div>
      {/* Follow action */}
      <div className="doctor-card__footer">
        <FollowButton
          doctorId={doctor.id}
          followState={doctor.follow_state}
          onToggle={onToggle}
          loading={loadingId}
        />
      </div>
    </div>
  );
}
/* ────────────────────────────────────────────────────────────
   Main Page
──────────────────────────────────────────────────────────── */
export default function Doctors() {
    const navigate = useNavigate();
  const scrolled = Scroll();
   const [doctors, setDoctors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null); // null = all
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState(null); // id of doctor being toggled
  const [notification, setNotification] = useState(null);
  const [activeNav, setActiveNav] = useState("doctors");
  /* ── Fetch helpers ── */
  const getHeaders = () => {
    const token = prepareRequest();
    return { "X-XSRF-TOKEN": decodeURIComponent(token) };
  };
    const fetchCategories = useCallback(async () => {
    try {
         const res = await axios.get("/api/categories/get", {
        headers: getHeaders(),
      });
      setCategories(res.data || []);
    } catch {
      // non-critical
    }
  }, []);
  const fetchDoctors = useCallback(async (categoryId = null) => {
    setLoading(true);
    try {
      const params = categoryId ? { category_id: categoryId } : {};
      const res = await axios.get("/api/patient/doctors/all", {
        headers: getHeaders(),
        params,
      });
      setDoctors(res.data || []);
    } catch {
      setNotification({
        type: "error",
        title: "Failed to load",
        message: "Could not fetch doctors. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchCategories();
    fetchDoctors(null);
  }, [fetchCategories, fetchDoctors]);
  /* ── Category select ── */
  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    fetchDoctors(catId);
  };
  /* ── Toggle follow ── */
  const handleToggleFollow = async (doctorId, currentState) => {
    setLoadingId(doctorId);
    try {
      const res = await axios.post(
        "/api/patient/follow/request",
        { doctor_id: doctorId },
        { headers: getHeaders() }
      );
      const status = res.data?.status;
      // Optimistically update the follow_state in local list
      setDoctors((prev) =>
        prev.map((d) => {
          if (d.id !== doctorId) return d;
          let newState;
          if (status === "cancelled" || status === "removed") {
            newState = null;
          } else if (status === "sent") {
            newState = "pending";
          } else {
            newState = currentState;
          }
          return { ...d, follow_state: newState };
        })
      );
      const msg =
        status === "sent"
          ? "Follow request sent successfully"
          : status === "cancelled"
          ? "Follow request cancelled"
          : status === "removed"
          ? 'Follow Removed'
          : 'Action complete';
      setNotification({ type: "success", title: "Done", message: msg });
    } catch {
      setNotification({
        type: "error",
        title: "Error",
        message: "Could not complete the action. Please try again.",
      });
    } finally {
      setLoadingId(null);
    }
  };
  /* ── Filtered doctors (by search) ── */
  const filteredDoctors = doctors.filter((d) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      (d.category?.name || "").toLowerCase().includes(q) ||
      (d.email || "").toLowerCase().includes(q)
    );
  });
  /* ── Sidebar nav items ── */
  const sidebarItems = [
    { key: "dashboard", label: "Dashboard", icon: "dashboard", path: "/patient-dashboard" },
    { key: "doctors", label: "Doctors", icon: "stethoscope", path: "/doctors" },
    { key: "medications", label: "Medications", icon: "pill", path: "/medications" },
    { key: "symptoms", label: "Symptom Tracker", icon: "query_stats", path: "/symptoms" },
    { key: "articles", label: "Blogs", icon: "library_books", path: "/articles" },
  ];
  return (
      <>
      {/* Inline styles for the Doctors page */}
      <style>{`
        /* ── Doctors page layout ── */
        .doctors-page {
          background: #f8f9ff;
          min-height: 100vh;
        }
   /* ── sidebar ── */
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          width: 260px;
          height: 100%;
          background: #fff;
          border-right: 1px solid rgba(226,232,240,.8);
          display: flex;
          flex-direction: column;
          padding: 1.5rem 1rem;
          z-index: 1040;
          box-shadow: 2px 0 12px rgba(0,0,0,.04);
        }
             .doctors-main {
          margin-left: 260px;
          padding: 2rem;
          padding-top: 90px; /* below navbar */
        }
        /* ── Category pill tabs ── */
        .cat-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 2rem;
        }
        .cat-pill {
          padding: 0.5rem 1.1rem;
          border-radius: 999px;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          font-size: 0.85rem;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s;
        }
        .cat-pill:hover {
          border-color: var(--primary);
          color: var(--primary);
        }
        .cat-pill.active {
          background: var(--primary);
          border-color: var(--primary);
          color: #fff;
          box-shadow: 0 4px 14px rgba(0,121,107,.25);
        }
        /* ── Doctor cards grid ── */
        .doctors-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        .doctor-card {
          background: #fff;
          border-radius: 20px;
          padding: 1.5rem;
          box-shadow: 0 4px 20px rgba(0,0,0,.06);
          border: 1px solid rgba(226,232,240,.6);
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .doctor-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0,0,0,.1);
        }
        .doctor-card__avatar-wrap {
          position: relative;
          width: 72px;
          height: 72px;
          margin: 0 auto;
        }
        .doctor-card__avatar {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          object-fit: cover;
        }
        .doctor-card__avatar--initials {
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--primary), #00628d);
          color: #fff;
          font-size: 1.4rem;
          font-weight: 800;
          font-family: 'Manrope', sans-serif;
        }
        .doctor-card__verified-dot {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 22px;
          height: 22px;
          background: #059669;
          border-radius: 50%;
          border: 2px solid #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        }
        .doctor-card__body {
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .doctor-card__name {
          font-size: 1rem;
          font-weight: 700;
          color: #0b1c30;
          margin: 0;
        }
        .doctor-card__specialty {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.3rem;
          font-size: 0.85rem;
          color: #475569;
          font-weight: 500;
        }
        .doctor-card__meta {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.3rem;
          margin-top: 0.25rem;
        }
        .doctor-card__badge {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.2rem 0.6rem;
          border-radius: 999px;
          letter-spacing: .04em;
          text-transform: uppercase;
        }
        .doctor-card__email {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.78rem;
          color: #94a3b8;
          word-break: break-all;
          text-align: center;
        }
        .doctor-card__footer {
          margin-top: auto;
        }
        /* ── Follow buttons ── */
        .follow-btn {
          width: 100%;
          padding: 0.6rem 1rem;
          border-radius: 12px;
          border: none;
          font-size: 0.875rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          transition: all 0.2s;
          font-family: 'Manrope', sans-serif;
        }
        .follow-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .follow-btn--follow {
          background: var(--primary);
          color: #fff;
          box-shadow: 0 4px 14px rgba(0,121,107,.3);
        }
        .follow-btn--follow:hover:not(:disabled) {
          background: var(--primary-hover);
          transform: translateY(-1px);
        }
        .follow-btn--pending {
          background: #fef3c7;
          color: #b45309;
          border: 1.5px solid #fcd34d;
        }
        .follow-btn--pending:hover:not(:disabled) {
          background: #fde68a;
        }
        .follow-btn--unfollow {
          background: #fee2e2;
          color: #b91c1c;
          border: 1.5px solid #fca5a5;
        }
        .follow-btn--unfollow:hover:not(:disabled) {
          background: #fecaca;
        }
        /* ── Search bar ── */
        .doctors-search-wrap {
          position: relative;
          max-width: 400px;
          flex: 1;
        }
        .doctors-search {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.75rem;
          border-radius: 14px;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          font-size: 0.875rem;
          font-family: 'Manrope', sans-serif;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .doctors-search:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(0,121,107,.12);
        }
        .doctors-search-icon {
          position: absolute;
          left: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
        }
        /* ── Empty state ── */
        .doctors-empty {
          grid-column: 1 / -1;
          text-align: center;
          padding: 4rem 2rem;
          color: #94a3b8;
        }
        /* ── Skeleton loader ── */
        .doctor-skeleton {
          background: #fff;
          border-radius: 20px;
          padding: 1.5rem;
          border: 1px solid rgba(226,232,240,.6);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        .skeleton-avatar {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        .skeleton-line {
          height: 12px;
          border-radius: 6px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div className="doctors-page cl-body">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="mb-4">
            <span className="sidebar-brand">CareLens</span>
          </div>
          <nav className="d-flex flex-column gap-1 flex-grow-1">
            {sidebarItems.map((item) => (
              <button
                key={item.key}
                id={`sidebar-${item.key}`}
                type="button"
                className={`nav-link-item border-0 bg-transparent${activeNav === item.key ? " active" : ""}`}
                onClick={() => {
                  setActiveNav(item.key);
                  navigate(item.path);
                }}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="sidebar-support">
            <div className="fw-bold mb-1" style={{ fontSize: "0.875rem" }}>Need help?</div>
            <div style={{ fontSize: "0.78rem", opacity: 0.85 }}>
              Contact support for assistance with your account.
            </div>
          </div>
        </aside>
        {/* Navbar */}
        <NavBar scrolled={scrolled} />
        {/* Main content */}
        <main className="doctors-main">
          <NotificationToast
            open={!!notification}
            notification={notification}
            onClose={() => setNotification(null)}
          />
          {/* Header */}
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
              <h1
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 800,
                  fontSize: "1.75rem",
                  color: "#0b1c30",
                  marginBottom: "0.25rem",
                }}
              >
                Find a Doctor
              </h1>
              <p style={{ color: "#64748b", fontSize: "0.9rem", margin: 0 }}>
                Browse and follow doctors by specialty to get personalized care.
              </p>
            </div>
            {/* Search */}
            <div className="doctors-search-wrap">
              <span
                className="material-symbols-outlined doctors-search-icon"
                style={{ fontSize: 20 }}
              >
                search
              </span>
              <input
                id="doctor-search"
                type="text"
                className="doctors-search"
                placeholder="Search by name, specialty…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          {/* Category filter pills */}
          <div className="cat-tabs">
            <button
              id="cat-all"
              className={`cat-pill${selectedCategory === null ? " active" : ""}`}
              onClick={() => handleCategorySelect(null)}
            >
              All Specialties
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                id={`cat-${cat.id}`}
                className={`cat-pill${selectedCategory === cat.id ? " active" : ""}`}
                onClick={() => handleCategorySelect(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
            {/* Stats bar */}
          {!loading && (
            <div
              className="d-flex align-items-center gap-2 mb-4"
              style={{ fontSize: "0.875rem", color: "#64748b" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                group
              </span>
              <span>
                Showing <strong>{filteredDoctors.length}</strong> doctor
                {filteredDoctors.length !== 1 ? "s" : ""}
                {selectedCategory && categories.find((c) => c.id === selectedCategory)
                  ? ` in ${categories.find((c) => c.id === selectedCategory).name}`
                  : ""}
              </span>
            </div>
          )}
          {/* Doctors grid */}
          {loading ? (
            <div className="doctors-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="doctor-skeleton">
                  <div className="skeleton-avatar" />
                  <div className="skeleton-line" style={{ width: "60%" }} />
                  <div className="skeleton-line" style={{ width: "45%" }} />
                  <div className="skeleton-line" style={{ width: "80%", height: 38, borderRadius: 12 }} />
                </div>
              ))}
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="doctors-grid">
              <div className="doctors-empty">
                <span
                  className="material-symbols-outlined mb-3"
                  style={{ fontSize: 64, display: "block", color: "#cbd5e1" }}
                >
                  person_search
                </span>
                <h3 style={{ color: "#475569", fontWeight: 700 }}>No doctors found</h3>
                <p style={{ fontSize: "0.9rem" }}>
                  {searchQuery
                    ? `No results for "${searchQuery}". Try a different search.`
                    : "No doctors available in this specialty yet."}
                </p>
              </div>
            </div>
          ) : (
            <div className="doctors-grid">
              {filteredDoctors.map((doctor) => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                  onToggle={handleToggleFollow}
                  loadingId={loadingId}
                />
              ))}
            </div>
          )}
        </main>
      </div>
       </>
  );
}
