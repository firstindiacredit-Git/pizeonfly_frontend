export const evaluateFormula = (formula, tableData) => {
  // Remove the '=' sign and trim whitespace
  const cleanFormula = formula.substring(1).trim().toUpperCase();

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