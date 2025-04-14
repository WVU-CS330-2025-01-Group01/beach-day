const bcrypt = require('bcryptjs');
require('dotenv').config();
const mysql = require('mysql2');
const dbErrors = require('./db-errors');
const dbHelper = require('./generic-helpers');
const connection = require('./database-connection');

module.exports = {
    getNotificationCount: async function(username) {
        try {

            if(!(await dbHelper.userExists(username))) {
                throw new dbErrors.UserNotFound();
            }
    
            const [notificationCount] = await connection.query(
                `
                SELECT COUNT(username) AS amount
                FROM notifications
                WHERE username = ?;
                `
                , [username]
            );
            return notificationCount[0].amount;
        } catch (e) {
            if(e instanceof dbErrors.UserNotFound) {
                throw new dbErrors.UserNotFound();
            } else {
                throw new dbErrors.ProblemWithDB()
            }
        }
    }
};