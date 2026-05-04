import logo from "../../public/CareLensLogo.png";
import { AuthContext } from "./AuthContext";
import UserProfile from "./UserProfile";
import { useContext, useEffect } from "react";
function NavBar(scrolled) {
    const { user, setUser, loading } = useContext(AuthContext);
    useEffect(()=>{
      // console.log(user);
    },[user])
  return (
    <nav
      className="cl-nav navbar navbar-expand-lg sticky-top bg-white"
      style={{ boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,.08)" : "none" }}
    >
          <img className="cl-logo ms-5" src={logo} />
      <div className="cl-container">
        <div className="cl-nav-inner">
          <div className="cl-nav-links">
            {["Home", "Features", "Medical Blog", "About"].map((l) => (
              <a key={l} className="cl-nav-link" href="#">
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
          <div className="cl-nav-btns me-5">
            { !user ? (
                <>
            <a href="/login" className="cl-btn-ghost text-decoration-none">Login</a>
            <a href="/register" className="cl-btn-primary text-decoration-none">Register</a>
                </>
            ) : (
              <div className="">
                <UserProfile title={user.name}/>
              </div>
            )}
          </div>
    </nav>
  );
}
export default NavBar;
