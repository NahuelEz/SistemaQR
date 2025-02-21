const mysql = require('mysql2/promise');
require('dotenv').config();

// First create a connection without database selection
const createDbConnection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

// Create the database if it doesn't exist
const createDatabase = async () => {
  try {
    const connection = await createDbConnection;
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log('Database created or already exists');
    await connection.end();
  } catch (error) {
    console.error('Error creating database:', error.message);
    throw error;
  }
};

// Then create the pool with the database selected
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00',
  multipleStatements: true
});

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection established successfully');
    connection.release();
  } catch (error) {
    console.error('Error connecting to database:', error.message);
    throw error;
  }
};

// Initialize database schema
const initializeDatabase = async () => {
  try {
    // First create the database
    await createDatabase();

    const fs = require('fs');
    const path = require('path');
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute the schema as a single query
    await pool.query(schema);

    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database schema:', error.message);
    throw error;
  }
};

module.exports = {
  pool,
  testConnection,
  initializeDatabase,
  createDatabase
};
