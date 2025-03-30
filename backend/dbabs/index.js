const bcrypt = require('bcryptjs');

// Error declarations
class UserAlreadyExists extends Error {}
class ProblemWithDB extends Error {}
class UserNotFound extends Error {}
class IncorrectPassword extends Error {}

/**
 * Currently, doesn't do anything. Should test that the database is accessable
 * and enure, programmatically, that the table has the correct schemas and
 * columns or whatever. If anything goes wrong, it will throw ProblemWithDB and
 * provide details about what went wrong either in the form of a console.log or
 * by putting a string in the exception.
 */
function tempInitDB() {}

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
let userTable = new Map();
function tempAttemptToMakeUser(username, password) {
	console.log(`Register Request\nUsername: ${username}\nPassword: ${password}\n`);
	if (userTable.has(username))
		throw new UserAlreadyExists();
	let hash = bcrypt.hashSync(password, 10);
	userTable.set(username, hash);
}
function tempTryLogIn(username, password) {
	console.log(`Login Request\nUsername: ${username}\nPassword: ${password}\n`);
	if (userTable.get(username) === undefined)
		throw new UserNotFound();
	if (!bcrypt.compareSync(password, userTable.get(username)))
		throw new IncorrectPassword();
}

/**
 * Currently, these are temporary functions for accessing/modifying the favorite
 * beaches of a user. Authentication is done by calling code, so you can assume
 * that the user is logged in. All functions can throw ProblemWithDB or
 * UserNotFound.
 */
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

module.exports = {
	initDB: tempInitDB,
	attemptToMakeUser: tempAttemptToMakeUser,
	tryLogIn: tempTryLogIn,
	getFavorites: tempGetFavorites,
	addFavorite: tempAddFavorite,
	removeFavorite: tempRemoveFavorite,
	clearFavorites: tempClearFavorites,
	UserAlreadyExists: UserAlreadyExists,
	ProblemWithDB: ProblemWithDB,
	UserNotFound: UserNotFound,
	IncorrectPassword: IncorrectPassword
};
