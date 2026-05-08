import { useNavigate } from "react-router-dom";

export default function AskAI() {
    const navigate = useNavigate();
  async function handleAsk() {
    navigate(`/chat-ai/new`);
  }
  return (
    <>
      <button className="db-fab" onClick={handleAsk}>
        <span className="material-symbols-outlined">smart_toy</span>
        Ask AI
      </button>
    </>
  );
}
