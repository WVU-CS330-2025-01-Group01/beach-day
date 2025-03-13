const express = require('express');

//const cookieParser = require('cookie-parser');
require('dotenv').config();

console.log(process.env)

const app = express();
const PORT = process.env.PORT || 3000;

// Allow cross origin responses
const cors = require('cors');
app.use(cors());

app.use(express.json());
//app.use(cookieParser());

const authRoutes = require('./routes/auth');
const backendRoutes = require('./routes');

app.use(authRoutes);
app.use(backendRoutes);

app.listen(PORT, () => {
  console.log(`Server started listening on port: ${PORT}`);
});
