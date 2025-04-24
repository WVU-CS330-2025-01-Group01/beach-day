const bcrypt = require('bcryptjs');
require('dotenv').config();
const mysql = require('mysql2');
const dbErrors = require('./db-errors');
const dbHelper = require('./generic-helpers');
const connection = require('./database-connection');



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
    },

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