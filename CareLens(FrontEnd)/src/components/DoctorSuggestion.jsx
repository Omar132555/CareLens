import React from "react";

export default function DoctorSuggestion({ specialty, description }) {
  const specialtyIcons = {
    cardiologist: "favorite",
    neurologist: "psychology",
    dermatologist: "skin_lesion",
    gastroenterologist: "stomach",
    pulmonologist: "lungs",
    orthopedic: "bone",
    immunologist: "shield",
    psychiatrist: "psychology",
    general: "local_hospital",
  };

  const icon = specialtyIcons[specialty?.toLowerCase()] || "local_hospital";

  return (
    <div className="tw-mt-4 tw-p-4 rounded-lg" style={{ background: "#f0fdf4", border: "1px solid #86efac" }}>
      <div className="d-flex align-items-start tw-gap-3">
        <div
          className="rounded-full tw-p-2 flex-shrink-0"
          style={{ background: "#dcfce7" }}
        >
          <span
            className="material-symbols-outlined"
            style={{ color: "#16a34a", fontSize: "20px" }}
          >
            {icon}
          </span>
        </div>
        <div className="flex-grow-1 min-w-0">
          <p className="text-xs fw-bold text-secondary-custom mb-1" style={{ color: "#059669" }}>
            SUGGESTED DOCTOR
          </p>
          <h4 className="text-sm fw-bold text-charcoal mb-1">{specialty}</h4>
          <p className="text-xs text-secondary-custom mb-0 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
