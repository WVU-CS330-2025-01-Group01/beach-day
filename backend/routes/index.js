const express = require('express');
const router = express.Router();

// Modules We Made
const wrapper = require("../scripts/");
const db = require("../dbabs/");

/* Prototypical routing code
router.get('/', (req, res, next) => {
	return res.status(200).json({ 
		message: 'Test test test' 
	});
});
*/

/**
 * Test route for testing stuff.
 */
router.get('/a', (req, res, next) => {
	return res.status(200).json({
		fuckinA: 455
	});
});

module.exports = router;
