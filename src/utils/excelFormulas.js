export const evaluateFormula = (formula, tableData) => {
  // Remove the '=' sign and trim whitespace
  const cleanFormula = formula.substring(1).trim().toUpperCase();

  // Date functions
  if (cleanFormula === 'TODAY()') {
    return new Date().toLocaleDateString();
  }

  if (cleanFormula === 'NOW()') {
    return new Date().toLocaleString();
  }

  if (cleanFormula.startsWith('DATE(')) {
    try {
      const params = cleanFormula.match(/DATE\((.*)\)/)[1].split(',').map(x => parseInt(x.trim()));
      const date = new Date(params[0], params[1] - 1, params[2]);
      return date.toLocaleDateString();
    } catch (error) {
      return '#ERROR!';
    }
  }

  // Date series function
  if (cleanFormula.startsWith('DATESERIES(')) {
    try {
      const params = cleanFormula.match(/DATESERIES\((.*)\)/)[1].split(',').map(x => x.trim());
      const startDate = new Date(params[0]);
      const count = parseInt(params[1]) || 1;
      const increment = parseInt(params[2]) || 1;
      return generateDateSeries(startDate, count, increment)[0]; // Return first date for single cell
    } catch (error) {
      return '#ERROR!';
    }
  }

  // Basic arithmetic operations
  if (cleanFormula.match(/^[\d\s+\-*/().]+$/)) {
    try {
      // eslint-disable-next-line no-eval
      return eval(cleanFormula);
    } catch (error) {
      return '#ERROR!';
    }
  }

  // SUM function
  if (cleanFormula.startsWith('SUM(')) {
    try {
      const range = cleanFormula.match(/SUM\((.*)\)/)[1];
      const values = extractRangeValues(range, tableData);
      return values.reduce((sum, val) => sum + (Number(val) || 0), 0);
    } catch (error) {
      return '#ERROR!';
    }
  }

  // AVERAGE function
  if (cleanFormula.startsWith('AVERAGE(')) {
    try {
      const range = cleanFormula.match(/AVERAGE\((.*)\)/)[1];
      const values = extractRangeValues(range, tableData);
      const sum = values.reduce((acc, val) => acc + (Number(val) || 0), 0);
      return sum / values.length;
    } catch (error) {
      return '#ERROR!';
    }
  }

  // MAX function
  if (cleanFormula.startsWith('MAX(')) {
    try {
      const range = cleanFormula.match(/MAX\((.*)\)/)[1];
      const values = extractRangeValues(range, tableData);
      return Math.max(...values.map(v => Number(v) || 0));
    } catch (error) {
      return '#ERROR!';
    }
  }

  // MIN function
  if (cleanFormula.startsWith('MIN(')) {
    try {
      const range = cleanFormula.match(/MIN\((.*)\)/)[1];
      const values = extractRangeValues(range, tableData);
      return Math.min(...values.map(v => Number(v) || 0));
    } catch (error) {
      return '#ERROR!';
    }
  }

  // COUNT function
  if (cleanFormula.startsWith('COUNT(')) {
    try {
      const range = cleanFormula.match(/COUNT\((.*)\)/)[1];
      const values = extractRangeValues(range, tableData);
      return values.filter(v => v !== '').length;
    } catch (error) {
      return '#ERROR!';
    }
  }

  return '#INVALID!';
};

const extractRangeValues = (range, tableData) => {
  // Split range into cells (e.g., "A1:A5" or "A1,B1,C1")
  const cells = range.includes(':') ? expandRange(range) : range.split(',');
  
  return cells.map(cell => {
    const { row, col } = cellToIndices(cell.trim());
    return tableData[row]?.[col] || '';
  });
};

const expandRange = (range) => {
  const [start, end] = range.split(':');
  const startIndices = cellToIndices(start);
  const endIndices = cellToIndices(end);
  
  const cells = [];
  for (let row = startIndices.row; row <= endIndices.row; row++) {
    for (let col = startIndices.col; col <= endIndices.col; col++) {
      cells.push(indicesToCell(row, col));
    }
  }
  return cells;
};

const cellToIndices = (cell) => {
  const match = cell.match(/([A-Z]+)(\d+)/);
  if (!match) return { row: 0, col: 0 };
  
  const col = match[1].split('').reduce((acc, char) => 
    acc * 26 + char.charCodeAt(0) - 'A'.charCodeAt(0), 0
  );
  const row = parseInt(match[2]) - 1;
  
  return { row, col };
};

const indicesToCell = (row, col) => {
  const colStr = String.fromCharCode('A'.charCodeAt(0) + col);
  return `${colStr}${row + 1}`;
}; 

export const generateDateSeries = (startDate, count, increment = 1) => {
  const dates = [];
  let currentDate = new Date(startDate);

  for (let i = 0; i < count; i++) {
    dates.push(currentDate.toLocaleDateString());
    currentDate.setDate(currentDate.getDate() + increment);
  }

  return dates;
}; 