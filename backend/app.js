const express = require('express');

const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

const authRoutes = require('./routes/auth');
const backendRoutes = require('./routes');

app.use(backendRoutes);
app.use('/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server started listening on port: ${PORT}`);
});
