/**
 * This is for routing related to weather.
 */

const express = require('express');
const router = express.Router();

// Modules We Made
const auth = require("../auth/");
const db = require("../dbabs/");
const wrapper = require("../scripts/");

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

		// Need to change this to fetch favorite beaches from the
		// database using the username in payload. Currently, it returns
		// dummy values.

		res.status(200).json({
			message: 'Success.',
			favorites: ["AK103349",
				"AK103839",
				"NC810571",
				"WA171257",
				"NJ828093",
				"FL257350",
				"MA242910",
				"WA397523",
				"WA815475",
				"HI659533"]
		});
	} catch (err) {
		if (err instanceof auth.InvalidToken)
			res.status(500).json({ message: 'User authentication token absent or invalid.' });
		else
			res.status(500).json({ message: 'Undefined error.' });
	}
});

module.exports = router;
