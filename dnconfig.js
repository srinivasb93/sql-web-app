const sql = require('mssql');

const dbConfig = {
  server: 'IN01-9MCXZH3\\SQLEXPRESS',
  port: '1433',
  database: 'NSEDATA',
  options: {
    trustedConnection: true
  }
};

async function connectToDatabase() {
  try {
    const pool = await sql.connect(dbConfig);
    console.log('Connected to the database');
    
    // Now you can use the 'pool' object to execute queries
    // For example:
    const result = await pool.request().query('SELECT * FROM dbo.AARTIIND');
    console.log(result.recordset);

  } catch (error) {
    console.error('Database connection error:', error.message);
  }
}

// Call the function to establish the connection
connectToDatabase();
