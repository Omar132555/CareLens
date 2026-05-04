export async function getConversation(id) {
  const res = await fetch(`/api/conversation/${id}`, {
    credentials: "include",
  });

  return res.json();
}