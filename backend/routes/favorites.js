/**
 * This is for routing related to favorited beaches.
 */

const express = require('express');
const router = express.Router();

// Modules We Made
const auth = require("../auth/");
const db = require("../dbabs/");

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
		if (err instanceof auth.InvalidToken)
			res.status(500).json({ message: 'User authentication token absent or invalid.' });
		else
			res.status(500).json({ message: 'Undefined error.' });
	}
});

/**
 * Allows frontend to modify favorited beaches.
 */
router.post('/update_favorites', async function (req, res, next) {
	try {
		if (req.body.jwt === undefined || req.body.type === undefined
				|| (req.body.type !== 'clear'
				&& req.body.favorite === undefined)) {
			res.status(500).json({ message: 'Invalid request.' });
			return;
		}

		const username = auth.verifyJWT(req.body.jwt).username;

		if (req.body.type === 'clear')
			await db.clearFavorites(username);
		else if (req.body.type === 'add')
			await db.addFavorite(username, req.body.favorite);
		else if (req.body.type === 'remove')
			await db.removeFavorite(username, req.body.favorite);
		res.status(200).json({ message: 'Success.' });
	} catch (err) {
		if (err instanceof auth.InvalidToken)
			res.status(500).json({ message: 'User authentication token absent or invalid.' });
		else if (err instanceof db.ProblemWithDB)
			res.status(500).json({ message: 'Problem updating database.' });
		else if (err instanceof db.UserNotFound)
			res.status(500).json({ message: 'User not found.' });
		else if (err instanceof db.BeachAlreadyFavorited)
			res.status(500).json({ message: 'Beach is already in favorites.' });
		else if (err instanceof db.BeachNotPresent)
			res.status(500).json({ message: 'Attempted to remove beach not in favorites.' });
		else
			res.status(500).json({ message: 'Undefined error.' });
	}
});

module.exports = router;
