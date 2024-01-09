const express = require('express');
const sql = require('mssql/msnodesqlv8');
const app = express();
const port = 3000;
const cors = require('cors');
app.use(cors());

// Serve static files from the public directory
app.use(express.static(__dirname + '/public'));

// SQL Server configuration
// SQL Server configuration for Windows Authentication
// const config = {
//   server: 'IN01-9MCXZH3\\SQLEXPRESS',
//   database: 'NSEDATA', // default database for fetching available databases
//   user: 'sa',
//   password: 'Newstart@dec29',
//   options: {
//     encrypt: true, // Use encryption (Recommended for security)
//     trustServerCertificate: true, // For self-signed certificates during development
//     instancename: 'SQLEXPRESS'
//   },
// };

const config = {
  server: 'IN01-9MCXZH3\\SQLEXPRESS',
  database: 'MFDATA', // or 'your_database'
  user: 'sa',
  password: 'Newstart@dec29',
  driver: 'msnodesqlv8',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

// Middleware to handle JSON data
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// API to get the list of databases
app.get('/databases', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query("SELECT name FROM sys.databases where name not in ('master', 'model', 'msdb', 'tempdb')");
    const databases = result.recordset.map((record) => record.name);
    res.json(databases);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// API to get the list of tables for a specific database
app.post('/tables', async (req, res) => {
  const { database } = req.body;
  try {
    const pool = await sql.connect({ ...config, database });
    const result = await pool.request().query('SELECT table_name FROM ' + database + '.information_schema.tables order by table_name');
    const tables = result.recordset.map((record) => record.table_name);
    res.json(tables);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// API to get table data from a specific database and table
app.post('/tableData', async (req, res) => {
  const { database, tableName, recordsPerPage } = req.body;
  console.log('databse', database, 'table', tableName)
  try {
    const pool = await sql.connect({ ...config, database });
    // const result = await pool.request().query(`SELECT * FROM ${tableName}`);
    // const query_str = 'SELECT top ' + recordsPerPage + '* FROM ' + database + '.dbo.' + tableName
    // Check if recordsPerPage is "ALL" to decide the query
    let query_str;
    if (recordsPerPage.toUpperCase() === "ALL") {
      query_str = `SELECT * FROM ${database}.dbo.${tableName} ORDER BY 1 DESC`;
    } else {
      // Assuming recordsPerPage is a number, you might want to add validation
      query_str = `SELECT TOP ${parseInt(recordsPerPage)} * FROM ${database}.dbo.${tableName} ORDER BY 1 DESC`;
      // query_str = `SELECT TOP  ${parseInt(recordsPerPage)} * FROM (SELECT TOP  ${parseInt(recordsPerPage)} * FROM ${database}.dbo.${tableName} ORDER BY 1 DESC) A ORDER BY 1`;
    }
    const result = await pool.request().query(query_str);
    const tableData = result.recordset;
    res.json(tableData);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to trigger the execution of the Python script
app.post('/loadData', (req, res) => {
  // Use a child process to execute the Python script
  const { exec } = require('child_process');
  exec('C:\\Users\\sba400\\AppData\\Local\\Programs\\Python\\Python38\\python.exe scripts\\daily_data_load.py', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing Python script: ${error.message}`);
      res.status(500).json({ error: 'Error executing Python script' });
      return;
    }

    console.log(`Python script output: ${stdout}`);
    res.json({ message: 'Daily data loaded successfully' });
  });
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
