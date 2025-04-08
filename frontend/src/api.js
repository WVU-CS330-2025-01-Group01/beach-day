const API_BASE = `http://${process.env.REACT_APP_BACKEND_HOST}:${process.env.REACT_APP_BACKEND_PORT}`;

export const API = {
    LOGIN: `${API_BASE}/login`,
    REGISTER: `${API_BASE}/register`,
    FAVORITES: `${API_BASE}/favorites`,
    UPDATE_FAVORITES: `${API_BASE}/update_favorites`,
    BEACHINFO: `${API_BASE}/weather`
  }; 