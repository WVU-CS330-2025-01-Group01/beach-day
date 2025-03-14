// Error Declarations
class InvalidToken extends Error {}

/**
 * This function takes the users cookies and accesses the token. This token is
 * then checked against the BEACH_DAY_JWT_SECRET and expiration is verified. If
 * the token is expired, the verification fails, the token is undefined, or the
 * cookies are undefined, InvalidToken is thrown. Otherwise the payload of the
 * token is returned.
 */
function verifyJWT(cookies) {
	if (cookies === undefined)
		throw new InvalidToken();

	if (cookies.token === undefined)
		throw new InvalidToken();

	try {
		// Verify the token using the secret
		return jwt.verify(cookies.token, process.env.BEACH_DAY_JWT_SECRET);
	} catch (_) {
		throw new InvalidToken();
	}
};

module.exports = {
	verifyJWT: verifyJWT,
	InvalidToken: InvalidToken
};
