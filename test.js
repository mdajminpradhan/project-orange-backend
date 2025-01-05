const xlsx = require("xlsx");

const data = xlsx.readFile('./PIC.xlsx');
console.log("🚀 ~ data:", data.Workbook.Sheets)
