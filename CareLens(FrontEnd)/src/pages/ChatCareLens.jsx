import React, { useContext, useEffect, useRef, useState } from "react";
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
import { AuthContext } from "../components/AuthContext";

function ChatCareLens() {
  const token = prepareRequest();

  const { id } = useParams();
  const navigate = useNavigate();
  const [conversationId, setConversationId] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const { user, setUser, loading } = useContext(AuthContext);
  const bottomRef = useRef(null);
  const [isSending, setIsSending] = useState(false);
  const isStreamingRef = useRef(false); // ✅ track لو stream شغال
  const [emergency, setEmergency] = useState({
    open: false,
    keyword: "",
    pendingMessage: null,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function createConv() {
    if (id === "new") {
      const convId = await createConversation();
      console.log("New conversation Created");
      setConversationId(convId);
      navigate(`/chat-ai/${convId}`, { replace: true });
      return convId;
    }
    return id;
  }

  async function getConv() {
    // ✅ لو stream شغال متعملش setMessages
    if (isStreamingRef.current) return;

    if (id !== "new") {
      setConversationId(id);
      const data = await getConversation(id);
      if (data == null) {
        navigate("/not-found", { replace: true });
        return null;
      }
      setMessages(data);
    } else {
      // ✅ لو new امسح الـ messages
      setMessages([]);
    }
  }

  const formatTime = () => new Date();

  useEffect(() => {
    getConv();
  }, [id]);

  async function sendMessage(text) {
    if (isSending) return;

    const convID = await createConv();
    if (!convID) return;

    const userMsg = {
      role: "user",
      content: text,
      created_at: formatTime(),
    };

    setMessages((prev) => [
      ...prev,
      userMsg,
      { role: "assistant", content: "", created_at: formatTime() },
    ]);

    setIsSending(true);
    setIsTyping(true);
    isStreamingRef.current = true; // ✅ ابدأ الـ stream

    try {
      const res = await fetch("http://localhost:8000/api/chatAi/send", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": decodeURIComponent(token),
        },
        body: JSON.stringify({
          conversation_id: Number(convID),
          message: text,
        }),
      });

      // ── Emergency alert ───────────────────────────────────────────────
      const contentType = res.headers.get("Content-Type") || "";
      if (contentType.includes("application/json")) {
        const data = await res.json();
        if (data.type === "emergency_alert") {
          setMessages((prev) => prev.slice(0, -1));
          setEmergency({
            open: true,
            keyword: data.keyword,
            pendingMessage: text,
          });
          return;
        }
      }

      // ── Stream ────────────────────────────────────────────────────────
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          console.log("Stream completed");
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;

        setMessages((prev) => {
          if (prev.length === 0) return prev;
          const updated = [...prev];
          const last = updated[updated.length - 1];
          // ✅ تأكد إن آخر message هي الـ assistant مش حاجة تانية
          if (!last || last.role !== "assistant") return prev;
          updated[updated.length - 1] = {
            ...last,
            content: last.content + chunk,
          };
          return updated;
        });
      }
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsSending(false);
      setIsTyping(false);
      isStreamingRef.current = false; // ✅ خلص الـ stream
    }
  }

  function handleEmergencyClose() {
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
        <Sidebar setMessages={setMessages} user={user} />
        <main className="flex-grow-1 d-flex flex-column position-relative h-100 bg-main">
          {/* <Header /> */}
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
