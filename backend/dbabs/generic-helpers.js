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
            return user[0];
        } catch (e) {
            if (e instanceof dbErrors.UserNotFound) {
                throw new dbErrors.UserNotFound();
            } else {
                throw new dbErrors.ProblemWithDB()
            }
        }
    },

    validateInputAlphaNumeric: function(input) {
        const regex = /^[a-zA-Z0-9_]*$/;
        return regex.test(input);
    },

    userExists: async function(username) {
    
        try {
    
            const [user] = await connection.query(`SELECT * FROM users WHERE username = ?;`, [username]);
    
            if (user.length != 0) {
                return true;
            }
    
            return false;
    
        } catch (e) {
            throw new dbErrors.ProblemWithDB();
        }
    }

};