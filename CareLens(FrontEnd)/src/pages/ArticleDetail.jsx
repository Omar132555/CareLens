import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import NavBar from "../components/navBar";
import Scroll from "../hooks/Scroll";
import prepareRequest from "../services/RequestService";
import NotificationToast from "../components/NotificationToast";
import { AuthContext } from "../components/AuthContext";

export default function ArticleDetail() {
  const scrolled                             = Scroll();
  const navigate                             = useNavigate();
  const { user }                             = useContext(AuthContext);
  const { id }                               = useParams();

  const [article, setArticle]               = useState(null);
  const [comments, setComments]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [isLiked, setIsLiked]               = useState(false);
  const [isSaved, setIsSaved]               = useState(false);
  const [likesCount, setLikesCount]         = useState(0);
  const [savesCount, setSavesCount]         = useState(0);
  const [notification, setNotification]     = useState(null);
  const [newComment, setNewComment]         = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [likeLoading, setLikeLoading]       = useState(false);
  const [saveLoading, setSaveLoading]       = useState(false);

  /* ── Styles ── */
  const btnPrimary = {
    background: "#00796b", color: "#fff", border: "none",
    borderRadius: "10px", padding: "0.65rem 1.4rem",
    fontWeight: 700, fontSize: "0.9rem", cursor: "pointer",
    display: "inline-flex", alignItems: "center", gap: "6px",
  };

  const btnOutline = {
    background: "transparent", color: "#00796b",
    border: "1.5px solid #00796b", borderRadius: "10px",
    padding: "0.55rem 1.2rem", fontWeight: 700,
    fontSize: "0.85rem", cursor: "pointer",
    display: "inline-flex", alignItems: "center", gap: "6px",
  };

  const btnDanger = {
    background: "transparent", color: "#e53935",
    border: "1.5px solid #e53935", borderRadius: "10px",
    padding: "0.55rem 1.2rem", fontWeight: 700,
    fontSize: "0.85rem", cursor: "pointer",
    display: "inline-flex", alignItems: "center", gap: "6px",
  };

  useEffect(() => {
    const load = async () => {
      try {
        const token    = prepareRequest();
        const response = await axios.get(`/api/articles/${id}`, {
          headers: { "X-XSRF-TOKEN": decodeURIComponent(token) },
        });
        const data = response.data;
        setArticle(data);
        setComments(data.comments    || []);
        setIsLiked(data.is_liked     ?? false);
        setIsSaved(data.is_saved     ?? false);
        setLikesCount(data.likes_count ?? 0);
        setSavesCount(data.saves_count ?? 0);
      } catch {
        setNotification({ type: "error", title: "Load Failed", message: "Could not load this article" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    // optimistic update
    setIsLiked(prev => !prev);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    try {
      const token    = prepareRequest();
      const response = await axios.post(
        `/api/articles/${id}/like`, {},
        { headers: { "X-XSRF-TOKEN": decodeURIComponent(token) } }
      );
      setIsLiked(response.data.liked);
      setLikesCount(response.data.likes_count);
    } catch {
      // rollback
      setIsLiked(prev => !prev);
      setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
      setNotification({ type: "error", title: "Error", message: "Failed to like article" });
    } finally {
      setLikeLoading(false);
    }
  };

  const handleSave = async () => {
    if (saveLoading) return;
    setSaveLoading(true);
    setIsSaved(prev => !prev);
    setSavesCount(prev => isSaved ? prev - 1 : prev + 1);
    try {
      const token    = prepareRequest();
      const response = await axios.post(
        `/api/articles/${id}/save`, {},
        { headers: { "X-XSRF-TOKEN": decodeURIComponent(token) } }
      );
      setIsSaved(response.data.saved);
      setSavesCount(response.data.saves_count);
    } catch {
      setIsSaved(prev => !prev);
      setSavesCount(prev => isSaved ? prev + 1 : prev - 1);
      setNotification({ type: "error", title: "Error", message: "Failed to save article" });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
    try {
      const token = prepareRequest();
      await axios.delete(`/api/doctor/articles/${id}`, {
        headers: { "X-XSRF-TOKEN": decodeURIComponent(token) },
      });
      navigate("/doctor-dashboard?tab=blogs", { replace: true });
    } catch {
      setNotification({ type: "error", title: "Error", message: "Failed to delete article." });
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      const token    = prepareRequest();
      const response = await axios.post(
        `/api/articles/${id}/comment`,
        { content: newComment },
        { headers: { "X-XSRF-TOKEN": decodeURIComponent(token) } }
      );
      setComments([response.data, ...comments]);
      setNewComment("");
      setNotification({ type: "success", title: "Comment posted", message: "Your comment has been added" });
    } catch {
      setNotification({ type: "error", title: "Error", message: "Failed to post comment" });
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="cl-body">
        <NavBar scrolled={scrolled} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 44, height: 44, borderRadius: "50%",
                border: "3px solid #e0f2f1", borderTopColor: "#00796b",
                animation: "spin 0.8s linear infinite", margin: "0 auto 12px",
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: "#607d8b", fontSize: "0.9rem" }}>Loading article...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="cl-body">
        <NavBar scrolled={scrolled} />
        <main style={{ minHeight: "100vh", background: "#f8fafb", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📄</div>
            <h3 style={{ color: "#263238", marginBottom: "0.5rem" }}>Article not found</h3>
            <p style={{ color: "#607d8b", marginBottom: "1.5rem" }}>This article may have been removed</p>
            <button onClick={() => navigate("/articles")} style={btnPrimary}>← Back to Articles</button>
          </div>
        </main>
      </div>
    );
  }

  const isOwner = user?.id === article.doctor_id;

  const avatarInitials = (name) =>
    name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?";

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—";

  return (
    <div className="cl-body">
      <NavBar scrolled={scrolled} />

      <NotificationToast
        open={!!notification}
        notification={notification}
        onClose={() => setNotification(null)}
      />

      <main style={{ background: "#f0f4f5", minHeight: "100vh", paddingBottom: "4rem" }}>

        {/* ── Hero Banner ── */}
        <div
          style={{
            background: article.image
              ? `linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.75) 100%), url(${article.image}) center/cover no-repeat`
              : "linear-gradient(135deg, #004d40 0%, #00796b 60%, #26a69a 100%)",
            minHeight: article.image ? "380px" : "280px",
            display: "flex", flexDirection: "column",
            justifyContent: "flex-end", padding: "0",
            position: "relative",
          }}
        >
          {/* Back button */}
          <div style={{ position: "absolute", top: "1.5rem", left: "1.5rem" }}>
            <button
              onClick={() => navigate("/articles")}
              style={{
                background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.3)", color: "#fff",
                borderRadius: "10px", padding: "0.5rem 1rem",
                fontWeight: 600, fontSize: "0.85rem", cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: "6px",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>arrow_back</span>
              Back
            </button>
          </div>

          {/* Hero content */}
          <div style={{ maxWidth: "820px", margin: "0 auto", width: "100%", padding: "2.5rem 1.5rem 2rem" }}>
            {/* Category */}
            <span style={{
              display: "inline-block", background: "#00bfa5",
              color: "#fff", fontSize: "0.72rem", fontWeight: 800,
              letterSpacing: "0.08em", textTransform: "uppercase",
              borderRadius: "20px", padding: "4px 14px", marginBottom: "1rem",
            }}>
              {article.category}
            </span>

            {/* Title */}
            <h1 style={{
              color: "#fff", fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
              fontWeight: 800, lineHeight: 1.3, marginBottom: "1.2rem",
              fontFamily: "'Manrope', sans-serif", textShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}>
              {article.title}
            </h1>

            {/* Meta */}
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
              {article.doctor && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {article.doctor.profile_photo ? (
                    <img
                      src={article.doctor.profile_photo}
                      alt={article.doctor.name}
                      style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.6)" }}
                    />
                  ) : (
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: "#00bfa5", display: "flex", alignItems: "center",
                      justifyContent: "center", color: "#fff", fontSize: "0.75rem", fontWeight: 700,
                    }}>
                      {avatarInitials(article.doctor.name)}
                    </div>
                  )}
                  <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.88rem", fontWeight: 600 }}>
                    Dr. {article.doctor.name}
                  </span>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "rgba(255,255,255,0.75)", fontSize: "0.83rem" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>calendar_today</span>
                {formatDate(article.published_at)}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "auto" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "rgba(255,255,255,0.85)", fontSize: "0.85rem" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "1rem", color: isLiked ? "#ff6b6b" : "inherit" }}>
                    {isLiked ? "favorite" : "favorite_border"}
                  </span>
                  {likesCount}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "rgba(255,255,255,0.85)", fontSize: "0.85rem" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>chat_bubble_outline</span>
                  {comments.length}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "rgba(255,255,255,0.85)", fontSize: "0.85rem" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "1rem", color: isSaved ? "#ffd54f" : "inherit" }}>
                    {isSaved ? "bookmark" : "bookmark_border"}
                  </span>
                  {savesCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ maxWidth: "820px", margin: "0 auto", padding: "0 1.5rem" }}>

          {/* ── Action bar ── */}
          <div style={{
            background: "#fff", borderRadius: "16px",
            padding: "1rem 1.5rem", marginTop: "-1.5rem",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            display: "flex", alignItems: "center", justifyContent: "flex-end",
            gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem",
          }}>
            {isOwner ? (
              <>
                <button
                  onClick={() => navigate(`/doctor-dashboard?tab=blogs&edit=${article.id}`)}
                  style={btnOutline}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>edit</span>
                  Edit article
                </button>
                <button onClick={handleDelete} style={btnDanger}>
                  <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>delete</span>
                  Delete
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleLike}
                  disabled={likeLoading}
                  style={{
                    ...btnOutline,
                    background: isLiked ? "#ffeaea" : "transparent",
                    color: isLiked ? "#e53935" : "#607d8b",
                    borderColor: isLiked ? "#e53935" : "#cfd8dc",
                    transition: "all 0.2s",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>
                    {isLiked ? "favorite" : "favorite_border"}
                  </span>
                  {isLiked ? "Liked" : "Like"} · {likesCount}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saveLoading}
                  style={{
                    ...btnOutline,
                    background: isSaved ? "#e8f5e9" : "transparent",
                    color: isSaved ? "#00796b" : "#607d8b",
                    borderColor: isSaved ? "#00796b" : "#cfd8dc",
                    transition: "all 0.2s",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>
                    {isSaved ? "bookmark" : "bookmark_border"}
                  </span>
                  {isSaved ? "Saved" : "Save"}
                </button>
              </>
            )}
          </div>

          {/* ── Article content ── */}
          <div style={{
            background: "#fff", borderRadius: "20px",
            padding: "2.5rem", marginBottom: "1.5rem",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            lineHeight: 1.9, color: "#37474f",
            fontSize: "1.05rem", whiteSpace: "pre-wrap",
            fontFamily: "'Georgia', serif",
          }}>
            <h1 className="mb-5">Content</h1>
            {article.content}
          </div>

          {/* ── Comments section ── */}
          <div style={{
            background: "#fff", borderRadius: "20px",
            padding: "2rem 2.5rem",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          }}>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.75rem" }}>
              <span className="material-symbols-outlined" style={{ color: "#00796b", fontSize: "1.3rem" }}>
                chat_bubble_outline
              </span>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#263238" }}>
                Comments
              </h3>
              <span style={{
                background: "#e0f2f1", color: "#00796b",
                borderRadius: "20px", padding: "2px 10px",
                fontSize: "0.78rem", fontWeight: 700,
              }}>
                {comments.length}
              </span>
            </div>

            {/* Comment form */}
            <form onSubmit={handleCommentSubmit} style={{ marginBottom: "2rem" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                {/* User avatar */}
                <div style={{
                  width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, #00796b, #26a69a)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: "0.8rem", fontWeight: 700,
                }}>
                  {avatarInitials(user?.name || "U")}
                </div>
                <div style={{ flex: 1 }}>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts on this article..."
                    rows={3}
                    style={{
                      width: "100%", padding: "0.85rem 1rem",
                      border: "1.5px solid #e0e8e7", borderRadius: "12px",
                      fontSize: "0.9rem", resize: "vertical",
                      fontFamily: "inherit", outline: "none",
                      transition: "border-color 0.2s", boxSizing: "border-box",
                      color: "#263238", lineHeight: 1.6,
                    }}
                    onFocus={e => e.target.style.borderColor = "#00796b"}
                    onBlur={e => e.target.style.borderColor = "#e0e8e7"}
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                    <button
                      type="submit"
                      disabled={submittingComment || !newComment.trim()}
                      style={{
                        ...btnPrimary,
                        opacity: (!newComment.trim() || submittingComment) ? 0.6 : 1,
                        cursor: (!newComment.trim() || submittingComment) ? "not-allowed" : "pointer",
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>send</span>
                      {submittingComment ? "Posting..." : "Post comment"}
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* Divider */}
            {comments.length > 0 && (
              <div style={{ borderTop: "1px solid #f0f4f5", marginBottom: "1.5rem" }} />
            )}

            {/* Comments list */}
            {comments.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    style={{
                      display: "flex", gap: "12px", alignItems: "flex-start",
                      padding: "1rem", background: "#f8fafb",
                      borderRadius: "14px", border: "1px solid #ecf0f1",
                    }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                      background: comment.user?.profile_photo
                        ? "transparent"
                        : "linear-gradient(135deg, #546e7a, #78909c)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontSize: "0.75rem", fontWeight: 700, overflow: "hidden",
                    }}>
                      {comment.user?.profile_photo ? (
                        <img
                          src={comment.user.profile_photo}
                          alt={comment.user.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        avatarInitials(comment.user?.name || comment.user_name || "U")
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#263238" }}>
                          {comment.user?.name ?? comment.user_name ?? "User"}
                        </span>
                        <span style={{ fontSize: "0.78rem", color: "#90a4ae" }}>
                          {comment.created_at ? new Date(comment.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: "0.9rem", color: "#546e7a", lineHeight: 1.6 }}>
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "#90a4ae" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "2.5rem", display: "block", marginBottom: "8px", opacity: 0.5 }}>
                  chat_bubble_outline
                </span>
                <p style={{ margin: 0, fontSize: "0.9rem" }}>No comments yet. Be the first to share your thoughts!</p>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}