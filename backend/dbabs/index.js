const bcrypt = require('bcryptjs');
require('dotenv').config();
const mysql = require('mysql2');

// Error declarations
class UserAlreadyExists extends Error {}
class ProblemWithDB extends Error {}
class UserNotFound extends Error {}
class IncorrectPassword extends Error {}
class BeachNotPresent extends Error {}


console.log(process.env.BEACH_DAY_DB_NAME);
const connection = mysql.createPool({
	host: process.env.BEACH_DAY_DB_HOST,    
	user: process.env.BEACH_DAY_DB_USER,    
	password: process.env.BEACH_DAY_DB_PASSWORD,
	database: process.env.BEACH_DAY_DB_NAME,
	port: process.env.BEACH_DAY_DB_PORT,
	waitForConnections: true,
  	connectionLimit: 10,
  	queueLimit: 0
}).promise();

async function testDatabaseConnection() {
    let connect;
    try {
      connect = await connection.getConnection(); // Get a connection from the pool
    } catch (err) {
      console.error('Error connecting to the database:', err.message || err);
      throw err; // Exit if there’s an error, no need to release connection
    } finally {
      if (connect) {
        connect.release(); // Release the connection back to the pool
      }
    }
  }
  
  testDatabaseConnection();

async function getUserData(username) {

	try {

		const [user] = await connection.query(`SELECT * FROM users WHERE username = ?;`, [username]);

		if(user.length == 0) {
					//errorCode = "UserNotFound"
					throw new UserNotFound();
				}
		return user[0];



	} catch (e) {
		//console.log(e);
		if(e instanceof UserNotFound) {
			throw new UserNotFound();
		} else {
			throw new ProblemWithDB()
		}
	}
}

async function userExists(username) {

    try {

        const [user] = await connection.query(`SELECT * FROM users WHERE username = ?;`, [username]);

        if (user.length != 0) {
            return true;
        }

        return false;

    } catch (e) {
        //console.log(e);
        throw new ProblemWithDB();
    }
}


async function printUser(username) {
	const test = await getUserData(username);
	console.log(test);
}

/**
 * Currently, doesn't do anything. Should test that the database is accessable
 * and enure, programmatically, that the table has the correct schemas and
 * columns or whatever. If anything goes wrong, it will throw ProblemWithDB and
 * provide details about what went wrong either in the form of a console.log or
 * by putting a string in the exception.
 */
function tempInitDB() {}

/**
 * Currently, userTable, tempAttemptToMakeUser(), and tempTryLogIn() are used to
 * demonstrate how the database functions should interact with the routing. They
 * are storing the usernames and password hashes to a map that is reset when the
 * server restarted. You need to implement functions that are called by the
 * exported attemptToMakeUser() and tryLogIn() that use the MySQL database. The
 * input and thrown exceptions are described below in the module.exports part.
 * Note: I am passing you unsanitized usernames and passwords. You need to
 * ensure that there is not SQL injection. You are also responsible for hashing
 * the passwords. I am using the synchronous hash and compare functions for
 * simplicity. Generally, asynchronous functions are preferred, but this app is
 * such small scale I don't think its necessary. I'll leave it up to you to
 * decide. Note that these two functions don't return anything, they only throw
 * exceptions. We will need to add functions for getting and setting user data
 * later when we decide what data we want to store. Another thing to consider,
 * the frontend currently does not place any restrictions on usernames, but if
 * we want to limit the characters that can be used in a uesrname, I think it
 * would be best if we put the check in this file and have an Error associated
 * with it. We can discuss that later. Same story for the password.
 */

function validateInputAlphaNumeric(input) {
    const regex = /^[a-zA-Z0-9_]*$/;
    return regex.test(input);
}

async function tryAddFavorites(username, beach) {
try {

const user = await getUserData(username);

if(!validateInputAlphaNumeric(beach)) {
console.log("That input ain't right dawg");
throw new ProblemWithDB();
}

if (user.favorite_beaches === "NULL_BEACH") {
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
let favBeachesArr = (user.favorite_beaches).split(",");
let existsFlag = false;

for(i = 0; i < favBeachesArr.length; i++) {
if(favBeachesArr[i] === beach) {
existsFlag = true;
break;
}
}

if(!existsFlag) {
favBeachesArr.push(beach);
} else {
//if we want an error for beach already exists
}

let favBeachesStringCSV = favBeachesArr.join(",");
//console.log(favBeachesStringCSV);

await connection.query(
`
UPDATE users
SET favorite_beaches = ?
WHERE username = ?;
`,
[favBeachesStringCSV, username]
);

} catch (e) {
console.log(e);
if(e instanceof UserNotFound) {
throw new UserNotFound();
} else {
throw new ProblemWithDB()
}
} 
}

async function functionTester(){

	const [rowsBefore] = await connection.query(
		`SELECT * FROM users;`
	)
	//the 4 is just whichever user I was testing, your index won't match mine

	console.log(rowsBefore[0].favorite_beaches);


	//await tryClearFavorites("personal");
	//await tryAddFavorites("dropThisUser", "\"\".etes\"\"");
	//await tryAddFavorites("dropThisUser", "beach4");
	await tryAddFavorites("dropThisUser", "beach4");
	//await tryClearFavorites("dropThisUser");

	const [rowsAfter] = await connection.query(
		`SELECT * FROM users;`
	)

	console.log(rowsAfter[0].favorite_beaches);
}

//functionTester();


async function removeFavorites(username, beach){
    try {
    const user = await getUserData(username);
    
    if(!validateInputAlphaNumeric(beach)) {
    console.log("That input ain't right dawg");
    throw new ProblemWithDB();
    }
    
    if (user.favorite_beaches === "NULL_BEACH") {
    console.log("No beach found")
    throw new BeachNotPresent();
    }
    let beaches = user.favorite_beaches.split(",");
    if(!beaches.includes(beach)){
    //console.log("Beach is not found");
    throw new BeachNotPresent();
    //return;
    }
    beaches = beaches.filter(beaches => beaches !== beach);
    if (beaches.length === 0){
    beaches = ["NULL_BEACH"];
    }
    let CSVbeaches = beaches.join(",");
    await connection.query(
                `UPDATE users SET favorite_beaches = ? WHERE username = ?;`,[CSVbeaches, username]
            );
    } catch (e) {
    console.log(e);
    if (e instanceof UserNotFound) {
    throw new UserNotFound();
    } else if (e instanceof BeachNotPresent) {
    throw new BeachNotPresent();
    }
    else {
    throw new ProblemWithDB();
    }
    }
    }

	async function removeTester(){

		const [rowsBefore] = await connection.query(
			`SELECT * FROM users;`
		)
		//the 4 is just whichever user I was testing, your index won't match mine
	
		console.log(rowsBefore[0].favorite_beaches);
	
	
		//await tryClearFavorites("personal");
		//await tryAddFavorites("dropThisUser", "\"\".etes\"\"");
		//await tryAddFavorites("dropThisUser", "beach4");
		await removeFavorites("dropThisUser", "beach2");
		//await tryClearFavorites("dropThisUser");
	
		const [rowsAfter] = await connection.query(
			`SELECT * FROM users;`
		)
	
		console.log(rowsAfter[0].favorite_beaches);
	}
	
	removeTester();

async function getFavorites(username) {
    try{
        const [favoritesColumn] = await connection.query('SELECT favorite_beaches FROM users WHERE username = ?', [username]);
        if (favoritesColumn.length === 0) { 
            throw new UserNotFound; //Throws error if there is no user favorite.
        }
        let userFavorite = favoritesColumn[0].favorite_beaches;
		 
        if (userFavorite === "NULL_BEACH" || userFavorite.trim() === "") { //Checks for whether userFavorite is null/empty
            return []; //Returns an empty array
        }
        return userFavorite.split(',').map(beach => beach.trim()).filter(beach => beach !== ""); //Returns an array with strings that are
	} catch (e) {
		console.log(e);
		if (e instanceof UserNotFound) {
			throw new UserNotFound();
		} else {
			throw new ProblemWithDB();
		}
	}
}

module.exports = {
	/**
	 * This function takes in an unsanitized username and password. If the
	 * user already exists, it throws UserAlreadyExists. If there is a
	 * problem adding the user to the database, it throws ProblemWithDB. If
	 * the user is successfully added to the database, no exceptions are to
	 * be thrown. Nothing is ever returned by this function.
	 */
	attemptToMakeUser: async function(username, password) {

		try {
			//const user = await getUserData(username);
	
			if (await userExists(username)) {
				throw new UserAlreadyExists();
			}
	
			const hash = await bcrypt.hash(password, 10);
	
			await connection.query(`
			INSERT INTO
			users (username, password)
			VALUES 
			(?, ?);
			`,
			[username, hash]);
	
	
		} catch (e) {
			//console.log(e);
			if (e instanceof UserAlreadyExists) {
				throw new UserAlreadyExists();
			} else {
				throw new ProblemWithDB()
			}
		}
	},
	/**
	 * This function takes in an unsanitized username and password. If the
	 * user does not exist, it throws UserNotFound. If there is a problem
	 * with the database, it throws ProblemWithDB. If the password is
	 * incorrect, it throws IncorrectPassword. If the username exists and
	 * the password is the correct password for that user, no exceptions are
	 * to be thrown. Nothing is ever returned by this function.
	 */

	tryLogIn: async function(username, enteredPassword) {
		try {
			const user = await getUserData(username);
		
			const password = await bcrypt.compare(enteredPassword, user.password);
			
			if(!password) {
				console.log("Wrong Password");
				throw new IncorrectPassword();
			}
		
			console.log("Password Works");
		
		
			} catch (e) {
				//console.log(e);
				if(e instanceof UserNotFound) {
					throw new UserNotFound();
				} else if(e instanceof IncorrectPassword){
					console.log("Pass Error Throw");
					throw new IncorrectPassword();
				} else {
					throw new ProblemWithDB()
				}
			}
    },

	getFavorites: async function(username) {
		try{
			const [favoritesColumn] = await connection.query('SELECT favorite_beaches FROM users WHERE username = ?', [username]);
			if (favoritesColumn.length === 0) { 
				throw new UserNotFound; //Throws error if there is no user favorite.
			}
			let userFavorite = favoritesColumn[0].favorite_beaches;
			 
			if (userFavorite === "NULL_BEACH" || userFavorite.trim() === "") { //Checks for whether userFavorite is null/empty
				return []; //Returns an empty array
			}
			return userFavorite.split(',').map(beach => beach.trim()).filter(beach => beach !== ""); //Returns an array with strings that are
		} catch (e) {
			//console.log(e);
			if (e instanceof UserNotFound) {
				throw new UserNotFound();
			} else {
				throw new ProblemWithDB();
			}
		}
	},

	removeFavorites: async function (username, beach){
		try {
		const user = await getUserData(username);
		
		if(!validateInputAlphaNumeric(beach)) {
		console.log("That input ain't right dawg");
		throw new ProblemWithDB();
		}
		
		if (user.favorite_beaches === "NULL_BEACH") {
		console.log("No beach found")
		throw new BeachNotPresent();
		}
		let beaches = user.favorite_beaches.split(",");
		if(!beaches.includes(beach)){
		//console.log("Beach is not found");
		throw new BeachNotPresent();
		//return;
		}
		beaches = beaches.filter(beaches => beaches !== beach);
		if (beaches.length === 0){
		beaches = ["NULL_BEACH"];
		}
		let CSVbeaches = beaches.join(",");
		await connection.query(
					`UPDATE users SET favorite_beaches = ? WHERE username = ?;`,[CSVbeaches, username]
				);
		} catch (e) {
		console.log(e);
		if (e instanceof UserNotFound) {
		throw new UserNotFound();
		} else if (e instanceof BeachNotPresent) {
		throw new BeachNotPresent();
		}
		else {
		throw new ProblemWithDB();
		}
	}
},
		
		
	initDB: tempInitDB,
	getFavorites: tempGetFavorites,
	addFavorite: tempAddFavorite,
	removeFavorite: tempRemoveFavorite,
	clearFavorites: tempClearFavorites,
	UserAlreadyExists: UserAlreadyExists,
	ProblemWithDB: ProblemWithDB,
	UserNotFound: UserNotFound,
	IncorrectPassword: IncorrectPassword,
	BeachNotPresent: BeachNotPresent,
};
	/**
	 * Export all the errors that can be thrown by the exported functions.
	 */
/**
 * Currently, these are temporary functions for accessing/modifying the favorite
 * beaches of a user. Authentication is done by calling code, so you can assume
 * that the user is logged in. All functions can throw ProblemWithDB or
 * UserNotFound.
 */
let favorites = new Set(["AK103349",
		"AK103839",
		"NC810571",
		"WA171257",
		"NJ828093",
		"FL257350",
		"MA242910",
		"WA397523",
		"WA815475",
		"HI659533"]);
function tempGetFavorites(username) {
	return Array.from(favorites.keys());
}
function tempAddFavorite(username, favorite) {
	favorites.add(favorite);
}
function tempRemoveFavorite(username, favorite) {
	favorites.delete(favorite);
}
function tempClearFavorites(username) {
	favorites.clear();
}

// module.exports = {
// 	initDB: tempInitDB,
// 	attemptToMakeUser: tempAttemptToMakeUser,
// 	tryLogIn: tempTryLogIn,
// 	getFavorites: tempGetFavorites,
// 	addFavorite: tempAddFavorite,
// 	removeFavorite: tempRemoveFavorite,
// 	clearFavorites: tempClearFavorites,
// 	UserAlreadyExists: UserAlreadyExists,
// 	ProblemWithDB: ProblemWithDB,
// 	UserNotFound: UserNotFound,
// 	IncorrectPassword: IncorrectPassword,
// };
