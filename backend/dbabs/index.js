const bcrypt = require('bcryptjs');
require('dotenv').config();
const mysql = require('mysql2');

// Error declarations
class UserAlreadyExists extends Error { }
class ProblemWithDB extends Error { }
class UserNotFound extends Error { }
class IncorrectPassword extends Error { }
class BeachNotPresent extends Error { }


console.log(process.env.BEACH_DAY_DB_NAME);
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
			throw new UserNotFound();
		}
		return user[0];
	} catch (e) {
		//console.log(e);
		if (e instanceof UserNotFound) {
			throw new UserNotFound();
		} else {
			throw new ProblemWithDB()
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
		throw new ProblemWithDB();
	}
}


async function printUser(username) {
	const test = await getUserData(username);
	console.log(test);
}


function validateInputAlphaNumeric(input) { //This is used in removeFavorites()
	const regex = /^[a-zA-Z0-9_]*$/;
	return regex.test(input);
}


async function removeFavorites(username, beach) {
	try {
		const user = await getUserData(username);

		if (!validateInputAlphaNumeric(beach)) {
			console.log("That input ain't right dawg");
			throw new ProblemWithDB();
		}

		if (user.favorite_beaches === "NULL_BEACH") {
			console.log("No beach found")
			throw new BeachNotPresent();
		}
		let beaches = user.favorite_beaches.split(",");
		if (!beaches.includes(beach)) {
			throw new BeachNotPresent();
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
		if (e instanceof UserNotFound) {
			throw new UserNotFound();
		} else if (e instanceof BeachNotPresent) {
			throw new BeachNotPresent();
		}
		else {
			throw new ProblemWithDB();
		}
	}
}

async function getFavorites(username) {
	try {
		const [favoritesColumn] = await connection.query('SELECT favorite_beaches FROM users WHERE username = ?', [username]);
		if (favoritesColumn.length === 0) {
			throw new UserNotFound; //Throws error if there is no user favorite.
		}
		let userFavorite = favoritesColumn[0].favorite_beaches;

		if (userFavorite === "NULL_BEACH" || userFavorite.trim() === "") { //Checks for whether userFavorite is null/empty
			return []; //Returns an empty array
		}
		return userFavorite.split(',').map(beach => beach.trim()).filter(beach => beach !== ""); //Returns an array with strings that are
	} catch (e) {
		console.log(e);
		if (e instanceof UserNotFound) {
			throw new UserNotFound();
		} else {
			throw new ProblemWithDB();
		}
	}
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
				throw new UserAlreadyExists();
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
			if (e instanceof UserAlreadyExists) {
				throw new UserAlreadyExists();
			} else {
				throw new ProblemWithDB()
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
				throw new IncorrectPassword();
			}

			console.log("Password Works");


		} catch (e) {
			if (e instanceof UserNotFound) {
				throw new UserNotFound();
			} else if (e instanceof IncorrectPassword) {
				console.log("Pass Error Throw");
				throw new IncorrectPassword();
			} else {
				throw new ProblemWithDB()
			}
		}
	},

	getFavorites: async function (username) {
		try {
			const [favoritesColumn] = await connection.query('SELECT favorite_beaches FROM users WHERE username = ?', [username]);
			if (favoritesColumn.length === 0) {
				throw new UserNotFound;
			}
			let userFavorite = favoritesColumn[0].favorite_beaches;

			if (userFavorite === "NULL_BEACH" || userFavorite.trim() === "") {
				return [];
			}
			return userFavorite.split(',').map(beach => beach.trim()).filter(beach => beach !== "");
		} catch (e) {

			if (e instanceof UserNotFound) {
				throw new UserNotFound();
			} else {
				throw new ProblemWithDB();
			}
		}
	},

	removeFavorites: async function (username, beach) {
		try {
			const user = await getUserData(username);

			if (!validateInputAlphaNumeric(beach)) {
				console.log("That input ain't right dawg");
				throw new ProblemWithDB();
			}

			if (user.favorite_beaches === "NULL_BEACH") {
				console.log("No beach found")
				throw new BeachNotPresent();
			}
			let beaches = user.favorite_beaches.split(",");
			if (!beaches.includes(beach)) {
				throw new BeachNotPresent();
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
			if (e instanceof UserNotFound) {
				throw new UserNotFound();
			} else if (e instanceof BeachNotPresent) {
				throw new BeachNotPresent();
			}
			else {
				throw new ProblemWithDB();
			}
		}
	},

	initDB: tempInitDB,
	getFavorites: tempGetFavorites,
	addFavorite: tempAddFavorite,
	removeFavorite: tempRemoveFavorite,
	clearFavorites: tempClearFavorites,
	UserAlreadyExists: UserAlreadyExists,
	ProblemWithDB: ProblemWithDB,
	UserNotFound: UserNotFound,
	IncorrectPassword: IncorrectPassword,
	BeachNotPresent: BeachNotPresent,
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


