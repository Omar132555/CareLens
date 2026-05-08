import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../components/AuthContext";
import prepareRequest from "../services/RequestService";
import NavBar from "../components/navBar";
import Scroll from "../hooks/Scroll";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const scrolled = Scroll();
  const [dashboardData, setDashboardData] = useState({
    lastChat: null,
    medicationsToday: [],
    recentSymptomLog: null,
    upcomingMedications: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = prepareRequest();
        const response = await axios.get("/api/dashboard/overview", {
          headers: {
            "X-XSRF-TOKEN": decodeURIComponent(token),
          },
        });

        setDashboardData(response.data);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    } else {
      Promise.resolve().then(() => setLoading(false));
    }
  }, [user]);

  if (loading) {
    return (
      <div className="cl-body">
        <div className="d-flex align-items-center justify-content-center vh-100">
          <div className="text-center">
            <div className="spinner-border text-primary-custom mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-secondary-custom">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const medicationsToday = dashboardData.medicationsToday || [];
  const recentSymptomLog = dashboardData.recentSymptomLog;

  return (
    <div className="cl-body">
      <aside className="sidebar">
        <div className="mb-4">
          <span className="sidebar-brand">CareLens</span>
        </div>
        <nav className="d-flex flex-column gap-1 flex-grow-1">
          <button type="button" className="nav-link-item active border-0 bg-transparent" onClick={() => navigate("/dashboard")}>
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </button>
          <button type="button" className="nav-link-item border-0 bg-transparent" onClick={() => navigate("/doctors")}>
            <span className="material-symbols-outlined">stethoscope</span>
            Doctors
          </button>
          <button type="button" className="nav-link-item border-0 bg-transparent" onClick={() => navigate("/medications")}>
            <span className="material-symbols-outlined">pill</span>
            Medications
          </button>
          <button type="button" className="nav-link-item border-0 bg-transparent" onClick={() => navigate("/symptoms")}>
            <span className="material-symbols-outlined">query_stats</span>
            Symptom Tracker
          </button>
          <button type="button" className="nav-link-item border-0 bg-transparent" onClick={() => navigate("/articles")}>
            <span className="material-symbols-outlined">library_books</span>
            Blogs
          </button>
        </nav>
      </aside>

      {<NavBar scrolled={scrolled}/>}

      <main className="main-content">
        <div className="d-flex flex-column gap-5">
          <div className="row g-3">
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="bg-white rounded-3 card-shadow p-4 stat-card h-100">
                <p className="text-secondary mb-2" style={{ fontSize: '.8rem' }}>
                  Upcoming meds
                </p>
                <h3 className="h4 fw-bold mb-0">{dashboardData.upcomingMedications?.length || 0}</h3>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="bg-white rounded-3 card-shadow p-4 stat-card h-100">
                <p className="text-secondary mb-2" style={{ fontSize: '.8rem' }}>
                  Last consultation
                </p>
                <h3 className="h4 fw-bold mb-0">
                  {dashboardData.lastChat ? new Date(dashboardData.lastChat.created_at).toLocaleDateString() : 'No chats'}
                </h3>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="bg-white rounded-3 card-shadow p-4 stat-card h-100">
                <p className="text-secondary mb-2" style={{ fontSize: '.8rem' }}>
                  Symptom log
                </p>
                <h3 className="h4 fw-bold mb-0">
                  {dashboardData.recentSymptomLog ? `Severity ${dashboardData.recentSymptomLog.severity}/10` : 'No logs'}
                </h3>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="bg-white rounded-3 card-shadow p-4 stat-card h-100">
                <p className="text-secondary mb-2" style={{ fontSize: '.8rem' }}>
                  Active sessions
                </p>
                <h3 className="h4 fw-bold mb-0">1</h3>
              </div>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-12 col-lg-4">
              <div className="ai-hero rounded-3 p-4 h-100 d-flex flex-column justify-content-between card-shadow">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      psychology_alt
                    </span>
                    <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", opacity: 0.9 }}>
                      AI Assistant
                    </span>
                  </div>
                  <h3 style={{ fontFamily: "'Manrope',sans-serif", fontSize: "1.4rem", fontWeight: 700 }} className="mb-2">
                    Feeling unusual?
                  </h3>
                  <p style={{ fontSize: ".875rem", opacity: 0.8 }} className="mb-4">
                    Our clinically-trained AI is here to help you understand your symptoms in seconds.
                  </p>
                </div>
                <button className="btn w-100 fw-bold d-flex align-items-center justify-content-center gap-2 py-3" style={{ background: "#fff", color: "var(--primary)" }} onClick={() => navigate('/chat-ai/new')}>
                  Check Symptoms <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-4">
              <div className="glass-card rounded-3 p-4 h-100 d-flex flex-column justify-content-between card-shadow">
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div className="p-2 rounded-3" style={{ background: "#fef2f2" }}>
                    <span className="material-symbols-outlined text-danger" style={{ fontVariationSettings: "'FILL' 1" }}>
                      favorite
                    </span>
                  </div>
                  <span className="badge rounded-pill text-danger" style={{ background: "#fef2f2", fontSize: "11px" }}>
                    +2% from avg
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: ".8rem", color: "var(--on-surface-variant)" }}>Heart Rate</div>
                  <div className="d-flex align-items-baseline gap-1">
                    <span style={{ fontFamily: "'Manrope',sans-serif", fontSize: "2rem", fontWeight: 700 }}>
                      {dashboardData.heartRate || 72}
                    </span>
                    <span style={{ fontSize: ".8rem", color: "var(--on-surface-variant)" }}>BPM</span>
                  </div>
                </div>
                <div className="sparkline-wrap mt-3">
                  <svg className="w-100 h-100" viewBox="0 0 100 20" fill="none" stroke="#ba1a1a" strokeWidth="2">
                    <polyline points="0,15 10,12 20,18 30,5 40,15 50,10 60,15 70,8 80,12 90,5 100,10" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-4">
              <div className="glass-card rounded-3 p-4 h-100 d-flex flex-column justify-content-between card-shadow">
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div className="p-2 rounded-3" style={{ background: "rgba(86,94,116,.1)" }}>
                    <span className="material-symbols-outlined" style={{ color: "var(--secondary)", fontVariationSettings: "'FILL' 1" }}>
                      bedtime
                    </span>
                  </div>
                  <span className="badge rounded-pill" style={{ background: "rgba(86,94,116,.1)", color: "var(--secondary)", fontSize: "11px" }}>
                    Optimal
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: ".8rem", color: "var(--on-surface-variant)" }}>Sleep Duration</div>
                  <div style={{ fontFamily: "'Manrope',sans-serif", fontSize: "2rem", fontWeight: 700 }}>
                    7<span style={{ fontSize: "1.3rem" }}>h</span> 20<span style={{ fontSize: "1.3rem" }}>m</span>
                  </div>
                </div>
                <div className="d-flex gap-1 align-items-end mt-3" style={{ height: 48 }}>
                  <div className="sleep-bar" style={{ height: "66%" }}></div>
                  <div className="sleep-bar" style={{ height: "83%" }}></div>
                  <div className="sleep-bar" style={{ height: "50%", background: "rgba(86,94,116,.4)" }}></div>
                  <div className="sleep-bar" style={{ height: "75%" }}></div>
                  <div className="sleep-bar" style={{ height: "100%", background: "var(--secondary)" }}></div>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="row g-4">
                <div className="col-12 col-lg-8">
                  <div className="bg-white rounded-3 card-shadow overflow-hidden h-100">
                    <div className="d-flex justify-content-between align-items-center p-4 border-bottom" style={{ background: "#f8fafc" }}>
                      <div>
                        <h5 style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700 }} className="mb-0">
                          Today's Medications
                        </h5>
                        <small className="text-secondary">
                          {medicationsToday.length} of {Math.max(medicationsToday.length, 4)} doses completed
                        </small>
                      </div>
                      <button className="btn btn-sm btn-outline-primary fw-bold" onClick={() => navigate('/medications')}>
                        Manage All
                      </button>
                    </div>
                    <div className="p-4 d-flex flex-column gap-3">
                      {medicationsToday.length ? (
                        medicationsToday.slice(0, 4).map((item, index) => (
                          <div key={index} className="med-row d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-3">
                              <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 44, height: 44, background: '#e0f2f1' }}>
                                <span className="material-symbols-outlined">medication</span>
                              </div>
                              <div>
                                <div className="fw-bold">{item.name || item.title || 'Medication'}</div>
                                <div className="text-secondary-custom" style={{ fontSize: '.85rem' }}>
                                  {item.dose ?? item.time ?? 'Scheduled'}
                                </div>
                              </div>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                              <span className="text-muted" style={{ fontSize: '.875rem' }}>
                                {item.time ? new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'No time'}
                              </span>
                              <span className="d-flex align-items-center gap-1 fw-bold">
                                {item.status ?? 'Active'}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-secondary-custom">No medication rows to show right now.</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-12 col-lg-4">
                  <div className="bg-white rounded-3 card-shadow p-4 d-flex flex-column h-100">
                    <h5 style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700 }} className="mb-1">
                      Symptom Tracker
                    </h5>
                    <p className="text-secondary mb-4" style={{ fontSize: '.875rem' }}>
                      Record any changes or new sensations you've experienced today.
                    </p>
                    <div className="flex-grow-1">
                      <div
                        className="d-flex flex-column align-items-center justify-content-center gap-2 p-4 rounded-3 mb-4"
                        style={{ border: '2px dashed #e2e8f0', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(0,104,95,0.3)';
                          e.currentTarget.style.background = '#f8fafc';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#e2e8f0';
                          e.currentTarget.style.background = 'transparent';
                        }}
                        onClick={() => navigate('/symptoms')}
                      >
                        <span className="material-symbols-outlined text-muted" style={{ fontSize: '2rem' }}>
                          add_circle
                        </span>
                        <span className="fw-bold text-muted" style={{ fontSize: '.875rem' }}>
                          Add New Symptom Log
                        </span>
                      </div>
                      <p className="text-muted fw-bold mb-3" style={{ fontSize: '.7rem', letterSpacing: '.05em', textTransform: 'uppercase' }}>
                        Recent Logs
                      </p>
                      {recentSymptomLog ? (
                        <div className="d-flex flex-column gap-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <div className="fw-bold mb-1">{recentSymptomLog.title || 'Recent symptom'}</div>
                              <div className="text-secondary-custom" style={{ fontSize: '.85rem' }}>
                                {recentSymptomLog.description || 'No details provided.'}
                              </div>
                            </div>
                            <span className="text-muted" style={{ fontSize: '.85rem' }}>
                              {recentSymptomLog.created_at || recentSymptomLog.date
                                ? new Date(recentSymptomLog.created_at || recentSymptomLog.date).toLocaleDateString()
                                : 'Unknown date'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-secondary-custom">No recent symptom logs recorded.</div>
                      )}
                    </div>
                    <button
                      className="btn w-100 fw-bold mt-4 py-3 rounded-3"
                      style={{ background: 'var(--secondary-container)', color: 'var(--on-secondary-container)' }}
                      onClick={() => navigate('/symptoms')}
                    >
                      Generate Health Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: '1.2rem' }} className="mb-0">
                Curated Articles for You
              </h5>
              <button
                type="button"
                className="btn btn-link fw-bold d-flex align-items-center gap-1"
                style={{ color: 'var(--primary)' }}
                onClick={() => navigate('/articles')}
              >
                View All <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>
                  arrow_forward
                </span>
              </button>
            </div>
            <div className="row g-4">
              <div className="col-12 col-sm-6 col-lg-4">
                <div className="bg-white rounded-3 card-shadow overflow-hidden article-card h-100">
                  <div className="article-img">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMLlgsJWba87FtavsxrsroQnghla_nJFbqIPgA29gwRYS6QUA-WO0XF1yBe_7BPPbejxOXLpYUdM4j6WG9eEbPKYeeXZDl_C4Goa9Wd99sZ4gQujkNkrcBflxpf_opK5mcrXbKtVtbYhHSuhCNrHAV4R9h16HA5h7h6qoFUZgFexnQ6o-SlyYLTg_n4QLc-6pJeK0X4B1vyxjQWiZ0Plf6iL8wT6eX1p3_FDLY5o9lgTPhE-JbT5aEUgtG-m9p0wHbZYOEFhAo" alt="Wellness" />
                  </div>
                  <div className="p-3">
                    <span className="badge badge-wellness rounded-2 mb-2" style={{ fontSize: '10px' }}>
                      WELLNESS
                    </span>
                    <h6 className="fw-bold">5 Ways to Manage Stress Naturally</h6>
                    <p className="text-secondary" style={{ fontSize: '.8rem' }}>
                      Simple daily routines that can significantly lower cortisol levels and improve heart health...
                    </p>
                    <div className="d-flex align-items-center gap-1 text-muted mt-3" style={{ fontSize: '.75rem' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>schedule</span> 5 min read
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-sm-6 col-lg-4">
                <div className="bg-white rounded-3 card-shadow overflow-hidden article-card h-100">
                  <div className="article-img">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLPggEkWf9UxnCCdWZwdIIq5OIgbhOX5KYIG0C4YPonINpKroJf9p7Js-u1AjSOdgOIvLCOEVfTUKoO1ZACFZhoZnuYgv1vXLVVNAOhk0rif5laJAZkzJQnYbVJ6vluTiKfuhedOYxrb5HFNBWVbm8mmlniIC9dP_TqZQpk9mOGFhGOVrjUjYfFDzFbEOLAX6eQHsBQiUEOAbyWIZfe_VGiFIQlQk3VKsWoq_NsX3vS24NXBtf-7rnT8SWBog8ABnUUCUQrRRm" alt="Nutrition" />
                  </div>
                  <div className="p-3">
                    <span className="badge badge-nutrition rounded-2 mb-2" style={{ fontSize: '10px' }}>
                      NUTRITION
                    </span>
                    <h6 className="fw-bold">Anti-Inflammatory Superfoods</h6>
                    <p className="text-secondary" style={{ fontSize: '.8rem' }}>
                      Discover how including these 10 foods in your diet can help with chronic pain management...
                    </p>
                    <div className="d-flex align-items-center gap-1 text-muted mt-3" style={{ fontSize: '.75rem' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>schedule</span> 7 min read
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-sm-6 col-lg-4">
                <div className="bg-white rounded-3 card-shadow overflow-hidden article-card h-100">
                  <div className="article-img">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEEkYyj0G9djSB6VhKX4opC92k4tqbywTOSIDBAaKESIu393ahVqkg4FUM7Ul6q2aUKCanjtDcJo7qMgRBbZSeAO7urjV4ulCMeKUFXg63tzNshpOrm-dKsMr3lhHwtWJDWiTSkU-3-YtNBFiIwQuTzxtjQLVll_E5V4apHEmR0evh_amxtVIE1HL-T-Trn5_MMhf9hTubnqzlClSJ3LDsZDRSyQGd1EgwOOfHjy0BxMq2SIHS_KPvoePygEVEaODocB1sPWoR" alt="Fitness" />
                  </div>
                  <div className="p-3">
                    <span className="badge badge-fitness rounded-2 mb-2" style={{ fontSize: '10px' }}>
                      FITNESS
                    </span>
                    <h6 className="fw-bold">The Best Low-Impact Exercises</h6>
                    <p className="text-secondary" style={{ fontSize: '.8rem' }}>
                      Staying active doesn't have to be hard on your joints. Try these medical-professional approved routines...
                    </p>
                    <div className="d-flex align-items-center gap-1 text-muted mt-3" style={{ fontSize: '.75rem' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>schedule</span> 4 min read
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        <button className="fab" onClick={() => navigate('/chat-ai/new')}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>
            smart_toy
          </span>
          Ask AI
        </button>
      </main>
    </div>
  );
}
