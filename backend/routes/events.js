/**
 * This is for routing related to events.
 */

const express = require('express');
const router = express.Router();

// Modules We Made
const auth = require("../auth/");
const db = require("../dbabs/");
const rterr = require("../routes/routing-errors");
const errRes = require("../routes/error-responses");

/**
 * Takes a username and event id as arguments. Returns true if the user own the
 * event corresponding to the id and false otherwise.
 */
async function userOwnsEvent(username, id) {
	const ev = await db.getEventFromID(id);
	return ev.username === username;
}

/**
 * This route adds an event.
 */
router.post('/add_event', async function(req, res, next) {
	try {
		const payload = auth.verifyJWT(req.body.jwt);

		await db.addEvent(req.body.time, req.body.title,
				req.body.beach_id, payload.username);

		res.status(200).json({ message: 'Success.' });
	} catch (err) {
		errRes.errorResLookup(res, err);
	}
});

/**
 * This route gets the number of events a user has.
 */
router.post('/count_events', async function(req, res, next) {
	try {
		const payload = auth.verifyJWT(req.body.jwt);

		const count = await db.getEventCount(payload.username);

		res.status(200).json({ message: 'Success.', count: count });
	} catch (err) {
		errRes.errorResLookup(res, err);
	}
});

/**
 * This route gets events.
 */
router.post('/get_events', async function(req, res, next) {
	try {
		const payload = auth.verifyJWT(req.body.jwt);

		let events;
		if (req.body.type === 'future') {
			events = await db.getUserFutureEvents(payload.username);
		} else if (req.body.type === 'all') {
			events = await db.getUserEvents(payload.username);
		} else if (req.body.type === 'by_id') {
			if (req.body.id === undefined || !await userOwnsEvent(
					payload.username, req.body.id))
				throw new rterr.UserDoesntOwnEvent();

			events = [ await db.getEventFromID(req.body.id) ];
		} else {
			throw new rterr.InvalidRequest();
		}

		res.status(200).json({ message: 'Success.', events: events });
	} catch (err) {
		errRes.errorResLookup(res, err);
	}
});

/**
 * This route removes notifications.
 */
router.post('/remove_events', async function(req, res, next) {
	try {
		const payload = auth.verifyJWT(req.body.jwt);

		if (req.body.type === 'all') {
			await db.removeAllEventsFromUser(payload.username);
		} else if (req.body.type === 'by_id') {
			if (req.body.id === undefined || !await userOwnsEvent(
					payload.username, req.body.id))
				throw new rterr.UserDoesntOwnEvent();

			await db.removeEventFromID(req.body.id);
		} else {
			throw new rterr.InvalidRequest();
		}

		res.status(200).json({ message: 'Success.' });
	} catch (err) {
		errRes.errorResLookup(res, err);
	}
});

module.exports = router;
