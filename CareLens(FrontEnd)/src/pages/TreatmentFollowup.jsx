import { useEffect, useState } from "react";
import NotificationToast from "../components/NotificationToast.jsx";
import prepareRequest from "../services/RequestService";
import axios from "axios";

export default function TreatmentFollowup() {
  const [treatmentPlans, setTreatmentPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [dailyLog, setDailyLog] = useState({
    compliance: "yes",
    symptomScore: 5,
    notes: "",
  });
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTreatmentPlans = async () => {
    try {
      const token = prepareRequest();
      const res = await axios.get("/api/treatment-plans", {
        headers: {
          "X-XSRF-TOKEN": decodeURIComponent(token),
        },
      });
      setTreatmentPlans(res.data || []);
      setLoading(false);
    } catch {
      setNotification({
        type: "error",
        title: "Failed to Load",
        message: "Could not fetch treatment plans. Please try again.",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 4200);
    return () => clearTimeout(timer);
  }, [notification]);

  useEffect(() => {
    fetchTreatmentPlans();
  }, []);

  const handleSubmitLog = async (e) => {
    e.preventDefault();
    if (!selectedPlan) return;

    try {
      const token = prepareRequest();
      await axios.post(
        `/api/treatment-plans/${selectedPlan.id}/log`,
        {
          compliance: dailyLog.compliance,
          symptom_score: dailyLog.symptomScore,
          notes: dailyLog.notes,
        },
        {
          headers: {
            "X-XSRF-TOKEN": decodeURIComponent(token),
          },
        },
      );

      setNotification({
        type: "success",
        title: "Log Submitted",
        message: "Your daily compliance log has been saved successfully.",
      });

      setDailyLog({
        compliance: "yes",
        symptomScore: 5,
        notes: "",
      });
    } catch (err) {
      setNotification({
        type: "error",
        title: "Submission Failed",
        message: err.response?.data?.message || "Failed to submit your log.",
      });
    }
  };

  return (
    <div className="cl-body">
      <div className="container-lg py-5">
        <NotificationToast
          open={!!notification}
          notification={notification}
          onClose={() => setNotification(null)}
        />

        <div className="row mb-5">
          <div className="col-md-8">
            <h1 className="text-charcoal fw-bold mb-2">Treatment Follow-up</h1>
            <p className="text-secondary-custom">
              Track your daily compliance and symptoms as part of your treatment plan.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <p className="text-secondary-custom">Loading treatment plans...</p>
          </div>
        ) : treatmentPlans.length === 0 ? (
          <div className="cl-card">
            <div className="cl-card-content text-center py-5">
              <p className="text-secondary-custom mb-0">
                No active treatment plans. Contact your doctor to create one.
              </p>
            </div>
          </div>
        ) : (
          <div className="row gap-3">
            <div className="col-md-4">
              <div className="cl-card">
                <div className="cl-card-content">
                  <h3 className="text-sm fw-bold mb-3">Active Plans</h3>
                  <div className="d-flex flex-column gap-2">
                    {treatmentPlans.map((plan) => (
                      <button
                        key={plan.id}
                        type="button"
                        className={`p-3 rounded-3xl border transition-all text-start ${
                          selectedPlan?.id === plan.id
                            ? "border-primary-custom bg-secondary-custom"
                            : "border-custom bg-white hover-bg-primary-5"
                        }`}
                        onClick={() => setSelectedPlan(plan)}
                      >
                        <p className="fw-bold text-sm mb-1">{plan.title}</p>
                        <p className="text-xs text-secondary-custom mb-0">
                          By Dr. {plan.doctor_name}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-8">
              {selectedPlan ? (
                <div className="cl-card">
                  <div className="cl-card-content">
                    <h3 className="text-sm fw-bold mb-4">{selectedPlan.title}</h3>

                    <div className="mb-4">
                      <p className="text-xs text-secondary-custom fw-bold mb-2">
                        MEDICATIONS
                      </p>
                      <div className="space-y-2">
                        {selectedPlan.medications?.map((med, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-secondary-custom rounded-xl"
                          >
                            <p className="fw-bold text-sm mb-1">{med.name}</p>
                            <p className="text-xs text-secondary-custom">
                              {med.dosage} • {med.timing}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <form onSubmit={handleSubmitLog}>
                      <div className="cl-field">
                        <label className="cl-field-label">
                          Did you take your medications today?
                        </label>
                        <select
                          className="cl-input"
                          value={dailyLog.compliance}
                          onChange={(e) =>
                            setDailyLog({
                              ...dailyLog,
                              compliance: e.target.value,
                            })
                          }
                        >
                          <option value="yes">Yes, all on time</option>
                          <option value="partial">Partial compliance</option>
                          <option value="no">No, missed doses</option>
                        </select>
                      </div>

                      <div className="cl-field">
                        <label className="cl-field-label">
                          Symptom severity (1-10)
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={dailyLog.symptomScore}
                          onChange={(e) =>
                            setDailyLog({
                              ...dailyLog,
                              symptomScore: parseInt(e.target.value),
                            })
                          }
                          className="w-100"
                        />
                        <p className="text-center text-secondary-custom text-sm mt-2">
                          Score: {dailyLog.symptomScore}/10
                        </p>
                      </div>

                      <div className="cl-field">
                        <label className="cl-field-label">
                          Additional notes
                        </label>
                        <textarea
                          className="cl-input"
                          placeholder="How are you feeling? Any side effects?"
                          rows="4"
                          value={dailyLog.notes}
                          onChange={(e) =>
                            setDailyLog({
                              ...dailyLog,
                              notes: e.target.value,
                            })
                          }
                        />
                      </div>

                      <button className="cl-btn-submit mt-4" type="submit">
                        Submit Daily Log
                        <span className="cl-arrow">→</span>
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="cl-card">
                  <div className="cl-card-content text-center py-5">
                    <p className="text-secondary-custom">
                      Select a treatment plan to begin logging.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
