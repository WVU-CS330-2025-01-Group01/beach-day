const bcrypt = require('bcryptjs');

// Error declarations
class UserAlreadyExists extends Error {}
class ProblemWithDB extends Error {}
class UserNotFound extends Error {}
class IncorrectPassword extends Error {}

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

module.exports = {
	/**
	 * This function takes in an unsanitized username and password. If the
	 * user already exists, it throws UserAlreadyExists. If there is a
	 * problem adding the user to the database, it throws ProblemWithDB. If
	 * the user is successfully added to the database, no exceptions are to
	 * be thrown. Nothing is ever returned by this function.
	 */
	attemptToMakeUser: function(username, password) {
		tempAttemptToMakeUser(username, password);
	},
	/**
	 * This function takes in an unsanitized username and password. If the
	 * user does not exist, it throws UserNotFound. If there is a problem
	 * with the database, it throws ProblemWithDB. If the password is
	 * incorrect, it throws IncorrectPassword. If the username exists and
	 * the password is the correct password for that user, no exceptions are
	 * to be thrown. Nothing is ever returned by this function.
	 */
	tryLogIn: function(username, password) {
		tempTryLogIn(username, password);
	},
	/**
	 * Export all the errors that can be thrown by the exported functions.
	 */
	UserAlreadyExists: UserAlreadyExists,
	ProblemWithDB: ProblemWithDB,
	UserNotFound: UserNotFound,
	IncorrectPassword: IncorrectPassword
};
