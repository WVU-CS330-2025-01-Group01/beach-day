# Get current date and time
from datetime import datetime

# Interface to NOAA weather forecasting
from noaa_sdk import NOAA

# Handle json data
import json

# Access NOAA forecast data
N = NOAA()

# Get the parameters as JSON from standard input
# Then handle each request type


input_params = json.loads(input())
try:
    request_type = input_params["request_type"]
except KeyError:
    result = {
        "code": "ERROR",
        "error_type": "missing_request_type",
        "message": "All requests must supply the 'request_type' key"
    }
    print(json.dumps(result, indent=4))
    exit()

try:

    # Generic weather info, not meant for building a map
    if request_type == "current_basic_weather":
        now = datetime.now()

        zip_code = input_params["zip_code"]
        country = input_params.get("country_code", "US")

        res = N.get_forecasts(zip_code, country)
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
                "error_type": "database_no_temp_unit",
                "message": "The database did not indicate which units the temperature is reported in. This is an error in the connection to the NOAA database, and it needs attention immediately"
            }
            print(json.dumps(result, indent=4))
            exit()
        if temperatureUnit == "C":
            temperature = (temperature * (9.0 / 5.0)) + 32.0
        
        probPrecip = now.get("probabilityOfPrecipitation", {}).get("value", "")

        relHumidity = now.get("relativeHumidity", {}).get("value", "")

        windSpeed = now.get("windSpeed", "")
        windDirection = now.get("windDirection", "")

        forecastSummary = now.get("shortForecast", "")

        result = {
            "code": "current_basic_weather",
            "zip_code": zip_code,
            "country": country,

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
        print(json.dumps(result, indent=4))
        exit()
    
    else:
        result = {
            "code": "ERROR",
            "error_type": "request_type_invalid",
            "message": f"Request type '{request_type}' is not recognized"
        }
        print(json.dumps(result, indent=4))
        exit()


except KeyError as e:
    result = {
        "code": "ERROR",
        "error_type": "malformed_request",
        "message": f"Malformed request for request type '{request_type}' (missing key '{e.args[0]}')"
    }
    print(json.dumps(result, indent=4))
    exit()
