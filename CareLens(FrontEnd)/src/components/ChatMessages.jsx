import { React } from "react";
import UserMessage from "./UserMessage";
import AIMessage from "./AIMessage";

function ChatMessages({ messages }) {
  let now = new Date();
  let hour = now.getHours() < 10 ? `0${now.getHours()}` : now.getHours();
  let minutes =
    now.getMinutes() < 10 ? `0${now.getMinutes()}` : now.getMinutes();

  const currentTime = `${hour}:${minutes}`;

  const formatTime = (dateString) => {
    const date = new Date(dateString);

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="flex-grow-1 overflow-y-auto tw-p-4 md-p-8 space-y-8 scroll-smooth"
      id="chat-container"
    >
      <div className="d-flex justify-content-center">
        <span className="text-light text-xs fw-medium bg-secondary-custom tw-px-3 tw-py-1 rounded-pill">
          Today, {currentTime}
        </span>
      </div>

      <div className="d-flex flex-column align-items-start tw-gap-2 max-w-3xl me-auto w-100">
        <div className="d-flex align-items-end tw-gap-3">
          <div className="bg-ai-chat rounded-pill size-8 flex-shrink-0" />

          <div className="d-flex flex-column align-items-start tw-gap-1">
            <div className="tw-px-5 tw-py-4 bg-ai-bubble text-charcoal rounded-2xl">
              <p className="text-15px mb-0">How can I help you today?</p>
            </div>

            <span className="text-secondary-custom text-xs">{currentTime}</span>
          </div>
        </div>
      </div>

      {/* dynamic messages */}
      {messages?.map((mess, index) =>
        mess.role === "user" ? (
          <UserMessage key={index} message={mess.content} time={formatTime(mess.created_at)} />
        ) : (
          <AIMessage key={index} message={mess.content} time={formatTime(mess.created_at)} />
        ),
      )}

      <div className="tw-h-4"></div>
    </div>
  );
}

export default ChatMessages;
