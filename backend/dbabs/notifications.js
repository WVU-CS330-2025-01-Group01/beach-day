/** 
 * This class includes functions related to sending notifications to users.
 * @author Ayden Jones, Bhavana Dakshinamoorthy, Austin Bird
 */

const bcrypt = require('bcryptjs');
require('dotenv').config();
const mysql = require('mysql2');
const dbErrors = require('./db-errors');
const dbHelper = require('./generic-helpers');
const connection = require('./database-connection');

    /** 
	 * Helper method to retrieve notifications from given ID.
	 * 
	 * Checks to see if there are no notifications or if there is a problem with the database.
	 * 
	 * @param {number} notificationID Given notification ID.
	 * @return {String} The notification found.
	 */
async function getNotificationFromIDHelper(notificationID) {
    try {

        const [notification] = await connection.query(
            `
                SELECT * FROM notifications
                WHERE notification_id = ?
            `
            , [notificationID]
        )

        if(notification.length <= 0) {
            throw new dbErrors.ZeroNotifications();
        }

        return notification[0];

    } catch (e) {
        if(e instanceof dbErrors.ZeroNotifications) {
            throw new dbErrors.ZeroNotifications();
        } else {
            throw new dbErrors.ProblemWithDB()
        }
    }
}

    /** 
	 * Helper method to retrieve all notifications from a user.
	 * 
	 * Checks to see if there are no notifications, if there is no user found, or
     * if there is a problem with the database.
	 * 
	 * @param {String} username Given username.
	 * @return {String} The notifications.
	 */
async function getUserNotificationsHelper(username) { //This and the function below are near identical in logic to two functions, but they were split to appear more clear to the frontend
    try {

        if(!(await dbHelper.userExists(username))) {
            throw new dbErrors.UserNotFound();
        }

        const [notifications] = await connection.query(
            `
                SELECT creation_time, notification_title, message, email, notifications_enabled, notification_id, notifications.username
                FROM notifications LEFT JOIN users
                ON  notifications.username = users.username
                WHERE notifications.username = ?
                ORDER BY creation_time DESC;
            `
            , [username]
        );
        if (notifications.length <= 0) {
            throw new dbErrors.ZeroNotifications();
        }

        return notifications;

    } catch (e) {
        if(e instanceof dbErrors.UserNotFound) {
            throw new dbErrors.UserNotFound();
        } else if (e instanceof dbErrors.ZeroNotifications) {
            throw new dbErrors.ZeroNotifications();
        } else {
            throw new dbErrors.ProblemWithDB()
        }
    }
}

module.exports = {
    /** 
	 * Method to retrieve whether or not a user has notifications enabled.
	 * 
	 * Checks to see if a user is not found or if there is a problem with the database.
	 * 
	 * @param {String} username Given username.
	 * @return {String} Value that represents whether a user has notifications enabled or not.
	 */
    getNotificationsEnabled: async function(username) {
        try {
            if (!(await dbHelper.userExists(username))) { // Check if user exists
                throw new dbErrors.UserNotFound();
            }
            let [enabled] = await connection.query('SELECT notifications_enabled FROM users where username = ?', [username]); // Get value from table
            return enabled[0].notifications_enabled;
        } catch (e) { // Error
            if (e instanceof dbErrors.UserNotFound) {
                throw new dbErrors.UserNotFound();
            } else {
                throw new dbErrors.ProblemWithDB();
            }
        }
    },

    /** 
	 * Set the value that represents whether a user has notifications enabled or not.
	 * 
	 * Checks to see if there is no  user found or if there is a problem with the database.
	 * 
	 * @param {String} username Given username.
     * @param {String} enabled Given value for enabled/not enabled.
	 * @return nothing
	 */
    setNotificationsEnabled: async function(username, enabled){
        try {
            if (!(await dbHelper.userExists(username))) { // Check if user exists
                throw new dbErrors.UserNotFound();
            }
            await connection.query('UPDATE users SET notifications_enabled = ? WHERE username = ?', [enabled ? 1 : 0, username]); // Set notifications_enabled to true/false
        } catch (e) { // Error
            if (e instanceof dbErrors.UserNotFound) {
                throw new dbErrors.UserNotFound();
            } else {
                throw new dbErrors.ProblemWithDB();
            }
        }
    },

    /** 
	 * Retrieves the number of notifications for each user.
	 * 
	 * Checks to see if there is no user found or if there is a problem with the database.
	 * 
	 * @param {String} username Given username.
	 * @return {number} Count of notifications.
	 */
    getNotificationCount: async function(username) {
        try {

            if(!(await dbHelper.userExists(username))) {
                throw new dbErrors.UserNotFound();
            }
    
            const [notificationCount] = await connection.query(
                `
                SELECT COUNT(username) AS amount
                FROM notifications
                WHERE username = ? AND wasReceived = 0;
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
    },

    /** 
	 * Marks whether or not a notification has been received.
	 * 
	 * Checks to see if there are no notifications, 
     * no user found or if there is a problem with the database. 
	 * 
	 * @param {String} username Given username.
     * @param {String} notification_id ID for notifications.
	 * @return nothing
	 */
    receivedNotification: async function(username, notification_id) {
        try {
    
            if(!(await dbHelper.userExists(username))) {
                throw new dbErrors.UserNotFound();
            }
    
            const [notificationQuery] = await connection.query(
                `
                    SELECT * FROM notifications
                    WHERE username = ? AND notification_id = ?;
                `
                , [username, notification_id]
            );
    
            if(notificationQuery.length <= 0) {
                throw new dbErrors.ZeroNotifications();
            }
    
            await connection.query(
                `
                    UPDATE notifications 
                    SET wasReceived = 1
                    WHERE username = ? AND notification_id = ?;
                `
                , [username, notification_id]
            );
        } catch (e) {
            if (e instanceof dbErrors.UserNotFound) {
                throw new dbErrors.UserNotFound();
            } else if (e instanceof dbErrors.ZeroNotifications){
                throw new dbErrors.ZeroNotifications();
            } else {
                throw new dbErrors.ProblemWithDB()
            }
        }
    },

    /** 
	 * Retrieves notifications that have not been received yet.
	 * 
	 * Checks to see if there are no notifications, 
     * no user found or if there is a problem with the database. 
	 * 
	 * @param {String} username Given username.
	 * @return {String} Pending notifications
	 */
    getUserPendingNotifications: async function (username) {
        try {
    
            if(!(await dbHelper.userExists(username))) {
                throw new dbErrors.UserNotFound();
            }
    
            const [notifications] = await connection.query(
                `
                    SELECT creation_time, notification_title, message, email, notifications_enabled, notification_id, notifications.username
                    FROM notifications LEFT JOIN users
                    ON  notifications.username = users.username
                    WHERE notifications.username = ? AND wasReceived = 0
                    ORDER BY creation_time desc;
                `
                , [username]
            );
            if (notifications.length <= 0) {
                throw new dbErrors.ZeroNotifications();
            }
    
            return notifications;
    
        } catch (e) {
            if(e instanceof dbErrors.UserNotFound) {
                throw new dbErrors.UserNotFound();
            } else if (e instanceof dbErrors.ZeroNotifications) {
                throw new dbErrors.ZeroNotifications();
            } else {
                throw new dbErrors.ProblemWithDB()
            }
        }
    },

    /** 
	 * Adds a notification for a user for them to see.
	 * 
	 * Checks to see if there is no user found or if there is a problem with the database. 
	 * 
	 * @param {String} username Given username.
     * @param {String} title Title of notification
     * @param {String} message Message of notification.
	 * @return nothing
	 */
    addNotification: async function (username, title, message) {
        try {
    
            if(!(await dbHelper.userExists(username))) {
                throw new dbErrors.UserNotFound();
            }
    
            await connection.query(
                `
                    INSERT INTO notifications (username, notification_title, message)
                    VALUES  (?, ?, ?);
                `
                , [username, title, message]
            );
    
        } catch (e) {
            if (e instanceof dbErrors.UserNotFound) {
                throw new dbErrors.UserNotFound();
            } else {
                throw new dbErrors.ProblemWithDB()
            }
        }
    },

    /** 
	 * Removes all notifications from a user.
	 * 
	 * Checks to see if there is no user found, no notifications, 
     * or if there is a problem with the database. 
	 * 
	 * @param {String} username Given username.
	 * @return nothing
	 */
    removeAllNotificationsFromUser: async function(username) {
        try {
    
            if(!(await dbHelper.userExists(username))) {
                throw new dbErrors.UserNotFound();
            }
    
            await getUserNotificationsHelper(username);
    
            await connection.query(
                `
                    DELETE FROM notifications
                    WHERE username = ?
                `
                , [username]
            );
        } catch (e) {
            if(e instanceof dbErrors.ZeroNotifications) {
                throw new dbErrors.ZeroNotifications();
            } else if (e instanceof dbErrors.UserNotFound) {
                throw new dbErrors.UserNotFound();
            } else {
                throw new dbErrors.ProblemWithDB()
            }
        }
    },

    /** 
	 * Removes notifications from a given ID.
	 * 
	 * Checks to see if there is are no notifications, 
     * or if there is a problem with the database. 
	 * 
	 * @param {String} username Given username.
	 * @return nothing
	 */
    removeNotificationFromID: async function(notificationID) {
        try {
    
            await getNotificationFromIDHelper(notificationID);
    
            await connection.query(
                `
                    DELETE FROM notifications
                    WHERE notification_id = ?
                `
                , [notificationID]
            );
        } catch (e) {
            if(e instanceof dbErrors.ZeroNotifications) {
                throw new dbErrors.ZeroNotifications();
            } else {
                throw new dbErrors.ProblemWithDB()
            }
        }
    },

    getNotificationFromID: getNotificationFromIDHelper,
    getUserNotifications: getUserNotificationsHelper,

    /** 
	 * Removes all received notifications from a user.
	 * 
	 * Checks to see if there is no user found, no notifications, 
     * or if there is a problem with the database. 
	 * 
	 * @param {String} username Given username.
	 * @return nothing
	 */
    removeAllReceivedNotificationsFromUser: async function(username) {
        try {
    
            if(!(await dbHelper.userExists(username))) {
                throw new dbErrors.UserNotFound();
            }
    
            await getUserNotificationsHelper(username);
    
            await connection.query(
                `
                    DELETE FROM notifications
                    WHERE username = ? AND wasReceived = 1;
                `
                , [username]
            );
        } catch (e) {
            if(e instanceof dbErrors.ZeroNotifications) {
                throw new dbErrors.ZeroNotifications();
            } else if (e instanceof dbErrors.UserNotFound) {
                throw new dbErrors.UserNotFound();
            } else {
                throw new dbErrors.ProblemWithDB()
            }
        }
    }
};