import { useState, useRef, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import prepareRequest from "../services/RequestService";

function UserProfile({ title = "" }) {
  const initials = title ? title.substring(0, 2).toUpperCase() : "NA";
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const token = prepareRequest();
      const res = await axios.delete("/api/logout",{
        headers:{
          "X-XSRF-TOKEN":decodeURIComponent(token)
        }
      });
      
    } catch (err) {
      console.warn("Logout failed", err);
      console.log(err.response?.data);
    } finally {
      setUser(null);
      navigate("/login");
    }
  };

  const handleDashboard = () => {
    setOpen(false);
    navigate("/dashboard");
  };

  return (
    <div className="profile-menu-wrapper" ref={ref}>
      <button
        type="button"
        className="avatar-circle border-0"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label="Open profile menu"
      >
        {initials}
      </button>

      {open && (
        <div className="profile-menu-dropdown">
          <button type="button" className="profile-menu-item" onClick={handleDashboard}>
            Dashboard
          </button>
          <button type="button" className="profile-menu-item" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default UserProfile;