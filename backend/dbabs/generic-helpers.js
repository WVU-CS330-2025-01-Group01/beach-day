/** 
 * This class includes generic helper functions that are used throughout
 * the database functions.
 * @author Ayden Jones, Bhavana Dakshinamoorthy, Austin Bird
 */

const bcrypt = require('bcryptjs');
require('dotenv').config();
const mysql = require('mysql2');
const dbErrors = require('./db-errors');
const connection = require('./database-connection');

module.exports = {
    /** 
	 * Retrives user data from a given username.
	 * 
	 * Checks to see if a user does not exist or if there is a database issue.
	 * 
	 * @param {String} username Username added
	 * @return user data
	 */
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

    /** 
	 * Checks to see if an input contains the correct constraints to pass as
     * Alphanumeric.
	 * 
	 * @param {String} input Any user/beach info.
	 * @return The input IF it passes the regex test.
	 */
    validateInputAlphaNumeric: function(input) {
        const regex = /^[a-zA-Z0-9_]*$/;
        return regex.test(input);
    },

    /** 
	 * Checks to see if a user already exists.
	 * 
	 * @param {String} username Given username.
	 * @return A boolean based on whether or not the user exists. 
	 */
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