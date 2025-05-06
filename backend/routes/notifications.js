/**
 * This is for routing related to notifications.
 */

const express = require('express');
const router = express.Router();

// Modules We Made
const auth = require("../auth/");
const db = require("../dbabs/");
const rterr = require("../routes/routing-errors");
const errRes = require("../routes/error-responses");

/**
 * Takes a username and notification id as arguments. Returns true if the user
 * owns the notification corresponding to the id and false otherwise.
 */
async function userOwnsNotification(username, id) {
	const notification = await db.getNotificationFromID(id);
	return notification.username === username;
}

/**
 * This route adds a notification. Details in the docs/routing.md file.
 */
router.post('/add_notification', async function(req, res, next) {
	try {
		// Authenticate the user.
		const payload = auth.verifyJWT(req.body.jwt);

		await db.addNotification(payload.username, req.body.title, req.body.message);

		res.status(200).json({ message: 'Success.' });
	} catch (err) {
		errRes.errorResLookup(res, err);
	}
});

/**
 * This route gets the number of notifications a user has. Details in the
 * docs/routing.md file.
 */
router.post('/count_notifications', async function(req, res, next) {
	try {
		// Authenticate the user.
		const payload = auth.verifyJWT(req.body.jwt);

		const count = await db.getNotificationCount(payload.username);

		res.status(200).json({ message: 'Success.', count: count });
	} catch (err) {
		errRes.errorResLookup(res, err);
	}
});

/**
 * This route marks a notification as received. Details in the docs/routing.md
 * file.
 */
router.post('/receive_notification', async function(req, res, next) {
	try {
		// Authenticate the user.
		const payload = auth.verifyJWT(req.body.jwt);

		// Check if user owns notification.
		if (req.body.id === undefined || !await userOwnsNotification(
				payload.username, req.body.id))
			throw new rterr.UserDoesntOwnNotification();

		await db.receivedNotification(payload.username, req.body.id);

		res.status(200).json({ message: 'Success.' });
	} catch (err) {
		errRes.errorResLookup(res, err);
	}
});

/**
 * This route gets notifications. Details in the docs/routing.md file.
 */
router.post('/get_notifications', async function(req, res, next) {
	try {
		// Authenticate the user.
		const payload = auth.verifyJWT(req.body.jwt);

		let notifications;
		// Call appropriate database function for each request.
		if (req.body.type === 'pending') {
			notifications = await db.getUserPendingNotifications(payload.username);
		} else if (req.body.type === 'all') {
			notifications = await db.getUserNotifications(payload.username);
		} else if (req.body.type === 'by_id') {
			// Check if user owns notification.
			if (req.body.id === undefined || !await userOwnsNotification(
					payload.username, req.body.id))
				throw new rterr.UserDoesntOwnNotification();

			notifications = [ await db.getNotificationFromID(req.body.id) ];
		} else {
			throw new rterr.InvalidRequest();
		}

		res.status(200).json({ message: 'Success.', notifications: notifications });
	} catch (err) {
		errRes.errorResLookup(res, err);
	}
});

/**
 * This route removes notifications. Details in the docs/routing.md file.
 */
router.post('/remove_notifications', async function(req, res, next) {
	try {
		// Authenticate the user.
		const payload = auth.verifyJWT(req.body.jwt);

		// Call appropriate database function for each request.
		if (req.body.type === 'received') {
			await db.removeAllReceivedNotificationsFromUser(payload.username);
		} else if (req.body.type === 'all') {
			await db.removeAllNotificationsFromUser(payload.username);
		} else if (req.body.type === 'by_id') {
			// Check if user owns notification.
			if (req.body.id === undefined || !await userOwnsNotification(
					payload.username, req.body.id))
				throw new rterr.UserDoesntOwnNotification();

			await db.removeNotificationFromID(req.body.id);
		} else {
			throw new rterr.InvalidRequest();
		}

		res.status(200).json({ message: 'Success.' });
	} catch (err) {
		errRes.errorResLookup(res, err);
	}
});

module.exports = router;
