const bcrypt = require('bcryptjs');
require('dotenv').config();
const mysql = require('mysql2');
const dbErrors = require('./db-errors');



const connection = mysql.createPool({
	host: process.env.BEACH_DAY_DB_HOST,
	user: process.env.BEACH_DAY_DB_USER,
	password: process.env.BEACH_DAY_DB_PASSWORD,
	database: process.env.BEACH_DAY_DB_NAME,
	port: process.env.BEACH_DAY_DB_PORT,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0
}).promise();

async function testDatabaseConnection() {
	let connect;
	try {
		connect = await connection.getConnection(); // Get a connection from the pool
	} catch (err) {
		console.error('Error connecting to the database:', err.message || err);
		throw err; // Exit if there’s an error, no need to release connection
	} finally {
		if (connect) {
			connect.release(); // Release the connection back to the pool
		}
	}
}

testDatabaseConnection();

async function getUserData(username) {

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
}

async function userExists(username) {

	try {

		const [user] = await connection.query(`SELECT * FROM users WHERE username = ?;`, [username]);

		if (user.length != 0) {
			return true;
		}

		return false;

	} catch (e) {
		//console.log(e);
		throw new dbErrors.ProblemWithDB();
	}
}


/*These are helper functions with initDB.  They are only used if needed, and are expected to ONLY be called by the developer.
* These means that they do not protect against SQL injection as it's impossible to run some of these queries without it.
* The code is written in a in a more hard defined manner as it's not meant to be variable. This is only a developer tool to check DBs.
* The function should entirely be deprecated once the DB is on the server.
* More functions can be added in the same fashion as the others.
*/


async function dropColumn(columnName) { 
	//just drops the column, no SQL Injection protection, only ran by initDB
	await connection.query(
		"ALTER TABLE users DROP COLUMN "+columnName+";"
	);
	//no error is caught either as that should be handled in initDB
}

async function getFieldAttributes(field, databaseName) {
	//no SQL Injection protection, only ran by initDB
	//no error is caught either as that should be handled in initDB
	const [attributes] = await connection.query(
		`
		SELECT * FROM information_schema.columns
		WHERE COLUMN_NAME = ? AND TABLE_SCHEMA = ?;
		`
	, [field, databaseName]);
	
	return attributes[0];
}

async function updateFields(fieldName, attributes, ordinalPos, varType, isNullAllowed, isAutoInc, colKey, def) {
	//no SQL Injection protection, only ran by initDB
	//no error is caught either as that should be handled in initDB
	if(attributes.ORDINAL_POSITION != ordinalPos) { console.error("Table ordered wrong, no conflicts should arise however."); }

	//This is a string that will be ran as a query. With the syntax of SQL, you can essentially build a command on top of old ones.
	//It can be quite strict, but this runs conditions whether the field needs new/updated attributes and finally runs that command.
	//Every condition just adds an extra relevant attribute to the query if ran
	let neededQuery = 'ALTER TABLE users MODIFY COLUMN '+fieldName+' '+varType;

	if(isNullAllowed && attributes.IS_NULLABLE === "NO") {
		neededQuery += ' NULL'
	} else if ((!isNullAllowed) && attributes.IS_NULLABLE !== "NO" && (colKey !== "PRI" && colKey !== "UNI")) {
		neededQuery += ' NOT NULL'
	}


	if(isAutoInc && attributes.EXTRA !== "auto_increment") { //these are joined because you cannot autoincrement and have a default value
		neededQuery += ' AUTO_INCREMENT';
	} else if(def !== "NO_DEFAULT") {
		let tempDefault = def;
		if(isNaN(parseInt(def)) && !(def.substring(0,1) === "(" && def.substring(def.length-1) === ")")) {tempDefault = '"' + def + '"'; }
		neededQuery += ' DEFAULT '+tempDefault;
	}

	await connection.query(neededQuery);
	
	//These are constraints, or more rather the important ones.  They can be added and dropped in a statement unlike the built query from above.
	//The order shouldn't entirely matter with how the code is written, but I believe this is better.
	//Primary is handled much differently, and less programatically.  This is due to the EXTREMELY strict behavior of Primary Keys (PK).
	//Thus, the only error should be if your ID still has the PK. We will NOT shift Primary Around as it should not be ever again.
	if(colKey === "PRI" && attributes.COLUMN_KEY !== "PRI") {

		const idAttributes = await getFieldAttributes("id", "authdb");
		if(idAttributes.COLUMN_KEY === "PRI") { 
			await connection.query(
				`
				ALTER TABLE users
				DROP PRIMARY KEY,
				MODIFY id INT NOT NULL UNIQUE,
				ADD PRIMARY KEY (username);
				`
			)
		} else {
			await connection.query(
				"ALTER TABLE users ADD PRIMARY KEY ("+fieldName+");"
			);//technically, this should only EVER apply to username.  That's why this case is more hardcoded.  It's purely on the chance you still have the original ID as Primary Key.
		}//Primary keys are extremely fickle, most likely they should NEVER change.  This is here for one case only.
	}

	if(colKey === "UNI" && attributes.COLUMN_KEY !== "UNI") {
		await connection.query(
			"ALTER TABLE users ADD UNIQUE ("+fieldName+");"
		);
	}
}

/**
 * Currently, doesn't do anything. Should test that the database is accessable
 * and enure, programmatically, that the table has the correct schemas and
 * columns or whatever. If anything goes wrong, it will throw ProblemWithDB and
 * provide details about what went wrong either in the form of a console.log or
 * by putting a string in the exception.
 */


function validateInputAlphaNumeric(input) {
    const regex = /^[a-zA-Z0-9_]*$/;
    return regex.test(input);
}

/**
 * Currently, userTable, tempAttemptToMakeUser(), and tempTryLogIn() are used to
 * demonstrate how the database functions should interact with the routing. They
 * are storing the usernames and password hashes to a map that is reset when the
 * server restarted. You need to implement functions that are called by the
 * exported attemptToMakeUser() and tryLogIn() that use the MySQL database. The
 * input and thrown exceptions are described below in the module.exports part.
 * Note: I am passing you unsanitized usernames and passwords. You need to
 * ensure that there is not SQL injection. You are also responsible for hashing
 * the passwords. I am using the synchronous hash and compare functions for
 * simplicity. Generally, asynchronous functions are preferred, but this app is
 * such small scale I don't think its necessary. I'll leave it up to you to
 * decide. Note that these two functions don't return anything, they only throw
 * exceptions. We will need to add functions for getting and setting user data
 * later when we decide what data we want to store. Another thing to consider,
 * the frontend currently does not place any restrictions on usernames, but if
 * we want to limit the characters that can be used in a uesrname, I think it
 * would be best if we put the check in this file and have an Error associated
 * with it. We can discuss that later. Same story for the password.
 */

async function printUser(username) {
	const test = await getUserData(username);
	console.log(test);
}

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

			if (await userExists(username)) {
				throw new dbErrors.UserAlreadyExists();
			}

			const hash = await bcrypt.hash(password, 10);

			await connection.query(`
			INSERT INTO
			users (username, password)
			VALUES 
			(?, ?);
			`,
				[username, hash]);


		} catch (e) {
			//console.log(e);
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
			const user = await getUserData(username);

			const password = await bcrypt.compare(enteredPassword, user.password);

			if (!password) {
				console.log("Wrong Password");
				throw new dbErrors.IncorrectPassword();
			}

			console.log("Password Works");
		} catch (e) {
			//console.log(e);
			if (e instanceof dbErrors.UserNotFound) {
				throw new dbErrors.UserNotFound();
			} else if(e instanceof dbErrors.IncorrectPassword){
				throw new dbErrors.IncorrectPassword();
			} else {
				throw new dbErrors.ProblemWithDB()
			}
		}

    },

	getFavorites: async function (username) {
		try {
			const [favoritesColumn] = await connection.query('SELECT favorite_beaches FROM users WHERE username = ?', [username]);
			if (favoritesColumn.length === 0) {
				throw new dbErrors.UserNotFound;
			}
			let userFavorite = favoritesColumn[0].favorite_beaches;

			if (userFavorite === "NULL_BEACH" || userFavorite.trim() === "") {
				return [];
			}
			return userFavorite.split(',').map(beach => beach.trim()).filter(beach => beach !== "");
		} catch (e) {

			if (e instanceof dbErrors.UserNotFound) {
				throw new dbErrors.UserNotFound();
			} else {
				throw new dbErrors.ProblemWithDB();
			}
		}
	},

	removeFavorites: async function (username, beach) {
		try {
			const user = await getUserData(username);

			if (!validateInputAlphaNumeric(beach)) {
				throw new dbErrors.ProblemWithDB();
			}

			if (user.favorite_beaches === "NULL_BEACH") {
				throw new dbErrors.BeachNotPresent();
			}
			let beaches = user.favorite_beaches.split(",");
			if (!beaches.includes(beach)) {
				throw new dbErrors.BeachNotPresent();
			}
			beaches = beaches.filter(beaches => beaches !== beach);
			if (beaches.length === 0) {
				beaches = ["NULL_BEACH"];
			}
			let CSVbeaches = beaches.join(",");
			await connection.query(
				`UPDATE users SET favorite_beaches = ? WHERE username = ?;`, [CSVbeaches, username]
			);
		} catch (e) {
			console.log(e);
			if (e instanceof dbErrors.UserNotFound) {
				throw new dbErrors.UserNotFound();
			} else if (e instanceof dbErrors.BeachNotPresent) {
				throw new dbErrors.BeachNotPresent();
			}
			else {
				throw new dbErrors.ProblemWithDB();
			}
		}
	},

	//If any of this can somehow be destructive to a db other than authdb/dbName, I will gladly sign the waver for Caden to be able to kill me.
	initDB: async function() {
		const dbName = "authdb"; //in case we don't standardize the name, this can be set to a param or process.env

	try {
			const [db] = await connection.query(`SHOW DATABASES LIKE ?;`, [dbName]);
			if(db == undefined) {
				console.error("Database Doesn't Exist");
				await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName};`); //THIS DOES NOT PROTECT AGAINST MYSQL INJECTION. Most of this doesn't.  Only a Developer should run initDB.
				await connection.query(
				`
				CREATE TABLE users (
				username VARCHAR(50) PRIMARY KEY,
				password VARCHAR(255) NOT NULL,
				email VARCHAR(50) UNIQUE,
				favorite_beaches VARCHAR(3000) DEFAULT "NULL_BEACH",
				timezone VARCHAR(3) DEFAULT "GMT",
				notifications_enabled TINYINT(1) NOT NULL DEFAULT 0,
				id INT NOT NULL UNIQUE AUTO_INCREMENT,
				register_date DATE DEFAULT (CURRENT_DATE())
				);
				`
			);
			return;

			} else {
			//Current Checks, DataBase Exists: Yes.  Next Check, Table Exists:Pending
			const [table] = await connection.query(
				`
				SELECT table_name
				FROM information_schema.tables
				WHERE table_schema = ?
				AND table_name = 'users';
				`
			, [dbName]);

			if(table == undefined) {
				console.error("users table does not exist");
				await connection.query(
					`
					CREATE TABLE users (
					username VARCHAR(50) PRIMARY KEY,
					password VARCHAR(255) NOT NULL,
					email VARCHAR(50) UNIQUE,
					favorite_beaches VARCHAR(3000) DEFAULT "NULL_BEACH",
					timezone VARCHAR(3) DEFAULT "GMT",
					notifications_enabled TINYINT(1) NOT NULL DEFAULT 0,
					id INT NOT NULL UNIQUE AUTO_INCREMENT,
					register_date DATE DEFAULT (CURRENT_DATE())
					);
					`
				);
				return;
				}
			} 
			//Current Checks, DataBase Exists: YES. Table Exists:YES.  Next Check: Every Field


			const usernameField = await getFieldAttributes("username", dbName); //all existing fields follow this pattern.  Grab the metadata
			if(usernameField == undefined) { //Check if column exists
				await connection.query( //if not, create it with all proper attributes
					`
					ALTER TABLE users
					ADD username VARCHAR(50) PRIMARY KEY;
					`
				)
			} else { //if it DOES exist, reinitialize the field with whatever needs to change.  If all attributes are correct, it will run a query that modifys/changes the current column's vartype to it's vartype, otherwise nothing changing.
				await updateFields("username", usernameField, 1, "varchar(50)", false, false, "PRI", "NO_DEFAULT");
			}
			//IF we have a table column we removed later and old tables might have it, we can check for it existing, and call the dropColumn(columnName)
			//There are currently none of those, so the function is unused.


			//the rest of the function follows the pattern above
			const passwordField = await getFieldAttributes("password", dbName);

			if(passwordField == undefined) {
				await connection.query(
					`
					ALTER TABLE users
					ADD password VARCHAR(255) NOT NULL;
					`
				)
			} else { 
				await updateFields("password", passwordField, 2, "varchar(255)", false, false, "NO_COLKEY", "NO_DEFAULT");
			}

			const emailField = await getFieldAttributes("email", dbName);

			if(emailField == undefined) {
				await connection.query(
					`
					ALTER TABLE users
					ADD email VARCHAR(50) UNIQUE;
					`
				);
			} else { 
				await updateFields("email", emailField, 3, "varchar(50)", false, false, "UNI", "NO_DEFAULT");
			}

			const favBeachField = await getFieldAttributes("favorite_beach", dbName);

			if(favBeachField !== undefined) {
				await connection.query(
					`
						ALTER TABLE users 
						RENAME COLUMN favorite_beach TO favorites_beaches;
					`
				);
			}


			const favBeachesField = await getFieldAttributes("favorite_beaches", dbName);

			if(favBeachesField == undefined) {
				await connection.query(
					`
					ALTER TABLE users
					ADD favorite_beaches VARCHAR(3000) DEFAULT "NULL_BEACH";
					`
				);
			} else {
				await updateFields("favorite_beaches", favBeachesField, 4, "varchar(3000)", true, false, "NO_COLKEY", "NULL_BEACH");
			}

			const timezoneField = await getFieldAttributes("timezone", dbName);

			if(timezoneField == undefined) {
				await connection.query(
					`
					ALTER TABLE users
					ADD timezone VARCHAR(3) DEFAULT "GMT";
					`
				);
			} else {
				await updateFields("timezone", timezoneField, 5, "varchar(3)", true, false, "NO_COLKEY", "GMT");
			}

			const notificationsField = await getFieldAttributes("notifications_enabled", dbName);

			if(notificationsField == undefined) {
				await connection.query(
					`
					ALTER TABLE users
					ADD notifications_enabled TINYINT(1) NOT NULL DEFAULT 0;
					`
				);
			} else {
				await updateFields("notifications_enabled", notificationsField, 6, "tinyint(1)", false, false, "NO_COLKEY", "0");
			}

			const idField = await getFieldAttributes("id", dbName);

			if(idField == undefined) {
				await connection.query(
					`
					ALTER TABLE users
					ADD id INT NOT NULL UNIQUE AUTO_INCREMENT;
					`
				);
			} else {
				await updateFields("id", idField, 7, "int", false, true, "NO_COLKEY", "NO_DEFAULT");
			}

			const registerField = await getFieldAttributes("register_date", dbName);

			if(registerField  == undefined) {
				await connection.query(
					`
					ALTER TABLE users
					ADD register_date DATE DEFAULT (CURRENT_DATE());
					`
				);
			} else {
				await updateFields("register_date", registerField, 8, "date", true, false, "NO_COLKEY", "(CURRENT_DATE())");
			}
		} catch (e) {
			//console.log(e);
			if(e instanceof dbErrors.UserNotFound) {
				throw new dbErrors.UserNotFound();
			} else if(e instanceof dbErrors.UserAlreadyExists){
				throw new dbErrors.UserAlreadyExists();
			} else {
				throw new dbErrors.ProblemWithDB()
			}
		} 
	},

	addFavorite: async function(username, beach) {
		try {
		
			const user = await getUserData(username);
	
			if(!validateInputAlphaNumeric(beach)) {
				throw new dbErrors.ProblemWithDB();
			}
	
			if (user.favorite_beaches === "NULL_BEACH") {
				await connection.query(
					`
					UPDATE users
					SET favorite_beaches = ?
					WHERE username = ?;
					`,
					[beach, username]
				);
				return;
			}
			let favBeachesArr = (user.favorite_beaches).split(",");
			let existsFlag = false;
	
			for(i = 0; i < favBeachesArr.length; i++) {
				if(favBeachesArr[i] === beach) {
					existsFlag = true;
					break;
				}
			}
	
			if(!existsFlag) {
				favBeachesArr.push(beach);
			} else {
				throw new dbErrors.BeachAlreadyFavorited();
			}
	
			let favBeachesStringCSV = favBeachesArr.join(",");
	
			await connection.query(
				`
				UPDATE users
				SET favorite_beaches = ?
				WHERE username = ?;
				`,
				[favBeachesStringCSV, username]
			);
	
				
	
		} catch (e) {
			console.log(e);
			if(e instanceof dbErrors.UserNotFound) {
				throw new dbErrors.UserNotFound();
			} else if (e instanceof dbErrors.BeachAlreadyFavorited) {
				throw new dbErrors.BeachAlreadyFavorited();
			} else {
				throw new dbErrors.ProblemWithDB()
			}
		} 
	},

	clearFavorites: async function(username) {
		try {
			if(!userExists) {
				throw new dbErrors.UserNotFound();
			}
	
		await connection.query(
			`
			UPDATE users
			SET favorite_beaches = "NULL_BEACH"
			WHERE username = ?;
			`,
			[username]
		);
		} catch (e) {
			//console.log(e);
			if(e instanceof dbErrors.UserNotFound) {
				throw new dbErrors.UserNotFound();
			} else {
				throw new dbErrors.ProblemWithDB()
			}
		} 
	},
	UserAlreadyExists: dbErrors.UserAlreadyExists,
	ProblemWithDB: dbErrors.ProblemWithDB,
	UserNotFound: dbErrors.UserNotFound,
	IncorrectPassword: dbErrors.IncorrectPassword,
	BeachAlreadyFavorited: dbErrors.BeachAlreadyFavorited,
	BeachNotPresent: dbErrors.BeachNotPresent
};

let favorites = new Set(["AK103349",
	"AK103839",
	"NC810571",
	"WA171257",
	"NJ828093",
	"FL257350",
	"MA242910",
	"WA397523",
	"WA815475",
	"HI659533"]);
function tempGetFavorites(username) {
	return favorites;
}
function tempAddFavorite(username, favorite) {
	favorites.add(favorite);
}
function tempRemoveFavorite(username, favorite) {
	favorites.delete(favorite);
}
function tempClearFavorites(username) {
	favorites.clear();
}


