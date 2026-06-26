import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../components/AuthContext";
import prepareRequest from "../services/RequestService";
import NotificationToast from "../components/NotificationToast";

const CATEGORIES = [
  "Cardiology", "Neurology", "Pediatrics", "Oncology",
  "Orthopedics", "Dermatology", "General Practice", "Psychiatry",
];

export default function ArticleEditorModal({ open, article, onClose, onSaved }) {
  const { user } = useContext(AuthContext);
  const isEdit = !!article;

  const [form, setForm] = useState({
    title: article?.title || "",
    content: article?.content || "",
    category: article?.category || "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(article?.image || null);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim() || !form.category) {
      setNotification({ type: "error", title: "Missing Fields", message: "Please fill in all required fields." });
      return;
    }
    setSubmitting(true);
    try {
      const token = prepareRequest();
      const data = new FormData();
      data.append("title", form.title);
      data.append("content", form.content);
      data.append("category", form.category);
      if (form.image) data.append("image", form.image);

      let res;
      if (isEdit) {
        data.append("_method", "PUT");
        res = await axios.post(`/api/articles/${article.id}`, data, {
          headers: {
            "X-XSRF-TOKEN": decodeURIComponent(token),
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        res = await axios.post("/api/articles", data, {
          headers: {
            "X-XSRF-TOKEN": decodeURIComponent(token),
            "Content-Type": "multipart/form-data",
          },
        });
      }
      setNotification({
        type: "success",
        title: isEdit ? "Article Updated" : "Article Published",
        message: isEdit ? "Your article has been updated." : "Your article has been published successfully.",
      });
      setTimeout(() => {
        onSaved && onSaved(res.data);
        onClose();
      }, 1200);
    } catch (err) {
      setNotification({
        type: "error",
        title: "Save Failed",
        message: err?.response?.data?.message || "Something went wrong.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          zIndex: 1040, backdropFilter: "blur(4px)",
        }}
      />
      {/* Modal */}
      <div
        style={{
          position: "fixed", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1050,
          background: "#fff",
          borderRadius: "20px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          width: "min(96vw, 640px)",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "2rem",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <NotificationToast
          open={!!notification}
          notification={notification}
          onClose={() => setNotification(null)}
        />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ margin: 0, fontWeight: 800, fontSize: "1.3rem", color: "#0b1c30" }}>
              {isEdit ? "Edit Article" : "Write New Article"}
            </h2>
            <p style={{ margin: 0, fontSize: "0.82rem", color: "#546e7a" }}>
              {isEdit ? "Update your published article" : "Share medical insights with patients"}
            </p>
          </div>
          <button
            onClick={onClose}
            id="btn-close-editor"
            style={{
              border: "none", background: "#f1f5f9", borderRadius: "10px",
              width: 36, height: 36, cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "1.1rem", color: "#546e7a" }}>close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Title */}
          <div>
            <label style={{ display: "block", fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.4rem", color: "#263238" }}>
              Title *
            </label>
            <input
              id="article-title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Understanding Hypertension in Adults"
              style={{
                width: "100%", padding: "0.75rem 1rem",
                border: "1.5px solid #e0e8e7", borderRadius: "10px",
                fontSize: "0.9rem", outline: "none", boxSizing: "border-box",
                fontFamily: "'Inter', sans-serif", transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#00796b")}
              onBlur={(e) => (e.target.style.borderColor = "#e0e8e7")}
            />
          </div>

          {/* Category */}
          <div>
            <label style={{ display: "block", fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.4rem", color: "#263238" }}>
              Category *
            </label>
            <select
              id="article-category"
              name="category"
              value={form.category}
              onChange={handleChange}
              style={{
                width: "100%", padding: "0.75rem 1rem",
                border: "1.5px solid #e0e8e7", borderRadius: "10px",
                fontSize: "0.9rem", outline: "none", boxSizing: "border-box",
                fontFamily: "'Inter', sans-serif", background: "#fff",
                cursor: "pointer",
              }}
            >
              <option value="">Select a category…</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Image Upload */}
          <div>
            <label style={{ display: "block", fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.4rem", color: "#263238" }}>
              Cover Image (optional)
            </label>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="preview"
                style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "10px", marginBottom: "0.75rem" }}
              />
            )}
            <label
              htmlFor="article-image"
              style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                padding: "0.75rem 1rem", border: "1.5px dashed #bcc9c6",
                borderRadius: "10px", cursor: "pointer", color: "#546e7a",
                fontSize: "0.85rem", fontWeight: 600, transition: "all 0.2s",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "1.2rem", color: "#00796b" }}>image</span>
              {form.image ? form.image.name : "Click to upload image"}
            </label>
            <input
              id="article-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
          </div>

          {/* Content */}
          <div>
            <label style={{ display: "block", fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.4rem", color: "#263238" }}>
              Content *
            </label>
            <textarea
              id="article-content"
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={10}
              placeholder="Write your article content here…"
              style={{
                width: "100%", padding: "0.75rem 1rem",
                border: "1.5px solid #e0e8e7", borderRadius: "10px",
                fontSize: "0.9rem", outline: "none", boxSizing: "border-box",
                fontFamily: "'Inter', sans-serif", resize: "vertical",
                lineHeight: 1.6, transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#00796b")}
              onBlur={(e) => (e.target.style.borderColor = "#e0e8e7")}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "0.75rem 1.5rem", borderRadius: "10px",
                border: "1.5px solid #e0e8e7", background: "transparent",
                fontWeight: 700, fontSize: "0.9rem", cursor: "pointer",
                color: "#546e7a", fontFamily: "'Inter', sans-serif",
              }}
            >
              Cancel
            </button>
            <button
              id="btn-save-article"
              type="submit"
              disabled={submitting}
              style={{
                padding: "0.75rem 1.5rem", borderRadius: "10px",
                border: "none", background: submitting ? "#94a3b8" : "#00796b",
                fontWeight: 700, fontSize: "0.9rem", cursor: submitting ? "not-allowed" : "pointer",
                color: "#fff", fontFamily: "'Inter', sans-serif",
                display: "flex", alignItems: "center", gap: "0.4rem",
                transition: "background 0.2s",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>
                {submitting ? "hourglass_empty" : isEdit ? "save" : "publish"}
              </span>
              {submitting ? "Saving…" : isEdit ? "Save Changes" : "Publish Article"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
