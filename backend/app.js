const express = require('express');
// const cookieParser = require('cookie-parser');

require('dotenv').config();

const app = express();
const PORT = process.env.BEACH_DAY_BACKEND_PORT || 3010;

// Allow cross origin responses
const cors = require('cors');
app.use(cors());

// Create/Update Conda and the Environment
const wrapper = require("./data/");
// wrapper.runScript("update conda");
wrapper.runScript("update conda env");

app.use(express.json());
// app.use(cookieParser());

const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/test');
const weatherRoutes = require('./routes/weather');

app.use(authRoutes);
app.use(testRoutes);
app.use(weatherRoutes);

app.listen(PORT, () => {
  console.log(`Server started listening on port: ${PORT}`);
});
