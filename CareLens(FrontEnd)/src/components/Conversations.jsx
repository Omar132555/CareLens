import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function DisplayConversations() {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    axios.get("/api/chatAi/conversation/get/names")
      .then((res) => {
        setConversations(res.data)
      })
  }, []);

  return (
    <>
      {conversations.map((c) => (
        <Link
          key={c.id}
          to={`/chat/${c.id}`}
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
  );
}
