import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import NavBar from "../components/navBar";
import Scroll from "../hooks/Scroll";
import prepareRequest from "../services/RequestService";
import NotificationToast from "../components/NotificationToast";

export default function SymptomTracker() {
  const scrolled = Scroll();
  const [symptoms, setSymptoms] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedSymptom, setSelectedSymptom] = useState("");
  const [severity, setSeverity] = useState(5);
  const [symptomNames, setSymptomNames] = useState([]);

  const processChartData = (data) => {
    // Group data by date
    const grouped = {};
    data.forEach((log) => {
      const date = new Date(log.logged_at).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = { date };
      }
      grouped[date][log.symptom_name] = log.severity;
    });

    const chartArray = Object.values(grouped).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    setChartData(chartArray);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const token = prepareRequest();
        const response = await axios.get("/api/symptoms/logs", {
          headers: {
            "X-XSRF-TOKEN": decodeURIComponent(token),
          },
        });

        setSymptoms(response.data);
        processChartData(response.data);

        // Get unique symptom names
        const uniqueSymptoms = [
          ...new Set(response.data.map((s) => s.symptom_name)),
        ];
        setSymptomNames(uniqueSymptoms);

        setLoading(false);
      } catch {
        console.error("Failed to load symptom logs");
        setNotification({
          type: "error",
          title: "Load Failed",
          message: "Could not load your symptom logs",
        });
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSymptom.trim()) {
      setNotification({
        type: "error",
        title: "Invalid Input",
        message: "Please enter a symptom name",
      });
      return;
    }

    try {
      const token = prepareRequest();
      await axios.post(
        "/api/symptoms/log",
        {
          symptom_name: selectedSymptom,
          severity: severity,
        },
        {
          headers: {
            "X-XSRF-TOKEN": decodeURIComponent(token),
          },
        }
      );

      setNotification({
        type: "success",
        title: "Logged",
        message: "Symptom logged successfully",
      });

      setSelectedSymptom("");
      setSeverity(5);
      setShowForm(false);
      window.location.reload();
    } catch {
      setNotification({
        type: "error",
        title: "Error",
        message: "Failed to log symptom",
      });
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
            <p className="text-secondary-custom">Loading symptom data...</p>
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

          <div className="d-flex justify-content-between align-items-center tw-mb-8">
            <div>
              <h1 className="text-3xl fw-bold text-charcoal mb-1">
                Symptom Tracker
              </h1>
              <p className="text-secondary-custom">
                Monitor your health progress over time
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="cl-btn-submit"
            >
              <span className="material-symbols-outlined">add</span>
              Log Symptom
            </button>
          </div>

          {showForm && (
            <div className="cl-card tw-p-6 tw-mb-8">
              <h2 className="text-lg fw-bold text-charcoal tw-mb-4">
                Log New Symptom
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-12 col-md-6">
                    <div className="cl-field">
                      <label className="cl-field-label">Symptom Name</label>
                      <div className="cl-input-wrap">
                        <div className="cl-input-icon">
                          <span className="material-symbols-outlined">
                            symptom_outline
                          </span>
                        </div>
                        <input
                          type="text"
                          className="cl-input"
                          placeholder="e.g., Headache, Fever, Cough"
                          value={selectedSymptom}
                          onChange={(e) => setSelectedSymptom(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="cl-field">
                      <label className="cl-field-label">
                        Severity: {severity}/10
                      </label>
                      <input
                        type="range"
                        className="form-range"
                        min="1"
                        max="10"
                        value={severity}
                        onChange={(e) => setSeverity(parseInt(e.target.value))}
                      />
                      <small className="text-secondary-custom">
                        1 = Minimal, 10 = Severe
                      </small>
                    </div>
                  </div>
                </div>

                <div className="d-flex tw-gap-3 tw-mt-4">
                  <button type="submit" className="cl-btn-submit">
                    Log Symptom
                    <span className="cl-arrow">→</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="cl-btn-ghost"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {chartData.length > 0 ? (
            <div className="cl-card tw-p-6 tw-mb-8">
              <h2 className="text-lg fw-bold text-charcoal tw-mb-6">
                Symptom Trends
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    domain={[0, 10]}
                    tick={{ fontSize: 12 }}
                    label={{ value: "Severity", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip formatter={(value) => `Severity: ${value}/10`} />
                  <Legend />
                  {symptomNames.map((symptom, idx) => (
                    <Line
                      key={symptom}
                      type="monotone"
                      dataKey={symptom}
                      stroke={[
                        "#0d9488",
                        "#ef4444",
                        "#f59e0b",
                        "#8b5cf6",
                        "#06b6d4",
                      ][idx % 5]}
                      dot={{ r: 4 }}
                      connectNulls
                      name={symptom}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : null}

          {symptoms.length > 0 ? (
            <div className="cl-card tw-p-6">
              <h2 className="text-lg fw-bold text-charcoal tw-mb-4">
                Recent Logs
              </h2>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th className="text-charcoal fw-bold">Symptom</th>
                      <th className="text-charcoal fw-bold">Severity</th>
                      <th className="text-charcoal fw-bold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {symptoms.map((log) => (
                      <tr key={log.id}>
                        <td className="text-charcoal">{log.symptom_name}</td>
                        <td>
                          <div
                            className="tw-inline-flex tw-items-center tw-gap-2 tw-px-3 tw-py-1 tw-rounded-full"
                            style={{
                              background:
                                log.severity <= 3
                                  ? "#d1fae5"
                                  : log.severity <= 6
                                  ? "#fef3c7"
                                  : "#fee2e2",
                              color:
                                log.severity <= 3
                                  ? "#065f46"
                                  : log.severity <= 6
                                  ? "#92400e"
                                  : "#7f1d1d",
                            }}
                          >
                            <span className="fw-medium">{log.severity}/10</span>
                          </div>
                        </td>
                        <td className="text-secondary-custom">
                          {new Date(log.logged_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="cl-card tw-p-12 text-center">
              <span
                className="material-symbols-outlined text-secondary-custom tw-mb-4"
                style={{ fontSize: "64px", display: "block" }}
              >
                trending_down
              </span>
              <h3 className="text-charcoal tw-mb-2">No symptoms logged yet</h3>
              <p className="text-secondary-custom tw-mb-4">
                Start tracking your symptoms to visualize health trends
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="cl-btn-submit"
              >
                Log Your First Symptom
                <span className="cl-arrow">→</span>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
