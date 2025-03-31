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

	const reply = JSON.parse(wrapper.runScript("get weather", JSON.stringify(req.body)));
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

module.exports = router;
