/**
 * This is for routing related to authentication and account management.
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Modules We Made
const auth = require("../auth/");
const db = require("../dbabs/");
const errRes = require("../routes/error-responses");

/**
 * Registers a new user.
 */
router.post('/register', async function(req, res) {
	console.log("Register route accessed");
	const { username, password } = req.body;

	try {
		await db.attemptToMakeUser(username, password);
		res.status(201).json({ message: 'User registered successfully.' });
	} catch (err) {
		errRes.errorResLookup(res, err);
	}
});

/**
 * Logs in a user.
 * Verifies credentials, generates a JWT if valid, and sends it in an HTTP-only cookie.
 */
router.post('/login', async function(req, res) {
	console.log("Login route accessed");
	const { username, password } = req.body;

	try {
		await db.tryLogIn(username, password);

		const token = jwt.sign(
			{ username: username },
			process.env.BEACH_DAY_JWT_SECRET,
			{ expiresIn: '1h' }
		);

		// res.cookie('token', token, { httpOnly: true, sameSite: 'strict' });
		res.json({ message: 'Login successful.', jwt: token });
	} catch (err) {
		errRes.errorResLookup(res, err);
	}
});

/**
 * Updates a user's email
 */
router.post('/set_email', async function(req, res) {
	try {
		const payload = auth.verifyJWT(req.body.jwt);

		await db.setEmail(payload.username, req.body.email);

		res.json({ message: 'Success.', jwt: token });
	} catch (err) {
		errRes.errorResLookup(res, err);
	}
});

/**
 * Updates a user's password
 */
router.post('/set_password', async function(req, res) {
	try {
		const payload = auth.verifyJWT(req.body.jwt);

		await db.setPassword(payload.username, req.body.password);

		res.json({ message: 'Success.', jwt: token });
	} catch (err) {
		errRes.errorResLookup(res, err);
	}
});

module.exports = router;
