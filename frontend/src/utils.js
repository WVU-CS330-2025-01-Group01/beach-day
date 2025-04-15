import { API } from "./api";

export async function fetchBeachInfoWithWeather(beachId) {
    try {
        const response = await fetch(API.BEACHINFO, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ request_type: 'dummy_get_beach_info_weather_by_id', beach_id: beachId })
        });

        const result = await response.json();
        console.log('Beach info result:', result);
        const { beach_name, beach_county, beach_state, weather } = result;
        return {
            name: beach_name || null,
            county: beach_county || null,
            state: beach_state,
            temperature: weather?.temperature || 'N/A',
            forecast: weather?.forecastSummary || 'No forecast available',
        };
    } catch (error) {
        console.error('Failed to fetch beach info with weather:', error);
        return null;
    }
};

export const cacheFavorites = async (jwtToken, setLoadingFavorites, setFavorites, favorites) => {
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

        // Fetch each favorite one at a time and update state incrementally
        for (const id of favoriteIds) {
            const info = await fetchBeachInfoWithWeather(id);
            if (info) {
                const fullBeach = { id, ...info };
                updatedFavorites.push(fullBeach);
                setFavorites((prev) => [...prev, fullBeach]); // update UI progressively
            }
        }

        localStorage.setItem('cachedFavorites', JSON.stringify(updatedFavorites));
        localStorage.setItem('lastUpdated', Date.now());
    } catch (err) {
        console.error('Error caching favorites:', err);
    } finally {
        setLoadingFavorites(false);
    }
};