const API_BASE = `http://${process.env.REACT_APP_BACKEND_HOST}:${process.env.REACT_APP_BACKEND_PORT}`;

export const API = {
    LOGIN: `${API_BASE}/login`,
    REGISTER: `${API_BASE}/register`,
    FAVORITES: `${API_BASE}/favorites`,
    UPDATE_FAVORITES: `${API_BASE}/update_favorites`,
    BEACHINFO: `${API_BASE}/weather`,
    GET_EMAIL: `${API_BASE}/get_email`,
    SET_EMAIL: `${API_BASE}/set_email`,
    DELETE_ACCOUNT: `${API_BASE}/delete_account`,
    CHANGE_PASSWORD: `${API_BASE}/change_password`,
    ADD_NOTIFICATION: `${API_BASE}/add_notification`,
    COUNT_NOTIFICATIONS: `${API_BASE}/count_notifications`,
    RECEIVE_NOTIFICATION: `${API_BASE}/receive_notification`,
    GET_NOTIFICATIONS: `${API_BASE}/get_notifications`,
    REMOVE_NOTIFICATIONS: `${API_BASE}/remove_notifications`
};
