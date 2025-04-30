const bcrypt = require('bcryptjs');
require('dotenv').config();
const mysql = require('mysql2');
const dbErrors = require('./db-errors');
const connection = require('./database-connection');

module.exports = {

    getUserData: async function(username) {
    
        try {
            const [user] = await connection.query(`SELECT * FROM users WHERE username = ?;`, [username]);
    
            if (user.length == 0) { 
                throw new dbErrors.UserNotFound();
            }
            return user[0]; // Repeated comment, but queries will return an array of rows, even if every username is STRICTLY unique.  So we will always grab the first row.
        } catch (e) {
            if (e instanceof dbErrors.UserNotFound) {
                throw new dbErrors.UserNotFound();
            } else {
                throw new dbErrors.ProblemWithDB()
            }
        }
    },

    validateInputAlphaNumeric: function(input) {
        const regex = /^[a-zA-Z0-9_]*$/; // This is a simple regex to ensure that some input only contains some string of letters and numbers.  It is unused, but exists for in case it is needed.
        return regex.test(input);
    },

    userExists: async function(username) {
    
        try {
    
            const [user] = await connection.query(`SELECT * FROM users WHERE username = ?;`, [username]);
    
            if (user.length != 0) { // The max length it can be is one, but if it's zero, no users with said username exists.  This is checked in many cases.
                return true;
            }
    
            return false;
    
        } catch (e) {
            throw new dbErrors.ProblemWithDB();
        }
    }

};