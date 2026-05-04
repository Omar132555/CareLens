import { useState, useEffect, useContext } from "react";
import NavBar from "../components/navBar";
import { AuthContext } from "../components/AuthContext";
import Scroll from "../hooks/Scroll";

const PRIMARY = "#00685f";
const PRIMARY_HOVER = "#008378";

const Icon = ({ name, size = 24, color, className = "" }) => (
  <span className={`ms ${className}`} style={{ fontSize: size, color }}>
    {name}
  </span>
);

const features = [
  {
    icon: "chat_bubble",
    title: "AI Medical Assistant",
    desc: "Conversational interface for symptom checking and health Q&A.",
    danger: false,
  },
  {
    icon: "warning",
    title: "Emergency Alert System",
    desc: "Automated detection of critical vitals with emergency contact pinging.",
    danger: true,
  },
  {
    icon: "notifications",
    title: "Medication Reminder",
    desc: "Smart scheduling and intake tracking for complex prescriptions.",
    danger: false,
  },
  {
    icon: "monitoring",
    title: "Symptom Tracker",
    desc: "Visualize patterns in your health data over weeks and months.",
    danger: false,
  },
  {
    icon: "history",
    title: "Chat History & Memory",
    desc: "Context-aware AI that remembers your long-term health journey.",
    danger: false,
  },
  {
    icon: "person",
    title: "Medical Profile",
    desc: "Localized storage of conditions, allergies, and blood type.",
    danger: false,
  },
  {
    icon: "medical_services",
    title: "Doctor Follow-up",
    desc: "Export localized summaries for your human primary care doctor.",
    danger: false,
  },
  {
    icon: "article",
    title: "Medical Articles",
    desc: "Curated database of peer-reviewed health information.",
    danger: false,
  },
];

export default function CareLens() {
  const scrolled = Scroll();
  return (
    <div className="cl-body">
      {/* NAV */}
      <NavBar scrolled={scrolled} />
      {/* HERO */}
      <button class="db-fab">
        <span class="material-symbols-outlined">smart_toy</span>
        Ask AI
      </button>
      <section className="cl-hero">
        <div className="cl-blob cl-blob-1" />
        <div className="cl-blob cl-blob-2" />
        <div
          className="cl-container"
          style={{ position: "relative", zIndex: 1 }}
        >
          <div className="cl-hero-grid">
            <div>
              <div className="cl-badge">
                <span className="cl-badge-dot" />
                Private Local AI
              </div>
              <h1 className="cl-hero-title">
                Your Private AI Doctor. Always Available.
              </h1>
              <p className="cl-hero-sub">
                CareLens provides instant medical guidance powered by a local AI
                — your health data never leaves your device. Secure, fast, and
                professional assistance.
              </p>
              <div className="cl-hero-btns">
                <button className="cl-btn-lg cl-btn-lg-primary">
                  Get Started
                </button>
                {/* {!user && (
                  <button className="cl-btn-lg cl-btn-lg-outline">Login</button>
                )} */}
              </div>
            </div>

            <div className="cl-hero-visual">
              <div className="cl-center-img">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCv-LQ_xNKsO_Wg6Q0s0oR7fHXJ7MxuhRtDXkO1q3uS94NyDfqtop9Nj5HEyfIOAzJ3j-8myaYghG4cZzjyWmjeWqFmqnOzYsrHU5GyrUgQfyvmFZhaGYqtt8-fORVNcTrS0gTCS9Ac-FmKu3ccCZ8lrhKMtrGd-17p8W8drbJQfHqRSSCbZ-udCeR3rmWA8NfKf4tYe9GoHkV0C52IY9VAqTCsRS3vKW1Ekfh26mFinN3n7S78JZumjsn8YIBnBYfCXBoYyFU1zr85"
                  alt="bg"
                />
              </div>

              <div className="cl-glass cl-card-heart">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <div className="cl-card-icon">
                    <Icon name="monitoring" color={PRIMARY} />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>
                    Heart Rate
                  </span>
                </div>
                <div className="cl-bpm">72 BPM</div>
                <div className="cl-bars">
                  {[16, 24, 32, 20, 28, 18, 36].map((h, i) => (
                    <div
                      key={i}
                      className="cl-bar"
                      style={{
                        height: h,
                        background: `rgba(0,104,95,${0.15 + i * 0.1})`,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="cl-glass cl-card-privacy ms-3">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <Icon name="lock" color={PRIMARY} size={20} />
                  <span style={{ fontWeight: 700, fontSize: 14 }}>
                    Encrypted Local Storage
                  </span>
                </div>
                <p
                  style={{
                    color: "#3d4947",
                    fontSize: 14,
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  Your medical logs are processed offline using CareLens Core
                  Engine.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMS */}
      <section className="cl-section cl-section-white">
        <div className="cl-container">
          <div style={{ textAlign: "center", marginBottom: 0 }}>
            <h2 className="cl-section-title">
              The healthcare gap we're closing.
            </h2>
            <p className="cl-section-sub">
              Standard medical access is often fragmented and risky.
            </p>
          </div>
          <div className="cl-problems-grid">
            {[
              {
                icon: "schedule",
                title: "Long waiting times",
                desc: "Average specialist wait times can span weeks or even months.",
              },
              {
                icon: "payments",
                title: "Expensive consultations",
                desc: "High costs prevent millions from seeking early medical guidance.",
              },
              {
                icon: "security",
                title: "Privacy concerns",
                desc: "Medical data in the cloud is vulnerable to breaches and tracking.",
              },
            ].map((p) => (
              <div key={p.title} className="cl-prob-card">
                <div className="cl-prob-icon">
                  <Icon name={p.icon} color="#e53e3e" size={32} />
                </div>
                <h3 className="cl-prob-title">{p.title}</h3>
                <p className="cl-prob-desc">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section className="cl-section cl-section-gray">
        <div className="cl-container">
          <div className="cl-solution-grid">
            <div className="cl-solution-img">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYFDJUbJ10OP7R1ABcxB8z99YTq9GhHxu82q89Pw_APKXFfARxLmyl7iYhQnNxtuJWTXQmMPQCD7mKBcGS36S-DbCSp5rm2zPEK-Nxzb152rxYrxYIPgrntFsHtQP_nDPiDg55wKTWo0EL4tP4XaCiuj31Wc2Ym2kD-aI7sPZyAJhj5XfAhL3AGApTQ7dxRTXFZjXc7BsWz7Tf5Vey5-tbsMMlGheGRMJw-Ig-q8_wpbsFmh2LrfG5zXO5WCb7PArHf1o77CP3Spdd"
                alt="solution"
              />
              <div className="cl-solution-img-overlay" />
            </div>
            <div>
              <h2 className="cl-section-title" style={{ marginBottom: 40 }}>
                Medical precision, powered by local intelligence.
              </h2>
              <div className="cl-features-list">
                {[
                  {
                    icon: "bolt",
                    title: "Instant AI responses",
                    desc: "Get clinically-backed guidance in milliseconds, not days.",
                  },
                  {
                    icon: "wifi_off",
                    title: "Offline processing",
                    desc: "Our LLMs run directly on your hardware. No internet required for analysis.",
                  },
                  {
                    icon: "verified_user",
                    title: "Privacy-first",
                    desc: "Zero-knowledge architecture means we can't see your data even if we wanted to.",
                  },
                ].map((f) => (
                  <div key={f.title} className="cl-feature-item">
                    <div className="cl-feature-icon">
                      <Icon name={f.icon} color={PRIMARY} />
                    </div>
                    <div>
                      <div className="cl-feature-title">{f.title}</div>
                      <div className="cl-feature-desc">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="cl-section cl-section-white" id="features">
        <div className="cl-container">
          <h2 className="cl-section-title">A complete health ecosystem.</h2>
          <div className="cl-feat-grid">
            {features.map((f) => (
              <div
                key={f.title}
                className={`cl-feat-card${f.danger ? " danger-tint" : ""}`}
              >
                <Icon
                  name={f.icon}
                  className="cl-feat-icon"
                  color={f.danger ? "#e53e3e" : PRIMARY}
                  size={28}
                />
                <div className="cl-feat-title">{f.title}</div>
                <div className="cl-feat-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECURITY */}
      <section className="cl-section cl-section-dark">
        <div className="cl-container" style={{ textAlign: "center" }}>
          <div className="cl-shield-wrap">
            <Icon name="shield" color={PRIMARY} size={36} />
          </div>
          <h2 style={{ fontSize: 42, color: "#fff", marginBottom: 0 }}>
            Security that goes beyond the cloud.
          </h2>
          <div className="cl-security-grid">
            <div>
              <div className="cl-sec-title">100% Local AI Processing</div>
              <p className="cl-sec-desc">
                Your health data is analyzed by the neural engine of your
                smartphone or computer. It never travels across the public
                internet.
              </p>
            </div>
            <div>
              <div className="cl-sec-title">Encrypted Data</div>
              <p className="cl-sec-desc">
                All local storage is protected by AES-256 hardware-level
                encryption, accessible only by your biometric authentication.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="cl-section cl-section-white" id="how-it-works">
        <div className="cl-container">
          <div style={{ textAlign: "center" }}>
            <h2 className="cl-section-title">
              Clinical guidance in three steps.
            </h2>
          </div>
          <div className="cl-steps">
            <div className="cl-steps-line" />
            {[
              {
                n: "1",
                title: "Describe symptoms",
                desc: "Speak or type your symptoms and health history into the secure local interface.",
              },
              {
                n: "2",
                title: "Local analysis",
                desc: "The on-device LLM processes your data against 20 million medical clinical records.",
              },
              {
                n: "3",
                title: "Instant guidance",
                desc: "Receive a structured report with potential diagnoses and recommended next steps.",
              },
            ].map((s) => (
              <div key={s.n} className="cl-step">
                <div className="cl-step-num">{s.n}</div>
                <div className="cl-step-title">{s.title}</div>
                <p className="cl-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="cl-cta bg-white">
        <div className="cl-cta-inner">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3PyLwHEX2gwQPUlH4IP3Jt8h-7nMAoKoMlBe-H1nKE9RQBPpVWl2PFOySLYa0NbS3r3GRL-fnP4CoZVlqdEzpy9RqdOE22aQfpgXoNZDSy-ssyGjXTKSXViBcopy9BLuj9H_ZWWg3YAq5bA-6xCSB7UdxTwy_vDJ92eq7bPk8WLH2U2aeK0BkDpBSJhKcghfnvg8raH9nTxeQH957DfTZEM8vZd0_0vdzIR3c00l_DyhN74UuRSFYZFvLFGwb8Ny3waiol15adfgZ"
            alt="texture"
          />
          <div className="cl-cta-content">
            <h2 className="cl-cta-title">Take Control of Your Health Today</h2>
            <p className="cl-cta-sub">
              Join 50,000+ users who trust CareLens for their daily medical
              guidance and data security.
            </p>
            <button className="cl-btn-cta">Start Now</button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="cl-footer">
        <div className="cl-container bg-light">
          <div className="cl-footer-grid">
            <div>
              <div className="cl-footer-logo">CareLens</div>
              <p className="cl-footer-copy">
                © 2024 CareLens. This is an AI assistant, not a doctor. In
                emergencies, contact medical services immediately.
              </p>
            </div>
            <div className="cl-footer-links-grid">
              {[
                { title: "Product", links: ["Features", "Security"] },
                {
                  title: "Legal",
                  links: ["Privacy Policy", "Terms of Service"],
                },
                { title: "Support", links: ["Cookie Policy", "Security"] },
              ].map((col) => (
                <div key={col.title}>
                  <div className="cl-footer-col-title">{col.title}</div>
                  {col.links.map((l) => (
                    <a key={l} href="#" className="cl-footer-link">
                      {l}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
