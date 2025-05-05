// Setup Express
const express = require('express');
const app = express();
app.use(express.json());

// Add http and https
const http = require('http');
const https = require('https');

// Get Backend Port from .env
require('dotenv').config();

// Allow Cross Origin Responses
const cors = require('cors');
app.use(cors());

// Create/Update Conda and the Environment
const wrapper = require("./data/");
const AUTO_UPDATE_CONDA = process.env.AUTO_UPDATE_CONDA || 1;
if (AUTO_UPDATE_CONDA == 1) {
	wrapper.runScript("update conda env");
}

// Check for Events
const dbabs = require("./dbabs/");
const interval = process.env.BEACH_DAY_EVENT_INTERVAL || 7200000; // 2 hours
setInterval(async function() {
	await dbabs.clearPastEvents();

	const events = await dbabs.getAllEvents();
	for (const ev of events) {
		const response = JSON.parse(wrapper.runScript("get weather", JSON.stringify({
			request_type: "check_event",
			time: ev.event_time.getTime() / 1000,
			beach_id: ev.beach_id,
			event_name: ev.event_message,
			email_address: dbabs.getEmail(ev.username)
		})).toString());

		if (response.action === "notify")
			dbabs.addNotification(ev.username, response.title, response.message);
	}
}, interval);

// Add the Routes
const authRoutes = require('./routes/auth');
const weatherRoutes = require('./routes/weather');
const favoritesRoutes = require('./routes/favorites');
const notificationsRoutes = require('./routes/notifications');
app.use(authRoutes);
app.use(weatherRoutes);
app.use(favoritesRoutes);
app.use(notificationsRoutes);

// Start App
if (process.env.BEACH_DAY_SSL_KEY !== undefined &&
		process.env.BEACH_DAY_SSL_CERT !== undefined) {
	const credentials = {
		key: process.env.BEACH_DAY_SSL_KEY,
		cert: process.env.BEACH_DAY_SSL_CERT
	};
	const httpsServer = https.createServer(credentials, app);
	httpsServer.listen(process.env.BEACH_DAY_BACKEND_PORT_SECURE);
}

const httpServer = http.createServer(app);
httpServer.listen(process.env.BEACH_DAY_BACKEND_PORT);
