/**
 * This is for routing related to favorited beaches.
 */

const express = require('express');
const router = express.Router();

// Modules We Made
const auth = require("../auth/");
const db = require("../dbabs/");
const rterr = require("../routes/routing-errors");
const errRes = require("../routes/error-responses");

/**
 * Returns a list of a users favorite beaches.
 */
router.post('/favorites', async function(req, res, next) {
	try {
		const payload = auth.verifyJWT(req.body.jwt);

		console.log("User Payload: ", payload);

		const favorites = await db.getFavorites(payload.username);

		res.status(200).json({
			message: 'Success.',
			favorites: favorites,
		});
	} catch (err) {
		errRes.errorResLookup(res, err);
	}
});

/**
 * Allows frontend to modify favorited beaches.
 */
router.post('/update_favorites', async function (req, res, next) {
	try {
		if (req.body.jwt === undefined || req.body.type === undefined
				|| (req.body.type !== 'clear'
				&& req.body.favorite === undefined))
			throw new rterr.InvalidRequest();

		const username = auth.verifyJWT(req.body.jwt).username;

		if (req.body.type === 'clear')
			await db.clearFavorites(username);
		else if (req.body.type === 'add')
			await db.addFavorite(username, req.body.favorite);
		else if (req.body.type === 'remove')
			await db.removeFavorite(username, req.body.favorite);
		res.status(200).json({ message: 'Success.' });
	} catch (err) {
		errRes.errorResLookup(res, err);
	}
});

module.exports = router;
