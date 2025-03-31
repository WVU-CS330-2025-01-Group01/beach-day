/**
 * This is for routing related to weather.
 */

const express = require('express');
const router = express.Router();

// Modules We Made
const auth = require("../auth/");
const db = require("../dbabs/");
const wrapper = require("../data/");

/**
 * Creates a route for getting weather data.
 */
router.post('/weather', (req, res) => {
	console.log("Weather route accessed");

	const reply = JSON.parse(wrapper.runScript("get weather", req));
	return res.status(200).json(reply);
});

/**
 * Returns a list of a users favorite beaches.
 */
router.post('/favorites', (req, res, next) => {
	try {
		const payload = auth.verifyJWT(req.body.jwt);

		console.log("User Payload: ", payload);

		const favorites = Array.from(db.getFavorites(payload.username).keys());

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
router.post('/update_favorites', (req, res, next) => {
	try {
		if (req.body.jwt === undefined || req.body.type === undefined
				|| (req.body.type !== 'clear'
				&& req.body.favorite === undefined)) {
			res.status(500).json({ message: 'Invalid request.' });
			return;
		}

		const username = auth.verifyJWT(req.body.jwt).username;

		if (req.type === 'clear')
			db.clearFavorites(username);
		else if (req.type === 'add')
			db.addFavorite(username, req.body.favorite);
		else if (req.type === 'remove')
			db.removeFavorite(username, req.body.favorite);
		res.status(200).json({ message: 'Success.' });
	} catch (err) {
		if (err instanceof auth.InvalidToken)
			res.status(500).json({ message: 'User authentication token absent or invalid.' });
		else if (err instanceof db.ProblemWithDB)
			res.status(500).json({ message: 'Problem updating database.' });
		else if (err instanceof db.UserNotFound)
			res.status(500).json({ message: 'User not found.' });
		else
			res.status(500).json({ message: 'Undefined error.' });
	}
});

module.exports = router;
