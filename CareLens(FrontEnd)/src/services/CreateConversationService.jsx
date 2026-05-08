import axios from "axios";
import prepareRequest from "./RequestService";

export default async function createConversation() {
  try {
    const token = prepareRequest();

    const res = await axios.post(
      "/api/chatAi/conversation/create",
      {},
      {
        headers: {
          "X-XSRF-TOKEN": decodeURIComponent(token),
        },
      }
    );

    if (res.data.status === true) {
      return res.data.id;
    }

    return null;
  } catch (err) {
    console.log(err.response?.data);
    return null;
  }
}