import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import axios from 'axios';
import FloatingMenu from '../Chats/FloatingMenu'

const UpdateInvoice = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();
  const navigate = useNavigate();

  // Add check for invoice data
  if (!location.state || !location.state.invoice) {
    return <div>No invoice data available. Please try again.</div>;
  }

  const { invoice } = location.state;

  const initialInvoice = {
    ...invoice,
    clientDetail: invoice.clientDetail || {
      businessName: '',
      clientAddress: '',
      clientGst: '',
      clientPhone: '',
      clientEmail: ''
    }
  };

  const [updatedInvoice, setUpdatedInvoice] = useState(initialInvoice);
  const [error, setError] = useState('');

  const isHaryanaState = updatedInvoice.state === 'HR';


  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number);
  };

  const calculateGST = (rate, quantity, gstPercentage) => {
    const amount = rate * quantity;
    const gstAmount = (amount * gstPercentage) / 100;
    const cgst = gstAmount / 2;
    const sgst = gstAmount / 2;
    const igst = gstAmount;
    return {
      amount: formatNumber(amount),
      cgst: formatNumber(cgst),
      sgst: formatNumber(sgst),
      igst: formatNumber(igst)
    };
  };

  const calculateTotal = (table) => {
    let totalAmount = 0;
    let totalGST = 0;

    table.forEach(item => {
      const { rate, quantity, gstPercentage } = item;
      const { amount, cgst, sgst, igst } = calculateGST(rate, quantity, gstPercentage);
      totalAmount += parseFloat(amount.replace(/,/g, ','));
      totalGST += parseFloat(cgst.replace(/,/g, ',')) + parseFloat(sgst.replace(/,/g, ''));  // Or totalGST += parseFloat(igst.replace(/,/g, '')) if IGST is used.
    });

    return {
      totalAmount: formatNumber(totalAmount),
      totalGST: formatNumber(totalGST)
    };
  };



  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const nestedKeys = name.split('.');
      setUpdatedInvoice(prevState => ({
        ...prevState,
        [nestedKeys[0]]: {
          ...prevState[nestedKeys[0]],
          [nestedKeys[1]]: value
        }
      }));
    } else {
      setUpdatedInvoice(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handleDateChange = (date, field) => {
    setUpdatedInvoice(prevState => ({
      ...prevState,
      [field]: date
    }));
  };

  const handleTableChange = (e, index, field) => {
    const { value } = e.target;
    const numericValue = parseFloat(value) || 0;  // Convert to number or default to 0
    const updatedTable = updatedInvoice.table.map((item, idx) =>
      idx === index ? { ...item, [field]: numericValue } : item
    );

    const recalculatedTable = updatedTable.map((item, idx) => {
      if (idx === index) {
        const { rate, quantity, gstPercentage } = item;
        const { amount, cgst, sgst, igst } = calculateGST(rate, quantity, gstPercentage);
        return { ...item, amount, cgst, sgst, igst };
      }
      return item;
    });

    const { totalAmount, totalGST } = calculateTotal(recalculatedTable);

    setUpdatedInvoice(prevState => ({
      ...prevState,
      table: recalculatedTable,
      amount: totalAmount,
      totalGst: totalGST,
      total: formatNumber(parseFloat(totalAmount.replace(/,/g, '')) + parseFloat(totalGST.replace(/,/g, '')))
    }));
  };




  const handleBankDetailsChange = (e, field) => {
    const { value } = e.target;
    setUpdatedInvoice(prevState => ({
      ...prevState,
      bankDetails: {
        ...prevState.bankDetails,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Updated Invoice Data:", updatedInvoice);
    try {
      const response = await axios.put(`${import.meta.env.VITE_BASE_URL}api/invoices/${updatedInvoice._id}`, updatedInvoice);
      console.log("Response Data:", response.data);
      if (response.status === 200) {
        navigate(`/all-invoice`);
      } else {
        setError('Failed to update invoice');
      }
      // Reload the page after 5 seconds
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    } catch (err) {
      console.error("Update Invoice Error:", err);
      setError('Failed to update invoice');
    }
  };


  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="mytask-layout">
      <Sidebar />
      <div className="main px-lg-4 px-md-4">
        <Header />
        <div className="print_invoice" style={{ marginTop: "-4px" }}>
          <div className="" style={{ borderBottom: "1px solid #A9A9A9" }}>
            <h5 className="card-title mb-0 fw-bold">INVOICE</h5>
          </div>
          <div className="d-flex justify-content-between mb-2" style={{ marginTop: "5px" }}>
            <div className="">
              <div className="d-flex">
                <span className="fw-bold text-muted">Invoice No # : </span>
                <input
                  className=""
                  name="invoiceNumber"
                  value={updatedInvoice.invoiceNumber}
                  onChange={handleChange}
                  style={{ marginLeft: "0.8rem", border: "none" }}
                />
              </div>
              <div className="d-flex">
                <span className="fw-bold text-muted"> Invoice Date : </span>
                <DatePicker
                  className="date1"
                  selected={new Date(updatedInvoice.invoiceDate)}
                  onChange={(date) => handleDateChange(date, 'invoiceDate')}
                />
                <div style={{ marginLeft: "12px" }}>{format(new Date(updatedInvoice.invoiceDate), 'MMMM dd, yyyy')}</div>
              </div>
              <div className="d-flex">
                <span className="fw-bold text-muted">Due Date : </span>
                <DatePicker
                  className="date2"
                  selected={new Date(updatedInvoice.invoiceDueDate)}
                  onChange={(date) => handleDateChange(date, 'invoiceDueDate')}
                />
                <div style={{ marginLeft: "32px" }}>{format(new Date(updatedInvoice.invoiceDueDate), 'MMMM dd, yyyy')}</div>
              </div>
            </div>
            <img id="image" style={{ width: "13rem", height: "2.5rem" }} src="Images/icon.png" alt="logo" />
          </div>

          <div className="d-flex justify-content-between">
            <div style={{ width: "49%" }}>
              <div className="p-3 rounded" style={{ backgroundColor: "lavender" }}>
                <h2 className="h5 text-primary mb-2" style={{ backgroundColor: "lavender" }}>Billed By</h2>
                <textarea
                  className="fw-semibold"
                  name="billedBy"
                  style={{ backgroundColor: "lavender", border: "none" }}
                  rows="9"
                  value={updatedInvoice.billedBy}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ width: "49%" }}>
              <div className="p-3 rounded" style={{ backgroundColor: "lavender", height: "16.3rem" }}>
                <h2 className="h5 text-primary mb-2" style={{ backgroundColor: "lavender" }}>Billed To</h2>
                <div style={{ backgroundColor: "lavender" }}>
                  <textarea
                    style={{ backgroundColor: "lavender", border: "none", height: "25px" }}
                    className="fw-bold"
                    name="clientDetail.businessName"
                    value={updatedInvoice.clientDetail.businessName}
                    onChange={handleChange}
                  /><br />
                  <textarea
                    style={{ backgroundColor: "lavender", border: "none", height: "25px" }}
                    className="mt-3 fw-bold"
                    name="clientDetail.clientAddress"
                    value={updatedInvoice.clientDetail.clientAddress}
                    onChange={handleChange}
                  />
                  <br />
                  <textarea
                    style={{ backgroundColor: "lavender", border: "none", height: "25px" }}
                    className="mt-3 fw-bold"
                    name="clientDetail.clientGst"
                    value={updatedInvoice.clientDetail.clientGst}
                    onChange={handleChange}
                  />
                  <p />
                  <textarea
                    style={{ backgroundColor: "lavender", border: "none", height: "25px" }}
                    className="fw-bold"
                    name="clientDetail.clientPhone"
                    value={updatedInvoice.clientDetail.clientPhone}
                    onChange={handleChange}
                  />
                  <p />
                  <textarea
                    style={{ backgroundColor: "lavender", border: "none", height: "25px" }}
                    className="fw-bold"
                    name="clientDetail.clientEmail"
                    value={updatedInvoice.clientDetail.clientEmail}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-around mt-2 ">
            <div className="d-flex">
              <span className="fw-bold" style={{ textWrap: "nowrap", padding: "8px" }}>Country of Supply :</span>
              <select
                id="country-select"
                className="form-control"
                name="country"
                value={updatedInvoice.country}
                onChange={handleChange}
                style={{ backgroundColor: "white", border: "none" }}
              >
                <option value="">Select Country</option>
                <option value={updatedInvoice.country}>{updatedInvoice.country}</option>
              </select>
            </div>
            <div className="d-flex">
              <span className="fw-bold" style={{ textWrap: "nowrap", padding: "8px" }}>Place of Supply :</span>
              <select
                id="state-select"
                className="form-control"
                name="state"
                value={updatedInvoice.state}
                onChange={handleChange}
                style={{ backgroundColor: "white", border: "none" }}
              >
                <option value="">Select State</option>
                <option value={updatedInvoice.state}>{updatedInvoice.state}</option>
              </select>
            </div>
          </div>

          <div className="a4-height" style={{ marginTop: "-20px" }}>
            <table className="items border-light">
              {isHaryanaState ? (
                <>
                  <tbody>
                    <tr>
                      <th style={{ background: "#650bfd", color: "white" }} className="border-secondary">Item</th>
                      <th style={{ background: "#650bfd", color: "white" }} className="border-secondary">Description</th>
                      <th style={{ width: 100, background: "#650bfd", color: "white" }} className="border-secondary">Rate</th>
                      <th style={{ width: 70, background: "#650bfd", color: "white" }} className="border-secondary">Quantity</th>
                      <th style={{ width: 60, background: "#650bfd", color: "white" }} className="border-secondary">GST %</th>
                      <th style={{ width: 100, background: "#650bfd", color: "white" }} className="border-secondary">CGST</th>
                      <th style={{ width: 100, background: "#650bfd", color: "white" }} className="border-secondary">SGST</th>
                      {/* <th style={{ width: 100, background: "#650bfd", color: "white" }} className="border-secondary">IGST</th> */}
                    </tr>

                    {updatedInvoice.table.map((item, index) => (
                      <tr className="item-row" key={index}>
                        <td className="item-name border-secondary">
                          <textarea
                            rows="2"
                            style={{ border: "none" }}
                            name={`table[${index}].item`}
                            value={item.item}
                            onChange={(e) => handleTableChange(e, index, 'item')}
                          />
                        </td>
                        <td className="description border-secondary">
                          <textarea
                            type="text"
                            rows="2"
                            style={{ border: "none" }}
                            name={`table[${index}].description`}
                            value={item.description}
                            onChange={(e) => handleTableChange(e, index, 'description')}
                          />
                        </td>
                        <td className="border-secondary">
                          <textarea
                            style={{ border: "none" }}
                            className="cost"
                            name={`table[${index}].rate`}
                            value={item.rate}
                            onChange={(e) => handleTableChange(e, index, 'rate')}
                          />
                        </td>
                        <td className="border-secondary">
                          <textarea
                            rows="2"
                            style={{ border: "none" }}
                            className="qty"
                            name={`table[${index}].quantity`}
                            value={item.quantity}
                            onChange={(e) => handleTableChange(e, index, 'quantity')}
                          />
                        </td>
                        <td className="border-secondary">
                          <textarea
                            rows="2"
                            style={{ border: "none" }}
                            className="gstPercentage"
                            name={`table[${index}].gstPercentage`}
                            value={item.gstPercentage}
                            onChange={(e) => handleTableChange(e, index, 'gstPercentage')}
                          />
                        </td>
                        <td className="border-secondary">
                          <span className="cgst">₹{item.cgst}</span>
                        </td>
                        <td className="border-secondary">
                          <span className="sgst">₹{item.sgst}</span>
                        </td>
                        {/* <td className="border-secondary">
                          <span className="igst">₹{item.igst}</span>
                        </td> */}
                      </tr>
                    ))}

                    <tr>
                      <td colSpan={4} className="blank border-secondary"></td>
                      <td colSpan={2} className="total-line border-secondary">Amount</td>
                      <td className="total-value border-secondary">
                        <div id="subtotal">₹{updatedInvoice.amount}</div>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="blank border-secondary"></td>
                      <td colSpan={2} className="total-line border-secondary">Total GST</td>
                      <td className="total-value border-secondary"><div id="total-gst">₹{updatedInvoice.totalGst}</div></td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="blank border-secondary"></td>
                      <td colSpan={2} className="total-line border-secondary fs-6 fw-bold" style={{ background: "#650bfd", color: "white" }}>Total (INR)</td>
                      <td className="total-value border-secondary fs-6 fw-bold" style={{ background: "#650bfd", color: "white" }}><div id="grand-total" style={{ background: "#650bfd", color: "white", width: "max-content" }}>₹{updatedInvoice.total}</div></td>
                    </tr>
                  </tbody>
                </>
              ) : (
                <tbody>
                  <tr>
                    <th style={{ background: "#650bfd", color: "white" }} className="border-secondary">Item</th>
                    <th style={{ background: "#650bfd", color: "white" }} className="border-secondary">Description</th>
                    <th style={{ width: 100, background: "#650bfd", color: "white" }} className="border-secondary">Rate</th>
                    <th style={{ width: 70, background: "#650bfd", color: "white" }} className="border-secondary">Quantity</th>
                    <th style={{ width: 60, background: "#650bfd", color: "white" }} className="border-secondary">GST %</th>
                    {/* <th style={{ width: 100, background: "#650bfd", color: "white" }} className="border-secondary">CGST</th>
                    <th style={{ width: 100, background: "#650bfd", color: "white" }} className="border-secondary">SGST</th> */}
                    <th style={{ width: 100, background: "#650bfd", color: "white" }} className="border-secondary">IGST</th>
                  </tr>

                  {updatedInvoice.table.map((item, index) => (
                    <tr className="item-row" key={index}>
                      <td className="item-name border-secondary">
                        <textarea
                          rows="2"
                          style={{ border: "none" }}
                          name={`table[${index}].item`}
                          value={item.item}
                          onChange={(e) => handleTableChange(e, index, 'item')}
                        />
                      </td>
                      <td className="description border-secondary">
                        <textarea
                          rows="2"
                          style={{ border: "none" }}
                          name={`table[${index}].description`}
                          value={item.description}
                          onChange={(e) => handleTableChange(e, index, 'description')}
                        />
                      </td>
                      <td className="border-secondary">
                        <textarea
                          style={{ border: "none" }}
                          className="cost"
                          name={`table[${index}].rate`}
                          value={item.rate}
                          onChange={(e) => handleTableChange(e, index, 'rate')}
                        />
                      </td>
                      <td className="border-secondary">
                        <textarea
                          rows="2"
                          style={{ border: "none" }}
                          className="qty"
                          name={`table[${index}].quantity`}
                          value={item.quantity}
                          onChange={(e) => handleTableChange(e, index, 'quantity')}
                        />
                      </td>
                      <td className="border-secondary">
                        <textarea
                          rows="2"
                          style={{ border: "none" }}
                          className="gstPercentage"
                          name={`table[${index}].gstPercentage`}
                          value={item.gstPercentage}
                          onChange={(e) => handleTableChange(e, index, 'gstPercentage')}
                        />
                      </td>
                      {/* <td className="border-secondary">
                        <span className="cgst">₹{item.cgst}</span>
                      </td>
                      <td className="border-secondary">
                        <span className="sgst">₹{item.sgst}</span>
                      </td> */}
                      <td className="border-secondary">
                        <span className="igst">₹{item.igst}</span>
                      </td>
                    </tr>
                  ))}

                  <tr>
                    <td colSpan={3} className="blank border-secondary"></td>
                    <td colSpan={2} className="total-line border-secondary">Amount</td>
                    <td className="total-value border-secondary">
                      <div id="subtotal">₹{updatedInvoice.amount}</div>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="blank border-secondary"></td>
                    <td colSpan={2} className="total-line border-secondary">Total GST</td>
                    <td className="total-value border-secondary"><div id="total-gst">₹{updatedInvoice.totalGst}</div></td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="blank border-secondary"></td>
                    <td colSpan={2} className="total-line border-secondary fs-6 fw-bold" style={{ background: "#650bfd", color: "white" }}>Total (INR)</td>
                    <td className="total-value border-secondary fs-6 fw-bold"
                      style={{ background: "#650bfd", color: "white" }}>
                      <div id="grand-total" style={{ background: "#650bfd", color: "white", width: "max-content" }}>₹{updatedInvoice.total}</div>
                    </td>
                  </tr>
                </tbody>
              )}


            </table>
            <div style={{ width: "45%", marginTop: "-60px" }}>
              <div className="p-2 rounded" style={{ backgroundColor: "lavender", border: "none" }}>
                <h2 className="h5 text-primary" style={{ backgroundColor: "lavender", border: "none" }}>Bank Details</h2>
                <table className="items" style={{ backgroundColor: "lavender", border: "none", marginTop: "-1px" }}>
                  <tbody>
                    <tr>
                      <td colSpan={2} className="fw-bold  p-0" style={{ backgroundColor: "lavender", border: "none" }}>Account Name</td>
                      <td className="p-0" style={{ backgroundColor: "lavender", border: "none" }}><textarea style={{ backgroundColor: "lavender", border: "none" }} rows="1" name="bankDetails.accountName" value={updatedInvoice.bankDetails.accountName} onChange={(e) => handleBankDetailsChange(e, 'accountName')} /></td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="fw-bold p-0" style={{ backgroundColor: "lavender", border: "none" }}>Account Number </td>
                      <td className="p-0" style={{ backgroundColor: "lavender", border: "none" }}><textarea style={{ backgroundColor: "lavender", border: "none" }} rows="1" name="bankDetails.accountNumber" value={updatedInvoice.bankDetails.accountNumber} onChange={(e) => handleBankDetailsChange(e, 'accountNumber')} /></td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="fw-bold p-0" style={{ backgroundColor: "lavender", border: "none" }}>IFSC</td>
                      <td className="p-0" style={{ backgroundColor: "lavender", border: "none" }}><textarea style={{ backgroundColor: "lavender", border: "none" }} rows="1" name="bankDetails.ifsc" value={updatedInvoice.bankDetails.ifsc} onChange={(e) => handleBankDetailsChange(e, 'ifsc')} /></td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="fw-bold p-0" style={{ backgroundColor: "lavender", border: "none" }}>Account Type</td>
                      <td className="p-0" style={{ backgroundColor: "lavender", border: "none" }}><textarea style={{ backgroundColor: "lavender", border: "none" }} rows="1" name="bankDetails.accountType" value={updatedInvoice.bankDetails.accountType} onChange={(e) => handleBankDetailsChange(e, 'accountType')} /></td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="fw-bold p-0" style={{ backgroundColor: "lavender", border: "none" }}>Bank</td>
                      <td className="p-0" style={{ backgroundColor: "lavender", border: "none" }}><textarea style={{ backgroundColor: "lavender", border: "none" }} rows="1" name="bankDetails.bankName" value={updatedInvoice.bankDetails.bankName} onChange={(e) => handleBankDetailsChange(e, 'bankName')} defaultValue={"ICICI bank"} /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ clear: "both" }} />
            <div className="footer-note mt-4 ">
              <h6 className="text-primary mb-1 bg-light">Terms and Conditions</h6>
              <textarea
                className=""
                rows="4"
                name="termsConditions"
                value={updatedInvoice.termsConditions}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="text-center d-flex justify-content-center gap-3 mb-3">
          <button type="button" className="btn btn-lg btn-primary" onClick={handlePrint}>
            <i className="fa fa-print me-2" />
            Print Invoice
          </button>
          <button type="button" className="btn btn-lg btn-success" onClick={handleSubmit}>
            <i className="fa fa-save me-2" />
            Save Invoice
          </button>
        </div>
      </div>
      <FloatingMenu userType="admin" isMobile={isMobile} />
    </div>
  );
};

export default UpdateInvoice;

