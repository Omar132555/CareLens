import React, { useContext, useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ChatMessages from "../components/ChatMessages";
import MessageComposer from "../components/MessageComposer";
import NavBar from "../components/navBar";
import Scroll from "../hooks/Scroll";
import axios from "axios";
import { getCookie, getXsrf } from "../config";
import { AuthContext } from "../components/AuthContext";
import useGetConversations from "../services/getConversationsService";
import { useParams } from "react-router-dom";
import prepareRequest from "../services/RequestService";

//Active Chat
//  recieve messages from the fetch
//  display the user message
// display the assistant message

function ChatCareLens() {
  // Get CSRF
  const token = prepareRequest();
  const { id } = useParams();
  if(id == "new")
  {
    console.log(id);
  }
  const [messages, setMessages] = useState([]);
  const [response, setResponse] = useState("");
  const bottomRef = useRef(null);
  const [form, setForm] = useState({
    conversation_id: "",
    message: "",
  });
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  async function sendMessage(text) {
    const userMsg = {
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);

    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    try{
      const res2 = await axios.post(
        "/api/chatAi/send",
        {
        conversation_id: form.conversation_id,
        message: text,
      },
      {
        headers: {
          "X-XSRF-TOKEN": decodeURIComponent(token),
        },
      },
    );
    console.log(res2.data);
    
  } catch (err) {
    console.log(err.response.data);        // 👈 كل الداتا
    console.log(err.response.data.errors); // 👈 الأخطاء بالتفصيل
  }
  
  
      // const res = await fetch("http://localhost:8000/api/chatAi/send", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     "X-XSRF-TOKEN": decodeURIComponent(token),
      //   },
      //   credentials: "include",
      //   body: JSON.stringify({
      //     conversation_id: form.conversation_id,
      //     message: text,
      //   }),
      // });
    //const data = await res.json();

    //console.log(data);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);

      // update آخر رسالة (AI)
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].content += chunk;
        return updated;
      });
    }
  }
  const scrolled = Scroll();

  return (

    <div className="cl-body">
      <NavBar scrolled={scrolled} />
      <div className="d-flex overflow-hidden vh-100 bg-main text-charcoal">
        {/* <h1 className="app-test-title">App is working</h1> */}
        <Sidebar />
        <main className="flex-grow-1 d-flex flex-column position-relative h-100 bg-main">
          <Header />
          <div className="messages-container">
            <ChatMessages messages={messages} />

            <div ref={bottomRef} />
          </div>
          <MessageComposer onSend={sendMessage} />
        </main>
        <div className="d-md-none position-fixed top-0 bottom-0 start-0 end-0 bg-charcoal-50 z-index-10 pointer-events-none opacity-0"></div>
      </div>
    </div>
  );
}

export default ChatCareLens;
