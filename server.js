const sql = require('mssql/msnodesqlv8');

const config = {
  server: 'IN01-9MCXZH3\\SQLEXPRESS',
  database: 'NSEDATA', // or 'your_database'
  user: 'sa',
  password: 'Newstart@dec29',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

async function testConnection() {
  try {
    await sql.connect(config);
    console.log('Connected to the database');
    // Additional queries or operations can be added here if needed
  } catch (error) {
    console.error('Error connecting to the database:', error.message);
  } finally {
    // Close the connection pool
    await sql.close();
    console.log('Connection closed');
  }
}

// Call the function to test the connection
testConnection();
