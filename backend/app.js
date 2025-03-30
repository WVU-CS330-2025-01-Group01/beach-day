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

// Initialize Database
const db = require("./dbabs/");
db.initDB();

// Add the Routes
const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/test');
const weatherRoutes = require('./routes/weather');
app.use(authRoutes);
app.use(testRoutes);
app.use(weatherRoutes);

// Start App
app.listen(PORT, () => {
  console.log(`Server started listening on port: ${PORT}`);
});
