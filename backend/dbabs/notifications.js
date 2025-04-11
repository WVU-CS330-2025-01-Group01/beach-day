const bcrypt = require('bcryptjs');
require('dotenv').config();
const mysql = require('mysql2');
const error = require("./db-errors");


const connection = mysql.createPool({
    host: process.env.BEACH_DAY_DB_HOST,
    user: process.env.BEACH_DAY_DB_USER,
    password: process.env.BEACH_DAY_DB_PASSWORD,
    database: process.env.BEACH_DAY_DB_NAME,
    port: process.env.BEACH_DAY_DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

async function testDatabaseConnection() {
    let connect;
    try {
        connect = await connection.getConnection(); // Get a connection from the pool
    } catch (err) {
        console.error('Error connecting to the database:', err.message || err);
        throw err; // Exit if there’s an error, no need to release connection
    } finally {
        if (connect) {
            connect.release(); // Release the connection back to the pool
        }
    }
}

testDatabaseConnection();

module.exports = {


};