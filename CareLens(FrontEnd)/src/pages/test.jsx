import axios from "axios";
import prepareRequest from "../services/RequestService";
import { useEffect } from "react";

export default function Test() {
  async function call() {
    try {
      const token = prepareRequest();

      const res = await axios.post(
        "/api/chatAi/conversation/create",
        {},
        {
          headers: {
            "X-XSRF-TOKEN": decodeURIComponent(token),
          },
        },
      );

      console.log(res.data);
    } catch (err) {
      console.log(err.response?.data);
      console.log(err.response?.data?.errors);
    }
  }
  useEffect(() => {
    call();
  }, []);
}
