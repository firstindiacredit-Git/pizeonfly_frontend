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
    invoiceDate: new Date(),
    invoiceDueDate: new Date(),
    logo: null,
    billedBy: 'First India Credit \n\n88,Sant Nagar,Near India Post Office, \nEast of Kailash, New Delhi, Delhi, \nIndia - 110065  \n\nGSTIN: 06AATFG8894M1Z8 \nPAN: AATFG8894M \nEmail:fzal9000i@gmail.com',
    clientDetail: '',
    country: 'IN',
    state: 'DL',
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
  const [logo, setLogo] = useState('');

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      logo: file // Store the file in formData
    }));
    setLogo(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();

      // Create a clean copy of formData without the File object
      const formDataWithoutLogo = { ...formData };
      
      if (formData.logo instanceof File) {
        // If it's a new file upload
        formDataToSend.append('logo', formData.logo);
        delete formDataWithoutLogo.logo; // Remove logo from JSON data
      }
      // If it's an existing logo path, keep it in the JSON data

      // Append the clean data as a single JSON string
      formDataToSend.append('data', JSON.stringify(formDataWithoutLogo));

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}api/invoices`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Invoice created:', response.data);
      window.print();

      // Reset form with current dates
      const currentDate = new Date();
      setInvoiceDate(currentDate);
      setInvoiceDueDate(currentDate);

      setFormData({
        invoiceNumber: '',
        invoiceDate: currentDate,
        invoiceDueDate: currentDate,
        logo: null,
        billedBy: 'First India Credit \n\n88,Sant Nagar,Near India Post Office, \nEast of Kailash, New Delhi, Delhi \nIndia - 110065 \n\nGSTIN: 06AATFG8894M1Z8 \nPAN: AATFG8894M \nEmail:afzal9000i@gmail.com',
        clientDetail: '',
        country: 'IN',
        state: 'DL',
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
          backgroundColor: "#0d6efd",
          color: "white",
        },
      });
      // Reload the page after 5 seconds
      setTimeout(() => {
        window.location.reload();
      }, 5000);

    } catch (error) {
      console.error('Submission error:', error);
      if (error.response?.data) {
        console.error('Server error:', error.response.data);
      }
      if (error.request) {
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
    const selectedDate = date || new Date(); // Use current date if no date selected
    setInvoiceDate(selectedDate);
    setFormData(prevFormData => ({
      ...prevFormData,
      invoiceDate: selectedDate
    }));
  };

  const handleInvoiceDueDateChange = (date) => {
    const selectedDate = date || new Date(); // Use current date if no date selected
    setInvoiceDueDate(selectedDate);
    setFormData(prevFormData => ({
      ...prevFormData,
      invoiceDueDate: selectedDate
    }));
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

  //Country & State
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('IN');
  const [selectedState, setSelectedState] = useState('DL');
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
          // Set default state in formData
          setFormData(prev => ({
            ...prev,
            country: selectedCountry,
            state: selectedState
          }));
        })
        .catch(error => console.error('Error fetching states:', error));
    } else {
      setStates([]);
    }
  }, [selectedCountry]);
  const handleCountryChange = (event) => {
    const country = event.target.value || 'IN';  // Default to IN if empty
    setSelectedCountry(country);
    setSelectedState('DL');  // Reset to Delhi when country changes
    setFormData((prevFormData) => ({
      ...prevFormData,
      country: country,
      state: 'DL'
    }));
  };
  const handleStateChange = (event) => {
    const state = event.target.value || 'DL';  // Default to DL if empty
    setSelectedState(state);
    setFormData((prevFormData) => ({
      ...prevFormData,
      state: state
    }));
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

  const [clients, setClients] = useState([]);

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

  // Add new state for stored logos
  const [storedLogos, setStoredLogos] = useState([]);

  // Add useEffect to fetch logos when component mounts
  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/invoice-logos`);
        setStoredLogos(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching logos:', error);
        setStoredLogos([]);
      }
    };
    fetchLogos();
  }, []);

  // Add function to handle logo selection from dropdown
  const handleStoredLogoSelect = (logoPath) => {
    if (logoPath) {
      setLogo(`${import.meta.env.VITE_BASE_URL}${logoPath}`);
      setFormData(prev => ({
        ...prev,
        logo: logoPath // Store just the path for existing logos
      }));
    }
  };

  // Add this function to get a friendly name for the logo
  const getLogoDisplayName = (logoPath) => {
    const defaultLogoNames = {
      'uploads/a2zlogo.png': 'A2Z Logo',
      'uploads/ficlogo.png': 'FIC Logo',
      'uploads/pizeonflylogo.png': 'Pizeonfly Logo'
    };

    // If it's a default logo, return its friendly name
    if (defaultLogoNames[logoPath]) {
      return defaultLogoNames[logoPath];
    }

    // For other logos, use the existing logic
    return decodeURIComponent(logoPath.split('-').pop().split('.')[0]);
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
                  <h5 className="card-title mb-0 fw-bold text-center mb-2">INVOICE</h5>
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
                        required
                      />
                    </div>
                    <div className="d-flex">
                      <span className="fw-bold text-muted"> Invoice Date : </span>
                      <DatePicker
                        className="date1"
                        selected={invoiceDate}
                        onChange={handleInvoiceDateChange}
                        dateFormat="MMMM dd, yyyy"
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        placeholderText="Select a date"
                        value={invoiceDate ? format(invoiceDate, 'MMMM dd, yyyy') : format(new Date(), 'MMMM dd, yyyy')}
                      />
                      <div style={{ marginLeft: "10px" }}>
                        {invoiceDate ? format(invoiceDate, 'MMMM dd, yyyy') : ''}
                      </div>
                    </div>
                    <div className="d-flex">
                      <span className="fw-bold text-muted">Due Date : </span>
                      <DatePicker
                        className="date2"
                        selected={invoiceDueDate}
                        onChange={handleInvoiceDueDateChange}
                        dateFormat="MMMM dd, yyyy"
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        placeholderText="Select a date"
                        value={invoiceDueDate ? format(invoiceDueDate, 'MMMM dd, yyyy') : format(new Date(), 'MMMM dd, yyyy')}
                      />
                      <div style={{ marginLeft: "32px" }}>
                        {invoiceDueDate ? format(invoiceDueDate, 'MMMM dd, yyyy') : ''}
                      </div>
                    </div>
                  </div>
                  {/* logo */}
                  <div className="d-flex flex-column align-items-end">
                    <div className="d-flex mb-2 no-print">
                      {/* Add logo dropdown */}
                      <select
                        className="form-select me-2"
                        onChange={(e) => handleStoredLogoSelect(e.target.value)}
                        style={{ maxWidth: '200px' }}
                      >
                        <option value="">Select Existing Logo</option>
                        {Array.isArray(storedLogos) && storedLogos.map((logoPath, index) => (
                          <option key={index} value={logoPath}>
                            {getLogoDisplayName(logoPath)}
                          </option>
                        ))}
                      </select>

                      {/* Existing file input */}
                      <input
                        type="file"
                        name="logo"
                        onChange={handleLogoChange}
                        accept="image/*"
                        className="form-control"
                        style={{ maxWidth: '250px' }}
                      />
                    </div>
                    {logo && (
                      <img
                        style={{ width: "10rem", objectFit: "contain" }}
                        src={logo.replace(/\\/g, '/').replace('uploads/', '')}
                        alt="logo"
                      />
                    )}
                  </div>
                </div>


                <div className="d-flex  justify-content-between">
                  <div style={{ width: "49%" }}>
                    <div className="p-3 rounded" style={{ backgroundColor: "lavender", height: "16.3rem" }}>
                      <h2 className="h5 text-primary mb-2" style={{ backgroundColor: "lavender" }}>Billed By</h2>
                      <textarea className="fw-semibold" style={{ backgroundColor: "lavender", border: "none" }} rows="9" onChange={handleBilledByChange} defaultValue={"First India Credit \n\n88,Sant Nagar,Near India Post Office, \nEast of Kailash, New Delhi, Delhi \nIndia - 110065 \n\nGSTIN: 06AATFG8894M1Z8 \nPAN: AATFG8894M \nEmail:afzal9000i@gmail.com"} />
                    </div>
                  </div>

                  <div style={{ width: "49%" }}>
                    {/* Client Selection Dropdown */}
                    <select
                      className="form-select mb-2 no-print"
                      onChange={(e) => {
                        const selectedClient = clients.find(client => client._id === e.target.value);
                        if (selectedClient) {
                          setFormData(prev => ({
                            ...prev,
                            clientId: selectedClient._id,
                            clientDetail: `${selectedClient.businessName}\n\n${selectedClient.clientAddress}\n\nGSTIN: ${selectedClient.clientGst}\nPhone: ${selectedClient.clientPhone}\nEmail: ${selectedClient.clientEmail}`
                          }));
                        }
                      }}
                    >
                      <option value="">Select Client</option>
                      {clients.map(client => (
                        <option key={client._id} value={client._id}>
                          {client.clientName}
                        </option>
                      ))}
                    </select>
                    <div className="p-3 rounded" style={{ backgroundColor: "lavender", height: "16.3rem" }}>
                      <h2 className="h5 text-primary mb-2" style={{ backgroundColor: "lavender" }}>Billed To</h2>



                      {/* Display Selected Client Details */}
                      <textarea
                        className="fw-semibold"
                        style={{
                          backgroundColor: "lavender",
                          border: "none",
                          width: "100%",
                          height: "75%"
                        }}
                        rows="7"
                        value={formData.clientDetail}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          clientDetail: e.target.value
                        }))}

                      />
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
                      value={selectedCountry || 'IN'}
                      onChange={handleCountryChange}
                    >
                      <option value="IN">India</option>
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
                      value={selectedState || 'DL'}
                      onChange={handleStateChange}
                    >
                      <option value="DL">Delhi</option>
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