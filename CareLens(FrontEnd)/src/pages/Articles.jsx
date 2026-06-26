import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavBar from "../components/navBar";
import Scroll from "../hooks/Scroll";
import prepareRequest from "../services/RequestService";
import { AuthContext } from "../components/AuthContext";

export default function Articles() {
  const scrolled = Scroll();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isDoctor = user?.role === "doctor";

  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const token = prepareRequest();
        const response = await axios.get("/api/articles", {
          headers: {
            "X-XSRF-TOKEN": decodeURIComponent(token),
          },
        });

        setArticles(response.data);
        const uniqueCategories = [
          ...new Set(response.data.map((a) => a.category)),
        ];
        setCategories(uniqueCategories);
        setLoading(false);
      } catch {
        console.error("Failed to load articles");
        setNotification({
          type: "error",
          title: "Load Failed",
          message: "Could not load medical articles",
        });
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    let filtered = articles;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((a) => a.category === selectedCategory);
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredArticles(filtered);
  }, [searchTerm, selectedCategory, articles]);

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
            <p className="text-secondary-custom">Loading articles...</p>
          </div>
        </div>
      </div>
    );
  }

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

          <div className="d-flex justify-content-between align-items-end tw-mb-8">
            <div>
              <h1 className="text-3xl fw-bold text-charcoal mb-1">
                Medical Articles
              </h1>
              <p className="text-secondary-custom mb-0">
                Explore health insights from medical professionals
              </p>
            </div>
            {isDoctor && (
              <button
                onClick={() => navigate("/doctor-dashboard?tab=blogs")}
                className="btn fw-bold text-white d-flex align-items-center gap-2"
                style={{ background: "#00796b", borderRadius: "10px", padding: "0.6rem 1.25rem", whiteSpace: "nowrap" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>edit_document</span>
                Write Article
              </button>
            )}
          </div>

          {/* Search and Filter */}
          <div className="row tw-mb-8 g-3">
            <div className="col-12 col-md-7">
              <div className="cl-input-wrap">
                <div className="cl-input-icon">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input
                  type="text"
                  className="cl-input"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="col-12 col-md-5">
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  padding: "0.625rem 0.875rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "0.5rem",
                  color: "#263238",
                }}
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Articles Grid */}
          {filteredArticles.length > 0 ? (
            <div className="row g-4">
              {filteredArticles.map((article) => (
                <div key={article.id} className="col-12 col-md-6 col-lg-4">
                  <div
                    className="cl-card tw-overflow-hidden hover:shadow-lg-custom transition-shadow tw-cursor-pointer tw-h-full d-flex flex-column"
                    onClick={() => navigate(`/articles/${article.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    {article.image && (
                      <img
                        src={article.image}
                        alt={article.title}
                        className="tw-w-full tw-h-48 tw-object-cover"
                      />
                    )}

                    <div className="tw-p-4 d-flex flex-column flex-grow-1">
                      <div className="tw-mb-2">
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

                      <h3 className="text-sm fw-bold text-charcoal tw-mb-2 line-clamp-2">
                        {article.title}
                      </h3>

                      <p className="text-xs text-secondary-custom flex-grow-1 tw-mb-3 line-clamp-3">
                        {article.content.substring(0, 100)}...
                      </p>

                      <div className="d-flex align-items-center gap-3 mb-3 text-xs fw-bold text-secondary-custom">
                        <div className="d-flex align-items-center gap-1">
                          <span className="material-symbols-outlined" style={{ fontSize: "14px", color: article.is_liked ? "#ef4444" : "inherit" }}>
                            {article.is_liked ? "favorite" : "favorite_border"}
                          </span>
                          {article.likes_count || 0}
                        </div>
                        <div className="d-flex align-items-center gap-1">
                          <span className="material-symbols-outlined" style={{ fontSize: "14px", color: article.is_saved ? "#00796b" : "inherit" }}>
                            {article.is_saved ? "bookmark" : "bookmark_border"}
                          </span>
                          {article.saves_count || 0}
                        </div>
                      </div>

                      <div className="d-flex justify-content-between align-items-center pt-3 border-top border-custom">
                        <small className="text-secondary-custom">
                          {new Date(article.published_at).toLocaleDateString()}
                        </small>
                        <div className="d-flex tw-gap-2">
                          <button
                            className="btn btn-sm text-primary-custom"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/articles/${article.id}`);
                            }}
                          >
                            <span className="material-symbols-outlined text-sm">
                              arrow_forward
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="cl-card tw-p-12 text-center">
              <span
                className="material-symbols-outlined text-secondary-custom tw-mb-4"
                style={{ fontSize: "64px", display: "block" }}
              >
                article
              </span>
              <h3 className="text-charcoal tw-mb-2">No articles found</h3>
              <p className="text-secondary-custom">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
