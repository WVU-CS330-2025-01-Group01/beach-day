const express = require('express');
const app = express();
const port = 8089;

// Calls the routes we have made
app.use(require("./routes"));

// Starts the server. Currently http only. Maybe we should look into https?
app.listen(port, () => {
    console.log(`Server started listening on port: ${port}`)
});
