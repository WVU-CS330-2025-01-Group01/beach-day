const bcrypt = require('bcryptjs');
require('dotenv').config();
const mysql = require('mysql2');
const dbErrors = require('./db-errors');
const dbHelper = require('./generic-helpers');
const connection = require('./database-connection');

module.exports = {
    getFavorites: async function (username) {
		try {
			const [favoritesColumn] = await connection.query('SELECT favorite_beaches FROM users WHERE username = ?', [username]);
			if (favoritesColumn.length === 0) {
				throw new dbErrors.UserNotFound;
			}
			let userFavorite = favoritesColumn[0].favorite_beaches; // Due to how queries work, even with only one row, it will return an array, so we must access the 0th element.  It returns an object, so we can call the key.

			if (userFavorite === "NULL_BEACH" || userFavorite.trim() === "") { // As a required placeholder, we are using 'NULL_BEACH' as no beach should have this name.
				return [];
			}
			return userFavorite.split(',').map(beach => beach.trim()).filter(beach => beach !== "");
		} catch (e) {
			if (e instanceof dbErrors.UserNotFound) {
				throw new dbErrors.UserNotFound();
			} else {
				throw new dbErrors.ProblemWithDB();
			}
		}
	},

	removeFavorites: async function (username, beach) {
		try {
			const user = await dbHelper.getUserData(username);

			if (user.favorite_beaches === "NULL_BEACH") { // These are guard conditions in order. We must check if they have the placeholder, meaning no beaches.  Check for if the request beach exists. And finally if removing it would set it back to it's placeholder.
				throw new dbErrors.BeachNotPresent();
			}
			let beaches = user.favorite_beaches.split(",");
			if (!beaches.includes(beach)) {
				throw new dbErrors.BeachNotPresent();
			}
			beaches = beaches.filter(beaches => beaches !== beach);
			if (beaches.length === 0) {
				beaches = ["NULL_BEACH"];
			}
			let CSVbeaches = beaches.join(","); // These favorites beaches are being stored in a CSV format, so we are creating a string to match the format to shove into the table/
			await connection.query(
				`UPDATE users SET favorite_beaches = ? WHERE username = ?;`, [CSVbeaches, username]
			);
		} catch (e) {

			if (e instanceof dbErrors.UserNotFound) {
				throw new dbErrors.UserNotFound();
			} else if (e instanceof dbErrors.BeachNotPresent) {
				throw new dbErrors.BeachNotPresent();
			}
			else {
				throw new dbErrors.ProblemWithDB();
			}
		}
	},

    addFavorite: async function(username, beach) {
		try {
		
			const user = await dbHelper.getUserData(username);
	
			if (user.favorite_beaches === "NULL_BEACH") { // This is a simple case if they have no prior beaches. Just set their field to the new one.
				await connection.query(
					`
					UPDATE users
					SET favorite_beaches = ?
					WHERE username = ?;
					`,
					[beach, username]
				);
				return;
			}
			let favBeachesArr = (user.favorite_beaches).split(","); // If the condition above it not applicable, we decode the CSV string containing multiple beaches.
			let existsFlag = false;
	
			for(i = 0; i < favBeachesArr.length; i++) { // We loop through all the beaches and if the existing beach is ever found, we throw an error.
				if(favBeachesArr[i] === beach) {
					existsFlag = true;
					break;
				}
			}
	
			if(!existsFlag) {
				favBeachesArr.push(beach); // If there was no error throw, the beach is valid, and we add it to an array.
			} else {
				throw new dbErrors.BeachAlreadyFavorited();
			}
	
			let favBeachesStringCSV = favBeachesArr.join(","); // The array is joined and then can be set as the new field value.
	
			await connection.query(
				`
				UPDATE users
				SET favorite_beaches = ?
				WHERE username = ?;
				`,
				[favBeachesStringCSV, username]
			);
	
				
	
		} catch (e) {
			if(e instanceof dbErrors.UserNotFound) {
				throw new dbErrors.UserNotFound();
			} else if (e instanceof dbErrors.BeachAlreadyFavorited) {
				throw new dbErrors.BeachAlreadyFavorited();
			} else {
				throw new dbErrors.ProblemWithDB()
			}
		} 
	},

	clearFavorites: async function(username) {
		try {
			if(!(await dbHelper.userExists(username))) {
				throw new dbErrors.UserNotFound();
			}
	
		await connection.query(
			`
			UPDATE users
			SET favorite_beaches = "NULL_BEACH"
			WHERE username = ?;
			`,
			[username]
		); // This query is simple as we have a placeholder value for no beaches, so all this does is set the value to the placeholder.
		} catch (e) {
			if(e instanceof dbErrors.UserNotFound) {
				throw new dbErrors.UserNotFound();
			} else {
				throw new dbErrors.ProblemWithDB()
			}
		} 
	},

}