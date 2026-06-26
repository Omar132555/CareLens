import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import NavBar from "../components/navBar";
import Scroll from "../hooks/Scroll";
import prepareRequest from "../services/RequestService";
import NotificationToast from "../components/NotificationToast";
import { AuthContext } from "../components/AuthContext";

export default function ArticleDetail() {
  const scrolled = Scroll();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [notification, setNotification] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const token = prepareRequest();
        const response = await axios.get(`/api/articles/${id}`, {
          headers: {
            "X-XSRF-TOKEN": decodeURIComponent(token),
          },
        });

        setArticle(response.data.article);
        setComments(response.data.comments || []);
        setIsLiked(response.data.isLiked || false);
        setIsSaved(response.data.isSaved || false);
        setLoading(false);
      } catch {
        console.error("Failed to load article");
        setNotification({
          type: "error",
          title: "Load Failed",
          message: "Could not load this article",
        });
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleLike = async () => {
    try {
      const token = prepareRequest();
      await axios.post(
        `/api/articles/${id}/like`,
        {},
        {
          headers: {
            "X-XSRF-TOKEN": decodeURIComponent(token),
          },
        }
      );

      setIsLiked(!isLiked);
      setNotification({
        type: "success",
        title: isLiked ? "Unliked" : "Liked",
        message: isLiked
          ? "Article removed from likes"
          : "Article added to likes",
      });
    } catch {
      setNotification({
        type: "error",
        title: "Error",
        message: "Failed to like article",
      });
    }
  };

  const handleSave = async () => {
    try {
      const token = prepareRequest();
      await axios.post(
        `/api/articles/${id}/save`,
        {},
        {
          headers: {
            "X-XSRF-TOKEN": decodeURIComponent(token),
          },
        }
      );

      setIsSaved(!isSaved);
      setNotification({
        type: "success",
        title: isSaved ? "Removed" : "Saved",
        message: isSaved
          ? "Article removed from saved"
          : "Article added to saved",
      });
    } catch {
      setNotification({
        type: "error",
        title: "Error",
        message: "Failed to save article",
      });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
    try {
      const token = prepareRequest();
      await axios.delete(`/api/articles/${id}`, {
        headers: { "X-XSRF-TOKEN": decodeURIComponent(token) }
      });
      navigate("/doctor-dashboard?tab=blogs", { replace: true });
    } catch {
      setNotification({ type: "error", title: "Error", message: "Failed to delete article." });
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) {
      setNotification({
        type: "error",
        title: "Invalid Input",
        message: "Please write a comment",
      });
      return;
    }

    setSubmittingComment(true);

    try {
      const token = prepareRequest();
      const response = await axios.post(
        `/api/articles/${id}/comment`,
        { content: newComment },
        {
          headers: {
            "X-XSRF-TOKEN": decodeURIComponent(token),
          },
        }
      );

      setComments([...comments, response.data]);
      setNewComment("");
      setNotification({
        type: "success",
        title: "Comment Posted",
        message: "Your comment has been added successfully",
      });
    } catch {
      setNotification({
        type: "error",
        title: "Error",
        message: "Failed to post comment",
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="cl-body">
        <NavBar scrolled={scrolled} />
        <div className="d-flex align-items-center justify-content-center vh-100">
          <div className="text-center">
            <div
              className="spinner-border text-primary-custom mb-3"
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-secondary-custom">Loading article...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="cl-body">
        <NavBar scrolled={scrolled} />
        <main className="tw-py-8 bg-main min-vh-100">
          <div className="tw-max-w-2xl tw-mx-auto tw-px-4">
            <div className="cl-card tw-p-12 text-center">
              <span
                className="material-symbols-outlined text-secondary-custom tw-mb-4"
                style={{ fontSize: "64px", display: "block" }}
              >
                article
              </span>
              <h3 className="text-charcoal tw-mb-2">Article not found</h3>
              <p className="text-secondary-custom tw-mb-4">
                This article may have been deleted or is unavailable
              </p>
              <button
                onClick={() => navigate("/articles")}
                className="cl-btn-submit"
              >
                Back to Articles
                <span className="cl-arrow">→</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="cl-body">
      <NavBar scrolled={scrolled} />
      <main className="tw-py-8 bg-main min-vh-100">
        <div className="tw-max-w-3xl tw-mx-auto tw-px-4">
          <NotificationToast
            open={!!notification}
            notification={notification}
            onClose={() => setNotification(null)}
          />

          <button
            onClick={() => navigate("/articles")}
            className="cl-btn-ghost tw-mb-6"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Articles
          </button>

          <article className="cl-card tw-p-8">
            {article.image && (
              <img
                src={article.image}
                alt={article.title}
                className="tw-w-full tw-h-80 tw-object-cover tw-rounded-lg tw-mb-8"
              />
            )}

            <div className="tw-mb-6">
              <span
                className="text-xs fw-bold tw-px-3 tw-py-1 rounded-full"
                style={{
                  background: "#e0f2fe",
                  color: "#0369a1",
                }}
              >
                {article.category}
              </span>
            </div>

            <h1 className="text-4xl fw-bold text-charcoal tw-mb-3">
              {article.title}
            </h1>

            <div className="d-flex align-items-center tw-gap-4 tw-mb-8 pb-4 border-bottom border-custom">
              <div className="d-flex align-items-center tw-gap-2">
                <span
                  className="material-symbols-outlined text-secondary-custom"
                  style={{ fontSize: "20px" }}
                >
                  calendar_today
                </span>
                <small className="text-secondary-custom">
                  {new Date(article.published_at).toLocaleDateString()}
                </small>
              </div>

              <div className="d-flex tw-gap-2 ms-auto">
                {user?.id === article.doctor_id ? (
                  <>
                    <button
                      onClick={() => navigate(`/doctor-dashboard?tab=blogs&edit=${article.id}`)}
                      className="btn btn-sm btn-outline-primary-custom d-flex align-items-center gap-2"
                    >
                      <span className="material-symbols-outlined">edit</span>
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="btn btn-sm btn-outline-danger d-flex align-items-center gap-2"
                    >
                      <span className="material-symbols-outlined">delete</span>
                      Delete
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleLike}
                      className={`btn btn-sm ${
                        isLiked
                          ? "btn-primary-custom"
                          : "btn-outline-primary-custom"
                      }`}
                    >
                      <span className="material-symbols-outlined">
                        {isLiked ? "favorite" : "favorite_border"}
                      </span>
                      Like
                    </button>
                    <button
                      onClick={handleSave}
                      className={`btn btn-sm ${
                        isSaved ? "btn-primary-custom" : "btn-outline-primary-custom"
                      }`}
                    >
                      <span className="material-symbols-outlined">
                        {isSaved ? "bookmark" : "bookmark_border"}
                      </span>
                      Save
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="tw-mb-12 text-charcoal leading-relaxed text-lg">
              {article.content}
            </div>

            <div className="border-top border-custom tw-pt-8">
              <h3 className="text-lg fw-bold text-charcoal tw-mb-6">
                Comments ({comments.length})
              </h3>

              <form onSubmit={handleCommentSubmit} className="tw-mb-8">
                <textarea
                  className="form-control tw-mb-3"
                  rows="4"
                  placeholder="Share your thoughts..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={submittingComment}
                  className="cl-btn-submit"
                >
                  {submittingComment ? "Posting..." : "Post Comment"}
                  <span className="cl-arrow">→</span>
                </button>
              </form>

              <div className="d-flex flex-column tw-gap-4">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="cl-card tw-p-4">
                      <div className="d-flex justify-content-between align-items-start tw-mb-2">
                        <h5 className="text-sm fw-bold text-charcoal mb-0">
                          {comment.user_name}
                        </h5>
                        <small className="text-secondary-custom">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </small>
                      </div>
                      <p className="text-sm text-charcoal mb-0">
                        {comment.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-secondary-custom text-center tw-py-8">
                    No comments yet. Be the first to share your thoughts!
                  </p>
                )}
              </div>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
