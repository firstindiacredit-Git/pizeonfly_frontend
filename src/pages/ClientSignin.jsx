import React, { useState } from "react";
import { Link, useNavigate, Navigate } from 'react-router-dom';
import axios from "axios";

const Signin = () => {
  const [formData, setFormData] = useState({
    clientEmail: "",
    clientPassword: "",
  });
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [showPassword, setShowPassword] = useState(false); // Password visibility state
  const navigate = useNavigate();

  // Handle form data change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Toggle password visibility
  const toggleShowPassword = () => {
    setShowPassword((prevState) => !prevState);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}api/clientlogin`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const { token, user } = response.data;

      if (token) {
        localStorage.setItem("client_token", token);
        localStorage.setItem("client_user", JSON.stringify(user));
        setIsAuthenticated(true);
        navigate("/client-dashboard");
      } else {
        setError("Incorrect email or password");
      }

      // Optional reload after successful login
      setTimeout(() => {
        window.location.reload();
      }, 3000);

    } catch (error) {
      if (error.response && error.response.status === 401) {
        setError("Incorrect email or password");
      } else {
        setError("An error occurred. Please try again.");
      }
      console.error(error);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  // Redirect if authenticated
  if (isAuthenticated) {
    return <Navigate to="/client-dashboard" />;
  }

  return (
    <div id="mytask-layout">
      <div className="main p-2 py-3 p-xl-5">
        <div className="body d-flex p-0 p-xl-5">
          <div className="container-xxl">
            <div className="row g-0">
              <div className="col-lg-6 d-none d-lg-flex justify-content-center align-items-center rounded-lg auth-h100">
                <div style={{ maxWidth: "25rem" }}>
                  <img
                    src="../Images/pizeonflylogo.png"
                    className="mb-4"
                    style={{ width: "-webkit-fill-available" }}
                  />
                  <div className="d-flex justify-content-center">
                    <img
                      src="../Images/crm.jpeg"
                      className="text-center"
                      style={{ height: "30px" }}
                    />
                  </div>
                  <div>
                    <img src="../assets/images/login-img.svg" alt="login-img" />
                  </div>
                </div>
              </div>
              <div className="col-lg-6 d-flex justify-content-center align-items-center border-0 rounded-lg auth-h100">
                <div className="w-100 p-3 p-md-5 card border-0 bg-dark text-light" style={{ maxWidth: "32rem" }}>
                  <form onSubmit={handleSubmit} className="row g-1 p-3 p-md-4">
                    <div className="col-12 text-center mb-1 mb-lg-5">
                      <h1>Client Sign in</h1>
                      <span>Client Panel</span>
                    </div>
                    <div className="col-12 text-center mb-4">
                      <div className="d-flex gap-5">
                        <Link
                          className="btn btn-lg btn-outline-secondary btn-block"
                          to="/"
                        >
                          <span className="d-flex justify-content-center align-items-center gap-2">
                            <i className="bi bi-person-plus-fill"></i>
                            Admin Sign In
                          </span>
                        </Link>
                        <Link
                          className="btn btn-lg btn-outline-secondary btn-block"
                          to="/employeesignin"
                        >
                          <span className="d-flex justify-content-center align-items-center gap-2">
                            <i className="bi bi-person-plus-fill"></i>
                            Employee Sign In
                          </span>
                        </Link>

                      </div>
                      <span className="dividers text-muted mt-4">OR</span>
                    </div>
                    <div className="col-12">
                      <div className="mb-2">
                        <label className="form-label">Email address</label>
                        <input
                          type="email"
                          name="clientEmail" // Correct name for email
                          onChange={handleChange}
                          value={formData.clientEmail}
                          className="form-control form-control-lg"
                          placeholder="name@example.com"
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="mb-2">
                        <div className="form-label">
                          <span className="d-flex justify-content-between align-items-center">
                            Password
                            <a className="text-secondary" href="auth-password-reset.html">
                              Forgot Password?
                            </a>
                          </span>
                        </div>
                        <div className="input-group">
                          <input
                            type={showPassword ? "text" : "password"} // Toggle input type
                            name="clientPassword" // Correct name for password
                            onChange={handleChange}
                            value={formData.clientPassword}
                            className="form-control form-control-lg"
                            placeholder="***************"
                          />
                          <div className="d-flex" style={{ position: "absolute", color: "black", marginLeft: "20rem" }}>
                            <i
                              onClick={toggleShowPassword}
                              className={`bi mt-2 form-control ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                            ></i>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 text-center mt-4">
                      <button
                        type="submit"
                        className="btn btn-lg btn-block btn-light lift text-uppercase"
                        disabled={isLoading} // Disable button while loading
                      >
                        {isLoading ? "Signing in..." : "SIGN IN"} {/* Show loading text */}
                      </button>
                    </div>
                    {error && <p className="text-danger mt-3 text-center">{error}</p>}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;
