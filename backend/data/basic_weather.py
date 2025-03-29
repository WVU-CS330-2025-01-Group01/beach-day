

import json

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

        "forecastSummary": forecastSummary
    }

    return result



# Get weather info at a latitude, longitude
def get_basic_weather_latlon(lat, lon):
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

        "forecastSummary": forecastSummary
    }

    return result

