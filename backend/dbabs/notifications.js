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

    getUserNotifications: async function (username) {
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
    
            await getUserNotifications(username);
    
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
    
            await getNotificationFromID(notificationID);
    
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

    getNotificationFromID: async function(notificationID) {
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
};