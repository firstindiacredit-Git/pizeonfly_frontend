import React, { useState } from "react";
import { Link, Navigate } from 'react-router-dom'; // Import Navigate
import axios from "axios";

const Signup = () => {
  const [formData, setFormData] = useState({
    employeeName: "",
    emailid: "",
    password: "",
  });

  const handleChange = (e) => {
    // console.log(e.target.name);
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      for (let key in formData) {
        formDataToSend.append(key, formData[key]);
      }
      console.log(formData);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}api/employees`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response.data);
      alert("Signup successful!");
      setIsSignIn(true);
      // Handle successful response
    } catch (error) {
      console.error("Error:", error);
      // Handle error
    }
  };
  if (isSignIn) {
    return <Navigate to="/employeesignin" />; // Use Navigate component
  }

  return (
    <>
      <div id="mytask-layout">
        {/* main body area */}
        <div className="main p-2 py-3 p-xl-5">
          {/* Body: Body */}
          <div className="body d-flex p-0 p-xl-5">
            <div className="container-xxl">
              <div className="row g-0">
                <div className="col-lg-6 d-none d-lg-flex justify-content-center align-items-center rounded-lg auth-h100">
                  <div style={{ maxWidth: "25rem" }}>
                    <img
                      src="../Images/techninza-logo.png"
                      className="mb-4"
                      style={{ width: "-webkit-fill-available" }}
                    />
                    <div className="d-flex justify-content-center ">
                      <img
                        src="../Images/crm.jpeg"
                        className="text-center"
                        style={{ height: "30px" }}
                      />
                    </div>
                    {/* Image block */}
                    <div>
                      <img
                        src="../assets/images/login-img.svg"
                        alt="login-img"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-lg-6 d-flex justify-content-center align-items-center border-0 rounded-lg auth-h100">
                  <div
                    className="w-100 p-3 p-md-5 card border-0 bg-dark text-light"
                    style={{ maxWidth: "32rem" }}
                  >
                    {/* Form */}
                    <form
                      //   onSubmit={handleSubmit}
                      className="row g-1 p-3 p-md-4"
                    >
                      <div className="col-12 text-center mb-1 mb-lg-5">
                        <h1>Employee Sign up</h1>
                        <span>Create your account as a Employee</span>
                      </div>
                      <div className="col-12 text-center">
                        <Link
                          className="btn btn-lg btn-outline-secondary btn-block "
                          style={{ marginTop: "-40px" }}
                          to="/signup"
                        >
                          <span className="d-flex justify-content-center align-items-center gap-2">
                            <i class="bi bi-person-plus-fill"></i>
                            Sign up as a Admin
                          </span>
                        </Link>
                        <span className="dividers text-muted mt-2">OR</span>
                      </div>

                      {/* <div className="row g-2">
                          <div className="col">
                            <label
                              htmlFor="exampleFormControlInput177"
                              className="form-label"
                            >
                              Full Name
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="exampleFormControlInput177"
                              placeholder="Full Name"
                              name="username"
                              // value={formData.username}
                              // onChange={handleChange}
                            />
                          </div>
                          <div className="col">
                            <label
                              htmlFor="exampleFormControlInput277"
                              className="form-label"
                            >
                              Company Name
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="exampleFormControlInput277"
                              placeholder="Company Name"
                              name=""
                              // value={formData.password}
                              // onChange={handleChange}
                            />
                          </div>
                        </div>
                      <div className="row g-2">
                          <div className="col">
                            <label
                              htmlFor="exampleFormControlInput177"
                              className="form-label"
                            >
                              Image
                            </label>
                            <input
                              type="file"
                              className="form-control"
                              id="exampleFormControlInput177"
                              placeholder="Add Image"
                              name=""
                              // value={formData.username}
                              // onChange={handleChange}
                            />
                          </div>
                          <div className="col">
                            <label
                              htmlFor="exampleFormControlInput277"
                              className="form-label"
                            >
                              User Name
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="exampleFormControlInput277"
                              placeholder="User Name"
                              name="password"
                              // value={formData.password}
                              // onChange={handleChange}
                            />
                          </div>
                        </div>
                      <div className="row g-2">
                          <div className="col">
                            <label
                              htmlFor="exampleFormControlInput177"
                              className="form-label"
                            >
                              Email Id
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="exampleFormControlInput177"
                              placeholder="Email Id"
                              name=""
                              // value={formData.username}
                              // onChange={handleChange}
                            />
                          </div>
                          <div className="col">
                            <label
                              htmlFor="exampleFormControlInput277"
                              className="form-label"
                            >
                              Password
                            </label>
                            <input
                              type="Password"
                              className="form-control"
                              id="exampleFormControlInput277"
                              placeholder="Password"
                              name="password"
                              // value={formData.password}
                              // onChange={handleChange}
                            />
                          </div>
                        </div>
                      <div className="row g-2">
                          <div className="col">
                            <label
                              htmlFor="exampleFormControlInput177"
                              className="form-label"
                            >
                              Phone No.
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="exampleFormControlInput177"
                              placeholder="Email Id"
                              name=""
                              // value={formData.username}
                              // onChange={handleChange}
                            />
                          </div>
                          <div className="col">
                            <label className="form-label">Designation</label>
                            <select
                              className="form-select"
                              aria-label="Default select Project Category"
                              name=""
                              // value={formData.designation}
                              // onChange={handleChange}
                            >
                              <option value={""}></option>
                              <option value={"UI/UX Design"}>
                                UI/UX Design
                              </option>
                              <option value={"Website Design"}>
                                Website Design
                              </option>
                              <option value={"App Development"}>
                                App Development
                              </option>
                              <option value={"Quality Assurance"}>
                                Quality Assurance
                              </option>
                              <option value={"Development"}>Development</option>
                              <option value={"Backend Development"}>
                                Backend Development
                              </option>
                              <option value={"Software Testing"}>
                                Software Testing
                              </option>
                              <option value={"Website Design"}>
                                Website Design
                              </option>
                              <option value={"Marketing"}>Marketing</option>
                              <option value={"SEO"}>SEO</option>
                              <option value={"Project Manager"}>
                                Project Manager
                              </option>
                              <option value={"Other"}>Other</option>
                            </select>
                          </div>
                        </div> */}
                      <div className="col-12">
                        <div className="mb-2">
                          <label className="form-label">Full name</label>
                          <input
                            type="text"
                            className="form-control form-control-lg" style={{color:"black"}}
                            placeholder="John"
                            name="employeeName"
                            value={formData.employeeName}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="mb-2">
                          <label className="form-label">Email address</label>
                          <input
                            type="email"
                            className="form-control form-control-lg"
                            placeholder="name@example.com"
                            name="emailid"
                            value={formData.emailid}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="mb-2">
                          <label className="form-label">Password</label>
                          <input
                            type="password"
                            className="form-control form-control-lg"
                            placeholder="8+ characters required"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="col-12 text-center mt-4">
                        <button
                          type="submit"
                          className="btn btn-lg btn-block btn-light lift text-uppercase"
                          alt="SIGNUP"
                          onClick={handleSubmit}
                        >
                          SIGN UP
                        </button>
                      </div>
                      {/* {error && <p>{error}</p>} */}
                    </form>
                    <div className="col-12 text-center mt-4">
                      <span className="text-muted">
                        Already have an account?{" "}
                        <Link to="/employeesignin" title="Sign in" className="text-secondary">
                          Sign in here
                        </Link>
                      </span>
                    </div>
                    {/* End Form */}
                  </div>
                </div>
              </div>{" "}
              {/* End Row */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
