import axios from "axios";
import { useEffect } from "react";

function useGetConversations()
{
    useEffect(()=>{
        axios.get("/api/chatAi/conversation/get/names")
        .then((res) => console.log(res.data))
        .catch(() => console.log("error"))
    },[]);
}
export default useGetConversations;