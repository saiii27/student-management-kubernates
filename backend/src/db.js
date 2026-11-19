const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'mysql-service',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rootpassword',
  database: process.env.DB_NAME || 'studentdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000
};

console.log(`[Database] Initializing connection pool to ${dbConfig.user}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);

const pool = mysql.createPool(dbConfig);

// Helper function to test DB connection with retries
async function testConnection(retries = 15, delay = 3000) {
  for (let i = 1; i <= retries; i++) {
    try {
      const connection = await pool.getConnection();
      console.log(`[Database] Successfully connected to MySQL database on attempt ${i}`);
      
      // Ensure students table exists
      await connection.query(`
        CREATE TABLE IF NOT EXISTS students (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          usn VARCHAR(20) NOT NULL UNIQUE,
          branch VARCHAR(50) NOT NULL,
          semester INT NOT NULL,
          email VARCHAR(100) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      connection.release();
      return true;
    } catch (err) {
      console.warn(`[Database] Connection attempt ${i}/${retries} failed: ${err.message}. Retrying in ${delay / 1000}s...`);
      if (i === retries) {
        console.error('[Database] Exceeded maximum connection attempts to MySQL.');
        return false;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

module.exports = {
  pool,
  testConnection
};
