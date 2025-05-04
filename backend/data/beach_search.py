import json
import os

from Levenshtein import distance as edit_distance

MAX_SEARCH_CACHE = 20
MAX_SEARCH_RESULTS = 500

# Construct the correct absolute path
base_dir = os.path.dirname(__file__)  # Get the directory of the current script
json_path = os.path.join(base_dir, "beach_data", "beach_attributes.json")

states_prefix = os.path.join(base_dir, "beach_data", "by_state", "states")

# Search for beach by county and state
def search_beach_by_county_state(county, state, start, stop):
    """
    Search for a beach by county and state. State must be one of the options documented in docs/data_interface.md. Results will be
    sorted by edit distance from the inputted county. Respond with results `start`-`stop-1` from the full set

    :param county: the county to search for
    :param state: the enumerated state
    :param start: the result to start at
    :param stop: the result to stop before
    :returns: JSON-compatible map that includes the order of the search results, as well as additional information about them
    """

    if not state in ["AK", "AL", "AS", "CA", "CT", "DE", "FL", "GA", "GU", "HI", "IL", "IN", "LA", "MA", "MD", "ME", "MI", "MN", "MP", "MS", "NC", "NH", "NJ", "NY", "OH", "OR", "PA", "PR", "RI", "SC", "ST", "TX", "VA", "VI", "WA", "WI"]:
        result = {
            "code": "ERROR",
            "error_type": "invalid_state_in_search",
            "message": "The provided state is not valid"
        }
        print(json.dumps(result, indent=4))
        exit()

    import beaches as beaches_info
    import basic_weather

    path = os.path.join(states_prefix, f"{state}.json")
    beaches = {}
    with open(path, 'r') as beaches_file:
        beaches = json.loads(beaches_file.read())

    results = {key: val for key, val in sorted(beaches.items(), key=lambda item: edit_distance(county, item[1]["BEACH_COUNTY"]))}

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


# Search for beach by latitude and longitude
def search_beach_by_lat_lon(lat, lon, start, stop):
    """
    Search for a beach by latitude and longitude. Respond with results `start`-`stop-1` from the full set

    :param lat: the latitude to search from
    :param lon: the longitude to search from
    :param start: the result to start at
    :param stop: the result to stop before
    :returns: JSON-compatible map that includes the order of the search results, as well as additional information about them
    """

    beaches = {}
    with open(json_path, 'r') as beaches_file:
        beaches = json.loads(beaches_file.read())

    import beaches as beaches_info
    import basic_weather

    results = {key: val for key, val in sorted(beaches.items(), key=lambda item: distance(float(lat), float(lon), item[1]))}
    
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
    """
    Get the distance between a latitude, longitude pair and a beach object

    :param a_lat: the latitude to measure from
    :param a_lon: the longitude to measure from
    :param other: the beach object to measure to
    :returns: the distance
    """

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
