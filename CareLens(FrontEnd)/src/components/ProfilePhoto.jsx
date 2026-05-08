import { useContext } from "react";
import { AuthContext } from "./AuthContext";

function ProfilePhoto() {
const {user} = useContext(AuthContext);
 const title = user.name;
 
  const initials = title ? title.substring(0, 2).toUpperCase() : "NA";
  return (
    (!user.profile_photo && (
      <div
        className="avatar-circle border-0"
      >
        {initials}
      </div>
    ))

  );
}

export default ProfilePhoto;