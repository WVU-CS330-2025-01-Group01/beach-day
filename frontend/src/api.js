/**
 * Base URL for the backend API, constructed using environment variables.
 * Example: http://localhost:3010
 */
const API_BASE = `http://${process.env.REACT_APP_BACKEND_HOST}:${process.env.REACT_APP_BACKEND_PORT}`;

/**
 * API endpoint definitions for use throughout the application.
 * Each property corresponds to a backend route for a specific feature.
 */
export const API = {
    /** Endpoint for user login requests */
    LOGIN: `${API_BASE}/login`,

    /** Endpoint for user registration */
    REGISTER: `${API_BASE}/register`,

    /** Endpoint to retrieve user's list of favorite beaches */
    FAVORITES: `${API_BASE}/favorites`,

    /** Endpoint to update the user's list of favorite beaches */
    UPDATE_FAVORITES: `${API_BASE}/update_favorites`,

    /** Endpoint to fetch weather data for a specific beach */
    BEACHINFO: `${API_BASE}/weather`,

    /** Endpoint to retrieve the current user's email */
    GET_EMAIL: `${API_BASE}/get_email`,

    /** Endpoint to update the current user's email */
    SET_EMAIL: `${API_BASE}/set_email`,

    /** Endpoint to delete the current user's account */
    DELETE_ACCOUNT: `${API_BASE}/delete_account`,

    /** Endpoint to change the current user's password */
    CHANGE_PASSWORD: `${API_BASE}/change_password`,

    /** Endpoint to add a new beach condition notification */
    ADD_NOTIFICATION: `${API_BASE}/add_notification`,

    /** Endpoint to count unread beach condition notifications */
    COUNT_NOTIFICATIONS: `${API_BASE}/count_notifications`,

    /** Endpoint to retrieve a specific notification */
    RECEIVE_NOTIFICATION: `${API_BASE}/receive_notification`,

    /** Endpoint to fetch all notifications for the current user */
    GET_NOTIFICATIONS: `${API_BASE}/get_notifications`,

    /** Endpoint to remove all notifications for the current user */
    REMOVE_NOTIFICATIONS: `${API_BASE}/remove_notifications`,

    /** Endpoint to add a new event for a user at a specific beach with a title and timestamp */
    ADD_EVENT: `${API_BASE}/add_event`,
};