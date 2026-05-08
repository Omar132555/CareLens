import axios from "axios"
import { useEffect } from "react";
import prepareRequest from "../services/RequestService";

export default function Test() {
  async function call() {
    const token = prepareRequest();
    const res = await axios.put("/api/medical-profile/update",{},      {
        headers:{
          "X-XSRF-TOKEN":decodeURIComponent(token)
        }
      });
     console.log(res.data);
  }
  useEffect(() => {
    call();
  }, []);
}
