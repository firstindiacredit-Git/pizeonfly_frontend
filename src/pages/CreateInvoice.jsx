import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import DatePicker from "react-datepicker";
import { format } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";
import './custom-datepicker.css';
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Loading.css"
import FloatingMenu from '../Chats/FloatingMenu'



const CreateInvoice = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [invoices, setInvoices] = useState([]);
  // Create a Invoice
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    invoiceDate: '',
    invoiceDueDate: '',
    billedBy: 'First India Credit \n\n88,Sant Nagar,Near India Post Office, \nEast of Kailash, New Delhi, Delhi, \nIndia - 110065  \n\nGSTIN: 06AATFG8894M1Z8 \nPAN: AATFG8894M \nEmail:fzal9000i@gmail.com',
    clientDetail: '',
    country: '',
    state: '',
    table: [{
      item: '',
      description: '',
      rate: '',
      quantity: '',
      gst: '',
      igst: '',
      cgst: '',
      sgst: ''
    }],
    amount: '',
    totalGst: '',
    total: '',
    bankDetails: {
      accountName: 'First India Credit',
      accountNumber: '002105501589',
      ifsc: 'ICIC0000021',
      accountType: 'Current',
      bankName: 'ICICI bank'
    },
    termsConditions: '1. Please quote invoice number when remitting funds'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if any required field is empty
    const requiredFields = ['invoiceDate', 'invoiceDueDate', 'clientDetail', 'country', 'state', 'table', 'amount'];
    const isEmpty = requiredFields.some(field => {
      if (field === 'table') {
        // Check if any table row is empty
        return formData.table.some(row => Object.values(row).some(value => value === ''));
      } else {
        return formData[field] === '';
      }
    });

    if (isEmpty) {
      // Display error toast
      toast.error("Please fill all required fields!", {
        style: {
          backgroundColor: "#4c3575",
          color: "white",
        },
      });
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}api/invoices`, formData);
      console.log('Invoice created:', response.data);
      window.print();

      // Clear the form
      setFormData({
        invoiceDate: '',
        invoiceDueDate: '',
        billedBy: 'First India Credit \n\n88,Sant Nagar,Near India Post Office, \nEast of Kailash, New Delhi, Delhi \nIndia - 110065 \n\nGSTIN: 06AATFG8894M1Z8 \nPAN: AATFG8894M \nEmail:afzal9000i@gmail.com',
        clientDetail: '',
        country: '',
        state: '',
        table: [{
          item: '',
          description: '',
          rate: '',
          quantity: '',
          gst: '',
          igst: '',
          cgst: '',
          sgst: ''
        }],
        amount: '',
        totalGst: '',
        total: '',
        bankDetails: {
          accountName: 'First India Credit',
          accountNumber: '002105501589',
          ifsc: 'ICIC0000021',
          accountType: 'Current',
          bankName: 'ICICI bank'
        },
        termsConditions: '1. Please quote invoice number when remitting funds'
      });

      // Toast
      toast.success("Invoice Added Successfully!", {
        style: {
          backgroundColor: "#4c3575",
          color: "white",
        },
      });
      // Reload the page after 5 seconds
      setTimeout(() => {
        window.location.reload();
      }, 5000);

    } catch (error) {
      if (error.response) {
        console.error('Server Error:', error.response.data);
      } else if (error.request) {
        console.error('No Response Received:', error.request);
      } else {
        console.error('Request Setup Error:', error.message);
      }
    }
  };









  //Invoice Number
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const handleInvoiceNumberChange = (e) => {
    const value = e.target.value;
    setInvoiceNumber(value);
    setFormData(prevFormData => ({ ...prevFormData, invoiceNumber: value }));
  };


  //Invoice Dates
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [invoiceDueDate, setInvoiceDueDate] = useState(new Date());
  const handleInvoiceDateChange = (date) => {
    setInvoiceDate(date);
    setFormData(prevFormData => ({
      ...prevFormData,
      invoiceDate: date
    }));
    // console.log(formData);
  };
  const handleInvoiceDueDateChange = (date) => {
    setInvoiceDueDate(date);
    setFormData(prevFormData => ({
      ...prevFormData,
      invoiceDueDate: date
    }));
    // console.log(formData);
  };


  //BilledBy
  const handleBilledByChange = (event) => {
    const billedByValue = event.target.value;
    setFormData(prevFormData => ({
      ...prevFormData,
      billedBy: billedByValue
    }));
    // console.log(formData);
  };

  //Get a client by Name
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/clients`);
        setClients(response.data);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };

    fetchClients();
  }, []);
  const handleClientChange = (event) => {
    const selectedClientId = event.target.value;
    const selectedClientData = clients.find(client => client.clientName === selectedClientId);
    setSelectedClient(selectedClientData);
    setFormData(prevFormData => ({
      ...prevFormData,
      clientDetail: selectedClientData
    }));
    console.log(formData);
  };


  //Country & State
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  useEffect(() => {
    fetch("https://api.countrystatecity.in/v1/countries", {
      method: 'GET',
      headers: {
        'X-CSCAPI-KEY': 'eUNnUGVIam1VVXVqOFdKWWtzc0I1REM5cFVnZWtaTEEyM1l5ZE1JMw=='
      }
    })
      .then(response => response.json())
      .then(data => {
        setCountries(data);
      })
      .catch(error => console.error('Error fetching countries:', error));
  }, []);
  useEffect(() => {
    if (selectedCountry) {
      fetch(`https://api.countrystatecity.in/v1/countries/${selectedCountry}/states`, {
        method: 'GET',
        headers: {
          'X-CSCAPI-KEY': 'eUNnUGVIam1VVXVqOFdKWWtzc0I1REM5cFVnZWtaTEEyM1l5ZE1JMw=='
        }
      })
        .then(response => response.json())
        .then(data => {
          setStates(data);

        })
        .catch(error => console.error('Error fetching states:', error));
    } else {
      setStates([]);
    }
  }, [selectedCountry]);
  const handleCountryChange = (event) => {
    const selectedCountry = event.target.value;
    setSelectedCountry(selectedCountry);
    setSelectedState('');
    setFormData((prevFormData) => ({
      ...prevFormData,
      country: selectedCountry,
      state: ''
    }));
    // console.log(formData);
  };
  const handleStateChange = (event) => {
    const selectedState = event.target.value;
    setSelectedState(selectedState);
    setFormData((prevFormData) => ({
      ...prevFormData,
      state: selectedState
    }));
    // console.log(formData);
  };





  const [rows, setRows] = useState([{ item: '', description: '', rate: '', quantity: '', price: 0, gstPercentage: 0, igst: 0, cgst: 0, sgst: 0 }]);
  const [total, setTotal] = useState({ subtotal: 0, gstTotal: 0, grandTotal: 0 });

  const handleAddRow = () => {
    setRows([...rows, { item: '', description: '', rate: '', quantity: '', price: 0, gstPercentage: 0, igst: 0, cgst: 0, sgst: 0 }]);
  };
  const handleDeleteRow = (index) => {
    const newRows = rows.filter((row, i) => i !== index);
    setRows(newRows);
  };

  const handleInputChange = (e, index, field) => {
    const { value } = e.target;
    const newRows = rows.map((row, i) => {
      if (i === index) {
        const updatedRow = { ...row, [field]: value };
        if (field === 'rate' || field === 'quantity' || field === 'gstPercentage') {
          const rate = parseFloat(updatedRow.rate.replace(/,/g, '')) || 0; // Remove commas for calculation
          const quantity = parseInt(updatedRow.quantity, 10) || 0;
          const gstPercentage = parseInt(updatedRow.gstPercentage)
          const gstAmount = (rate * quantity * gstPercentage) / 100;
          let igst, cgst, sgst;
          if (selectedState === 'HR') {
            igst = 0;
            cgst = gstAmount / 2;
            sgst = gstAmount / 2;
          } else {
            igst = gstAmount;
            cgst = 0;
            sgst = 0;
          }
          updatedRow.price = rate * quantity;
          updatedRow.igst = igst;
          updatedRow.cgst = cgst;
          updatedRow.sgst = sgst;
        }
        return updatedRow;
      }
      return row;
    });
    setRows(newRows);
    updateTotal(newRows);
  };

  const handleBlur = (e, index, field) => {
    const { value } = e.target;
    const formattedValue = value.replace(/,/g, ',');
    const newRows = rows.map((row, i) => {
      if (i === index) {
        const updatedRow = { ...row, [field]: parseFloat(formattedValue).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) };
        return updatedRow;
      }
      return row;
    });
    setRows(newRows);
  };

  const formatNumber = (number) => {
    return number.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const updateTotal = (newRows) => {
    const subtotal = newRows.reduce((acc, row) => acc + row.price, 0);
    const gstTotal = newRows.reduce((acc, row) => acc + row.igst + row.cgst + row.sgst, 0);
    const grandTotal = subtotal + gstTotal;
    setTotal({ subtotal, gstTotal, grandTotal });

    setFormData(prevFormData => ({
      ...prevFormData,
      table: newRows,
      amount: subtotal,
      totalGst: gstTotal,
      total: grandTotal
    }));
    // console.log(formData);
  };
  useEffect(() => {
    updateTotal(rows);
  }, [rows]);


  //Bank Details
  const handleBankDetailsChange = (e, field) => {
    const { value } = e.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      bankDetails: {
        ...prevFormData.bankDetails,
        [field]: value
      }
    }));
    // console.log(formData);
  };

  //Term&condition
  const handleTermsConditionsChange = (e) => {
    const { value } = e.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      termsConditions: value
    }));
    // console.log(formData);
  };












  return (
    <>
      <div id="mytask-layout">
        <Sidebar />
        {/* main body area */}
        <div className="main px-lg-4 px-md-4">
          {/* Body: Header */}
          <Header />

          {/*Body*/}

          <div className="body d-flex py-lg-3 py-md-2">
            {/* <form onSubmit={handleSubmit}> */}
            <div className="container-xxl">
              <div className="row align-items-center">
                <div className="border-0 mb-4">
                  <div className="card-header py-3 no-bg bg-transparent d-flex align-items-center px-0 justify-content-between border-bottom flex-wrap">
                    <h3 className="fw-bold mb-0">Create Invoice</h3>
                    <div className="text-center">
                      <button type="submit" className="btn btn-lg btn-primary" onClick={handleSubmit}>
                        <i className="fa fa-print me-2" />
                        Print Invoice
                      </button>
                    </div>
                  </div>

                </div>

              </div>

              {/* <!-- Row end  --> */}
              <div className="print_invoice" style={{ marginTop: "-4px" }}>
                <div className="" style={{ borderBottom: "1px solid #A9A9A9" }}>
                  <h5 className="card-title mb-0 fw-bold">INVOICE</h5>
                </div>
                <div className=" d-flex justify-content-between mb-2" style={{ marginTop: "5px" }}>
                  <div className="">
                    <div className="d-flex">
                      <span className="fw-bold text-muted">Invoice No # : </span>
                      <input
                        className=""
                        style={{ marginLeft: "0.8rem", border: "none" }}
                        name="invoiceNumber"
                        value={invoiceNumber}
                        onChange={handleInvoiceNumberChange}

                      />
                    </div>
                    <div className="d-flex">
                      <span className="fw-bold text-muted"> Invoice Date : </span>
                      <DatePicker className="date1"
                        selected={invoiceDate}
                        onChange={handleInvoiceDateChange}
                      />
                      <div style={{ marginLeft: "10px" }}>{format(invoiceDate, 'MMMM dd, yyyy')}</div>
                    </div>
                    <div className="d-flex">
                      <span className="fw-bold text-muted">Due Date : </span>
                      <DatePicker className="date2"
                        selected={invoiceDueDate}
                        onChange={handleInvoiceDueDateChange}
                      />
                      <div style={{ marginLeft: "32px" }}>{format(invoiceDueDate, 'MMMM dd, yyyy')}</div>
                    </div>
                  </div>
                  <img id="image" style={{ width: "13rem", height: "2.5rem" }} src="Images/icon.png" alt="logo" />
                </div>


                <div className="d-flex  justify-content-between">
                  <div style={{ width: "49%" }}>
                    <div className="p-3 rounded" style={{ backgroundColor: "lavender" }}>
                      <h2 className="h5 text-primary mb-2" style={{ backgroundColor: "lavender" }}>Billed By</h2>
                      <textarea className="fw-semibold" style={{ backgroundColor: "lavender", border: "none" }} rows="9" onChange={handleBilledByChange} defaultValue={"First India Credit \n\n88,Sant Nagar,Near India Post Office, \nEast of Kailash, New Delhi, Delhi \nIndia - 110065 \n\nGSTIN: 06AATFG8894M1Z8 \nPAN: AATFG8894M \nEmail:afzal9000i@gmail.com"} />
                    </div>
                  </div>


                  <div style={{ width: "49%" }}>
                    <div className="mb-1 client-search" style={{ marginTop: "-2rem" }}>
                      <select className="form-select" aria-label="Default select Project Category" onChange={handleClientChange}>
                        <option value="" selected>Search Client</option>
                        {clients.map(client => (
                          <option key={client._id} value={client.clientName}>{client.clientName}</option>
                        ))}
                      </select>
                    </div>
                    <div className="p-3 rounded" style={{ backgroundColor: "lavender", height: "16.3rem" }}>
                      <h2 className="h5 text-primary mb-2" style={{ backgroundColor: "lavender" }}>Billed To</h2>

                      {selectedClient && (
                        <div style={{ backgroundColor: "lavender" }}>
                          {/* <div>Client Name - {selectedClient.clientName}</div> */}
                          <p style={{ backgroundColor: "lavender" }} className="fw-bold">{selectedClient.businessName}</p>
                          <p style={{ backgroundColor: "lavender" }} className="mt-3 fw-bold">{selectedClient.clientAddress}</p>
                          <p style={{ backgroundColor: "lavender" }} className="mt-3 fw-bold">GSTIN : {selectedClient.clientGst}</p>
                          <p style={{ backgroundColor: "lavender" }} className="fw-bold">Phone No. : {selectedClient.clientPhone}</p>
                          <p style={{ backgroundColor: "lavender" }} className="fw-bold">Email : {selectedClient.clientEmail}</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
                <div className="d-flex justify-content-around mt-2 ">
                  <div className="d-flex">
                    <span className="fw-bold" style={{ textWrap: "nowrap", padding: "8px" }}>Country of Supply :</span>
                    <select
                      id="country-select"
                      className="form-control"
                      style={{ backgroundColor: "white", border: "none" }}
                      value={selectedCountry}
                      onChange={handleCountryChange}
                    >
                      <option value="">Select Country</option>
                      {countries.map(country => (
                        <option key={country.iso2} value={country.iso2}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="d-flex">
                    <span className="fw-bold" style={{ textWrap: "nowrap", padding: "8px" }}>Place of Supply :</span>
                    <select
                      id="state-select"
                      className="form-control"
                      style={{ backgroundColor: "white", border: "none" }}
                      value={selectedState}
                      onChange={handleStateChange}
                    >
                      <option value="">Select State</option>
                      {states.map(state => (
                        <option key={state.iso2} value={state.iso2}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="a4-height" style={{ marginTop: "-20px" }}>
                  {selectedCountry.length > 0 ?

                    <table className="items border-light">
                      {selectedState === 'HR' ?
                        <tbody >
                          <tr >
                            <th style={{ background: "#650bfd", color: "white" }} className="border-secondary">Item</th>
                            <th style={{ background: "#650bfd", color: "white" }} className="border-secondary">Description</th>
                            <th style={{ width: 100, background: "#650bfd", color: "white" }} className="border-secondary">Rate</th>
                            <th style={{ width: 70, background: "#650bfd", color: "white" }} className="border-secondary">Quantity</th>
                            <th style={{ width: 60, background: "#650bfd", color: "white" }} className="border-secondary">GST %</th>
                            {/* <th style={{ width: 100, background: "#650bfd", color: "white" }} className="border-secondary">IGST</th> */}
                            <th style={{ width: 100, background: "#650bfd", color: "white" }} className="border-secondary">CGST</th>
                            <th style={{ width: 100, background: "#650bfd", color: "white" }} className="border-secondary">SGST</th>
                          </tr>
                          {rows.map((row, index) => (
                            <tr key={index} className="item-row ">
                              <td className="item-name border-secondary">
                                <div className="delete-wpr ">
                                  <textarea rows="2" style={{ border: "none" }} value={row.item} onChange={(e) => handleInputChange(e, index, 'item')} />
                                  <a className="delete" href="javascript:;" onClick={() => handleDeleteRow(index)} title="Remove row">X</a>
                                </div>
                              </td>
                              <td className="description border-secondary">
                                <textarea rows="2" style={{ border: "none" }} value={row.description} onChange={(e) => handleInputChange(e, index, 'description')} />
                              </td>
                              <td className="border-secondary">
                                <textarea
                                  style={{ border: "none" }}
                                  className="rate"
                                  value={row.rate}
                                  onChange={(e) => handleInputChange(e, index, 'rate')}
                                  onBlur={(e) => handleBlur(e, index, 'rate')}
                                />
                              </td>
                              <td className="border-secondary">
                                <textarea rows="2" style={{ border: "none" }} className="quantity" value={row.quantity} onChange={(e) => handleInputChange(e, index, 'quantity')} />
                              </td >
                              <td className="border-secondary">
                                <textarea rows="2" style={{ border: "none" }} className="gstPercentage" value={row.gstPercentage} onChange={(e) => handleInputChange(e, index, 'gstPercentage')} />
                              </td>
                              {/* <td className="border-secondary">
                                 <span className="igst">₹ {row.igst.toFixed(2)}</span>
                               </td> */}
                              <td className="border-secondary">
                                <span className="cgst">₹ {formatNumber(row.cgst)}</span>
                              </td>
                              <td className="border-secondary">
                                <span className="sgst">₹ {formatNumber(row.sgst)}</span>
                              </td>
                            </tr>
                          ))}
                          <tr id="hiderow" >
                            <td colSpan={5} className="border-secondary">
                              <a id="addrow" href="javascript:;" onClick={handleAddRow} title="Add a row">Add a row</a>
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={4} className="blank border-secondary">Amount</td>
                            <td colSpan={2} className="total-line border-secondary">₹ {formatNumber(total.subtotal)}</td>
                          </tr>
                          <tr>
                            <td colSpan={4} className="blank border-secondary">Total GST</td>
                            <td colSpan={2} className="total-line border-secondary">₹ {formatNumber(total.gstTotal)}</td>
                          </tr>
                          <tr>
                            <td colSpan={4} className="blank border-secondary">Total (INR)</td>
                            <td colSpan={2} className="total-line border-secondary fs-6 fw-bold" style={{ background: "#650bfd", color: "white" }}>₹ {formatNumber(total.grandTotal)}</td>
                          </tr>
                        </tbody>
                        :
                        <tbody >
                          <tr >
                            <th style={{ background: "#650bfd", color: "white" }} className="border-secondary">Item</th>
                            <th style={{ background: "#650bfd", color: "white" }} className="border-secondary">Description</th>
                            <th style={{ width: 100, background: "#650bfd", color: "white" }} className="border-secondary">Rate</th>
                            <th style={{ width: 70, background: "#650bfd", color: "white" }} className="border-secondary">Quantity</th>
                            <th style={{ width: 60, background: "#650bfd", color: "white" }} className="border-secondary">GST %</th>
                            <th style={{ width: 100, background: "#650bfd", color: "white" }} className="border-secondary">IGST</th>
                            {/* <th style={{ width: 100, background: "#650bfd", color: "white" }} className="border-secondary">CGST</th>
                                <th style={{ width: 100, background: "#650bfd", color: "white" }} className="border-secondary">SGST</th> */}
                          </tr>
                          {rows.map((row, index) => (
                            <tr key={index} className="item-row ">
                              <td className="item-name border-secondary">
                                <div className="delete-wpr ">
                                  <textarea style={{ border: "none" }} value={row.item} onChange={(e) => handleInputChange(e, index, 'item')} />
                                  <a className="delete" href="javascript:;" onClick={() => handleDeleteRow(index)} title="Remove row">X</a>
                                </div>
                              </td>
                              <td className="description border-secondary">
                                <textarea style={{ border: "none" }} value={row.description} onChange={(e) => handleInputChange(e, index, 'description')} />
                              </td>
                              <td className="border-secondary">
                                <textarea
                                  style={{ border: "none" }}
                                  className="rate"
                                  value={row.rate}
                                  onChange={(e) => handleInputChange(e, index, 'rate')}
                                  onBlur={(e) => handleBlur(e, index, 'rate')}
                                />
                              </td>
                              <td className="border-secondary">
                                <textarea style={{ border: "none" }} className="quantity" value={row.quantity} onChange={(e) => handleInputChange(e, index, 'quantity')} />
                              </td >
                              <td className="border-secondary">
                                <textarea style={{ border: "none" }} className="gstPercentage" value={row.gstPercentage} onChange={(e) => handleInputChange(e, index, 'gstPercentage')} />
                              </td>
                              <td className="border-secondary">
                                <span className="igst">₹ {formatNumber(row.igst)}</span>
                              </td>
                              {/* <td className="border-secondary">
                                    <span className="cgst">₹ {row.cgst.toFixed(2)}</span>
                                  </td>
                                  <td className="border-secondary">
                                    <span className="sgst">₹ {row.sgst.toFixed(2)}</span>
                                  </td> */}
                            </tr>
                          ))}
                          <tr id="hiderow" >
                            <td colSpan={5} className="border-secondary">
                              <a id="addrow" href="javascript:;" onClick={handleAddRow} title="Add a row">Add a row</a>
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={3} className="blank border-secondary"></td>
                            <td colSpan={2} className="total-line border-secondary">Amount</td>
                            <td className="total-value border-secondary">
                              <div id="subtotal">₹ {formatNumber(total.subtotal)}</div>
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={3} className="blank border-secondary"> </td>
                            <td colSpan={2} className="total-line border-secondary">Total GST</td>
                            <td className="total-value border-secondary"><div id="total-gst">₹ {formatNumber(total.gstTotal)}</div></td>
                          </tr>
                          <tr>
                            <td colSpan={3} className="blank border-secondary"> </td>
                            <td colSpan={2} className="total-line border-secondary fs-6 fw-bold" style={{ background: "#650bfd", color: "white" }}>Total (INR)</td>
                            <td className="total-value border-secondary fs-6 fw-bold" style={{ background: "#650bfd", color: "white" }}><div id="grand-total" style={{ background: "#650bfd", color: "white", width: "max-content" }}>₹ {formatNumber(total.grandTotal)}</div></td>
                          </tr>
                        </tbody>
                      }
                    </table>
                    :
                    <div style={{ height: "90px" }}></div>
                  }
                  <div style={{ width: "45%", marginTop: "-60px" }}>
                    <div className="p-2 rounded" style={{ backgroundColor: "lavender", border: "none" }}>
                      <h2 className="h5 text-primary" style={{ backgroundColor: "lavender", border: "none" }}>Bank Details</h2>
                      <table className="items " style={{ backgroundColor: "lavender", border: "none", marginTop: "-1px" }}>
                        <tbody>
                          <tr>
                            <td colSpan={2} className="fw-bold p-0" style={{ backgroundColor: "lavender", border: "none" }}>Account Name</td>
                            <td className="p-0" style={{ backgroundColor: "lavender", border: "none" }}>
                              <textarea
                                style={{ backgroundColor: "lavender", border: "none" }}
                                rows="1"
                                defaultValue={"First India Credit"}
                                onChange={(e) => handleBankDetailsChange(e, 'accountName')}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={2} className="fw-bold p-0" style={{ backgroundColor: "lavender", border: "none" }}>Account Number</td>
                            <td className="p-0" style={{ backgroundColor: "lavender", border: "none" }}>
                              <textarea
                                style={{ backgroundColor: "lavender", border: "none" }}
                                rows="1"
                                defaultValue={"002105501589"}
                                onChange={(e) => handleBankDetailsChange(e, 'accountNumber')}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={2} className="fw-bold p-0" style={{ backgroundColor: "lavender", border: "none" }}>IFSC</td>
                            <td className="p-0" style={{ backgroundColor: "lavender", border: "none" }}>
                              <textarea
                                style={{ backgroundColor: "lavender", border: "none" }}
                                rows="1"
                                defaultValue={"ICIC0000021"}
                                onChange={(e) => handleBankDetailsChange(e, 'ifsc')}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={2} className="fw-bold p-0" style={{ backgroundColor: "lavender", border: "none" }}>Account Type</td>
                            <td className="p-0" style={{ backgroundColor: "lavender", border: "none" }}>
                              <textarea
                                style={{ backgroundColor: "lavender", border: "none" }}
                                rows="1"
                                defaultValue={"Current"}
                                onChange={(e) => handleBankDetailsChange(e, 'accountType')}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={2} className="fw-bold p-0" style={{ backgroundColor: "lavender", border: "none" }}>Bank</td>
                            <td className="p-0" style={{ backgroundColor: "lavender", border: "none" }}>
                              <textarea
                                style={{ backgroundColor: "lavender", border: "none" }}
                                rows="1"
                                defaultValue={"KOTAK MAHINDRA BANK"}
                                onChange={(e) => handleBankDetailsChange(e, 'bankName')}
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div style={{ clear: "both" }} />
                  <div className="footer-note mt-4">
                    <h6 className="text-primary mb-1 bg-light">Terms and Conditions</h6>
                    <textarea
                      className=""
                      rows="4"
                      defaultValue={"1. Please quote invoice number when remitting funds"}
                      onChange={handleTermsConditionsChange}
                    />
                  </div>
                </div>
                <div className="d-flex justify-content-center" style={{ borderTop: "1px solid #A9A9A9", color: "grey", marginTop: "8rem" }}>This invoice is system generated. No signature is required.</div>
              </div>
            </div>
            {/* </form> */}
          </div>
        </div>
        <FloatingMenu userType="admin" isMobile={isMobile} />
      </div>
    </>
  );
};

export default CreateInvoice;





// To handle GST calculations based on state-wise rules (IGST, CGST, and SGST)