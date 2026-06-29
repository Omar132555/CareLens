import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavBar from "../components/navBar";
import Scroll from "../hooks/Scroll";
import prepareRequest from "../services/RequestService";
import NotificationToast from "../components/NotificationToast";

export default function SavedArticles() {
  const scrolled = Scroll();
  const navigate = useNavigate();

  const [savedArticles, setSavedArticles] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [notification, setNotification]   = useState(null);

  /* ── Fetch saved articles ── */
  useEffect(() => {
    const load = async () => {
      try {
        const token    = prepareRequest();
        const response = await axios.get("/api/articles/saved", {
          headers: { "X-XSRF-TOKEN": decodeURIComponent(token) },
        });
        setSavedArticles(response.data || []);
      } catch {
        setNotification({ type: "error", title: "Load Failed", message: "Could not load your saved articles" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ── Toggle save (remove) ──
     Calls the same POST /api/articles/{id}/save endpoint which toggles.
     Backend returns { saved: false, saves_count } when unsaving.
  ── */
  const handleRemoveSaved = async (articleId) => {
    try {
      const token = prepareRequest();
      await axios.post(
        `/api/articles/${articleId}/save`, {},
        { headers: { "X-XSRF-TOKEN": decodeURIComponent(token) } }
      );
      // Optimistically remove from list
      setSavedArticles((prev) => prev.filter((a) => a.id !== articleId));
      setNotification({ type: "success", title: "Removed", message: "Article removed from saved" });
    } catch {
      setNotification({ type: "error", title: "Error", message: "Failed to remove article" });
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="cl-body">
        <NavBar scrolled={scrolled} />
        <div className="d-flex align-items-center justify-content-center vh-100">
          <div className="text-center">
            <div className="spinner-border text-primary-custom mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-secondary-custom">Loading saved articles...</p>
          </div>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════
     RENDER
  ════════════════════════════════════════ */
  return (
    <div className="cl-body">
      <NavBar scrolled={scrolled} />

      <main className="tw-py-8 bg-main min-vh-100">
        <div className="tw-max-w-6xl tw-mx-auto tw-px-4">

          <NotificationToast
            open={!!notification}
            notification={notification}
            onClose={() => setNotification(null)}
          />

          {/* ── Header ── */}
          <div className="d-flex justify-content-between align-items-center tw-mb-8">
            <div>
              <h1 className="text-3xl fw-bold text-charcoal mb-1">Saved Articles</h1>
              <p className="text-secondary-custom">
                Your personal reading list ({savedArticles.length})
              </p>
            </div>
            <button onClick={() => navigate("/articles")} className="cl-btn-ghost">
              <span className="material-symbols-outlined">add</span>
              Browse Articles
            </button>
          </div>

          {/* ── Grid ── */}
          {savedArticles.length > 0 ? (
            <div className="row g-4">
              {savedArticles.map((article) => (
                <div key={article.id} className="col-12 col-md-6 col-lg-4">
                  <div className="cl-card tw-overflow-hidden tw-h-full d-flex flex-column">

                    {/* Cover */}
                    {article.image && (
                      <img
                        src={article.image}
                        alt={article.title}
                        className="tw-w-full tw-h-48 tw-object-cover"
                      />
                    )}

                    <div className="tw-p-4 d-flex flex-column flex-grow-1">

                      {/* Category */}
                      <div className="tw-mb-2">
                        <span
                          className="text-xs fw-bold tw-px-3 tw-py-1 rounded-full"
                          style={{ background: "#e0f2fe", color: "#0369a1" }}
                        >
                          {article.category}
                        </span>
                      </div>

                      {/* Title */}
                      <h3
                        className="text-sm fw-bold text-charcoal tw-mb-2 line-clamp-2"
                        onClick={() => navigate(`/articles/${article.id}`)}
                        style={{ cursor: "pointer" }}
                      >
                        {article.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-xs text-secondary-custom flex-grow-1 tw-mb-3 line-clamp-3">
                        {article.content?.substring(0, 100)}...
                      </p>

                      {/* Likes & saves counts */}
                      <div className="d-flex align-items-center gap-3 mb-3 text-xs text-secondary-custom fw-bold">
                        <div className="d-flex align-items-center gap-1">
                          <span className="material-symbols-outlined" style={{ fontSize: "14px", color: "#ef4444" }}>
                            favorite
                          </span>
                          {article.likes_count || 0}
                        </div>
                        <div className="d-flex align-items-center gap-1">
                          <span className="material-symbols-outlined" style={{ fontSize: "14px", color: "#00796b" }}>
                            bookmark
                          </span>
                          {article.saves_count || 0}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="d-flex justify-content-between align-items-center pt-3 border-top border-custom">
                        <small className="text-secondary-custom">
                          {article.published_at
                            ? new Date(article.published_at).toLocaleDateString()
                            : "—"}
                        </small>
                        <div className="d-flex gap-2">
                          <button
                            onClick={() => navigate(`/articles/${article.id}`)}
                            className="btn btn-sm text-primary-custom d-flex align-items-center gap-1"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                              arrow_forward
                            </span>
                          </button>
                          <button
                            onClick={() => handleRemoveSaved(article.id)}
                            className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                              bookmark_remove
                            </span>
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ── Empty state ── */
            <div className="cl-card tw-p-12 text-center">
              <span
                className="material-symbols-outlined text-secondary-custom tw-mb-4"
                style={{ fontSize: "64px", display: "block" }}
              >
                bookmark_border
              </span>
              <h3 className="text-charcoal tw-mb-2">No saved articles yet</h3>
              <p className="text-secondary-custom tw-mb-4">
                Start saving articles to your reading list
              </p>
              <button onClick={() => navigate("/articles")} className="cl-btn-submit">
                Browse Articles
                <span className="cl-arrow">→</span>
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}