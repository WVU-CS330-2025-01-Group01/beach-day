

import json
import requests

# Interface to NOAA weather forecasting
from noaa_sdk import NOAA

# Access NOAA forecast data
N = NOAA()

# Get weather info at a zip code
def get_basic_weather_zip(zip_code, country_code):
    res = N.get_forecasts(zip_code, country_code)
    now = res[0]

    startTime = now.get("startTime", "")
    endTime = now.get("endTime", "")
    isDaytime = now.get("isDaytime", "")

    temperature = now.get("temperature", "")
    try:
        temperatureUnit = now["temperatureUnit"]
    except KeyError:
        result = {
            "code": "ERROR",
            "error_type": "DATABASE_no_temp_unit",
            "message": "The database did not indicate which units the temperature is reported in. This is an error in the connection to the NOAA database, and it needs attention immediately"
        }
        print(json.dumps(result, indent=4))
        exit()
    if temperatureUnit == "C":
        temperature = (temperature * (9.0 / 5.0)) + 32.0
    
    probPrecip = now.get("probabilityOfPrecipitation", {}).get("value", "")
    if probPrecip == "null":
        probPrecip = ""

    relHumidity = now.get("relativeHumidity", {}).get("value", "")
    if relHumidity == "null":
        relHumidity = ""

    windSpeed = now.get("windSpeed", "")
    windDirection = now.get("windDirection", "")

    forecastSummary = now.get("shortForecast", "")

    result = {
        "startTime": startTime,
        "endTime": endTime,

        "isDaytime": isDaytime,

        "temperature": temperature,

        "probPrecip": probPrecip,
        "relHumidity": relHumidity,

        "windSpeed": windSpeed,
        "windDirection": windDirection,

        "uvIndex": "",

        "forecastSummary": forecastSummary
    }

    return result



# Get weather info at a latitude, longitude
def get_basic_weather_latlon(lat, lon):
    # Check if latitude or longitude is "N/A"
    if lat == "N/A" or lon == "N/A":
        result = {
            "code": "ERROR",
            "error_type": "invalid_coordinates",
            "message": "Latitude or Longitude is missing or invalid."
        }
        print(json.dumps(result, indent=4))
        return result  # Return the error response instead of making a request
    
    res = N.points_forecast(lat, lon, type="forecast")
    now = res['properties']['periods'][0]

    startTime = now.get("startTime", "")
    endTime = now.get("endTime", "")
    isDaytime = now.get("isDaytime", "")

    temperature = now.get("temperature", "")
    try:
        temperatureUnit = now["temperatureUnit"]
    except KeyError:
        result = {
            "code": "ERROR",
            "error_type": "DATABASE_no_temp_unit",
            "message": "The database did not indicate which units the temperature is reported in. This is an error in the connection to the NOAA database, and it needs attention immediately"
        }
        print(json.dumps(result, indent=4))
        exit()
    if temperatureUnit == "C":
        temperature = (temperature * (9.0 / 5.0)) + 32.0
    
    probPrecip = now.get("probabilityOfPrecipitation", {}).get("value", "")
    if probPrecip == None:
        probPrecip = ""

    relHumidity = now.get("relativeHumidity", {}).get("value", "")
    if relHumidity == None:
        relHumidity = ""

    windSpeed = now.get("windSpeed", "")
    windDirection = now.get("windDirection", "")

    forecastSummary = now.get("shortForecast", "")

    result = {
        "startTime": startTime,
        "endTime": endTime,

        "isDaytime": isDaytime,

        "temperature": temperature,

        "probPrecip": probPrecip,
        "relHumidity": relHumidity,

        "windSpeed": windSpeed,
        "windDirection": windDirection,

        "forecastSummary": forecastSummary,

        "uvIndex": get_uv_index(lat, lon)
    }

    return result



def get_uv_index(lat, lon):
    lines = requests.get("https://www.cpc.ncep.noaa.gov/products/stratosphere/uv_index/bulletin.txt").text.split("\n")

    i = 0
    while i < len(lines):
        if "CITY" in lines[i]:
            i += 1
            break
        else:
            i += 1
    
    collected = []
    for line in lines[i:]:
        parts = filter(lambda x: x != "", map(lambda x: x.strip(), line.split("  ")))
        for part in parts:
            collected.append(part)
    
    uvmap = {}

    while len(collected) >= 3:
        city = collected.pop(0)
        state = collected.pop(0)
        uv = collected.pop(0)

        key = f"{city} {state}"
        uv = int(uv)

        uvmap[key] = uv
    
    closest_city = get_closest_uv_city(lat, lon)

    return uvmap.get(closest_city, "")

def distance(a_lat, a_lon, b_lat, b_lon):
    return ((b_lat - a_lat) ** 2 + (b_lon - a_lon) ** 2) ** 0.5


def get_closest_uv_city(lat, lon):

    city_map = {
        "ALBUQUERQUE NM": (35.093779, -106.645375),
        "LITTLE ROCK AR": (34.731196, -92.358115),
        "ANCHORAGE AK": (61.201635, -149.855982),
        "LOS ANGELES CA": (34.175477, -118.480221),
        "ATLANTIC CITY NJ": (39.383432, -74.467481),
        "LOUISVILLE KY": (38.176383, -85.681930),
        "ATLANTA GA": (33.748492, -84.446447),
        "MEMPHIS TN": (35.119206, -89.958910),
        "BALTIMORE MD": (39.307919, -76.605990),
        "MIAMI FL": (25.784873, -80.221712),
        "BILLINGS MT": (45.766990, -108.561719),
        "MILWAUKEE WI": (43.050674, -87.946621),
        "BISMARCK ND": (46.821625, -100.777803),
        "MINNEAPOLIS MN": (44.961500, -93.263933),
        "BOISE ID": (43.607974, -116.230958),
        "MOBILE AL": (30.670142, -88.140929),
        "BOSTON MA": (42.318214, -71.084370),
        "NEW ORLEANS LA": (30.045320, -89.914739),
        "BUFFALO NY": (42.903220, -78.862017),
        "NEW YORK NY": (40.69108, -73.895797),
        "BURLINGTON VT": (44.488524, -73.21630),
        "NORFOLK VA": (36.869636, -76.214791),
        "CHARLESTON WV": (38.35474, -81.62188),
        "OKLAHOMA CITY OK": (35.455118, -97.533206),
        "CHARLESTON SC": (32.79207, -80.02049),
        "OMAHA NE": (41.25647, -96.055015),
        "CHEYENNE WY": (41.12875, -104.794204),
        "PHILADELPHIA PA": (40.00337, -75.14129),
        "CHICAGO IL": (41.85063, -87.657758),
        "PHOENIX AZ": (33.542101, -112.072650),
        "CLEVELAND OH": (41.48085, -81.683585),
        "PITTSBURGH PA": (40.44107, -79.97734),
        "CONCORD NH": (43.23019, -71.553355),
        "PORTLAND ME": (43.67674, -70.29406),
        "DALLAS TX": (32.78672, -96.790003),
        "PORTLAND OR": (45.527900, -122.61450),
        "DENVER CO": (39.73803, -104.965895),
        "PROVIDENCE RI": (41.820911, -71.418851),
        "DES MOINES IA": (41.57119, -93.615420),
        "RALEIGH NC": (35.83632, -78.656937),
        "DETROIT MI": (42.37558, -83.08541),
        "SALT LAKE CITY UT": (40.77559, -111.918841),
        "DOVER DE": (39.163030, -75.531701),
        "SAN FRANCISCO CA": (37.754556, -122.436961),
        "HARTFORD CT": (41.764823, -72.682681),
        "SAN JUAN PR": (18.39493, -66.053650),
        "HONOLULU HI": (21.315436, -157.81777),
        "SEATTLE WA": (47.58616, -122.317932),
        "HOUSTON TX": (29.78182, -95.38429),
        "SIOUX FALLS SD": (43.538270, -96.718315),
        "INDIANAPOLIS IN": (39.760920, -86.138986),
        "ST. LOUIS MO": (38.62574, -90.2445),
        "JACKSON MS": (32.31934, -90.218509),
        "TAMPA FL": (27.978445, -82.45967),
        "JACKSONVILLE FL": (30.353784, -81.634107),
        "WASHINGTON DC": (38.905395, -77.010399),
        "LAS VEGAS NV": (36.19356, -115.26293),
        "WICHITA KS": (37.68678, -97.33421)
    }

    city_map_sorted = {key: val for key, val in sorted(city_map.items(), key=lambda item: distance(lat, lon, item[1][0], item[1][1]))}

    return list(city_map_sorted.items())[0][0]
