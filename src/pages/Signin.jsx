import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Signin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    role: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for show password

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/crm-access`);
        console.log(response.data);
        setRoles(response.data);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    const token = localStorage.getItem("token");
    if (token) {
      navigate("/project-dashboard");
    } else {
      fetchRoles();
    }
  }, [navigate]);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.role) {
      setError("Please fill out all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}api/login`,
        form
      );
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/project-dashboard");
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setError("Invalid email or password");
      } else {
        setError("An error occurred. Please try again later.");
        console.error(error);
      }
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
              <div className="col-lg-6 d-flex justify-content-center align-items-center border-0 rounded-lg auth-h100">
                <div
                  className="w-100 p-3 p-md-5 card border-0 bg-dark text-light"
                  style={{ maxWidth: "32rem" }}
                >
                  <form onSubmit={handleSubmit} className="row g-1 p-3 p-md-4">
                    <div className="col-12 text-center mb-1 mb-lg-5">
                      <h1>Admin Sign in</h1>
                      <span>Admin Panel</span>
                    </div>
                    <div className="col-12 text-center mb-4">
                      <div className="d-flex gap-5">
                        <Link
                          className="btn btn-lg btn-outline-secondary btn-block"
                          to="/employeesignin"
                        >
                          <span className="d-flex justify-content-center align-items-center gap-2">
                            <i className="bi bi-person-plus-fill"></i>
                            Employee Sign In
                          </span>
                        </Link>
                        <Link
                          className="btn btn-lg btn-outline-secondary btn-block"
                          to="/clientsignin"
                        >
                          <span className="d-flex justify-content-center align-items-center gap-2">
                            <i className="bi bi-person-plus-fill"></i>
                            Client Sign In
                          </span>
                        </Link>
                      </div>
                      <span className="dividers text-muted mt-4">OR</span>
                    </div>
                    <div className="col-12">
                      <div className="mb-2">
                        <label className="form-label">Role</label>
                        <select
                          className="form-control form-control-lg"
                          name="role"
                          value={form.role}
                          onChange={handleChange}
                        >
                          <option value="">Select Role</option>
                          <option value="superadmin">Super Admin</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="mb-2">
                        <label className="form-label">Email address</label>
                        <input
                          type="email"
                          name="email"
                          onChange={handleChange}
                          value={form.email}
                          className="form-control form-control-lg"
                          placeholder="name@example.com"
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="mb-2 position-relative">
                        <div className="form-label">
                          <span className="d-flex justify-content-between align-items-center">
                            Password
                          </span>
                        </div>
                        <input
                          type={showPassword ? "text" : "password"} // Toggle input type
                          name="password"
                          onChange={handleChange}
                          value={form.password}
                          className="form-control form-control-lg"
                          placeholder="***************"
                        />
                        <div
                          className="d-flex"
                          style={{
                            position: "absolute",
                            right: "15px",
                            top: "67%",
                            transform: "translateY(-50%)",
                            color: "black",
                            cursor: "pointer",
                          }}
                          onClick={toggleShowPassword}
                        >
                          <i
                            className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                          ></i>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 text-center mt-4">
                      <button
                        type="submit"
                        className="btn btn-lg btn-block btn-light lift text-uppercase"
                        disabled={loading}
                      >
                        {loading ? "Signing In..." : "SIGN IN"}
                      </button>
                    </div>
                    {error && <p className="text-danger">{error}</p>}
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
export default Signin;