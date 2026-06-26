import React from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/navBar";
import Scroll from "../hooks/Scroll";

export default function Forbidden() {
  const scrolled = Scroll();
  const navigate = useNavigate();

  return (
    <div className="cl-body">
      <NavBar scrolled={scrolled} />
      <div className="d-flex align-items-center justify-content-center vh-100 bg-main">
        <div className="text-center">
          <h1 className="display-1 fw-bold text-primary-custom">403</h1>
          <h2 className="text-3xl fw-bold text-charcoal tw-mb-2">
            Forbidden
          </h2>
          <p className="text-secondary-custom tw-mb-8 text-lg max-w-md">
            You are not Authorized to do this action for now.
          </p>
          <div className="d-flex tw-gap-3 justify-content-center">
            <button
              onClick={() => navigate(-1)}
              className="cl-btn-ghost"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Go Back
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
