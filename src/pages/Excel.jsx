import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import CustomColorPicker, { isLightColor } from "./colorpicker/CustomColorPicker";

const Excel = () => {
  const [tables, setTables] = useState([]);
  const [excelSheetId, setExcelSheetId] = useState(null);
  const [excelSheetColor, setExcelSheetColor] = useState('#d4edda');
  const [showExcelPicker, setShowExcelPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteAction, setDeleteAction] = useState({ type: '', index: null });

  useEffect(() => {
    fetchExcelSheet();
    fetchColors();
  }, []);

  const fetchExcelSheet = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('user'));
      const email = userData.email;

      const response = await fetch(`${import.meta.env.VITE_BASE_URL}api/adminExcelSheet/${email}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data.tables) {
        setTables(data.tables);
      }
      if (data._id) {
        setExcelSheetId(data._id);
      }
    } catch (error) {
      console.error("Error fetching excel sheet:", error);
      setError("Failed to fetch excel sheet");
      toast.error("Failed to fetch excel sheet");
    } finally {
      setLoading(false);
    }
  };

  const fetchColors = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const email = userData.email;

      const response = await fetch(`${import.meta.env.VITE_BASE_URL}api/adminColors/${email}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setExcelSheetColor(data.excelSheetColor || '#d4edda');
    } catch (error) {
      console.error("Error fetching colors:", error);
      toast.error("Failed to fetch colors");
    }
  };

  const handleCellChange = async (tableIndex, rowIndex, colIndex, value) => {
    try {
      const newTables = [...tables];
      newTables[tableIndex].data[rowIndex][colIndex] = value;
      setTables(newTables);

      const userData = JSON.parse(localStorage.getItem('user'));
      const email = userData.email;

      const url = excelSheetId
        ? `${import.meta.env.VITE_BASE_URL}api/adminExcelSheet/${excelSheetId}`
        : `${import.meta.env.VITE_BASE_URL}api/adminExcelSheet`;

      const method = excelSheetId ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tables: newTables, email }),
      });
    } catch (error) {
      console.error("Error saving cell:", error);
      toast.error("Failed to save changes");
    }
  };

  const addTable = () => {
    const newTable = {
      id: Date.now(),
      rows: 5,
      cols: 5,
      data: Array(5).fill().map(() => Array(5).fill(''))
    };
    setTables([...tables, newTable]);
  };

  const handleTableNameChange = (tableIndex, newName) => {
    const updatedTables = [...tables];
    updatedTables[tableIndex].name = newName;
    setTables(updatedTables);
  };

  const addRow = async (tableIndex) => {
    try {
      const newTables = [...tables];
      const cols = newTables[tableIndex].cols;
      newTables[tableIndex].rows++;
      newTables[tableIndex].data.push(Array(cols).fill(''));
      setTables(newTables);

      const userData = JSON.parse(localStorage.getItem('user'));
      const email = userData.email;

      if (excelSheetId) {
        await fetch(`${import.meta.env.VITE_BASE_URL}api/adminExcelSheet/${excelSheetId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tables: newTables, email }),
        });
      }
    } catch (error) {
      console.error("Error adding row:", error);
      toast.error("Failed to add row");
    }
  };

  const addColumn = async (tableIndex) => {
    try {
      const newTables = [...tables];
      newTables[tableIndex].cols++;
      newTables[tableIndex].data = newTables[tableIndex].data.map(row => [...row, '']);
      setTables(newTables);

      const userData = JSON.parse(localStorage.getItem('user'));
      const email = userData.email;

      if (excelSheetId) {
        await fetch(`${import.meta.env.VITE_BASE_URL}api/adminExcelSheet/${excelSheetId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tables: newTables, email }),
        });
      }
    } catch (error) {
      console.error("Error adding column:", error);
      toast.error("Failed to add column");
    }
  };

  const deleteColumn = (tableIndex, colIndex) => {
    const updatedTables = [...tables];
    updatedTables[tableIndex].cols--;
    updatedTables[tableIndex].data = updatedTables[tableIndex].data.map(row => 
      row.filter((_, index) => index !== colIndex)
    );
    setTables(updatedTables);
  };

  const deleteRow = (tableIndex, rowIndex) => {
    const updatedTables = [...tables];
    updatedTables[tableIndex].rows--;
    updatedTables[tableIndex].data = updatedTables[tableIndex].data.filter((_, index) => 
      index !== rowIndex
    );
    setTables(updatedTables);
  };

  const clearTableData = (tableIndex) => {
    setDeleteAction({ type: 'table', index: tableIndex });
    $('#deleteproject').modal('show');
  };

  const deleteTable = (tableIndex) => {
    setDeleteAction({ type: 'deleteTable', index: tableIndex });
    $('#deleteproject').modal('show');
  };

  const downloadExcelSheet = (tableIndex) => {
    const table = tables[tableIndex];
    let csv = '';

    // Add headers (A, B, C, etc.)
    for (let i = 0; i < table.cols; i++) {
      csv += getColumnLabel(i) + ',';
    }
    csv = csv.slice(0, -1) + '\n';

    // Add data
    table.data.forEach(row => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `excel_sheet_${tableIndex + 1}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const updateColors = async (color) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const email = userData.email;

      setExcelSheetColor(color);

      await fetch(`${import.meta.env.VITE_BASE_URL}api/adminColors/${email}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          excelSheetColor: color
        }),
      });
    } catch (error) {
      console.error('Error updating colors:', error);
      toast.error('Failed to update colors');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const email = userData.email;

      switch (deleteAction.type) {
        case 'table':
          const newTables = [...tables];
          newTables[deleteAction.index].data = Array(newTables[deleteAction.index].rows)
            .fill()
            .map(() => Array(newTables[deleteAction.index].cols).fill(''));
          setTables(newTables);
          break;

        case 'deleteTable':
          const updatedTables = tables.filter((_, index) => index !== deleteAction.index);
          setTables(updatedTables);
          if (excelSheetId) {
            await fetch(`${import.meta.env.VITE_BASE_URL}api/adminExcelSheet/${excelSheetId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ tables: updatedTables, email }),
            });
          }
          break;
      }

      $('#deleteproject').modal('hide');
    } catch (error) {
      console.error("Error handling delete:", error);
      toast.error("Failed to delete item");
    }
  };

  const getColumnLabel = (colIndex) => {
    return String.fromCharCode(65 + colIndex);
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleCellKeyDown = (e, tableIndex, rowIndex, colIndex) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (rowIndex < tables[tableIndex].rows - 1) {
        const nextCell = document.querySelector(`[data-cell="${tableIndex}-${rowIndex + 1}-${colIndex}"]`);
        nextCell?.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (rowIndex > 0) {
        const prevCell = document.querySelector(`[data-cell="${tableIndex}-${rowIndex - 1}-${colIndex}"]`);
        prevCell?.focus();
      }
    } else if (e.key === 'ArrowRight') {
      if (colIndex < tables[tableIndex].cols - 1) {
        const nextCell = document.querySelector(`[data-cell="${tableIndex}-${rowIndex}-${colIndex + 1}"]`);
        nextCell?.focus();
      }
    } else if (e.key === 'ArrowLeft') {
      if (colIndex > 0) {
        const prevCell = document.querySelector(`[data-cell="${tableIndex}-${rowIndex}-${colIndex - 1}"]`);
        prevCell?.focus();
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <>
      <div className="card shadow-lg mb-5" style={{ backgroundColor: excelSheetColor }}>
        <div className="card-body">
          {tables.length === 0 ? (
            <div className="text-center">
              <p className="text-muted mb-3">No excel sheets available</p>
              <button className="btn btn-primary" onClick={addTable}>
                <i className="icofont-plus me-1" />
                Add Excel Sheet
              </button>
            </div>
          ) : (
            <>
              {tables.map((table, tableIndex) => (
                <div key={table.id} className="">
                  <div className="d-flex justify-content-center align-items-center mb-3">
                    <input
                      type="text"
                      value={table.name || `Table ${tableIndex + 1}`}
                      onChange={(e) => handleTableNameChange(tableIndex, e.target.value)}
                      className="form-control text-center"
                      style={{
                        border: 'none',
                        backgroundColor: 'transparent',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        width: 'auto'
                      }}
                    />
                  </div>
                  <div className="table-responsive mb-3">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th style={{ width: '30px', backgroundColor: '#f8f9fa' }}></th>
                          {Array(table.cols).fill().map((_, colIndex) => (
                            <th key={colIndex} className="text-center" style={{
                              backgroundColor: '#f8f9fa',
                              padding: '2px',
                              fontSize: '12px',
                              width: '80px',
                              color: isLightColor(excelSheetColor) ? '#000' : '#fff'
                            }}>
                              {getColumnLabel(colIndex)}
                              <button
                                className="btn text-danger btn-sm ms-1"
                                onClick={() => deleteColumn(tableIndex, colIndex)}
                                style={{ padding: '0px 2px', fontSize: '10px' }}
                              >
                                ×
                              </button>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Array(table.rows).fill().map((_, rowIndex) => (
                          <tr key={rowIndex}>
                            <td className="text-center" style={{
                              backgroundColor: '#f8f9fa',
                              padding: '2px',
                              fontSize: '12px'
                            }}>
                              {rowIndex + 1}
                              <button
                                className="btn text-danger btn-sm ms-1"
                                onClick={() => deleteRow(tableIndex, rowIndex)}
                                style={{ padding: '0px 2px', fontSize: '10px' }}
                              >
                                ×
                              </button>
                            </td>
                            {Array(table.cols).fill().map((_, colIndex) => (
                              <td key={colIndex} style={{
                                padding: '0px',
                                width: '80px',
                                maxWidth: '80px'
                              }}>
                                <div className="d-flex align-items-center" style={{ position: 'relative' }}>
                                  <textarea
                                    data-cell={`${tableIndex}-${rowIndex}-${colIndex}`}
                                    value={table.data[rowIndex][colIndex]}
                                    onChange={(e) => handleCellChange(tableIndex, rowIndex, colIndex, e.target.value)}
                                    onKeyDown={(e) => handleCellKeyDown(e, tableIndex, rowIndex, colIndex)}
                                    className="cell-input"
                                    tabIndex={0}
                                    style={{
                                      width: '100%',
                                      padding: '1px 2px',
                                      border: 'none',
                                      background: 'transparent',
                                      resize: 'none',
                                      overflow: 'hidden',
                                      minHeight: '22px',
                                      maxHeight: '60px',
                                      fontSize: '12px',
                                      color: isValidUrl(table.data[rowIndex][colIndex]) ? '#0d6efd' : (isLightColor(excelSheetColor) ? '#000' : '#fff'),
                                      textDecoration: isValidUrl(table.data[rowIndex][colIndex]) ? 'underline' : 'none'
                                    }}
                                  />
                                  {isValidUrl(table.data[rowIndex][colIndex]) && (
                                    <a
                                      href={table.data[rowIndex][colIndex]}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      style={{
                                        position: 'absolute',
                                        right: '2px',
                                        top: '50%',
                                        color: '#0d6efd',
                                        fontSize: '12px',
                                        zIndex: '1000'
                                      }}
                                    >
                                      <i className="bi bi-box-arrow-up-right"></i>
                                    </a>
                                  )}
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mb-4 d-flex justify-content-between">
                    <div className="position-relative btn-group">
                      <button
                        className="btn btn-secondary me-1"
                        onClick={() => setShowExcelPicker(!showExcelPicker)}
                        title='Color The Sheet'
                      >
                        <i className="bi bi-palette-fill"></i>
                        <span className="ms-1">Color</span>
                      </button>
                      <button
                        className="btn btn-dark btn-sm"
                        onClick={() => downloadExcelSheet(tableIndex)}
                        title='Download The Excel Sheet'
                      >
                        <i className="bi bi-download"></i>
                        <span className="ms-1">Excel</span>
                      </button>
                      {showExcelPicker && (
                        <CustomColorPicker
                          color={excelSheetColor}
                          onChange={(color) => updateColors(color)}
                          onClose={() => setShowExcelPicker(false)}
                        />
                      )}
                    </div>

                    <div className="btn-group">
                      <button
                        className="btn btn-primary me-1"
                        onClick={addTable}
                        title='Add New Table'
                      >
                        <i className="icofont-plus me-1" />
                        <span className="">Table</span>
                      </button>
                      <button
                        className="btn btn-secondary me-1"
                        onClick={() => addRow(tableIndex)}
                        title='Add New Row In Table'
                      >
                        <i className="icofont-plus me-1" />
                        <span className="">Row</span>
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => addColumn(tableIndex)}
                        title='Add New Column In Table'
                      >
                        <i className="icofont-plus me-1" />
                        <span className="">Column</span>
                      </button>
                    </div>

                    <div className="btn-group">
                      <button
                        className="btn btn-danger text-white me-1"
                        onClick={() => clearTableData(tableIndex)}
                        title='Clear All Table Value'
                      >
                        <i className="icofont-eraser me-1" />
                        <span className="">Erase</span>
                      </button>
                      {tables.length > 1 && (
                        <button
                          className="btn btn-danger me-2"
                          onClick={() => deleteTable(tableIndex)}
                        >
                          <i className="icofont-trash me-1 text-white" />
                          <span className="text-white">Table</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <hr className="my-4" />
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Modal Delete Confirmation */}
      <div className="modal fade" id="deleteproject" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-md modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title fw-bold" id="deleteprojectLabel">
                Delete item Permanently?
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <div className="modal-body justify-content-center flex-column d-flex">
              <i className="icofont-ui-delete text-danger display-2 text-center mt-2" />
              <p className="mt-4 fs-5 text-center">
                You can only delete this item Permanently
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger color-fff"
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Excel;






// import { Spreadsheet } from 'react-spreadsheet';


// const ProjectDashboard = () => {

//   const [spreadsheetData, setSpreadsheetData] = useState([
//     [{ value: "A1" }, { value: "B1" }],
//     [{ value: "A2" }, { value: "B2" }],
//   ]);


//   return (
//     <>

//       <div className="card shadow-lg mb-5">
//         <div className="card-body">
//           <h5 className="card-title text-center mb-4">Spreadsheet</h5>
//           <Spreadsheet data={spreadsheetData} onChange={setSpreadsheetData} />
//         </div>
//       </div>

//     </>
//   );
// };




{/* Excel Sheet */}
                {/* <div className="card shadow-lg mb-5" style={{ backgroundColor: excelSheetColor }}>
                  <div className="card-body">
                    {loading.excelSheet ? (
                      <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : error.excelSheet ? (
                      <div className="alert alert-danger">{error.excelSheet}</div>
                    ) : (
                      <>
                        {tables.length === 0 ? (
                          <div className="text-center">
                            <p className="text-muted mb-3">No excel sheets available</p>
                            <button className="btn btn-primary" onClick={addTable} title='Add New Table'>
                              <i className="icofont-plus me-1" />
                              <span className="">Add Excel Sheet</span>
                            </button>
                          </div>
                        ) : (
                          <>
                            {tables.map((table, tableIndex) => (
                              <div key={table.id} className="">
                                <div className="d-flex justify-content-center align-items-center mb-3">
                                  <input
                                    type="text"
                                    value={table.name || `Table ${tableIndex + 1}`}
                                    onChange={(e) => handleTableNameChange(tableIndex, e.target.value)}
                                    className="form-control text-center"
                                    style={{
                                      border: 'none',
                                      backgroundColor: 'transparent',
                                      fontSize: '1.1rem',
                                      fontWeight: 'bold',
                                      width: 'auto'
                                    }}
                                  />
                                </div>
                                <div className="table-responsive mb-3" style={{
                                  maxHeight: table.rows > 10 ? '400px' : 'auto',
                                  overflowY: table.rows > 10 ? 'auto' : 'visible',
                                  overflowX: 'auto',
                                  msOverflowStyle: 'none',  // Hide scrollbar in IE/Edge
                                  scrollbarWidth: 'none',   // Hide scrollbar in Firefox
                                  '&::-webkit-scrollbar': { // Hide scrollbar in Chrome/Safari/Newer Edge
                                    display: 'none'
                                  }
                                }}>
                                  <table className="table table-bordered" style={{
                                    minWidth: '100%',
                                    width: 'max-content'
                                  }}>
                                    <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                                      <tr>
                                        <th style={{
                                          width: '30px',
                                          backgroundColor: '#f8f9fa',
                                          position: 'sticky',
                                          left: 0,
                                          zIndex: 2
                                        }}></th>
                                        {Array(table.cols).fill().map((_, colIndex) => (
                                          <th key={colIndex} className="text-center" style={{
                                            backgroundColor: '#f8f9fa',
                                            padding: '2px',
                                            fontSize: '12px',
                                            width: '80px',
                                            color: isLightColor(excelSheetColor) ? '#000' : '#fff'
                                          }}>
                                            {getColumnLabel(colIndex)}
                                            <button
                                              className="btn text-danger btn-sm ms-1"
                                              onClick={() => deleteColumn(tableIndex, colIndex)}
                                              style={{ padding: '0px 2px', fontSize: '10px' }}
                                            >
                                              ×
                                            </button>
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {Array(table.rows).fill().map((_, rowIndex) => (
                                        <tr key={rowIndex}>
                                          <td className="text-center" style={{
                                            backgroundColor: '#f8f9fa',
                                            padding: '2px',
                                            fontSize: '12px',
                                            position: 'sticky',
                                            left: 0,
                                            zIndex: 1
                                          }}>
                                            {rowIndex + 1}
                                            <button
                                              className="btn text-danger btn-sm ms-1"
                                              onClick={() => deleteRow(tableIndex, rowIndex)}
                                              style={{ padding: '0px 2px', fontSize: '10px' }}
                                            >
                                              ×
                                            </button>
                                          </td>
                                          {Array(table.cols).fill().map((_, colIndex) => (
                                            <td key={colIndex} style={{
                                              padding: '0px',
                                              width: '80px',
                                              maxWidth: '80px'
                                            }}>
                                              <div className="d-flex align-items-center" style={{ position: 'relative' }}>
                                                <textarea
                                                  data-cell={`${tableIndex}-${rowIndex}-${colIndex}`}
                                                  value={table.data[rowIndex][colIndex]}
                                                  onChange={(e) => handleCellChange(tableIndex, rowIndex, colIndex, e.target.value)}
                                                  onKeyDown={(e) => handleCellKeyDown(e, tableIndex, rowIndex, colIndex)}
                                                  className="cell-input"
                                                  tabIndex={0}
                                                  style={{
                                                    width: '100%',
                                                    padding: '1px 2px',
                                                    border: 'none',
                                                    background: 'transparent',
                                                    resize: 'none',
                                                    overflow: 'hidden',
                                                    minHeight: '22px',
                                                    maxHeight: '60px',
                                                    fontSize: '12px',
                                                    color: isValidUrl(table.data[rowIndex][colIndex]) ? '#0d6efd' : (isLightColor(excelSheetColor) ? '#000' : '#fff'),
                                                    textDecoration: isValidUrl(table.data[rowIndex][colIndex]) ? 'underline' : 'none'
                                                  }}
                                                />
                                                {isValidUrl(table.data[rowIndex][colIndex]) && (
                                                  <a
                                                    href={table.data[rowIndex][colIndex]}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    style={{
                                                      position: 'absolute',
                                                      right: '2px',
                                                      top: '50%',
                                                      color: '#0d6efd',
                                                      fontSize: '12px',
                                                      zIndex: '1000'
                                                    }}
                                                  >
                                                    <i className="bi bi-box-arrow-up-right"></i>
                                                  </a>
                                                )}
                                              </div>
                                            </td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                                <div className="mb-4 d-flex justify-content-between">

                                  <div className="position-relative btn-group">
                                    <button
                                      className="btn btn-secondary me-1"
                                      onClick={() => setShowExcelPicker(!showExcelPicker)}
                                      title='Color The Sheet'
                                    >
                                      <i className="bi bi-palette-fill"></i>
                                      <span className="ms-1">Color</span>
                                    </button>
                                    <button
                                      className="btn btn-dark btn-sm"
                                      onClick={() => downloadExcelSheet(tableIndex)}
                                      title='Download The Excel Sheet'
                                    >
                                      <i className="bi bi-download"></i>
                                      <span className="ms-1">Excel</span>
                                    </button>
                                    {showExcelPicker && (
                                      <CustomColorPicker
                                        color={excelSheetColor}
                                        onChange={(color) => updateColors('excel', color)}
                                        onClose={() => setShowExcelPicker(false)}
                                      />
                                    )}
                                  </div>

                                  <div className="btn-group">
                                    <button
                                      className="btn btn-primary me-1"
                                      onClick={addTable}
                                      title='Add New Table'
                                    >
                                      <i className="icofont-plus me-1" />
                                      <span className="">Table</span>
                                    </button>
                                    <button
                                      className="btn btn-secondary me-1"
                                      onClick={() => addRow(tableIndex)}
                                      title='Add New Row In Table'
                                    >
                                      <i className="icofont-plus me-1" />
                                      <span className="">Row</span>
                                    </button>
                                    <button
                                      className="btn btn-secondary"
                                      onClick={() => addColumn(tableIndex)}
                                      title='Add New Column In Table'
                                    >
                                      <i className="icofont-plus me-1" />
                                      <span className="">Column</span>
                                    </button>
                                  </div>


                                  <div className="btn-group">
                                    <button
                                      className="btn btn-danger text-white me-1"
                                      onClick={() => clearTableData(tableIndex)}
                                      title='Clear All Table Value'
                                    >
                                      <i className="icofont-eraser  me-1" />
                                      <span className="">Erase</span>
                                    </button>
                                    {tables.length > 1 && (
                                      <button
                                        className="btn btn-danger me-2"
                                        onClick={() => deleteTable(tableIndex)}
                                      >
                                        <i className="icofont-trash me-1 text-white" />
                                        <span className="text-white">Table</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <hr className="my-4" />
                              </div>
                            ))}
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div> */}



                {/* Spreadsheets */}
                {/* <div className="card shadow-lg mb-5" style={{ backgroundColor: spreadsheetColor }}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h5 className="card-title mb-0">Interactive Spreadsheets</h5>
                      <div className="d-flex gap-2">
                        <div className="position-relative">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setShowSpreadsheetPicker(!showSpreadsheetPicker)}
                            title="Change background color"
                          >
                            <i className="bi bi-palette-fill"></i>
                            <span className="ms-1">Color</span>
                          </button>
                          {showSpreadsheetPicker && (
                            <CustomColorPicker
                              color={spreadsheetColor}
                              onChange={updateSpreadsheetColor}
                              onClose={() => setShowSpreadsheetPicker(false)}
                            />
                          )}
                        </div>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={addNewSpreadsheet}
                        >
                          <i className="icofont-plus me-1"></i>
                          New Spreadsheet
                        </button>
                      </div>
                    </div>

                    {spreadsheets.map((sheet, index) => (
                      <div key={sheet.id} className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <input
                            type="text"
                            value={sheet.name}
                            onChange={(e) => updateSpreadsheetName(sheet.id, e.target.value)}
                            className="form-control form-control-sm"
                            style={{
                              width: 'auto',
                              backgroundColor: 'transparent',
                              color: isLightColor(spreadsheetColor) ? '#000' : '#fff'
                            }}
                          />
                          <div>
                            <button
                              className="btn btn-dark btn-sm me-2"
                              onClick={() => downloadSpreadsheet(sheet.id)}
                            >
                              <i className="bi bi-download"></i>
                              Download
                            </button>
                            {spreadsheets.length > 1 && (
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => deleteSpreadsheet(sheet.id)}
                              >
                                <i className="icofont-trash me-1"></i>
                                Delete Sheet
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="spreadsheet-container" style={{
                          overflowX: 'auto',
                          backgroundColor: 'transparent'
                        }}>
                          <Spreadsheet
                            data={sheet.data}
                            onChange={(data) => handleSpreadsheetChange(data, sheet.id)}
                            className="custom-spreadsheet"
                          />
                        </div>
                        <div className="d-flex justify-content-end mt-3 gap-2">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              const newData = [...sheet.data, [{ value: "" }, { value: "" }]];
                              handleSpreadsheetChange(newData, sheet.id);
                            }}
                          >
                            <i className="icofont-plus me-1"></i>
                            Add Row
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              const newData = sheet.data.map(row => [...row, { value: "" }]);
                              handleSpreadsheetChange(newData, sheet.id);
                            }}
                          >
                            <i className="icofont-plus me-1"></i>
                            Add Column
                          </button>
                        </div>
                        {index < spreadsheets.length - 1 && <hr className="my-4" />}
                      </div>
                    ))}
                  </div>
                </div> */}




                // const addNewSpreadsheet = () => {
                //   setSpreadsheets([
                //     ...spreadsheets,
                //     {
                //       id: Date.now(),
                //       name: `Spreadsheet ${spreadsheets.length + 1}`,
                //       data: [
                //         [{ value: "" }, { value: "" }],
                //         [{ value: "" }, { value: "" }]
                //       ]
                //     }
                //   ]);
                // };
              
                // const handleSpreadsheetChange = (data, sheetId) => {
                //   setSpreadsheets(spreadsheets.map(sheet =>
                //     sheet.id === sheetId ? { ...sheet, data } : sheet
                //   ));
                // };
              
                // const deleteSpreadsheet = (sheetId) => {
                //   if (spreadsheets.length > 1) {
                //     setSpreadsheets(spreadsheets.filter(sheet => sheet.id !== sheetId));
                //   }
                // };
              
                // const updateSpreadsheetName = (sheetId, newName) => {
                //   setSpreadsheets(spreadsheets.map(sheet =>
                //     sheet.id === sheetId ? { ...sheet, name: newName } : sheet
                //   ));
                // };
              
                // const downloadSpreadsheet = (sheetId) => {
                //   const sheet = spreadsheets.find(sheet => sheet.id === sheetId);
                //   if (!sheet) return;
              
                //   let csv = '';
              
                //   // Add headers (A, B, C, etc.)
                //   for (let i = 0; i < sheet.data[0].length; i++) {
                //     csv += String.fromCharCode(65 + i) + ',';
                //   }
                //   csv = csv.slice(0, -1) + '\n';
              
                //   // Add data
                //   sheet.data.forEach(row => {
                //     csv += row.map(cell => cell.value).join(',') + '\n';
                //   });
              
                //   const blob = new Blob([csv], { type: 'text/csv' });
                //   const url = window.URL.createObjectURL(blob);
                //   const a = document.createElement('a');
                //   a.href = url;
                //   a.download = `${sheet.name}.csv`;
                //   document.body.appendChild(a);
                //   a.click();
                //   document.body.removeChild(a);
                //   window.URL.revokeObjectURL(url);
                // };
              
                // const updateSpreadsheetColor = (color) => {
                //   setSpreadsheetColor(color);
                // };
              
