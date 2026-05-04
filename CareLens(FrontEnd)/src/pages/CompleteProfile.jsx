import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormError from "../components/FormError";

export default function CompleteProfile() {
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    phone: "",
    role: "patient",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop().split(";").shift();
    }
  }
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.get("/sanctum/csrf-cookie");

      const token = getCookie("XSRF-TOKEN");

      const res = await axios.post(
        "/complete-profile",
        { ...form },
        {
          headers: {
            "X-XSRF-TOKEN": decodeURIComponent(token),
          },
        },
      );

      console.log("success", res.data);
      navigate(`${res.redirect}`);
    
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
      } else {
        console.log("ERROR RESPONSE:", err.response?.data);
        console.log("STATUS:", err.response?.status);
      }
    }
  };

  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center">
      <div className="row w-100">
        <div className="col-12 col-md-6 col-lg-4 mx-auto">
          <div className="card shadow border-0 rounded-4">
            <div className="card-body p-4">
              {/* Title */}
              <h4 className="text-center mb-2 fw-bold">
                Complete Your Profile
              </h4>
              <p className="text-center text-muted mb-4">
                Just a few more details to get started
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                {/* Phone */}
                <div className="mb-3">
                  <label className="form-label">Phone Number</label>
                  {errors.phone && <FormError message={errors.phone[0]} />}
                  <input
                    type="text"
                    name="phone"
                    className="form-control"
                    placeholder="Enter your phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Role */}
                <div className="mb-4">
                  <label className="form-label">I am a</label>
                  <select
                    name="role"
                    className="form-select"
                    value={form.role}
                    onChange={handleChange}
                  >
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                  </select>
                </div>

                {/* Button */}
                <button type="submit" className="btn btn-primary w-100">
                  Continue
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
