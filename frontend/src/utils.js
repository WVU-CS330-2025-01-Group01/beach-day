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
        const { beach_name, beach_county, beach_state, beach_access, beach_longitude, beach_latitude, beach_length, weather } = result;
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
};

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

export async function refreshWeatherData(favorites, setFavorites) {
    if (!favorites.length) return;
  
    try {
      const updatedFavorites = await Promise.all(
        favorites.map(async (beach) => {
          const weather = await fetchBeachInfoWithWeather(beach.id); // Your fetchWeatherData function
          return {
            ...beach,
            temperature: weather.temperature,
            forecast: weather.forecast,
          };
        })
      );
  
      setFavorites(updatedFavorites); // Replace with updated weather, but same names/IDs
    } catch (err) {
      console.error("Error refreshing weather data:", err);
    }
  };