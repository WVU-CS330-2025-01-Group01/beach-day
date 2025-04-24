const bcrypt = require('bcryptjs');
require('dotenv').config();
const mysql = require('mysql2');
const dbErrors = require('./db-errors');
const dbHelper = require('./generic-helpers');
const dbFavorite = require('./favorite-functions');
const dbNotifications = require('./notifications');
const connection = require('./database-connection');
const salt = 10;


module.exports = {
	/**
	 * This function takes in an unsanitized username and password. If the
	 * user already exists, it throws UserAlreadyExists. If there is a
	 * problem adding the user to the database, it throws ProblemWithDB. If
	 * the user is successfully added to the database, no exceptions are to
	 * be thrown. Nothing is ever returned by this function.
	 */
	attemptToMakeUser: async function (username, password) {

		try {

			if (await dbHelper.userExists(username)) {
				throw new dbErrors.UserAlreadyExists();
			}

			const hash = await bcrypt.hash(password, salt);

			await connection.query(`
				INSERT INTO
				users (username, password)
				VALUES 
				(?, ?);
				`, [username, hash]
			);


		} catch (e) {
			if (e instanceof dbErrors.UserAlreadyExists) {
				throw new dbErrors.UserAlreadyExists();
			} else {
				throw new dbErrors.ProblemWithDB()
			}
		}
	},
	/**
	 * This function takes in an unsanitized username and password. If the
	 * user does not exist, it throws UserNotFound. If there is a problem
	 * with the database, it throws ProblemWithDB. If the password is
	 * incorrect, it throws IncorrectPassword. If the username exists and
	 * the password is the correct password for that user, no exceptions are
	 * to be thrown. Nothing is ever returned by this function.
	 */
	tryLogIn: async function (username, enteredPassword) {
		try {
			const user = await dbHelper.getUserData(username);

			const password = await bcrypt.compare(enteredPassword, user.password);

			if (!password) {
				console.log("Wrong Password");
				throw new dbErrors.IncorrectPassword();
			}

			console.log("Password Works");
		} catch (e) {
			if (e instanceof dbErrors.UserNotFound) {
				throw new dbErrors.UserNotFound();
			} else if (e instanceof dbErrors.IncorrectPassword) {
				throw new dbErrors.IncorrectPassword();
			} else {
				throw new dbErrors.ProblemWithDB();
			}
		}

	},

	setEmail: async function (username, email) {
        try {
            await dbHelper.getUserData(username);
            await connection.query(`UPDATE users SET email = ? WHERE username = ?`, [email, username]);
        } catch (e) {
            if (e instanceof dbErrors.UserNotFound) {
                throw new dbErrors.UserNotFound();
            } else {
                throw new dbErrors.ProblemWithDB();
            }
        }
    },

	removeUser: async function(username) {
		try {
			if((await dbNotifications.getNotificationCount(username)) > 0) {
				await dbNotifications.removeAllNotificationsFromUser(username);
			}
	
			connection.query(
				`
					DELETE FROM USERS
					WHERE username = ?;
				`
				, [username]
			);
	
		} catch (e) {
			if (e instanceof dbErrors.UserNotFound) {
				throw new dbErrors.UserNotFound();
			} else {
				throw new dbErrors.ProblemWithDB();
			}
		}
	},


	addFavorite: dbFavorite.addFavorite,
	clearFavorites: dbFavorite.clearFavorites,
	getFavorites: dbFavorite.getFavorites,
	removeFavorite: dbFavorite.removeFavorites,
	getNotificationCount: dbNotifications.getNotificationCount,
	receivedNotification: dbNotifications.receivedNotification,
	getUserNotifications: dbNotifications.getUserNotifications,
	addNotification: dbNotifications.addNotification,
	removeAllNotificationsFromUser: dbNotifications.removeAllNotificationsFromUser,
	removeNotificationFromID: dbNotifications.removeNotificationFromID,
	getNotificationFromID: dbNotifications.getNotificationFromID,
	getUserPendingNotifications: dbNotifications.getUserPendingNotifications,
	removeAllReceivedNotificationsFromUser: dbNotifications.removeAllReceivedNotificationsFromUser,
	UserAlreadyExists: dbErrors.UserAlreadyExists,
	ProblemWithDB: dbErrors.ProblemWithDB,
	UserNotFound: dbErrors.UserNotFound,
	IncorrectPassword: dbErrors.IncorrectPassword,
	BeachAlreadyFavorited: dbErrors.BeachAlreadyFavorited,
	BeachNotPresent: dbErrors.BeachNotPresent,
	ZeroNotifications: dbErrors.ZeroNotifications
};


