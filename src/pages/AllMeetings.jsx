import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FloatingMenu from '../Chats/FloatingMenu'
import { useTable, useSortBy, useFilters, usePagination } from 'react-table';

const AllMeetings = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [meetings, setMeetings] = useState([]);

  const handleStatusUpdate = async (meetingId, newStatus) => {
    try {
      await axios.put(`${import.meta.env.VITE_BASE_URL}api/meetings/${meetingId}/status`, {
        status: newStatus
      });
      fetchMeetings(); // Refresh the meetings list
    } catch (error) {
      console.error('Error updating meeting status:', error);
      toast.error("Failed to update meeting status");
    }
  };

  const handleDelete = async (meetingId) => {
    if (window.confirm("Are you sure you want to delete this meeting?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_BASE_URL}api/meetings/${meetingId}`);
        toast.success("Meeting deleted successfully");
        fetchMeetings(); // Refresh the list
      } catch (error) {
        console.error('Error deleting meeting:', error);
        toast.error("Failed to delete meeting");
      }
    }
  };

  const columns = useMemo(() => [
    { 
      Header: '#', 
      accessor: (row, i) => i + 1,
      Cell: ({ row }) => row.index + 1 + pageIndex * pageSize
    },
    { Header: 'Title', accessor: 'title' },
    { 
      Header: 'Date', 
      accessor: 'date',
      Cell: ({ value }) => new Date(value).toLocaleDateString()
    },
    { Header: 'Time', accessor: 'startTime' },
    { Header: 'Duration (mins)', accessor: 'duration' },
    { Header: 'Guest Name', accessor: 'guestName' },
    { Header: 'Guest Email', accessor: 'guestEmail' },
    { 
      Header: 'Status', 
      accessor: 'status',
      Cell: ({ row }) => (
        <div className="dropdown">
          <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
            {row.original.status}
          </button>
          <ul className="dropdown-menu">
            <li><button className="dropdown-item" onClick={() => handleStatusUpdate(row.original._id, 'scheduled')}>Scheduled</button></li>
            <li><button className="dropdown-item" onClick={() => handleStatusUpdate(row.original._id, 'postponed')}>Postponed</button></li>
            <li><button className="dropdown-item" onClick={() => handleStatusUpdate(row.original._id, 'cancelled')}>Cancelled</button></li>
            <li><button className="dropdown-item" onClick={() => handleStatusUpdate(row.original._id, 'completed')}>Completed</button></li>
          </ul>
        </div>
      )
    },
    { 
      Header: 'Actions', 
      accessor: '_id',
      Cell: ({ value, row }) => (
        <div className="d-flex gap-2">
          {/* <button 
            className="btn btn-sm btn-outline-primary"
            onClick={() => window.location.href = `/edit-meeting/${value}`}
          >
            <i className="bi bi-pencil"></i>
          </button> */}
          <button 
            className="btn btn-sm btn-outline-danger"
            onClick={() => handleDelete(value)}
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      )
    }
  ], []);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize }
  } = useTable(
    {
      columns,
      data: meetings,
      initialState: { pageIndex: 0, pageSize: 10 }
    },
    useFilters,
    useSortBy,
    usePagination
  );

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/meetings`);
      setMeetings(response.data.meetings || []);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      // toast.error("Failed to fetch meetings");
      setMeetings([]);
    }
  };

  return (
    <>
      <div id="mytask-layout">
        <Sidebar />
        <div className="main px-lg-4 px-md-4">
          <Header />
          <div className="body d-flex py-lg-3 py-md-2">
            <div className="container-xxl">
              <div className="row clearfix g-3">
                <div className="col-12">
                  <div className="">
                    <div className="">
                      <h3 className="">All Meetings</h3>
                    </div>
                    <div className="">
                      <div className="table-responsive">
                        <table {...getTableProps()} className="table table-hover align-middle mb-0">
                          <thead>
                            {headerGroups.map(headerGroup => (
                              <tr {...headerGroup.getHeaderGroupProps()}>
                                {headerGroup.headers.map(column => (
                                  <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                                    {column.render('Header')}
                                    <span>
                                      {column.isSorted
                                        ? column.isSortedDesc
                                          ? <i className="bi bi-arrow-up-short fs-5"></i>
                                          : <i className="bi bi-arrow-down-short fs-5"></i>
                                        : ''}
                                    </span>
                                  </th>
                                ))}
                              </tr>
                            ))}
                          </thead>
                          <tbody {...getTableBodyProps()}>
                            {page.map(row => {
                              prepareRow(row);
                              return (
                                <tr {...row.getRowProps()}>
                                  {row.cells.map(cell => (
                                    <td {...cell.getCellProps()}>
                                      {cell.render('Cell')}
                                    </td>
                                  ))}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <div>
                            <button 
                              className="btn btn-sm btn-outline-secondary me-2" 
                              onClick={() => gotoPage(0)} 
                              disabled={!canPreviousPage}
                            >
                              {'<<'}
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-secondary me-2" 
                              onClick={() => previousPage()} 
                              disabled={!canPreviousPage}
                            >
                              Previous
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-secondary me-2" 
                              onClick={() => nextPage()} 
                              disabled={!canNextPage}
                            >
                              Next
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-secondary" 
                              onClick={() => gotoPage(pageCount - 1)} 
                              disabled={!canNextPage}
                            >
                              {'>>'}
                            </button>
                          </div>
                          <div>
                            <select
                              className="form-select form-select-sm w-auto"
                              value={pageSize}
                              onChange={e => setPageSize(Number(e.target.value))}
                            >
                              {[10, 20, 30, 40, 50].map(size => (
                                <option key={size} value={size}>
                                  Show {size}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ToastContainer />
        <FloatingMenu userType="admin" isMobile={isMobile} />
      </div>
    </>
  );
};

export default AllMeetings;
