# Get current date and time
from datetime import datetime

# Handle json data
import json

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
        import basic_weather

        now = datetime.now()

        result = {}

        if "zip_code" in input_params.keys():
            zip_code = str(input_params["zip_code"])
            country = input_params.get("country_code", "US")
            result = basic_weather.get_basic_weather_zip(zip_code, country)
        elif "latitude" in input_params.keys() and "longitude" in input_params.keys():
            lat = float(input_params["latitude"])
            lon = float(input_params["longitude"])
            result = basic_weather.get_basic_weather_latlon(lat, lon)
        else:
            result = {
                "code": "ERROR",
                "error_type": "malformed_request",
                "message": f"Malformed request for request type '{request_type}' (must specify either zip_code or latitude and longitude)"
            }
            print(json.dumps(result, indent=4))
            exit()

        result["code"] = "current_basic_weather"

        print(json.dumps(result, indent=4))
        exit()

    # Beach info
    elif request_type == "get_beach_info_by_id":
        import beaches
        import basic_weather

        beach_id = input_params["beach_id"]

        beach_info = beaches.get_beach_info_by_id(beach_id)

        result = beach_info
        result["code"] = "get_beach_info_by_id"

        print(json.dumps(result, indent=4))
        exit()

    # Beach info with weather included
    elif request_type == "get_beach_info_weather_by_id":
        import beaches
        import basic_weather

        beach_id = input_params["beach_id"]
       
        beach_info = beaches.get_beach_info_by_id(beach_id)
        
        lat = beach_info["latitude"]
        lon = beach_info["longitude"]
        beach_weather = basic_weather.get_basic_weather_latlon(lat, lon)

        result = beach_info
        result["weather"] = beach_weather
        result["code"] = "get_beach_info_weather_by_id"
        
        print(json.dumps(result, indent=4))
        exit()
    
    
    # Beach info (batch mode)
    elif request_type == "get_beach_info_weather_by_id_batch":
        import beaches
        import basic_weather

        beaches_input = map(lambda x: x.strip(), input_params["beach_ids"].split(","))

        beaches_info = {}

        for key in beaches_input:
            beach_info = beaches.get_beach_info_by_id(key)

            lat = beach_info["latitude"]
            lon = beach_info["longitude"]
            beach_weather = basic_weather.get_basic_weather_latlon(lat, lon)

            beach_info["weather"] = beach_weather

            beaches_info[key] = beach_info
        
        result = beaches_info
        result["code"] = "get_beach_info_weather_by_id_batch"

        print(json.dumps(result, indent=4))
        exit()
    
    

    # Dummy request types from testing. Will still work, but should be avoided
    # Dummy beach info (should roughly mimic the real beach info access)
    elif request_type == "dummy_get_beach_info_by_id":
        import beaches
        import basic_weather

        beach_id = input_params["beach_id"]

        beach_info = beaches.get_dummy_beach_info_by_id(beach_id)

        result = beach_info
        result["code"] = "dummy_get_beach_info_by_id"

        print(json.dumps(result, indent=4))
        exit()

    # Dummy beach info (should roughly mimic the real beach info access) with weather included
    elif request_type == "dummy_get_beach_info_weather_by_id":
        import beaches
        import basic_weather

        beach_id = input_params["beach_id"]
       
        beach_info = beaches.get_dummy_beach_info_by_id(beach_id)
        
        lat = beach_info["latitude"]
        lon = beach_info["longitude"]
        beach_weather = basic_weather.get_basic_weather_latlon(lat, lon)

        result = beach_info
        result["weather"] = beach_weather
        result["code"] = "dummy_get_beach_info_weather_by_id"
        
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
