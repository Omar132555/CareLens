import { configureEcho } from "@laravel/echo-react";
import axios from "axios";
import { getCookie, getXsrf } from "../config";
import prepareRequest from "./RequestService";

configureEcho({
  broadcaster: "reverb",
  key: "local",
  wsHost: "127.0.0.1",
  wsPort: 8080,
  wssPort: 8080,
  forceTLS: false,
  disableStats: true,
  enabledTransports: ["ws", "wss"],
  authorizer: (channel) => ({
    authorize: (socketId, callback) => {
      // Refresh the CSRF cookie right before the auth request
      // so X-XSRF-TOKEN is always current.
      getXsrf()
        .then(() => {
          const token = prepareRequest();
          return axios.post(
            "/api/broadcasting/auth",
            { socket_id: socketId, channel_name: channel.name },
            {
              headers: {
                "X-XSRF-TOKEN": decodeURIComponent(token),
                Accept: "application/json",
              },
              withCredentials: true,
            }
          );
        })
        .then((res) => callback(false, res.data))
        .catch((err) => callback(true, err));
    },
  }),
});
