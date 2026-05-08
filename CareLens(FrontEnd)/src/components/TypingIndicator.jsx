import React from "react";

export default function TypingIndicator() {
  return (
    <div className="d-flex align-items-center tw-gap-2">
      <div
        className="bg-secondary-custom rounded-full"
        style={{
          width: "8px",
          height: "8px",
          animation: "bounce 1.4s infinite",
          animationDelay: "0s",
        }}
      />
      <div
        className="bg-secondary-custom rounded-full"
        style={{
          width: "8px",
          height: "8px",
          animation: "bounce 1.4s infinite",
          animationDelay: "0.2s",
        }}
      />
      <div
        className="bg-secondary-custom rounded-full"
        style={{
          width: "8px",
          height: "8px",
          animation: "bounce 1.4s infinite",
          animationDelay: "0.4s",
        }}
      />
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
