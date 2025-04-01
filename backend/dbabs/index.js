const bcrypt = require('bcryptjs');
require('dotenv').config();
const mysql = require('mysql2');

// Error declarations
class UserAlreadyExists extends Error {}
class ProblemWithDB extends Error {}
class UserNotFound extends Error {}
class IncorrectPassword extends Error {}


// process.on('uncaughtException', (err) => {
//     console.error('Uncaught Exception:', err);
	
// });

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

////////////////////All functions here are tests, code was shifted to the exports, but this is kept because they should work.\\\\\\\\\\\\\\\\\\
//note, some of these say "userss", this is because I have two tables and didn't want to mess up my main table accidentally when testing



// 	//console.log(res[1].username);
// 	console.log(typeof res);
// 	console.log(JSON.stringify(res));

// 	//console.log(res[2].favorite_beaches.split(", "));
// 	let userId = 1;

// 	console.log(res[userId].favorite_beaches);
// 	var favBeaches = res[userId].favorite_beaches.split(", ");
	
// 	console.log(favBeaches);
// 	for(i = 0; i < favBeaches.length; i++) {
// 		if(favBeaches[i] !== "beach2") {
// 			//add to temp array
// 			//once loop done, join
// 			//actually, this is mf javascript, it has the includes()
// 			//favBeaches.push();
// 		}
// 	}
// 	var favBeachesString = favBeaches.join(', ');
// 	console.log(favBeachesString);
// });



// function makeUserTest(username, password) {
// 	console.log(`Register Request\nUsername: ${username}\nPassword ${password}\n`);


// 	connection.query(`SELECT * FROM users WHERE username = ?;`, [username], (err, res) => {
// 		if (err) throw err;

// 		if (!(Object.keys(res).length == 0)) {
// 			throw new UserAlreadyExists;
// 		}
// 	});
	

// 	//if we want, we can add an existing email error to check and throw
	
// 	let hash = bcrypt.hashSync(password, 10);

// 	connection.query(`
// 		INSERT INTO
// 		users (username, password)
// 		VALUES 
// 		(?, ?);
// 		`,
// 		[username, hash], (err, res) => {
// 		if (err) throw err;


// 	});
// }

//tryLogInTest("passTest", "string");


// function tryLogInTest(username, password) {

// 	connection.query(`SELECT * FROM userss WHERE username = ?;`, [username], (err, res) => {
// 		if (err) throw err;

// 		if (Object.keys(res).length == 0) {
// 			throw new UserNotFound;
// 		}
// 	});

// 	connection.query(`SELECT * FROM userss WHERE username = ?;`, [username], (err, res) => {
// 		if (err) throw err;

// 		//console.log(res[0].password);

// 		if(!bcrypt.compareSync(password, res[0].password)) {
// 		throw new IncorrectPassword;
// 	}
// 		console.log("Password Correct!!!");
// 	});
// }


// function getUser(username) {
// 	connection.query(`SELECT * FROM userss WHERE username = ?;`, [username], (err, res) => {
// 		if (err) throw err;

// 		return res;

// 	});
// }

// function isEmpty(username) {
// 	connection.query(`SELECT * FROM userss WHERE username = ?;`, [username], (err, res) => {
// 		if (err) throw err;

// 		//console.log((Object.keys(res).length==0));
// 		return (Object.keys(res).length == 0);
// 	});
// }

async function getUserData(username) {

	try {

		const [user] = await connection.query(`SELECT * FROM users WHERE username = ?;`, [username]);

		if(user.length == 0) {
					errorCode = "UserNotFound"
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



// async function aLogInTest(username, enteredPassword) {


// 	try {
// 	const user = await getUserData(username);

// 	const password = await bcrypt.compare(enteredPassword, user.password);
	
// 	if(!password) {
// 		console.log("Wrong Password");
// 		throw new IncorrectPassword();
// 	}

// 	console.log("Password Works");


// 	} catch (e) {
// 		console.log(e);
// 		if(e instanceof UserNotFound) {
// 			throw new UserNotFound();
// 		} else if(e instanceof IncorrectPassword){
// 			throw new IncorrectPassword();
// 		} else {
// 			throw new ProblemWithDB()
// 		}
// 	}
// }

async function printUser(username) {
	const test = await getUserData(username);
	console.log(test);
}

//console.log("ran getuser");
//printUser("npmTest");

//console.log("no Running login");
//aLogInTest("npmTest", "screwYou");
//console.log(printUser("npmTests"));
//console.log(await getUserData("npmTest"));




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
// let userTable = new Map();
// function tempAttemptToMakeUser(username, password) {
// 	console.log(`Register Request\nUsername: ${username}\nPassword: ${password}\n`);
// 	if (userTable.has(username))
// 		throw new UserAlreadyExists();
// 	let hash = bcrypt.hashSync(password, 10);
// 	userTable.set(username, hash);


// }
// function tempTryLogIn(username, password) {
// 	console.log(`Login Request\nUsername: ${username}\nPassword: ${password}\n`);
// 	if (userTable.get(username) === undefined)
// 		throw new UserNotFound();
// 	if (!bcrypt.compareSync(password, userTable.get(username)))
// 		throw new IncorrectPassword();
// }





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
	//tryLogIn: async function(username, password) {
		
		
		
		
		//tempTryLogIn(username, password);
		// let errorStatus = "NULL";
		// let nestedQueryExit = false;


		// await connection.query(`SELECT * FROM users WHERE username = ?;`, [username], (err, res) => {

		// 	queryBlock : {
		// 		if (err) {
		// 			errorStatus = "ProblemWithDB";
		// 			break queryBlock;
		// 			//throw ProblemWithDB;
		// 		}
		
		// 		if (Object.keys(res).length == 0) {
		// 			console.log("Error: UserNotFound");
		// 			errorStatus = "UserNotFound";
		// 			break queryBlock;
		// 			//throw new UserNotFound;
		// 		}

		// 			connection.query(`SELECT * FROM users WHERE username = ?;`, [username], (err, res) => {
		// 			nestedQuery : {
		// 				if (err) {
		// 					errorStatus = "UserAlreadyExists";
		// 					nestedQueryExit = true;
		// 					break nestedQuery;
		// 					//throw ProblemWithDB;
		// 				}
				

				
		// 				if(!bcrypt.compareSync(password, res[0].password)) {
		// 				console.log("Error: Incorrect Password");
		// 				errorStatus = "IncorrectPassword";
		// 				nestedQueryExit = true;
		// 				break nestedQuery;
		// 				//throw new IncorrectPassword;
		// 				}
		// 				console.log("Password Correct!!!");
		// 			}
		// 		});
		// 	}
		// });
		// console.log("RAN: " + errorStatus);

		// switch (errorStatus) {
		// 	case "ProblemWithDB":
		// 		throw new ProblemWithDB();
		// 	case "UserAlreadyExists":
		// 		throw new UserAlreadyExists();
		// 	case "IncorrectPassword":
		// 		console.log("ATTEMPTED THROW");
		// 		throw new IncorrectPassword();
		// 	case "UserNotFound":
		// 		throw new UserNotFound();
		// }

	//},

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
        
		
		
	// 	//tempTryLogIn(username, password);
    //     let errorStatus = "NULL";
    //     //let nestedQueryExit = false;

    //     try{
    //     const[res] = await connection.promise().query(`SELECT * FROM users WHERE username = ?;`, [username], async (err, res) => {
	// 		console.log(res[0]);
    //         if(res.length === 0){
    //             console.log("Error: UserNotFound");
    //                 errorStatus = "UserNotFound";
    //                 throw new UserNotFound();
    //         }

    //         const user = res[0];

    //         const password = await bcrypt.compare(password, res[0].password);
    //         if(!bcrypt.compare(password, res[0].password)) { //ASYNC EDIT
    //             console.log("Error: Incorrect Password");
    //             errorStatus = "IncorrectPassword";
    //             throw new IncorrectPassword();
    //         }
	// 	});
	// 	} catch(err){

    //     // switch (errorStatus) {
    //     //     case "ProblemWithDB":
    //     //         throw new ProblemWithDB();
    //     //     case "UserAlreadyExists":
    //     //         throw new UserAlreadyExists();
    //     //     case "IncorrectPassword":
    //     //         console.log("ATTEMPTED THROW");
    //     //         throw new IncorrectPassword();
    //     //     case "UserNotFound":
    //     //         throw new UserNotFound();
    //     // }
    // }
    },

	initDB: tempInitDB,
	getFavorites: tempGetFavorites,
	addFavorite: tempAddFavorite,
	removeFavorite: tempRemoveFavorite,
	clearFavorites: tempClearFavorites,
	UserAlreadyExists: UserAlreadyExists,
	ProblemWithDB: ProblemWithDB,
	UserNotFound: UserNotFound,
	IncorrectPassword: IncorrectPassword
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
	return favorites;
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
