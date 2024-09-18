import React from 'react'
import Sidebar from '../employeeCompt/EmployeeSidebar'
import Header from '../employeeCompt/EmployeeHeader'

import axios from 'axios'
import { Link } from 'react-router-dom'

const EmployeeDashboard = () => {

  return (
    <>
      <div id="mytask-layout">
        <Sidebar />
        {/* main body area */}
        <div className="main px-lg-4 px-md-4">
          {/* Body: Header */}
          <Header />
          <div className="body d-flex py-lg-3 py-md-2">
            <div className="container-xxl">
              <div className="col-12">
                <div className="card mb-3">
                  <div className="card-body text-center p-5">
                    <img
                      src="../assets/images/no-data.svg"
                      className="img-fluid mx-size"
                      alt="No Data"
                    />
                    <div className="mt-4 mb-2">
                      <Link to="https://pizeonfly.com/" className="text-muted">GO TO THE WEBSITE</Link>
                    </div>
                    {/* <button
                      type="button"
                      className="btn btn-white border lift mt-1"
                    >
                      Get Started
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary border lift mt-1"
                    >
                      Back to Home
                    </button> */}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>


    </>
  )
}

export default EmployeeDashboard