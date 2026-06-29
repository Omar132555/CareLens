import { useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../components/AuthContext";

export default function Test() {
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (!user?.id) return;

        const channel = window.Echo.private(
            `App.Models.User.${user.id}`
        );
        console.log(window.Echo.connector.pusher.connection.state);

        channel
  .subscribed(() => console.log("Subscribed"))
  .error((e) => console.log("AUTH ERROR", e))
  .notification((n) => console.log("Notification", n));
        return () => {
            window.Echo.leave(`App.Models.User.${user.id}`);
        };
    }, [user]);

    useEffect(() => {
        axios
            .get("/api/notification/test")
            .then((res) => console.log(res.status))
            .catch((err) => console.log(err));
    }, []);

    return null;
}