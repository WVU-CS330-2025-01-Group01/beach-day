const bcrypt = require('bcryptjs');
require('dotenv').config();
const mysql = require('mysql2');
const dbErrors = require('./db-errors');
const dbHelper = require('./generic-helpers');
const connection = require('./database-connection');

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
        );
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

module.exports = {

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
            );
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

    clearPastEvents: async function() {
        try {
    
            await connection.query(
                `
                    DELETE FROM events
                    WHERE event_time < NOW();
                `
            );
        } catch (e) {
            throw new dbErrors.ProblemWithDB()
        }
    },

    getUserEvents: getUserEventsHelper,
}