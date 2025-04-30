

import json
from datetime import datetime

# Interface to NOAA weather forecasting
from noaa_sdk import NOAA

# Access NOAA forecast data
N = NOAA()


# Get the weather forecast
def get_forecast(lat, lon):
    res = N.points_forecast(lat, lon, type="forecast")

    periods = res["properties"]["periods"]

    return list(periods)

def get_forecast_at_time(lat, lon, time):
    periods = get_forecast(lat, lon)

    for period in periods:
        start = datetime.strptime(period["startTime"],"%Y-%m-%dT%H:%M:%S%z")
        end = datetime.strptime(period["endTime"],"%Y-%m-%dT%H:%M:%S%z")

        print()
        print(start)
        print(end)
        print()
        print()
        
        if start <= time and time < end:
            startTime = period.get("startTime", "")
            endTime = period.get("endTime", "")
            isDaytime = period.get("isDaytime", "")

            temperature = period.get("temperature", "")
            try:
                temperatureUnit = period["temperatureUnit"]
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
            
            probPrecip = period.get("probabilityOfPrecipitation", {}).get("value", "")
            if probPrecip == None:
                probPrecip = ""

            relHumidity = period.get("relativeHumidity", {}).get("value", "")
            if relHumidity == None:
                relHumidity = ""

            windSpeed = period.get("windSpeed", "")
            windDirection = period.get("windDirection", "")

            forecastSummary = period.get("shortForecast", "")

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
        
    return None

# 2025-05-04T06:00:00-04:00

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

        "forecastSummary": forecastSummary
    }

    return result

