import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../components/AuthContext";
import NavBar from "../components/navBar";
import Scroll from "../hooks/Scroll";
import prepareRequest from "../services/RequestService";
import NotificationToast from "../components/NotificationToast";

export default function MedicationReminders() {
  const scrolled = Scroll();
  useContext(AuthContext);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    schedule_time: "",
  });

  const checkAndNotify = (meds) => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    meds.forEach((med) => {
      if (med.schedule_time === currentTime) {
        // Browser notification
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Medication Reminder", {
            body: `Time to take ${med.name} - ${med.dosage}`,
            icon: "../../public/CareLensImage.png",
            tag: `med-${med.id}`,
            requireInteraction: true,
          });
        }
      }
    });
  };

  const fetchMedications = async () => {
    try {
      const token = prepareRequest();
      const response = await axios.get("/api/medications", {
        headers: {
          "X-XSRF-TOKEN": decodeURIComponent(token),
        },
      });

      setMedications(response.data);
      checkAndNotify(response.data);
      setLoading(false);
    } catch {
      console.error("Failed to load medications");
      setNotification({
        type: "error",
        title: "Load Failed",
        message: "Could not load your medications",
      });
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = prepareRequest();

      if (editingId) {
        await axios.put(
          `/api/medications/${editingId}`,
          formData,
          {
            headers: {
              "X-XSRF-TOKEN": decodeURIComponent(token),
            },
          }
        );
        setNotification({
          type: "success",
          title: "Updated",
          message: "Medication updated successfully",
        });
      } else {
        await axios.post("/api/medications", formData, {
          headers: {
            "X-XSRF-TOKEN": decodeURIComponent(token),
          },
        });
        setNotification({
          type: "success",
          title: "Added",
          message: "Medication reminder added successfully",
        });
      }

      setFormData({ name: "", dosage: "", schedule_time: "" });
      setShowForm(false);
      setEditingId(null);
      fetchMedications();
    } catch {
      setNotification({
        type: "error",
        title: "Error",
        message: "Failed to save medication",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this medication?")) {
      return;
    }

    try {
      const token = prepareRequest();
      await axios.delete(`/api/medications/${id}`, {
        headers: {
          "X-XSRF-TOKEN": decodeURIComponent(token),
        },
      });

      setNotification({
        type: "success",
        title: "Deleted",
        message: "Medication reminder deleted",
      });

      fetchMedications();
    } catch (err) {
      setNotification({
        type: "error",
        title: "Delete Failed",
        message: "Could not delete medication",
      });
    }
  };

  const handleEdit = (med) => {
    setFormData({
      name: med.name,
      dosage: med.dosage,
      schedule_time: med.schedule_time,
    });
    setEditingId(med.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({ name: "", dosage: "", schedule_time: "" });
    setEditingId(null);
    setShowForm(false);
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
            <p className="text-secondary-custom">Loading medications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cl-body">
      <NavBar scrolled={scrolled} />
      <main className="tw-py-8 bg-main min-vh-100">
        <div className="tw-max-w-4xl tw-mx-auto tw-px-4">
          <NotificationToast
            open={!!notification}
            notification={notification}
            onClose={() => setNotification(null)}
          />

          <div className="d-flex justify-content-between align-items-center tw-mb-8">
            <div>
              <h1 className="text-3xl fw-bold text-charcoal mb-1">
                Medication Reminders
              </h1>
              <p className="text-secondary-custom">
                Manage your medications and set reminders
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="cl-btn-submit"
            >
              <span className="material-symbols-outlined">add</span>
              Add Medication
            </button>
          </div>

          {showForm && (
            <div className="cl-card tw-p-6 tw-mb-8">
              <h2 className="text-lg fw-bold text-charcoal tw-mb-4">
                {editingId ? "Edit Medication" : "Add New Medication"}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-12 col-md-4">
                    <div className="cl-field">
                      <label className="cl-field-label">Medication Name</label>
                      <div className="cl-input-wrap">
                        <div className="cl-input-icon">
                          <span className="material-symbols-outlined">
                            medication
                          </span>
                        </div>
                        <input
                          type="text"
                          className="cl-input"
                          placeholder="e.g., Aspirin"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              name: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-md-4">
                    <div className="cl-field">
                      <label className="cl-field-label">Dosage</label>
                      <div className="cl-input-wrap">
                        <div className="cl-input-icon">
                          <span className="material-symbols-outlined">
                            medical_information
                          </span>
                        </div>
                        <input
                          type="text"
                          className="cl-input"
                          placeholder="e.g., 500mg"
                          value={formData.dosage}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              dosage: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-md-4">
                    <div className="cl-field">
                      <label className="cl-field-label">Time</label>
                      <div className="cl-input-wrap">
                        <div className="cl-input-icon">
                          <span className="material-symbols-outlined">
                            schedule
                          </span>
                        </div>
                        <input
                          type="time"
                          className="cl-input"
                          value={formData.schedule_time}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              schedule_time: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="d-flex tw-gap-3 tw-mt-4">
                  <button type="submit" className="cl-btn-submit">
                    {editingId ? "Update" : "Add"} Medication
                    <span className="cl-arrow">→</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="cl-btn-ghost"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {medications.length > 0 ? (
            <div className="row g-4">
              {medications.map((med) => (
                <div key={med.id} className="col-12 col-md-6 col-lg-4">
                  <div className="cl-card tw-p-6 tw-h-full d-flex flex-column">
                    <div className="d-flex align-items-start justify-content-between tw-mb-4">
                      <div>
                        <h3 className="text-lg fw-bold text-charcoal mb-1">
                          {med.name}
                        </h3>
                        <p className="text-secondary-custom text-sm mb-0">
                          {med.dosage}
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-primary-custom">
                        medication
                      </span>
                    </div>

                    <div className="d-flex align-items-center tw-gap-2 tw-mb-4">
                      <span className="material-symbols-outlined text-secondary-custom">
                        schedule
                      </span>
                      <p className="text-sm text-charcoal fw-medium mb-0">
                        {med.schedule_time}
                      </p>
                    </div>

                    <div className="mt-auto d-flex tw-gap-2">
                      <button
                        onClick={() => handleEdit(med)}
                        className="btn btn-sm btn-outline-primary-custom flex-grow-1"
                      >
                        <span className="material-symbols-outlined text-sm">
                          edit
                        </span>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(med.id)}
                        className="btn btn-sm btn-outline-danger flex-grow-1"
                      >
                        <span className="material-symbols-outlined text-sm">
                          delete
                        </span>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="cl-card tw-p-12 text-center">
              <span className="material-symbols-outlined text-secondary-custom tw-mb-4"
                style={{ fontSize: "64px", display: "block" }}>
                medications
              </span>
              <h3 className="text-charcoal tw-mb-2">No medications yet</h3>
              <p className="text-secondary-custom tw-mb-4">
                Add your first medication reminder to get started
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="cl-btn-submit"
              >
                Add Your First Medication
                <span className="cl-arrow">→</span>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
