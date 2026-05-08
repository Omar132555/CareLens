import React from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/navBar";
import Scroll from "../hooks/Scroll";

export default function ServiceUnavailable() {
  const scrolled = Scroll();
  const navigate = useNavigate();

  return (
    <div className="cl-body">
      <NavBar scrolled={scrolled} />
      <div className="d-flex align-items-center justify-content-center vh-100 bg-main">
        <div className="text-center">
          <h1 className="display-1 fw-bold" style={{ color: "#ef4444" }}>503</h1>
          <h2 className="text-3xl fw-bold text-charcoal tw-mb-2">
            Service Temporarily Unavailable
          </h2>
          <p className="text-secondary-custom tw-mb-4 text-lg max-w-md">
            The AI service is currently offline or experiencing issues. Our team is working to restore it.
          </p>
          <div
            className="tw-p-4 rounded-lg tw-mb-8"
            style={{ background: "#fef2f2", border: "1px solid #fecaca" }}
          >
            <div className="d-flex align-items-center tw-gap-2 tw-mb-2">
              <span
                className="material-symbols-outlined"
                style={{ color: "#991b1b" }}
              >
                info
              </span>
              <p className="fw-bold mb-0" style={{ color: "#991b1b" }}>
                What you can do:
              </p>
            </div>
            <ul className="text-start small tw-mb-0" style={{ color: "#7f1d1d" }}>
              <li>Check back in a few minutes</li>
              <li>Try refreshing the page</li>
              <li>Visit the home page for other features</li>
            </ul>
          </div>

          <div className="d-flex tw-gap-3 justify-content-center">
            <button
              onClick={() => window.location.reload()}
              className="cl-btn-ghost"
            >
              <span className="material-symbols-outlined">refresh</span>
              Retry
            </button>
            <button
              onClick={() => navigate("/home")}
              className="cl-btn-submit"
            >
              Home
              <span className="cl-arrow">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
