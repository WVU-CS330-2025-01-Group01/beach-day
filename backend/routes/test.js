/**
 * This file is for routes used to test parts of the codebase.
 */

const express = require('express');
const router = express.Router();

// Modules We Made
const auth = require("../auth/");
const db = require("../dbabs/");
const wrapper = require("../scripts/");

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

module.exports = router;
