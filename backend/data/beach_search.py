import json
import os

MAX_SEARCH_CACHE = 20
MAX_SEARCH_RESULTS = 500

# Construct the correct absolute path
base_dir = os.path.dirname(__file__)  # Get the directory of the current script
json_path = os.path.join(base_dir, "beach_data", "beach_attributes.json")

cache_path = os.path.join(base_dir, "caching", "search_cache.json")

beaches = {}
with open(json_path, 'r') as beaches_file:
    beaches = json.loads(beaches_file.read())


# Search for beach by latitude and longitude
def search_beach_by_lat_lon(lat, lon, start, stop):

    import beaches as beaches_info
    import basic_weather

    results = {key: val for key, val in sorted(beaches.items(), key=lambda item: distance(lat, lon, item[1]))}
    count = 0
    # for res in results.items():
    #     if count < 20:
    #         print(f"{res[0]}:\t{res[1]}")
    #         count += 1
    #     else:
    #         break
    
    results = list(results.keys())[start:stop]

    beach_elements = {}

    for key in results:
        beach_info = beaches_info.get_beach_info_by_id(key)

        lat = beach_info["latitude"]
        lon = beach_info["longitude"]

        beach_weather = basic_weather.get_basic_weather_latlon(lat, lon)

        beach_info["weather"] = beach_weather
        beach_elements[key] = beach_info

    result = {
        "order": results,
        "result": beach_elements
    }

    return result

def distance(a_lat, a_lon, other):

    start_lat = other.get("START_LATITUDE_MEASURE", "")
    end_lat = other.get("END_LATITUDE_MEASURE", "")
    start_lon = other.get("START_LONGITUDE_MEASURE", "")
    end_lon = other.get("END_LONGITUDE_MEASURE", "")

    try:
        start_lat = float(start_lat)
    except ValueError:
        start_lat = ""
    
    try:
        end_lat = float(end_lat)
    except ValueError:
        end_lat = ""
    
    try:
        start_lon = float(start_lon)
    except ValueError:
        start_lon = ""
    
    try:
        end_lon = float(end_lon)
    except ValueError:
        end_lon = ""
    
    # Compute latitude as the average of start and end if they both exist, or
    # select whichever exists. This is because sometimes one end is left out if
    # it would be similar to the other
    if start_lat != "" and end_lat != "":
        latitude = (start_lat + end_lat) / 2.0
    elif start_lat != "":
        latitude = start_lat
    elif end_lat != "":
        latitude = end_lat
    else:
        return float('inf')
    
    # Same as above, for longitude
    if start_lon != "" and end_lon != "":
        longitude = (start_lon + end_lon) / 2.0
    elif start_lon != "":
        longitude = start_lon
    elif end_lat != "":
        longitude = end_lon
    else:
        return float('inf')

    b_lat = latitude
    b_lon = longitude
    return ((b_lat - a_lat) ** 2 + (b_lon - a_lon) ** 2) ** 0.5
