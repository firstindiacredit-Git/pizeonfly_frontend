import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!newPassword || !confirmPassword) {
      setError("Please fill out all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_BASE_URL}api/reset-password`, { token, newPassword });
      toast.success("Password updated successfully!");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError("Failed to reset password. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="mytask-layout">
      <div className="main p-2 py-3 p-xl-5">
        <div className="body d-flex p-0 p-xl-5">
          <div className="container-xxl">
            <div className="row g-0">
              {/* Left side: Logo and images */}
              <div className="col-lg-6 d-none d-lg-flex justify-content-center align-items-center rounded-lg auth-h100">
                <div style={{ maxWidth: "25rem" }}>
                  <img
                    src="../Images/pizeonflylogo.png"
                    className="mb-4"
                    style={{ width: "-webkit-fill-available" }}
                    alt="Logo"
                  />
                  <div className="d-flex justify-content-center ">
                    <img
                      src="../Images/crm.jpeg"
                      className="text-center"
                      style={{ height: "30px" }}
                      alt="CRM"
                    />
                  </div>
                  <div>
                    <img src="../assets/images/login-img.svg" alt="Login" />
                  </div>
                </div>
              </div>
              {/* Right side: Reset Password Form */}
              <div className="col-lg-6 d-flex justify-content-center align-items-center border-0 rounded-lg auth-h100">
                <div
                  className="w-100 p-3 p-md-5 card border-0 bg-dark text-light"
                  style={{ maxWidth: "32rem" }}
                >
                  <form className="row g-1 p-3 p-md-4" onSubmit={handleSubmit}>
                    <div className="col-12 text-center mb-1 mb-lg-5">
                      <h1>Reset Password</h1>
                      <span>Set your new password</span>
                    </div>
                    <div className="col-12">
                      <div className="mb-3 position-relative">
                        <label className="form-label">New Password</label>
                        <input
                          type={showNewPassword ? "text" : "password"}
                          className="form-control"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                        />
                        <span
                          className="d-flex align-items-center"
                          style={{ position: "absolute", right: "15px", top: "70%", transform: "translateY(-50%)", color: "#aaa", cursor: "pointer" }}
                          onClick={() => setShowNewPassword((prev) => !prev)}
                        >
                          <i className={`bi ${showNewPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                        </span>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="mb-3 position-relative">
                        <label className="form-label">Confirm Password</label>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className="form-control"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                        />
                        <span
                          className="d-flex align-items-center"
                          style={{ position: "absolute", right: "15px", top: "70%", transform: "translateY(-50%)", color: "#aaa", cursor: "pointer" }}
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                        >
                          <i className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                        </span>
                      </div>
                    </div>
                    {error && <div className="text-danger mb-2 text-center">{error}</div>}
                    <div className="col-12 text-center mt-4">
                      <button type="submit" className="btn btn-lg btn-block btn-light lift text-uppercase" disabled={loading}>
                        {loading ? "Saving..." : "Save Password"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ResetPassword; 