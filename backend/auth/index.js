// Error Declarations
class InvalidToken extends Error {}
const jwt = require('jsonwebtoken');

/**
 * This function takes the user's token as the only parameter. This token is
 * then checked against the BEACH_DAY_JWT_SECRET and expiration is verified. If
 * the token is expired, the verification fails, the token is undefined, or the
 * cookies are undefined, InvalidToken is thrown. Otherwise the payload of the
 * token is returned.
 */
function verifyJWT(token) {
	if (token === undefined)
		throw new InvalidToken();

	try {
		// Verify the token using the secret
		return jwt.verify(token, process.env.BEACH_DAY_JWT_SECRET);
	} catch (_) {
		throw new InvalidToken();
	}
};

module.exports = {
	verifyJWT: verifyJWT,
	InvalidToken: InvalidToken
};
