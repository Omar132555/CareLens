import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../components/AuthContext";
import prepareRequest from "../services/RequestService";
import NotificationToast from "../components/NotificationToast";
import FormError from "../components/FormError";
export default function MedicalProfile() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    allergies: "",
    chronic_diseases: "",
    current_medications: "",
    age: "",
    weight: "",
    gender: "male",
    height: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  const fetchMedicalProfile = async () => {
    try {
      const token = prepareRequest();
      const response = await axios.get("/api/medical-profile/get", {
        headers: {
          "X-XSRF-TOKEN": decodeURIComponent(token),
        },
      });

      if (response.data?.[0] && response.data[0] !== false) {
        setFormData(response.data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch medical profile:", err);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => fetchMedicalProfile());
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      setErrors({});
      const token = prepareRequest();
      await axios.put("/api/medical-profile/update", formData, {
        headers: {
          "X-XSRF-TOKEN": decodeURIComponent(token),
        },
      });

      setNotification({
        type: "success",
        title: "Success",
        message: "Medical profile saved successfully!",
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
      }
      console.error("Failed to save medical profile:", err);
      setNotification({
        type: "error",
        title: "Error",
        message:
          err.response?.data?.message || "Failed to save medical profile",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cl-body">
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "100vh", padding: "2rem" }}
      >
        <div style={{ maxWidth: "600px", width: "100%" }}>
          <div className="bg-white rounded-3 card-shadow p-5">
            <div className="mb-4">
              <h1
                style={{
                  fontFamily: "'Manrope',sans-serif",
                  fontSize: "1.8rem",
                  fontWeight: 700,
                  color: "#0d9488",
                }}
                className="mb-2"
              >
                Medical Profile
              </h1>
              <p className="text-secondary mb-0">
                Please provide your medical information to get personalized care
                and accurate recommendations.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
              <div>
                <label className="form-label fw-bold mb-2">
                  Gender <span style={{ color: "red" }}> *</span>
                </label>
                <select
                  name="gender"
                  onChange={handleChange}
                  className="form-control"
                  style={{ borderRadius: "0.75rem" }}
                >
                  <option value="male">Male</option>
                  <option value="female">female</option>
                </select>
                {errors.gender && <FormError message={errors.gender[0]} />}
              </div>

              <div>
                <label className="form-label fw-bold mb-2">Allergies</label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  placeholder="List any allergies (e.g., Penicillin, Nuts, Latex)"
                  className="form-control"
                  rows="3"
                  style={{ borderRadius: "0.75rem" }}
                />
              </div>

              <div>
                <label className="form-label fw-bold mb-2">
                  Chronic Conditions
                </label>
                <textarea
                  name="chronic_diseases"
                  value={formData.chronic_diseases}
                  onChange={handleChange}
                  placeholder="List any chronic conditions (e.g., Diabetes, Hypertension, Asthma)"
                  className="form-control"
                  rows="3"
                  style={{ borderRadius: "0.75rem" }}
                />
              </div>

              <div>
                <label className="form-label fw-bold mb-2">
                  Current Medications
                </label>
                <textarea
                  name="current_medications"
                  value={formData.current_medications}
                  onChange={handleChange}
                  placeholder="List current medications with dosages"
                  className="form-control"
                  rows="3"
                  style={{ borderRadius: "0.75rem" }}
                />
              </div>

              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label fw-bold mb-2">
                    Age
                    <span style={{ color: "red" }}> *</span>
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="25 e.g"
                    className="form-control mb-2"
                    style={{ borderRadius: "0.75rem" }}
                  />
                  {errors.age && <FormError message={errors.age[0]} />}
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-bold mb-2">
                    Weight
                    <span style={{ color: "red" }}> *</span>
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="Weight in KG/ 70 e.g"
                    className="form-control mb-2"
                    style={{ borderRadius: "0.75rem" }}
                  />
                {errors.weight && <FormError message={errors.weight[0]} />}
                </div>
              </div>

              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label fw-bold mb-2">
                    Height
                    <span style={{ color: "red" }}> *</span>
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    placeholder="Height in cm/ 170"
                    className="form-control"
                    style={{ borderRadius: "0.75rem" }}
                  />
                </div>
                {errors.height && <FormError message={errors.height[0]} />}
              </div>

              <div className="d-flex gap-3 mt-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary flex-grow-1 fw-bold py-3"
                  onClick={() => navigate("/patient-dashboard")}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn fw-bold py-3 flex-grow-1"
                  style={{ background: "var(--primary)", color: "#fff" }}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Medical Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <NotificationToast
        open={!!notification}
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
}
