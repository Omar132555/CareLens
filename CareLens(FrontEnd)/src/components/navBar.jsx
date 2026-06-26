import logo from "../../public/CareLensLogo.png";
import { hasRole } from "../helpers/hasRole";
import { AuthContext } from "./AuthContext";
import UserProfile from "./UserProfile";
import { useContext, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";

function NavBar(scrolled) {
  const { user, setUser, loading } = useContext(AuthContext);
  const navigate = useNavigate();

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
                <NavLink
                  to="/chat-ai/new"
                  className={({ isActive }) =>
                    isActive ? "cl-nav-link active" : "cl-nav-link"
                  }
                >
                  AI Assistant
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
                <NavLink
                  to="/symptoms"
                  className={({ isActive }) =>
                    isActive ? "cl-nav-link active" : "cl-nav-link"
                  }
                >
                  Symptom Tracker
                </NavLink>
                <NavLink
                  to="/treatment-followup"
                  className={({ isActive }) =>
                    isActive ? "cl-nav-link active" : "cl-nav-link"
                  }
                >
                  Treatment Plan
                </NavLink>
                {hasRole(user,"patient")&&(
                <NavLink
                  to="/medical-profile"
                  className={({ isActive }) =>
                    isActive ? "cl-nav-link active" : "cl-nav-link"
                  }
                >
                  Medical Profile
                </NavLink>
                )}
                {hasRole(user,"doctor")&&(
                <NavLink
                  to="/patients"
                  className={({ isActive }) =>
                    isActive ? "cl-nav-link active" : "cl-nav-link"
                  }
                >
                  Patients
                </NavLink>
                )}
                {hasRole(user,"patient")&&(
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
                    style={{ cursor: "pointer" }}
                  >
                    notifications
                  </span>
                  <span
                    className="position-absolute top-0 end-0 w-2 h-2 bg-danger rounded-circle border border-white"
                    style={{ width: 8, height: 8, display: "block" }}
                  />
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
                {hasRole(user,"patient")&&(
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
              <UserProfile title={user.name} />
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
export default NavBar;
