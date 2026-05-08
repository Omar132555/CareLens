export async function getConversation(id) {
  const res = await fetch(
    `http://localhost:8000/api/chatAi/conversation/get/${id}`,
    {
      credentials: "include",
    },
  );
  
  if (!res.ok) {
    if (res.status === 404) {
      return null;
    }
    throw new Error("Failed");
  }
  const data = await res.json();

  return data.messages;
}
