/**
 * This is for routing related to weather.
 */

const express = require('express');
const router = express.Router();

// Modules We Made
const wrapper = require("../data/");

/**
 * Creates a route for getting weather data.
 */
router.post('/weather', (req, res) => {
	console.log("Weather route accessed");

	const reply = JSON.parse(wrapper.runScript("get weather", JSON.stringify(req.body)));
	return res.status(200).json(reply);
});

module.exports = router;
