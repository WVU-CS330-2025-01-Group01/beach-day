/** 
 * This class includes functions related to user handling 
 * and login credentials.
 * @author Ayden Jones, Bhavana Dakshinamoorthy, Austin Bird
 */

const bcrypt = require('bcryptjs');
require('dotenv').config();
const mysql = require('mysql2');
const dbErrors = require('./db-errors');
const dbHelper = require('./generic-helpers');
const dbFavorite = require('./favorite-functions');
const dbNotifications = require('./notifications');
const dbEvents = require('./events');
const connection = require('./database-connection');
const salt = 10;



module.exports = {
	/** 
	 * Creates a new user and inserts it into the database.
	 * 
	 * Checks to see if a user already exists or if there is a database issue.
	 * 
	 * @param {String} username Username added
	 * @param {String} password Password created by user
	 * @return nothing
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
	 * Allows user to login with their correct username and password.
	 * 
	 * Checks to see if the user does not exist and if the password is incorrect.
	 * 
	 * @param {String} username Username given by user
	 * @param {String} enteredPassword Password given by user
	 * @return nothing
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

	/** 
	 * Sets a given e-mail in the database.
	 * 
	 * Checks to see if the user does not exist and for issues in the database.
	 * 
	 * @param {String} username User's username
	 * @param {String} email Email added by user
	 * @return nothing
	 */
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

	/** 
	 * Sets a given password in the database.
	 * 
	 * Checks to see if a user already exists or if there is a database issue.
	 * 
	 * @param {String} username Username added
	 * @param {String} password Password created by user
	 * @return nothing
	 */
	setPassword: async function(username, password) {
		try {
			const hash = await bcrypt.hash(password, salt);
			await connection.query(`UPDATE users SET password = ? WHERE username = ?`, [hash, username]);
		} catch (e) {
			if (e instanceof dbErrors.UserNotFound) {
				throw new dbErrors.UserNotFound();
			} else {
				throw new dbErrors.ProblemWithDB();
			}
		}
	},

	/** 
	 * Looks for a user in the database to delete it.
	 * 
	 * Checks to see if a user already exists or if there is a database issue.
	 * 
	 * @param {String} username Username added
	 * @return nothing
	 */
	removeUser: async function(username) {
		try {
			//Foreign keys halt any dropping of primary key as long as it's used in another table, this clears the other tables
			if((await dbNotifications.getNotificationCount(username)) > 0) {
				await dbNotifications.removeAllNotificationsFromUser(username);
			}
			if((await dbEvents.getEventCount(username)) > 0) {
				await dbEvents.removeAllEventsFromUser(username);
			}
			
	
			await connection.query(
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

	/** 
	 * Returns user's email
	 * 
	 * Checks to see if the user does not exist, then grabs email
	 * 
	 * @param {String} username Username given by user
	 * @return email as string
	 */
	getEmail: async function (username) {
		try {
			const user = await dbHelper.getUserData(username);
	
			if(user.email === null) {
				return "null";
			}
	
			return user.email;
	
		} catch (e) {
			if (e instanceof dbErrors.UserNotFound) {
				throw new dbErrors.UserNotFound();
			} else {
				throw new dbErrors.ProblemWithDB();
			}
		}
	},

	// This file acts as a hub for the most basic functions, as well as every other function that communicates with the backend. This is to make routing simpler.
	addFavorite: dbFavorite.addFavorite, 
	clearFavorites: dbFavorite.clearFavorites,
	getFavorites: dbFavorite.getFavorites,
	removeFavorite: dbFavorite.removeFavorites,
	getUserData: dbHelper.getUserData,

	getNotificationCount: dbNotifications.getNotificationCount,
	receivedNotification: dbNotifications.receivedNotification,
	getUserNotifications: dbNotifications.getUserNotifications,
	addNotification: dbNotifications.addNotification,
	removeAllNotificationsFromUser: dbNotifications.removeAllNotificationsFromUser,
	removeNotificationFromID: dbNotifications.removeNotificationFromID,
	getNotificationFromID: dbNotifications.getNotificationFromID,
	getUserPendingNotifications: dbNotifications.getUserPendingNotifications,
	removeAllReceivedNotificationsFromUser: dbNotifications.removeAllReceivedNotificationsFromUser,

	getUserFutureEvents: dbEvents.getUserFutureEvents,
	getEventCount: dbEvents.getEventCount,
	removeAllEventsFromUser: dbEvents.removeAllEventsFromUser,
	clearPastEvents: dbEvents.clearPastEvents,
	getUserEvents: dbEvents.getUserEvents,
	getEventFromId: dbEvents.getEventFromID,
	removeEventFromID: dbEvents.removeEventFromID,
	
	UserAlreadyExists: dbErrors.UserAlreadyExists,
	ProblemWithDB: dbErrors.ProblemWithDB,
	UserNotFound: dbErrors.UserNotFound,
	IncorrectPassword: dbErrors.IncorrectPassword,
	BeachAlreadyFavorited: dbErrors.BeachAlreadyFavorited,
	BeachNotPresent: dbErrors.BeachNotPresent,
	ZeroNotifications: dbErrors.ZeroNotifications
};