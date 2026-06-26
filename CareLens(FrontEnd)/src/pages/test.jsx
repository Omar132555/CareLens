import axios from "axios";
import { useEffect } from "react";
import prepareRequest from "../services/RequestService";

export default function Test() {
  async function call() {
    const token = prepareRequest();
    try {
      // const res = await axios.get('/api/patient/doctors/all');
      const res = await axios.post(
        "/api/patient/follow/request",
        {
          doctor_id: 3,
        },
        {
          headers: {
            "X-XSRF-TOKEN": decodeURIComponent(token),
          },
        },
      );
      console.log(res.data);
    } catch (err) {
      console.log(err.response?.data);
    }
  }
  useEffect(() => {
    call();
  }, []);
}
