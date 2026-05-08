import React, { useState } from "react";

function MessageComposer({ onSend, isSending }) {
  let [message, setMessage] = useState("");

  return (
    <div className="tw-p-5 md-px-16 md-pb-8 w-100 max-w-5xl mx-auto bg-gradient-custom position">
      <div className="tw-mb-4 d-flex justify-content-center">
        <p className="text-xs text-secondary-custom text-center max-w-lg opacity-80 mb-0">
          AI is not a substitute for professional medical advice.
        </p>
      </div>

      <div className="position-relative group-input">
        <div className="d-flex w-100 align-items-end bg-white border border-custom rounded-3xl tw-p-2 shadow-lg-custom">

          <textarea
            className="form-control w-100 border-0 resize-none"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />


          <button
            disabled={isSending}
            onClick={(e) => {
              e.preventDefault();
              
              if (!message.trim()) return;

              onSend(message);

              setMessage("");
            }}
            className="d-flex align-items-center justify-content-center tw-h-10 tw-px-4 bg-primary-custom hover-bg-primary-hover text-white rounded-pill transition-all fw-bold text-sm shadow-md-custom shadow-primary-20 border-0">
              <span className="d-none d-sm-inline tw-mr-1">Send</span>
              <span className="material-symbols-outlined text-20px fw-bold">arrow_upward</span>
          </button>

        </div>
      </div>
    </div>
  );
}

export default MessageComposer;