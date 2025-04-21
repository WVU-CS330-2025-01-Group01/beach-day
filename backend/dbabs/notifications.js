const bcrypt = require('bcryptjs');
require('dotenv').config();
const mysql = require('mysql2');
const error = require("./db-errors");
const dbErrors = require('./db-errors');
const dbHelper = require('./')


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
        throw new dbErrors.ProblemWithDB(); // Exit if there’s an error, no need to release connection
    } finally {
        if (connect) {
            connect.release(); // Release the connection back to the pool
        }
    }
}

testDatabaseConnection();


async function getNotificationsEnabled(username) {
    try {
        if (!(await dbHelper.userExists(username))) { // Check if user exists
            throw new dbError.UserNotFound();
        }
        let [enabled] = await connection.query('SELECT notifications_enabled FROM users where username = ?', [username]); // Get value from table
        return enabled[0].notifications_enabled;
    } catch (e) { // Error
        if (e instanceof dbErrors.UserNotFound) {
            throw new dbErrors.UserNotFound;
        } else {
            console.log(e);
            throw new dbErrors.ProblemWithDB();
        }
    }
}

async function setNotificationsEnabled(username, enabled) {
    try {
        if (!(await dbHelper.userExists(username))) { // Check if user exists
            throw new dbError.UserNotFound();
        }
        await connection.query('UPDATE users SET notifications_enabled = ? WHERE username = ?', [enabled ? 1 : 0, username]); // Set notifications_enabled to true/false
    } catch (e) { // Error
        if (e instanceof dbErrors.UserNotFound) {
            throw new dbErrors.UserNotFound();
        } else {
            throw new dbErrors.ProblemWithDB();
        }
    }
}

async function test() {
    console.log(await getNotificationsEnabled('favTest'));
    await setNotificationsEnabled('favTest', 0);
    console.log(await getNotificationsEnabled('favTest'));
}

test();

module.exports = {
    getNotificationsEnabled: async function(username) {
        try {
            if (!(await dbHelper.userExists(username))) { // Check if user exists
                throw new dbError.UserNotFound();
            }
            let [enabled] = await connection.query('SELECT notifications_enabled FROM users where username = ?', [username]); // Get value from table
            return enabled[0].notifications_enabled;
        } catch (e) { // Error
            if (e instanceof dbErrors.UserNotFound) {
                throw new dbErrors.UserNotFound;
            } else {
                console.log(e);
                throw new dbErrors.ProblemWithDB();
            }
        }
    },
    setNotificationsEnabled: async function(username, enabled){
        try {
            if (!(await dbHelper.userExists(username))) { // Check if user exists
                throw new dbError.UserNotFound();
            }
            await connection.query('UPDATE users SET notifications_enabled = ? WHERE username = ?', [enabled ? 1 : 0, username]); // Set notifications_enabled to true/false
        } catch (e) { // Error
            if (e instanceof dbErrors.UserNotFound) {
                throw new dbErrors.UserNotFound();
            } else {
                throw new dbErrors.ProblemWithDB();
            }
        }
    }
};