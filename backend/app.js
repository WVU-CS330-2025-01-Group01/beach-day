// Setup Express
const express = require('express');
const app = express();
app.use(express.json());

// Get Backend Port from .env
require('dotenv').config();
const PORT = process.env.BEACH_DAY_BACKEND_PORT || 3010;

// Allow Cross Origin Responses
const cors = require('cors');
app.use(cors());

// Create/Update Conda and the Environment
const wrapper = require("./data/");
wrapper.runScript("update conda env");

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
app.listen(PORT, () => {
	console.log(`Server started listening on port: ${PORT}`);
});
