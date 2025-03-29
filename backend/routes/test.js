/**
 * This file is for routes used to test parts of the codebase.
 */

const express = require('express');
const router = express.Router();

// Modules We Made
const auth = require("../auth/");
const db = require("../dbabs/");
const wrapper = require("../data/");

/**
 * Test route for testing stuff.
 */
router.get('/example_route', (req, res, next) => {
	return res.status(200).json({
		test: 42
	});
});

/**
 * Auth test route.
 */
router.post('/auth_test', (req, res, next) => {
	try {
		const payload = auth.verifyJWT(req.body.jwt);
		console.log("User Payload: ", payload);
	} catch (err) {
		if (err instanceof auth.InvalidToken)
			res.status(500).json({ message: 'User authentication token absent or invalid.' });
		else
			res.status(500).json({ message: 'Undefined error.' });
	}
});

/**
 * Test the get_weather.py script and the runScript() function.
 */
router.get('/weather_test', (req, res, next) => {
	const request = JSON.stringify({
		request_type: "current_basic_weather",
		zip_code: 25213,
		country_code: "US"
	});
	const reply = JSON.parse(wrapper.runScript("get weather", request));
	return res.status(200).json(reply);
});

module.exports = router;
