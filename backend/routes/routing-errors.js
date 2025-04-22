/**
 * Contains all the errors used by routing code.
 */

class InvalidRequest extends Error {}
class UserDoesntOwnNotification extends Error {}

module.exports = {
	InvalidRequest: InvalidRequest,
	UserDoesntOwnNotification: UserDoesntOwnNotification
};
