/**
 * This is for routing related to weather.
 */

const router = express.Router();

// Modules We Made
const db = require("../dbabs/");
const wrapper = require("../scripts/");

/**
 * Creates a route for getting weather data.
 */
router.post('/weather', (req, res) => {
	console.log("Weather route accessed");

	const reply = JSON.parse(wrapper.runScript("get weather", req));
	return res.status(200).json(reply);
});

module.exports = router;
