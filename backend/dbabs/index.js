const bcrypt = require('bcryptjs');
require('dotenv').config();
const mysql = require('mysql2');
const dbErrors = require('./db-errors');
const dbHelper = require('./generic-helpers');
const dbFavorite = require('./favorite-functions');
const dbNotifications = require('./notifications');
const connection = require('./database-connection');
const salt = 10;

async function setEmail (username, email) {
    try {
        const user = await dbHelper.getUserData(username);
        await connection.query(`UPDATE users SET email = ? WHERE username = ?`, [email, username]);
    } catch (e) {
        if (e instanceof dbErrors.UserNotFound) {
            throw new dbErrors.UserNotFound();
        } else {
            throw new dbErrors.ProblemWithDB();
        }
    }
}
async function setEmailTester(){

    const [rowsBefore] = await connection.query('SELECT * FROM users WHERE username = ?', ["testuser"]);
    //the 4 is just whichever user I was testing, your index won't match mine
    
    console.log(rowsBefore[0].email);
    
    await setEmail("testuser", "goofy2email@example.com");
    
    const [rowsAfter] = await connection.query(
    `SELECT * FROM users WHERE username = ?`, ['testuser']
    );
    
    console.log(rowsAfter[0].email);
    }
    setEmailTester();

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
			} else if(e instanceof dbErrors.IncorrectPassword){
				throw new dbErrors.IncorrectPassword();
			} else {
				throw new dbErrors.ProblemWithDB()
			}
		}

    },

	initDB: async function() {
		console.error("initDB is now called upon connection creation.  This message is only here until no longer called by app.js");
	},

	setEmail: async function (username, email) {
        try {
            const user = await getUserData(username);
            await connection.query(`UPDATE users SET email = ? WHERE username = ?;`, [email, username]);
        } catch (e) {
            if (e instanceof UserNotFound) {
                throw new UserNotFound();
            } else {
                throw new ProblemWithDB();
            }
        }
    },

	addFavorite: dbFavorite.addFavorite,
	clearFavorites: dbFavorite.clearFavorites,
	getFavorites: dbFavorite.getFavorites,
	removeFavorite: dbFavorite.removeFavorites,
	getNotificationCount: dbNotifications.getNotificationCount,
	UserAlreadyExists: dbErrors.UserAlreadyExists,
	ProblemWithDB: dbErrors.ProblemWithDB,
	UserNotFound: dbErrors.UserNotFound,
	IncorrectPassword: dbErrors.IncorrectPassword,
	BeachAlreadyFavorited: dbErrors.BeachAlreadyFavorited,
	BeachNotPresent: dbErrors.BeachNotPresent
};

