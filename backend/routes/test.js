/**
 * This file is for routes used to test parts of the codebase.
 */

const express = require('express');
const router = express.Router();

// Modules We Made
const auth = require("../auth/");
const db = require("../dbabs/");
const wrapper = require("../data/");

/* Prototypical routing code
router.get('/', (req, res, next) => {
	return res.status(200).json({ 
		message: 'Test test test' 
	});
});
*/

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
router.get('/auth_test', (req, res, next) => {
	console.log("Auth Test Called");

	try {
		let payload = auth.verifyJWT(req.cookies);
		console.log("Auth payload: " + payload);
	} catch (err) {
		console.log("Auth verify error");
	}

	return res.status(200).json({
		test: 45
	});
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
