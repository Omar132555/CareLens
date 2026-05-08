import axios from "axios";
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { getCookie } from "../config.jsx";
import { AuthContext } from "../components/AuthContext.jsx";
// SVG Icons
const IconMedical = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
    <path d="M12 8v8M8 12h8" />
  </svg>
);

const IconStethoscope = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
    <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
    <circle cx="20" cy="10" r="2" />
  </svg>
);

const IconPatient = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconMail = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const IconLock = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconEyeOff = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);

const IconEye = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconArrow = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember_me: false,
  });
  const [role, setRole] = useState("doctor");
  const [showPassword, setShowPassword] = useState(false);
  const [data, setData] = useState([]);
  const [errors, setErrors] = useState({});
  const { setUser } = useContext(AuthContext);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setErrors({});

    axios
      .get("/sanctum/csrf-cookie")
      .then(() => {
        const token = getCookie("XSRF-TOKEN");

        return axios.post(
          "/login",
          {
            ...form,
            role,
          },
          {
            headers: {
              "X-XSRF-TOKEN": decodeURIComponent(token),
            },
          },
        );
      })
      .then((res) => {
        navigate('/home');
        setUser(res.data.user);
        console.log("Login success", res.data);
      })
      .catch((err) => {
        console.log(err.response?.data);

        if (err.response?.status === 422) {
          setErrors(err.response.data.errors);
        } else {
          setErrors({
            general: err.response?.data?.message || "Something went wrong",
          });
        }
      });
  };
  useEffect(() => {
    console.log("errors updated:", errors);
  }, [errors]);
  useEffect(() => {
    const getData = async () => {
      const res = await fetch("http://localhost:8000/api/login");
      const result = await res.json();

      setData(result);
    };
    getData();
  }, []);
  return (
    <div className="cl-bg-box">
      {/* Background */}
      <div className="cl-bg-overlay">
        <div className="cl-bg-image" />
        <div className="cl-bg-dark" />
        <div className="cl-bg-teal" />
      </div>

      <div className="cl-wrapper">
        {/* Logo */}
        <div className="cl-logo-area">
          <div className="cl-logo-icon">
            <img
              src="../../public/CareLensImage.png"
              alt=""
              className="object-fit-cover mt-1"
              width="110"
              height="110"
            />
          </div>
          <h1 className="cl-logo-title">CareLens</h1>
          <p className="cl-logo-subtitle">Smart Patient Management System</p>
        </div>

        {/* Card */}
        <div className="cl-card">
          {/* Tabs */}
          <div className="cl-tabs">
            <button className="cl-tab-btn cl-active" type="button">
              Login
            </button>
            <button
              className="cl-tab-btn"
              onClick={() => navigate("/register")}
              type="button"
            >
              Register
            </button>
          </div>

          <div className="cl-card-content">
            {/* Header */}
            <div className="cl-card-header">
              <h2>Welcome Back</h2>
              <p>Access your medical dashboard</p>
            </div>

            {/* Role Selector */}
            <label className="cl-role-label">Select Role</label>
            <div className="cl-role-selector">
              <div className="cl-role-option">
                <input
                  type="radio"
                  id="role-doctor"
                  name="role"
                  value="doctor"
                  checked={role === "doctor"}
                  onChange={() => setRole("doctor")}
                />
                <label className="cl-role-option-label" htmlFor="role-doctor">
                  <IconStethoscope />
                  Doctor
                </label>
              </div>
              <div className="cl-role-option">
                <input
                  type="radio"
                  id="role-patient"
                  name="role"
                  value="patient"
                  checked={role === "patient"}
                  onChange={() => setRole("patient")}
                />
                <label className="cl-role-option-label" htmlFor="role-patient">
                  <IconPatient />
                  Patient
                </label>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="cl-field">
                <label className="cl-field-label">Email Address</label>
                <div className="cl-input-wrap">
                  <div className="cl-input-icon">
                    <IconMail />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="name@hospital.com"
                    className="cl-input"
                  />
                </div>
                {errors.email && (
                  <p className="text-danger m-2">{errors.email[0]}</p>
                )}
              </div>

              {/* Password */}
              <div className="cl-field">
                <div className="cl-field-header">
                  <label className="cl-field-label" style={{ marginBottom: 0 }}>
                    Password
                  </label>
                </div>
                <div className="cl-input-wrap">
                  <div className="cl-input-icon">
                    <IconLock />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="cl-input has-right-icon"
                  />
                  <button
                    type="button"
                    className="cl-toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <IconEye /> : <IconEyeOff />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-danger m-2">{errors.password[0]}</p>
                )}
              </div>

              {/* Remember Me */}
              <div className="cl-remember-row">
                <input
                  type="checkbox"
                  name="remember_me"
                  checked={form.remember_me}
                  onChange={handleChange}
                  id="remember_me"
                />
                <label htmlFor="remember_me">Remember Me</label>
                <a href="/forget-password" className="cl-forgot-link ms-auto">
                  Forgot?
                </a>
              </div>

              {/* Submit */}
              <button className="cl-btn-submit mt-4" type="submit">
                Sign In
                <span className="cl-arrow">
                  <IconArrow />
                </span>
              </button>

              {/* Divider */}
              <div className="cl-divider">
                <hr />
                <span>Or</span>
                <hr />
              </div>

              {/* Google */}
              <a href={data.googleLogin} className="cl-btn-google">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-google"
                  viewBox="0 0 16 16"
                >
                  <path d="M15.545 6.558a9.4 9.4 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.7 7.7 0 0 1 5.352 2.082l-2.284 2.284A4.35 4.35 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.8 4.8 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.7 3.7 0 0 0 1.599-2.431H8v-3.08z" />
                </svg>
                Log In With Google
              </a>
            </form>

            {/* Card Footer */}
            <div className="cl-card-footer">
              <p>
                Don't have an account?
                <a href="" onClick={() => navigate("/register")}>
                  Create free account
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Links */}
        <div className="cl-bottom-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Support</a>
        </div>
      </div>
    </div>
  );
}

export default Login;
