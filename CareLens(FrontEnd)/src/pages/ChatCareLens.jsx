import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ChatMessages from "../components/ChatMessages";
import MessageComposer from "../components/MessageComposer";
import NavBar from "../components/navBar";
import Scroll from "../hooks/Scroll";
import { useNavigate, useParams } from "react-router-dom";
import prepareRequest from "../services/RequestService";
import createConversation from "../services/createConversationService";
import { getConversation } from "../services/getConversationService";
import EmergencyAlertModal from "../components/Emergencyalertmodal";

function ChatCareLens() {
  const token = prepareRequest();

  const { id } = useParams();
  const navigate = useNavigate();
  const [conversationId, setConversationId] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);
  const [isSending, setIsSending] = useState(false);
  const [emergency, setEmergency] = useState({
    open: false,
    keyword: "",
    pendingMessage: null, // the message that triggered the alert
  });
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  async function handleConv() {
    console.log(id);
    if (id === "new") {
      const convId = await createConversation();
      console.log("New conversation Created");
      setConversationId(convId);
      navigate(`/chat-ai/${convId}`);
    } else {
      const data = await getConversation(id);
      setConversationId(id);
      if (data == null) {
        navigate("/not-found", { replace: true });
        return null;
      }
      console.log("History: ");
      console.log(data);
      setMessages(data);
    }
  }
  useEffect(() => {
    handleConv();
  }, [id]);
  async function sendMessage(text) {
    if (isSending) return;

    const userMsg = {
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);

    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    setIsSending(true);
    setIsTyping(true);

    try {
      const res = await fetch("http://localhost:8000/api/chatAi/send", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": decodeURIComponent(token),
        },
        body: JSON.stringify({
          conversation_id: Number(conversationId),
          message: text,
        }),
      });

      // ── Emergency alert response (JSON) ──────────────────────────────
      const contentType = res.headers.get("Content-Type") || "";
      if (contentType.includes("application/json")) {
        const data = await res.json();

        if (data.type === "emergency_alert") {
          // Remove the blank assistant placeholder we added optimistically
          setMessages((prev) => prev.slice(0, -1));
          setIsSending(false);
          setIsTyping(false);

          // Open the blocking modal
          setEmergency({
            open: true,
            keyword: data.keyword,
            pendingMessage: text, // keep so user can re-send after dismissal if they choose
          });
          return;
        }
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();

        console.log(done);
        if (done) {
          console.log("Stream completed");
          break;
        }

        const chunk = decoder.decode(value);
        console.log(chunk);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].content += chunk;
          return updated;
        });
      }
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsSending(false);
      setIsTyping(false);
    }
  }
  function handleEmergencyClose() {
    // Let the user dismiss and still see the AI response if they want
    setEmergency({ open: false, keyword: "", pendingMessage: null });
  }

  const scrolled = Scroll();

  return (
    <div className="cl-body">
      {/* ── Emergency Alert Modal (full-screen, blocking) ── */}
      <EmergencyAlertModal
        isOpen={emergency.open}
        keyword={emergency.keyword}
        onClose={handleEmergencyClose}
      />

      <NavBar scrolled={scrolled} />
      <div className="main-content-modified d-flex overflow-hidden vh-100 bg-main text-charcoal">
        {/* <h1 className="app-test-title">App is working</h1> */}
        <Sidebar setMessages={setMessages} />
        <main className="flex-grow-1 d-flex flex-column position-relative h-100 bg-main">
          <Header />
          <div className="messages-container flex-grow-1 overflow-auto">
            <ChatMessages messages={messages} /> <div ref={bottomRef} />
            {/* {isTyping && (
              <div className="text-secondary-custom text-sm tw-px-3">
                AI is typing...
              </div>
            )} */}
          </div>
          <MessageComposer onSend={sendMessage} isSending={isSending} />
        </main>
        <div className="d-md-none position-fixed top-0 bottom-0 start-0 end-0 bg-charcoal-50 z-index-10 pointer-events-none opacity-0"></div>
      </div>
    </div>
  );
}

export default ChatCareLens;
