import Echo from "laravel-echo";
import Pusher from "pusher-js";
import axios from "axios";
import prepareRequest from "./RequestService";

window.Pusher = Pusher;

window.Echo = new Echo({
  broadcaster: "reverb",
  key: "local",
  wsHost: "127.0.0.1",
  wsPort: 8080,
  forceTLS: false,
  enabledTransports: ["ws"],
  
  authorizer: (channel) => ({
    authorize: (socketId, callback) => {
      const token = prepareRequest();
      axios.post(
        "/broadcasting/auth",
        {
          socket_id: socketId,
          channel_name: channel.name,
        },{
          headers:{
            "X-XSRF-TOKEN": decodeURIComponent(token)
          }
        }
      )
      .then(response => callback(false, response.data))
      .catch(error => callback(true, error));
    },
  }),
});