import React from "react";
import DisplayConversations from "./Conversations";
import { useNavigate } from "react-router-dom";
import ProfilePhoto from "./ProfilePhoto";

function Sidebar({ setMessages }) {
  const navigate = useNavigate();
  async function handleAsk() {
    setMessages([]);
    navigate(`/chat-ai/new`);
    window.location.reload();
  }
  return (
    <aside className="sidebar-modified d-none d-md-flex flex-column border-end border-custom bg-sidebar flex-shrink-0 z-index-20 w-300px vh-100">
      <div className="flex-grow-1 overflow-y-auto tw-px-3 space-y-6">
        <div className="tw-p-5 tw-pb-2">
          <div className="d-flex align-items-center tw-gap-3 tw-mb-8">
            <div className="bg-primary-custom aspect-square rounded-circle size-9 d-flex align-items-center justify-content-center shadow-lg-custom shadow-primary-20 text-white">
              <span className="material-symbols-outlined text-20px">
                medical_services
              </span>
            </div>
            <h1 className="text-charcoal text-lg fw-bold tracking-tight mb-0">
              CareLens AI
            </h1>
          </div>

          <button className="d-flex w-100 cursor-pointer align-items-center tw-gap-3 rounded-pill tw-h-12 tw-px-4 bg-primary-custom hover-bg-primary-hover transition-colors text-white tw-mb-6 shadow-lg-custom shadow-primary-10 group border-0"
           onClick={handleAsk}>
            <span className="material-symbols-outlined transition-transform group-hover-rotate-90">
              add
            </span>
            <span
              className="text-sm fw-bold leading-normal tracking-015"
             
            >
              New Consultation
            </span>
          </button>
        </div>
        <div className="d-flex flex-column tw-gap-2">
          {<DisplayConversations />}
        </div>
      </div>

      <div className="tw-p-4 mt-auto border-top border-custom">
        <button className="d-flex align-items-center tw-gap-3 w-100 tw-p-2 rounded-xl hover-bg-primary-5 transition-colors text-start group border-0 bg-transparent">
          {<ProfilePhoto />}
          <div className="d-flex flex-column flex-grow-1 min-w-0">
            <span className="text-charcoal text-sm fw-bold text-truncate group-hover-text-primary">
              James Anderson
            </span>
            <span className="text-secondary-custom text-xs text-truncate">
              Premium Plan
            </span>
          </div>
          <span className="material-symbols-outlined text-secondary-custom text-20px group-hover-text-primary">
            settings
          </span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
