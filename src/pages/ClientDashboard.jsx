import React from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../clientCompt/ClientSidebar'
import Header from '../clientCompt/ClientHeader'

const ClientDashboard = () => {
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
                    <div style={{ height: "13rem" }}>

                      <img
                        src="Images/icon.png"
                        className="img-fluid"
                        alt="No Data"
                        style={{ height: "7rem" }}
                      />
                      <p className="fs-4 mt-4" style={{ color: "#4989fd" }}>An agency like no other. <span style={{ color: "#0c117b" }}>Results to match.</span></p>
                    </div>
                    <div className="mt-4 mb-2">
                      <Link to="https://pizeonfly.com/" className="text-muted">GO TO THE WEBSITE</Link>
                    </div>
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

export default ClientDashboard