import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavBar from "../components/navBar";
import Scroll from "../hooks/Scroll";
import prepareRequest from "../services/RequestService";
import NotificationToast from "../components/NotificationToast";

/* ────────────────────────────────────────────────────────────
   Patient Card
──────────────────────────────────────────────────────────── */
function PatientCard({ patient }) {
  const initials = patient.name
    ? patient.name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="patient-card" id={`patient-card-${patient.id}`}>
      {/* Avatar */}
      <div className="patient-card__avatar-wrap">
        {patient.profile_photo ? (
          <img
            src={`/storage/${patient.profile_photo}`}
            alt={patient.name}
            className="patient-card__avatar"
          />
        ) : (
          <div className="patient-card__avatar patient-card__avatar--initials">
            {initials}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="patient-card__body">
        <h3 className="patient-card__name">{patient.name || "—"}</h3>
        {patient.email && (
          <div className="patient-card__email">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
              mail
            </span>
            {patient.email}
          </div>
        )}
        <div className="patient-card__meta">
          <span className="patient-card__badge">Active Patient</span>
        </div>
      </div>

      {/* Footer */}
      <div className="patient-card__footer">
        <span className="patient-card__id">
          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>
            badge
          </span>
          ID #{patient.id}
        </span>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Main Page
──────────────────────────────────────────────────────────── */
export default function Patients() {
  const navigate = useNavigate();
  const scrolled = Scroll();

  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [activeNav, setActiveNav] = useState("patients");

  /* ── Fetch helpers ── */
  const getHeaders = () => {
    const token = prepareRequest();
    return { "X-XSRF-TOKEN": decodeURIComponent(token) };
  };

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/doctor/patients");
      setPatients(res.data || []);
    } catch {
      setNotification({
        type: "error",
        title: "Failed to load",
        message: "Could not fetch patients. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  /* ── Filtered patients (by search) ── */
  const filteredPatients = patients.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.name || "").toLowerCase().includes(q) ||
      (p.email || "").toLowerCase().includes(q)
    );
  });

  /* ── Sidebar nav items ── */
  const sidebarItems = [
    { key: "dashboard", label: "Dashboard", icon: "dashboard", path: "/doctor-dashboard" },
    { key: "patients", label: "Patients", icon: "groups", path: "/doctor/patients" },
    { key: "appointments", label: "Appointments", icon: "calendar_month", path: "/appointments" },
    { key: "articles", label: "Blogs", icon: "library_books", path: "/articles" },
  ];

  return (
    <>
      <style>{`
        /* ── Page layout ── */
        .patients-page {
          background: #f8f9ff;
          min-height: 100vh;
        }

        /* ── Sidebar ── */
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

        .patients-main {
          margin-left: 260px;
          padding: 2rem;
          padding-top: 90px;
        }

        /* ── Patient cards grid ── */
        .patients-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .patient-card {
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
        .patient-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0,0,0,.1);
        }

        .patient-card__avatar-wrap {
          position: relative;
          width: 72px;
          height: 72px;
          margin: 0 auto;
        }
        .patient-card__avatar {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          object-fit: cover;
        }
        .patient-card__avatar--initials {
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--primary), #00628d);
          color: #fff;
          font-size: 1.4rem;
          font-weight: 800;
          font-family: 'Manrope', sans-serif;
        }

        .patient-card__body {
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .patient-card__name {
          font-size: 1rem;
          font-weight: 700;
          color: #0b1c30;
          margin: 0;
        }
        .patient-card__email {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          font-size: 0.78rem;
          color: #94a3b8;
          word-break: break-all;
          text-align: center;
        }
        .patient-card__meta {
          display: flex;
          justify-content: center;
          margin-top: 0.25rem;
        }
        .patient-card__badge {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.2rem 0.6rem;
          border-radius: 999px;
          letter-spacing: .04em;
          text-transform: uppercase;
          background: #d1fae5;
          color: #059669;
        }
        .patient-card__footer {
          margin-top: auto;
          display: flex;
          justify-content: center;
        }
        .patient-card__id {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.8rem;
          color: #94a3b8;
          font-weight: 600;
        }

        /* ── Search bar ── */
        .patients-search-wrap {
          position: relative;
          max-width: 400px;
          flex: 1;
        }
        .patients-search {
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
        .patients-search:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(0,121,107,.12);
        }
        .patients-search-icon {
          position: absolute;
          left: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
        }

        /* ── Empty state ── */
        .patients-empty {
          grid-column: 1 / -1;
          text-align: center;
          padding: 4rem 2rem;
          color: #94a3b8;
        }

        /* ── Skeleton loader ── */
        .patient-skeleton {
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

      <div className="patients-page cl-body">
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
                className={`nav-link-item border-0 bg-transparent${
                  activeNav === item.key ? " active" : ""
                }`}
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
            <div className="fw-bold mb-1" style={{ fontSize: "0.875rem" }}>
              Need help?
            </div>
            <div style={{ fontSize: "0.78rem", opacity: 0.85 }}>
              Contact support for assistance with your account.
            </div>
          </div>
        </aside>

        {/* Navbar */}
        <NavBar scrolled={scrolled} />

        {/* Main content */}
        <main className="patients-main">
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
                My Patients
              </h1>
              <p style={{ color: "#64748b", fontSize: "0.9rem", margin: 0 }}>
                All patients currently following you.
              </p>
            </div>

            {/* Search */}
            <div className="patients-search-wrap">
              <span
                className="material-symbols-outlined patients-search-icon"
                style={{ fontSize: 20 }}
              >
                search
              </span>
              <input
                id="patient-search"
                type="text"
                className="patients-search"
                placeholder="Search by name or email…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Stats bar */}
          {!loading && (
            <div
              className="d-flex align-items-center gap-2 mb-4"
              style={{ fontSize: "0.875rem", color: "#64748b" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                groups
              </span>
              <span>
                Showing <strong>{filteredPatients.length}</strong> patient
                {filteredPatients.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          {/* Patients grid */}
          {loading ? (
            <div className="patients-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="patient-skeleton">
                  <div className="skeleton-avatar" />
                  <div className="skeleton-line" style={{ width: "60%" }} />
                  <div className="skeleton-line" style={{ width: "45%" }} />
                  <div className="skeleton-line" style={{ width: "80%", height: 16, borderRadius: 8 }} />
                </div>
              ))}
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="patients-grid">
              <div className="patients-empty">
                <span
                  className="material-symbols-outlined mb-3"
                  style={{ fontSize: 64, display: "block", color: "#cbd5e1" }}
                >
                  person_search
                </span>
                <h3 style={{ color: "#475569", fontWeight: 700 }}>No patients found</h3>
                <p style={{ fontSize: "0.9rem" }}>
                  {searchQuery
                    ? `No results for "${searchQuery}". Try a different search.`
                    : "You have no patients following you yet."}
                </p>
              </div>
            </div>
          ) : (
            <div className="patients-grid">
              {filteredPatients.map((patient) => (
                <PatientCard key={patient.id} patient={patient} />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}