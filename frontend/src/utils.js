import { API } from "./api";

/**
 * Fetch full beach info (metadata + weather) by beach ID
 * @param {string} beachId - ID of the beach to look up
 * @returns {Object|null} structured beach + weather data or null on failure
 */
export async function fetchBeachInfoWithWeather(beachId) {
    try {
        const response = await fetch(API.BEACHINFO, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ request_type: 'dummy_get_beach_info_weather_by_id', beach_id: beachId })
        });

        const result = await response.json();
        console.log('Beach info result:', result);

        const {
            beach_name,
            beach_county,
            beach_state,
            beach_access,
            beach_longitude,
            beach_latitude,
            beach_length,
            weather
        } = result;

        return {
            name: beach_name || null,
            county: beach_county || null,
            state: beach_state,
            access: beach_access || null,
            longitude: beach_longitude || null,
            latitude: beach_latitude || null,
            length: beach_length || null,
            temperature: weather?.temperature || null,
            forecast: weather?.forecastSummary || null,
            probPrecip: weather?.probPrecip || null,
            humidity: weather?.relHumidity || null,
            windSpeed: weather?.windSpeed || null,
            windDirection: weather?.windDirection || null,
            uvIndex: weather?.uvIndex || null,
            airQuality: weather?.airQuality || null,
            ecoli: weather?.ecoli || null,
            alerts: weather?.alerts || [""]
        };
    } catch (error) {
        console.error('Failed to fetch beach info with weather:', error);
        return null;
    }
}

/**
 * Fetch and cache favorite beach data with weather, update state + localStorage
 * @param {string} jwtToken - user auth token
 * @param {function} setLoadingFavorites - toggles loading UI
 * @param {function} setFavorites - updates app favorites state
 * @param {Array} favorites - current favorites array (can be empty)
 */
export async function cacheFavorites(jwtToken, setLoadingFavorites, setFavorites, favorites) {
    try {
        setLoadingFavorites(true);
        const response = await fetch(API.FAVORITES, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jwt: jwtToken }),
        });

        const data = await response.json();
        const favoriteIds = Array.isArray(data.favorites) ? data.favorites : [];

        const updatedFavorites = [];

        // Fetch each favorite individually and update UI progressively
        for (const id of favoriteIds) {
            const info = await fetchBeachInfoWithWeather(id);
            if (info) {
                const fullBeach = { id, ...info };
                updatedFavorites.push(fullBeach);
                setFavorites((prev) => [...prev, fullBeach]);
            }
        }

        localStorage.setItem('cachedFavorites', JSON.stringify(updatedFavorites));
        localStorage.setItem('lastUpdated', Date.now());
    } catch (err) {
        console.error('Error caching favorites:', err);
    } finally {
        setLoadingFavorites(false);
    }
}

/**
 * Refresh weather data for all currently saved favorite beaches
 * @param {Array} favorites - list of saved beaches
 * @param {function} setFavorites - setter to update weather in state
 */
export async function refreshWeatherData(favorites, setFavorites) {
    if (!favorites.length) return;

    try {
        const updatedFavorites = await Promise.all(
            favorites.map(async (beach) => {
                const weather = await fetchBeachInfoWithWeather(beach.id);
                return {
                    ...beach,
                    temperature: weather.temperature,
                    forecast: weather.forecast,
                };
            })
        );

        setFavorites(updatedFavorites);
    } catch (err) {
        console.error("Error refreshing weather data:", err);
    }
}
