import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function DisplayConversations() {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    axios.get("/api/chatAi/conversation/get/names").then((res) => {
      setConversations(res.data);
    });
  }, []);

  return (
    <>
      <h3 className="tw-px-3 text-secondary-custom text-xs fw-semibold text-uppercase tracking-wider mb-0">
        Today
      </h3>
      {conversations.today?.length > 0 ? (
        <>
          {conversations.today.map((c) => (
            <Link
              key={c.id}
              to={`/chat-ai/${c.id}`}
              className="d-flex align-items-center tw-gap-3 tw-px-3 tw-py-3 rounded-xl bg-white border border-custom hover-border-primary-50 transition-all group shadow-sm-custom text-decoration-none"
            >
              <span className="material-symbols-outlined text-primary-custom text-20px">
                chat_bubble
              </span>

              <p className="text-charcoal text-sm fw-medium leading-normal text-truncate group-hover-text-primary transition-colors mb-0">
                {c.name}
              </p>
            </Link>
          ))}
        </>
      ) : (
        <div className="tw-px-3 tw-py-3 text-secondary-custom text-sm">
          No chats today
        </div>
      )}
      <div className="d-flex flex-column tw-gap-2">
        <h3 className="tw-px-3 text-secondary-custom text-xs fw-semibold text-uppercase tracking-wider mb-0">
          History
        </h3>
      </div>
      {conversations.history?.length > 0 ? (
        <>
          {conversations.history.map((c) => (
            <Link
              key={c.id}
              to={`/chat-ai/${c.id}`}
              className="d-flex align-items-center tw-gap-3 tw-px-3 tw-py-3 rounded-xl bg-white border border-custom hover-border-primary-50 transition-all group shadow-sm-custom text-decoration-none"
            >
              <span className="material-symbols-outlined text-primary-custom text-20px">
                chat_bubble
              </span>

              <p className="text-charcoal text-sm fw-medium leading-normal text-truncate group-hover-text-primary transition-colors mb-0">
                {c.name}
              </p>
            </Link>
          ))}
        </>
      ) : (
        <div className="tw-px-3 tw-py-3 text-secondary-custom text-sm">
          No history chats
        </div>
      )}
    </>
  );
}
