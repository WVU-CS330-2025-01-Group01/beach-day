/** 
 * This class includes functions for a user to schedule personal events.
 * @author Ayden Jones, Bhavana Dakshinamoorthy, Austin Bird
 */
const bcrypt = require('bcryptjs');
require('dotenv').config();
const mysql = require('mysql2');
const dbErrors = require('./db-errors');
const dbHelper = require('./generic-helpers');
const connection = require('./database-connection');

    /** 
	 * Retrives a user's events.
	 * 
	 * Checks to see if a user does not exist, if there are no
     * events or if there is a database issue.
	 * 
	 * @param {String} username Given username
	 * @return User's events
	 */
async function getUserEventsHelper(username) { 
    try {

        if(!(await dbHelper.userExists(username))) {
            throw new dbErrors.UserNotFound();
        }

        const [events] = await connection.query(
            `
                SELECT event_time, event_message, beach_id, email, event_id, events.username
                FROM events LEFT JOIN users
                ON  events.username = users.username
                WHERE events.username = ?
                ORDER BY event_time ASC;
            `
            , [events]
        ); // This query joins two tables (events and users) and prints out the attributes on the first line.  It is linked by username. It gets every event in the table at username, in order of soonest to happen.
        if (events.length <= 0) {
            throw new dbErrors.ZeroEvents();
        }

        return events;

    } catch (e) {
        if(e instanceof dbErrors.UserNotFound) {
            throw new dbErrors.UserNotFound();
        } else if (e instanceof dbErrors.ZeroEvents) {
            throw new dbErrors.ZeroEvents();
        } else {
            throw new dbErrors.ProblemWithDB()
        }
    }
}

    /** 
	 * Retrives a user's events from a given ID.
	 * 
	 * Checks to see if there are no events
     * or if there is a database issue.
	 * 
	 * @param {number} eventID Given event ID
	 * @return User's event from given ID
	 */
async function getEventFromIDHelper(eventID) {
    try {

        const [event] = await connection.query(
            `
                SELECT * FROM events
                WHERE event_id = ?
            `
            , [eventID]
        )

        if(event.length <= 0) {
            throw new dbErrors.ZeroEvents();
        }

        return event[0];

    } catch (e) {
        if(e instanceof dbErrors.ZeroEvents) {
            throw new dbErrors.ZeroEvents();
        } else {
            throw new dbErrors.ProblemWithDB()
        }
    }
}

module.exports = {
    /** 
	 * Retrives a user's future events.
	 * 
	 * Checks to see if a user does not exist, if there are no
     * events or if there is a database issue.
	 * 
	 * @param {String} username Given username
	 * @return User's events
	 */
    getUserFutureEvents: async function(username) {
        try {
    
            if(!(await dbHelper.userExists(username))) {
                throw new dbErrors.UserNotFound();
            }
    
            const [events] = await connection.query(
                `
                    SELECT event_time, event_message, beach_id, email, event_id, events.username
                    FROM events LEFT JOIN users
                    ON  events.username = users.username
                    WHERE events.username = ? AND event_time > NOW()
                    ORDER BY event_time ASC;
                `
                , [username]
            ); //This is another joined table query with the added requirement that the stated time of the event for each event much be AFTER the current time as the query is run.
            if (events.length <= 0) {
                throw new dbErrors.ZeroEvents();
            }
    
            return events;
    
        } catch (e) {
            if(e instanceof dbErrors.UserNotFound) {
                throw new dbErrors.UserNotFound();
            } else if (e instanceof dbErrors.ZeroEvents) {
                throw new dbErrors.ZeroEvents();
            } else {
                throw new dbErrors.ProblemWithDB()
            }
        }
    },

    /** 
	 * Retrives the number of pending events for a user.
	 * 
	 * Checks to see if a user does not exist,
     * or if there is a database issue.
	 * 
	 * @param {String} username Given username
	 * @return Number of events for a given user.
	 */
    getEventCount: async function(username) {
        try {
    
            if(!(await dbHelper.userExists(username))) {
                throw new dbErrors.UserNotFound();
            }
    
            const [eventCount] = await connection.query(
                `
                SELECT COUNT(username) AS amount
                FROM events
                WHERE username = ?;
                `
                , [username]
            );
            return eventCount[0].amount;
        } catch (e) {
            if(e instanceof dbErrors.UserNotFound) {
                throw new dbErrors.UserNotFound();
            } else {
                throw new dbErrors.ProblemWithDB()
            }
        }
    },

     /** 
	 * Removes all of a user's events from the database.
	 * 
	 * Checks to see if a user does not exist, if there are no events
     * or if there is a database issue.
	 * 
	 * @param {String} username Given username
	 * @return Nothing
	 */
    removeAllEventsFromUser: async function(username) {
        try {
    
            if(!(await dbHelper.userExists(username))) {
                throw new dbErrors.UserNotFound();
            }
    
            await getUserEventsHelper(username);
    
            await connection.query(
                `
                    DELETE FROM events
                    WHERE username = ?
                `
                , [username]
            );
        } catch (e) {
            if(e instanceof dbErrors.ZeroEvents) {
                throw new dbErrors.ZeroEvents();
            } else if (e instanceof dbErrors.UserNotFound) {
                throw new dbErrors.UserNotFound();
            } else {
                throw new dbErrors.ProblemWithDB()
            }
        }
    },

     /** 
	 * Clears a user's past events.
	 * 
	 * Checks to see if there is a database issue.
	 *
	 * @return Nothing
	 */
    clearPastEvents: async function() {
        try {
    
            await connection.query(
                `
                    DELETE FROM events
                    WHERE event_time < NOW();
                `
            ); // The greater-than/less-than operations for the datatime work with less than being a time BEFORE the current time.  So this deletes everything already passed.
        } catch (e) {
            throw new dbErrors.ProblemWithDB()
        }
    },

     /** 
	 * Removes an event from a given ID.
	 * 
	 * Checks to see if there are no events
     * or if there is a database issue.
	 * 
	 * @param {number} eventID Given event ID.
	 * @return Nothing
	 */
    removeEventFromID: async function(eventID) {
        try {
    
            await getEventFromIDHelper(eventID);
    
            await connection.query(
                `
                    DELETE FROM events
                    WHERE event_id = ?
                `
                , [eventID]
            );
        } catch (e) {
            if(e instanceof dbErrors.ZeroEvents) {
                throw new dbErrors.ZeroEvents();
            } else {
                throw new dbErrors.ProblemWithDB()
            }
        }
    },

    getEventFromID: getEventFromIDHelper,
    getUserEvents: getUserEventsHelper,
}