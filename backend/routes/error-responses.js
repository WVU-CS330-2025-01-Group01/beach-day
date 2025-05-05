/**
 * Contains all the responses for all the errors.
 */

const ERR_CODE = 500;

// Modules We Made
const auth = require("../auth/");
const db = require("../dbabs/");
const rterr = require("../routes/routing-errors");

module.exports = {
	/**
	 * Takes in an express response and an error as arugments. Sets the
	 * return code to ERR_CODE and sets the return value of res to a json
	 * object containing the message field with an appropriate error
	 * message.
	 */
	errorResLookup: function(res, err) {
		// Login/Registration Errors
		if (err instanceof db.UserAlreadyExists)
			res.status(ERR_CODE).json({ message: 'This user already exists.' });
		else if (err instanceof db.UserNotFound)
			res.status(ERR_CODE).json({ message: 'This user does not exist.' });
		else if (err instanceof db.IncorrectPassword)
			res.status(ERR_CODE).json({ message: 'Password is incorrect.' });

		// Authentication Errors
		else if (err instanceof auth.InvalidToken)
			res.status(ERR_CODE).json({ message: 'User authentication token absent or invalid.' });

		// Favorited Beaches Errors
		else if (err instanceof db.BeachAlreadyFavorited)
			res.status(ERR_CODE).json({ message: 'Beach is already in favorites.' });
		else if (err instanceof db.BeachNotPresent)
			res.status(ERR_CODE).json({ message: 'Attempted to remove beach not in favorites.' });

		// Notification Errors
		else if (err instanceof db.ZeroNotifications)
			res.status(ERR_CODE).json({ message: 'No notifications of specified type.' });
		else if (err instanceof rterr.UserDoesntOwnNotification)
			res.status(ERR_CODE).json({ message: 'User does not own this notification.' });

		// Event Errors
		else if (err instanceof rterr.UserDoesntOwnEvent)
			res.status(ERR_CODE).json({ message: 'User does not own this event.' });

		// General Errors
		else if (err instanceof rterr.InvalidRequest)
			res.status(ERR_CODE).json({ message: 'Invalid request.' });
		else if (err instanceof db.ProblemWithDB)
			res.status(ERR_CODE).json({ message: 'Trouble accessing database.' });
		else
			res.status(ERR_CODE).json({ message: 'Undefined error.' });
	}
};
