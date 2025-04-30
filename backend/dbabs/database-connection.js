/** 
 * This class includes handling the connection to the database.
 * 
 * @author Ayden Jones, Bhavana Dakshinamoorthy, Austin Bird
 */
require('dotenv').config();
const mysql = require('mysql2');
const dbErrors = require("./db-errors");

//Creating the mySQL connection and declraring variables.
const connection = mysql.createPool({
    host: process.env.BEACH_DAY_DB_HOST,
    user: process.env.BEACH_DAY_DB_USER,
    password: process.env.BEACH_DAY_DB_PASSWORD,
    database: process.env.BEACH_DAY_DB_NAME,
    port: process.env.BEACH_DAY_DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: (process.env.BEACH_DAY_DB_SSL_FLAG === undefined) ? (undefined) : ({ ca: process.env.BEACH_DAY_DB_SSL_CERT })
}).promise();

if (process.env.BEACH_DAY_DB_SSL_FLAG === undefined) {
    console.error("Manipulating Local Database");
} else {
    console.error("Manipulating Remote Database");
}

/** 
 * Tests a local database connection.
 * 
 * Checks to see is a connection is retrieved. If not, an error is thrown. 
 * The connection is nevertheless released back into the pool.
 * 
 * @return Nothing.
 */
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

/*These are helper functions with initDB.  They are only used if needed, and are expected to ONLY be called by the developer.
* These means that they do not protect against SQL injection as it's impossible to run some of these queries without it.
* The code is written in a in a more hard defined manner as it's not meant to be variable. This is only a developer tool to check DBs.
* The function should entirely be deprecated once the DB is on the server.
* More functions can be added in the same fashion as the others.
*/

    /** 
     * Helper to drop a column for the InitDB() function.
     * 
     * Drops a column in the table.
     * 
     * @return Nothing.
     */
async function dropColumn(columnName) {
    //just drops the column, no SQL Injection protection, only ran by initDB
    await connection.query(
        "ALTER TABLE users DROP COLUMN " + columnName + ";"
    );
}

    /** 
     * Helper to retrieve table data.
     * 
     * @param {String} databaseName Name of the database
     * @param {String} field Name of field
     * @param {String} tableName Name of table
     * @return Nothing.
     */
async function getFieldAttributes(field, databaseName, tableName) {
    const [attributes] = await connection.query(
        `
		SELECT * FROM information_schema.columns
		WHERE COLUMN_NAME = ? AND TABLE_SCHEMA = ? AND TABLE_NAME = ?;
		`
        , [field, databaseName, tableName]
    );

    return attributes[0];
}

    /** 
     * Updates the fields in the table.
     * 
     * Prints out error if the fields are unexpected.
     * 
     * @param {String} fieldName Given field name.
     * @param {String} attributes Given attributes.
     * @param {number} ordinalPos
     * @param {} varType
     * @param {} isNullAllowed
     * @param {} isAutoInc
     * @param {} colKey
     * @param {} def
     * @param {} tableName 
     * 
     * @return nothing
     */
async function updateFields(fieldName, attributes, ordinalPos, varType, isNullAllowed, isAutoInc, colKey, def, tableName) {
    if (attributes.ORDINAL_POSITION != ordinalPos) {
        console.error(" " + fieldName + " position " + ordinalPos + ", should be " + attributes.ORDINAL_POSITION + " Table ordered wrong, no conflicts should arise however.");
    }

    //This is a string that will be ran as a query. With the syntax of SQL, you can essentially build a command on top of old ones.
    //It can be quite strict, but this runs conditions whether the field needs new/updated attributes and finally runs that command.
    //Every condition just adds an extra relevant attribute to the query if ran
    let neededQuery = 'ALTER TABLE ' + tableName + ' MODIFY COLUMN ' + fieldName + ' ' + varType;

    if (isNullAllowed && attributes.IS_NULLABLE === "NO") {
        neededQuery += ' NULL'
    } else if ((!isNullAllowed) && attributes.IS_NULLABLE !== "NO" && (colKey !== "PRI" && colKey !== "UNI")) {
        neededQuery += ' NOT NULL'
    }


    if (isAutoInc && attributes.EXTRA !== "auto_increment") { //these are joined because you cannot autoincrement and have a default value
        neededQuery += ' AUTO_INCREMENT';
    } else if (def !== "NO_DEFAULT") {
        let tempDefault = def;
        if (isNaN(parseInt(def)) && !(def.substring(def.length - 2, def.length - 1) === "(" && def.substring(def.length - 1) === ")")) { //so, defaults can be a string, number, or function.  They CANNOT be queried with quotations, which is what parameterization does. Strings need quotes, number/function doesn't.  This checks for that. 
            tempDefault = '"' + def + '"';
        }
        neededQuery += ' DEFAULT ' + tempDefault;
    }

    await connection.query(neededQuery);

    //These are constraints, or more rather the important ones.  They can be added and dropped in a statement unlike the built query from above.
    //The order shouldn't entirely matter with how the code is written, but I believe this is better.
    //Primary is handled much differently, and less programatically.  This is due to the EXTREMELY strict behavior of Primary Keys (PK).
    //Thus, the only error should be if your ID still has the PK. We will NOT shift Primary Around as it should not be ever again.
    if (colKey === "PRI" && attributes.COLUMN_KEY !== "PRI") {

        const idAttributes = await getFieldAttributes("id", "authdb");
        if (idAttributes.COLUMN_KEY === "PRI") {
            await connection.query(
                `
				ALTER TABLE users
				DROP PRIMARY KEY,
				MODIFY id INT NOT NULL UNIQUE,
				ADD PRIMARY KEY (username);
				`
            )
        }
        //technically, this should only EVER apply to username.  That's why this case is more hardcoded.  It's purely on the chance you still have the original ID as Primary Key.
        //Primary keys are extremely fickle, most likely they should NEVER change.  This is here for one case only.
    }

    if (colKey === "UNI" && attributes.COLUMN_KEY !== "UNI") {
        await connection.query(
            "ALTER TABLE " + tableName + " ADD UNIQUE (" + fieldName + ");"
        );
    }

    if (colKey === "MUL" && attributes.COLUMN_KEY !== "MUL") {
        await connection.query(
            "ALTER TABLE " + tableName + " ADD FOREIGN KEY (" + fieldName + ") REFERENCES " + fieldName + "(" + fieldName + ");"
        );
    }
}

    /** 
     * Checks if the database has all of the necessary fields and constraints.
     * 
     * Throws errors if fields/constraints are missing from the database/table.
     * 
     * @return nothing
     */
async function initDB() {
    const dbName = "authdb"; //in case we don't standardize the name, this can be set to a param or process.env

    testDatabaseConnection();

    //These are the proper location/index for each field on their respective table. Because we grab objects and use keys, order doesn't matter.  Used for debugging.
    const ordinalPositions = Object.freeze({
        USERNAME: 1,
        PASSWORD: 2,
        EMAIL: 3,
        FAVORITE_BEACHES: 4,
        TIMEZONE: 5,
        NOTIFICATIONS_EN: 6,
        ID: 7,
        REGISTER: 8,
        NOTIFICATION_ID: 1,
        CREATION_TIME: 2,
        TITLE: 3,
        MESSAGE: 4,
        WAS_REC: 5,
        NOTIFICATION_USERNAME: 6,
        EVENT_ID: 1,
        EVENT_TIME: 2,
        EVENT_MESSAGE: 3,
        EVENT_BEACH_ID: 4,
        EVENT_USERNAME: 5
    });

    try {
        const [db] = await connection.query(`SHOW DATABASES LIKE ?;`, [dbName]);
        if (db.length <= 0) {
            console.error("Database Doesn't Exist");
            await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName};`); //THIS DOES NOT PROTECT AGAINST MYSQL INJECTION. Most of this doesn't.  Only a Developer should run initDB.
            await connection.query(
                `
            CREATE TABLE users (
            username VARCHAR(50) PRIMARY KEY,
            password VARCHAR(255) NOT NULL,
            email VARCHAR(50) UNIQUE,
            favorite_beaches VARCHAR(3000) DEFAULT "NULL_BEACH",
            timezone VARCHAR(3) DEFAULT "GMT",
            notifications_enabled TINYINT(1) NOT NULL DEFAULT 0,
            id INT NOT NULL UNIQUE AUTO_INCREMENT
            );
            `
            );
            return;

        } else {
            //Current Checks, DataBase Exists: Yes.  Next Check, Table(s) Exists:Pending

            let allEmptyFlag = false;

            const [table] = await connection.query(
                `
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = ?
                AND table_name = 'users';
                `
                , [dbName]
            );

            const [notificationTable] = await connection.query(
                `
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = ?
                AND table_name = 'notifications';
                `
                , [dbName]
            );

            const [eventsTable] = await connection.query(
                `
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = ?
                AND table_name = 'events';
                `
                , [dbName]
            );

            allEmptyFlag = (table.length <= 0 && notificationTable.length <= 0 && eventsTable.length <= 0);

            if (table.length <= 0) {
                console.error("users table does not exist.  creating...");
                await connection.query(
                    `
                    CREATE TABLE users (
                    username VARCHAR(50) PRIMARY KEY,
                    password VARCHAR(255) NOT NULL,
                    email VARCHAR(50) UNIQUE,
                    favorite_beaches VARCHAR(3000) DEFAULT "NULL_BEACH",
                    timezone VARCHAR(3) DEFAULT "GMT",
                    notifications_enabled TINYINT(1) NOT NULL DEFAULT 0,
                    id INT NOT NULL UNIQUE AUTO_INCREMENT
                    );
                `
                );

                console.error("created.")
            }

            if (notificationTable.length <= 0) {
                console.error("notifications table does not exist.  creating...");
                await connection.query(
                    `
                    CREATE TABLE notifications (
                    notification_id INT AUTO_INCREMENT PRIMARY KEY,
                    creation_time DATETIME DEFAULT NOW(),
                    notification_title VARCHAR(300),
                    message MEDIUMTEXT,
                    wasReceived TINYINT(1) NOT NULL DEFAULT 0,
                    username VARCHAR(50),
                    FOREIGN KEY (username) REFERENCES users(username) 
                    );
                `
                );
                console.error("created.")
            }

            if (eventsTable.length <= 0) {
                console.error("events table does not exist.  creating...");
                await connection.query(
                    `
                    CREATE TABLE events (
                    event_id INT AUTO_INCREMENT PRIMARY KEY,
                    event_time DATETIME,
                    event_message MEDIUMTEXT,
                    beach_id VARCHAR(10),
                    username VARCHAR(50),
                    FOREIGN KEY (username) REFERENCES users(username) 
                    );
                `
                );
                console.error("created.")
            }

            if (allEmptyFlag) {
                return; //this is to save processing time, as if it's created via these queries, we don't need to check with the multitude of field queries
            }
        }
        //Current Checks, DataBase Exists: YES. Tables Exists:YES.  Next Check: Every Field


        const usernameField = await getFieldAttributes("username", dbName, "users"); //all existing fields follow this pattern.  Grab the metadata
        if (usernameField == undefined) { //Check if column exists
            await connection.query( //if not, create it with all proper attributes
                `
                ALTER TABLE users
                ADD username VARCHAR(50) PRIMARY KEY;
                `
            )
        } else { //if it DOES exist, reinitialize the field with whatever needs to change.  If all attributes are correct, it will run a query that modifys/changes the current column's vartype to it's vartype, otherwise nothing changing.
            await updateFields("username", usernameField, ordinalPositions.USERNAME, "varchar(50)", false, false, "PRI", "NO_DEFAULT", "users");
        }
        //IF we have a table column we removed later and old tables might have it, we can check for it existing, and call the dropColumn(columnName)
        //There are currently none of those, so the function is unused.


        //the rest of the function follows the pattern above
        const passwordField = await getFieldAttributes("password", dbName, "users");

        if (passwordField == undefined) {
            await connection.query(
                `
                ALTER TABLE users
                ADD password VARCHAR(255) NOT NULL;
                `
            )
        } else {
            await updateFields("password", passwordField, ordinalPositions.PASSWORD, "varchar(255)", false, false, "NO_COLKEY", "NO_DEFAULT", "users");
        }

        const emailField = await getFieldAttributes("email", dbName, "users");

        if (emailField == undefined) {
            await connection.query(
                `
                ALTER TABLE users
                ADD email VARCHAR(50) UNIQUE;
                `
            );
        } else {
            await updateFields("email", emailField, ordinalPositions.EMAIL, "varchar(50)", false, false, "UNI", "NO_DEFAULT", "users");
        }

        const favBeachField = await getFieldAttributes("favorite_beach", dbName, "users");

        if (favBeachField !== undefined) {
            await connection.query(
                `
                    ALTER TABLE users 
                    RENAME COLUMN favorite_beach TO favorites_beaches;
                `
            );
        }


        const favBeachesField = await getFieldAttributes("favorite_beaches", dbName, "users");

        if (favBeachesField == undefined) {
            await connection.query(
                `
                ALTER TABLE users
                ADD favorite_beaches VARCHAR(3000) DEFAULT "NULL_BEACH";
                `
            );
        } else {
            await updateFields("favorite_beaches", favBeachesField, ordinalPositions.FAVORITE_BEACHES, "varchar(3000)", true, false, "NO_COLKEY", "NULL_BEACH", "users");
        }

        const timezoneField = await getFieldAttributes("timezone", dbName, "users");

        if (timezoneField == undefined) {
            await connection.query(
                `
                ALTER TABLE users
                ADD timezone VARCHAR(3) DEFAULT "GMT";
                `
            );
        } else {
            await updateFields("timezone", timezoneField, ordinalPositions.TIMEZONE, "varchar(3)", true, false, "NO_COLKEY", "GMT", "users");
        }

        const notificationsField = await getFieldAttributes("notifications_enabled", dbName, "users");

        if (notificationsField == undefined) {
            await connection.query(
                `
                ALTER TABLE users
                ADD notifications_enabled TINYINT(1) NOT NULL DEFAULT 0;
                `
            );
        } else {
            await updateFields("notifications_enabled", notificationsField, ordinalPositions.NOTIFICATIONS_EN, "tinyint(1)", false, false, "NO_COLKEY", "0", "users");
        }

        const idField = await getFieldAttributes("id", dbName, "users");

        if (idField == undefined) {
            await connection.query(
                `
                ALTER TABLE users
                ADD id INT NOT NULL UNIQUE AUTO_INCREMENT;
                `
            );
        } else {
            await updateFields("id", idField, ordinalPositions.ID, "int", false, true, "NO_COLKEY", "NO_DEFAULT", "users");
        }

        const registerField = await getFieldAttributes("register_date", dbName, "users");

        if (registerField != undefined) { //cannot be supported in the Azure database
            await connection.query(
                `
                ALTER TABLE users
                DROP COLUMN register_date;
                `
            );
        }
        //All user table fields have been checked, now checking notification table fields
        const creationField = await getFieldAttributes("creation_time", dbName, "notifications");

        if (creationField == undefined) {
            await connection.query(
                `
                ALTER TABLE notifications
                ADD creation_time DATETIME DEFAULT NOW();
                `
            );
        } else {
            await updateFields("creation_time", creationField, ordinalPositions.CREATION_TIME, "DATETIME", true, false, "NO_COLKEY", "NOW()", "notifications");
        }

        const notificationTitleField = await getFieldAttributes("notification_title", dbName, "notifications");

        if (notificationTitleField == undefined) {
            await connection.query(
                `
                ALTER TABLE notifications
                ADD notification_title VARCHAR(300);
                `
            );
        } else {
            await updateFields("notification_title", notificationTitleField, ordinalPositions.TITLE, "VARCHAR(300)", true, false, "NO_COLKEY", "NO_DEFAULT", "notifications");
        }

        const messageField = await getFieldAttributes("message", dbName, "notifications");

        if (messageField == undefined) {
            await connection.query(
                `
                ALTER TABLE notifications
                ADD message MEDIUMTEXT;
                `
            );
        } else {
            await updateFields("message", messageField, ordinalPositions.MESSAGE, "MEDIUMTEXT", true, false, "NO_COLKEY", "NO_DEFAULT", "notifications");
        }

        const wasReceivedField = await getFieldAttributes("wasReceived", dbName, "notifications");

        if (wasReceivedField == undefined) {
            await connection.query(
                `
                ALTER TABLE notifications
                ADD wasReceived TINYINT(1) NOT NULL DEFAULT 0;
                `
            );
        } else {
            await updateFields("wasReceived", wasReceivedField, ordinalPositions.WAS_REC, "TINYINT(1)", false, false, "NO_COLKEY", "0", "notifications");
        }

        const notificationsUsernameField = await getFieldAttributes("username", dbName, "notifications");

        if (notificationsUsernameField == undefined) {
            await connection.query(
                `
                ALTER TABLE notifications
                ADD username VARCHAR(50);
                ADD FOREIGN KEY (username) REFERENCES users(username);
                `
            );
        } else {
            await updateFields("username", notificationsUsernameField, ordinalPositions.NOTIFICATION_USERNAME, "VARCHAR(50)", false, false, "MUL", "NO_DEFAULT", "notifications");
        }
        //All user table fields have been checked. All notification table fields have been checked, now checking event table fields
        const eventTimeField = await getFieldAttributes("event_time", dbName, "events");

        if (eventTimeField == undefined) {
            await connection.query(
                `
                ALTER TABLE events
                ADD event_time DATETIME;
                `
            );
        } else {
            await updateFields("event_time", eventTimeField, ordinalPositions.EVENT_TIME, "DATETIME", true, false, "NO_COLKEY", "NO_DEFAULT", "events");
        }

        const eventMessageField = await getFieldAttributes("event_message", dbName, "events");

        if (eventMessageField == undefined) {
            await connection.query(
                `
                ALTER TABLE events
                ADD event_message MEDIUMTEXT;
                `
            );
        } else {
            await updateFields("event_message", eventMessageField, ordinalPositions.EVENT_MESSAGE, "MEDIUMTEXT", true, false, "NO_COLKEY", "NO_DEFAULT", "events");
        }

        const eventBeachIDField = await getFieldAttributes("beach_id", dbName, "events");

        if (eventBeachIDField == undefined) {
            await connection.query(
                `
                ALTER TABLE events
                ADD beach_id VARCHAR(10);
                `
            );
        } else {
            await updateFields("beach_id", eventBeachIDField, ordinalPositions.EVENT_BEACH_ID, "VARCHAR(10)", true, false, "NO_COLKEY", "NO_DEFAULT", "events");
        }

        const eventUsernameField = await getFieldAttributes("username", dbName, "events");

        if (eventUsernameField == undefined) {
            await connection.query(
                `
                ALTER TABLE events
                ADD username VARCHAR(50);
                ADD FOREIGN KEY (username) REFERENCES users(username);
                `
            );
        } else {
            await updateFields("username", eventUsernameField, ordinalPositions.EVENT_USERNAME, "VARCHAR(50)", false, false, "MUL", "NO_DEFAULT", "events");
        }

    } catch (e) {
        console.log(e);
        if (e instanceof dbErrors.UserNotFound) {
            throw new dbErrors.UserNotFound();
        } else if (e instanceof dbErrors.UserAlreadyExists) {
            throw new dbErrors.UserAlreadyExists();
        } else {
            throw new dbErrors.ProblemWithDB()
        }
    }
}

initDB();

module.exports = connection;


