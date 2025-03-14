/**
 * This is for routing related to authentication and account management.
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const pool = require('../config/database'); // Note: Using ../config since auth.js is in the routes folder
const router = express.Router();

// Modules We Made
const db = require("../dbabs/");

/**
 * Registers a new user.
 */
router.post('/register', (req, res) => {
	console.log("Register route accessed");
	const { username, password } = req.body;

	try {
		db.attemptToMakeUser(username, password);
		res.status(201).json({ message: 'User registered successfully.' });
	} catch (err) {
		if (err instanceof db.UserAlreadyExists)
			res.status(500).json({ message: 'This user already exists.' });
		else if (err instanceof db.ProblemWithDB)
			res.status(500).json({ message: 'Trouble accessing database.' });
		else
			res.status(500).json({ message: 'Undefined error.' });
	}
});

/**
 * Logs in a user.
 * Verifies credentials, generates a JWT if valid, and sends it in an HTTP-only cookie.
 */
router.post('/login', (req, res) => {
	console.log("Login route accessed");
	const { username, password } = req.body;

	try {
		db.tryLogIn(username, password);

		const token = jwt.sign(
			{ username: username },
			process.env.BEACH_DAY_JWT_SECRET,
			{ expiresIn: '1h' }
		);

		res.cookie('token', token, { httpOnly: true, sameSite: 'strict' });
		res.json({ message: 'Login successful.' });
	} catch (err) {
		if (err instanceof db.UserNotFound)
			res.status(500).json({ message: 'This user does not exist.' });
		else if (err instanceof db.IncorrectPassword)
			res.status(500).json({ message: 'Password is incorrect.' });
		else if (err instanceof db.ProblemWithDB)
			res.status(500).json({ message: 'Trouble accessing database.' });
		else
			res.status(500).json({ message: 'Undefined error.' });
	}
});

module.exports = router;
