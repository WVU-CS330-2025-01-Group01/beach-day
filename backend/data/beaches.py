import json
import os

# Construct the correct absolute path
base_dir = os.path.dirname(__file__)  # Get the directory of the current script
json_path = os.path.join(base_dir, "beach_data", "beach_attributes.json")

# All functions use this, and it never changes, so load it globally
beaches = {}
with open(json_path, 'r') as beaches_file:
    beaches = json.loads(beaches_file.read())


def get_beach_info_by_id(beach_id):
    """
    Get info about a beach by id

    :param beach_id: the beach id to search for

    :returns: JSON-compatible map with keys:
    * beach_name
    * beach_county
    * beach_state
    * beach_tribe
    * beach_length
    * beach_access
    * latitude
    * longitude
    * joinkey
    """

    try:
        beach_info = beaches[beach_id]

        # Check and replace missing or empty fields with empty string
        beach_name = beach_info.get("BEACH_NAME", "")
        beach_county = beach_info.get("BEACH_COUNTY", "")
        beach_state = beach_info.get("BEACH_STATE", "")
        beach_tribe = beach_info.get("BEACH_TRIBE_CODE", "")
        beach_length = beach_info.get("BEACH_LEN_IN_MI", "")
        beach_access = beach_info.get("BEACH_ACCESS", "")

        # Check if latitude and longitude values are available before calculating
        start_lat = beach_info.get("START_LATITUDE_MEASURE", "")
        end_lat = beach_info.get("END_LATITUDE_MEASURE", "")
        start_lon = beach_info.get("START_LONGITUDE_MEASURE", "")
        end_lon = beach_info.get("END_LONGITUDE_MEASURE", "")

        # Use exception handling to detect invalid length and endpoint measurements
        try:
            beach_length = float(beach_length)
        except ValueError:
            beach_length = ""

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
            latitude = str((start_lat + end_lat) / 2.0)
        elif start_lat != "":
            latitude = str(start_lat)
        elif end_lat != "":
            latitude = str(end_lat)
        else:
            latitude = ""
        
        # Same as above, for longitude
        if start_lon != "" and end_lon != "":
            longitude = str((start_lon + end_lon) / 2.0)
        elif start_lon != "":
            longitude = str(start_lon)
        elif end_lat != "":
            longitude = str(end_lon)
        else:
            longitude = ""
        
        
        joinkey = beach_info.get("SOURCE_JOINKEY", "")
        
        result = {
            "beach_name": beach_name,
            "beach_county": beach_county,
            "beach_state": beach_state,
            "beach_tribe": beach_tribe,
            "beach_length": beach_length,
            "beach_access": beach_access,
            "latitude": latitude,
            "longitude": longitude,
            "joinkey": joinkey
        }

        return result
        
    # If requested beach ID doest not exist, exit and respond with an error response
    except KeyError as e:
        result = {
            "code": "ERROR",
            "error_type": "invalid_beach_id",
            "message": "The requested beach ID could not be found"
        }
        print(json.dumps(result, indent=4))
        exit()






# Get dummy beach info
def get_dummy_beach_info_by_id(beach_id):
    """
    Original dummy function from before the ID system was finalized. Still compatible with many other components, so
    it is left in to prevent breakage where new features are not required.

    :param beach_id: the beach id to search for

    :returns: JSON-compatible map with keys:
    * beach_name
    * beach_county
    * beach_state
    * beach_tribe
    * beach_length
    * beach_access
    * latitude
    * longitude
    * joinkey
    """

    try:
        beach_info = beaches[beach_id]

        # Check and replace missing or empty fields with "N/A"
        beach_name = beach_info.get("BEACH_NAME", "N/A")
        beach_county = beach_info.get("BEACH_COUNTY", "N/A")
        beach_state = beach_info.get("BEACH_STATE", "N/A")
        beach_tribe = beach_info.get("BEACH_TRIBE_CODE", "N/A")
        beach_length = beach_info.get("BEACH_LEN_IN_MI", "N/A")
        beach_access = beach_info.get("BEACH_ACCESS", "N/A")

        # Check if latitude and longitude values are available before calculating
        start_lat = beach_info.get("START_LATITUDE_MEASURE", "N/A")
        end_lat = beach_info.get("END_LATITUDE_MEASURE", "N/A")
        start_lon = beach_info.get("START_LONGITUDE_MEASURE", "N/A")
        end_lon = beach_info.get("END_LONGITUDE_MEASURE", "N/A")

        # If either latitude or longitude is N/A, skip calculation and set as N/A
        if start_lat == "N/A" or end_lat == "N/A":
            latitude = "N/A"
        else:
            try:
                latitude = (float(start_lat) + float(end_lat)) / 2.0
            except ValueError:
                latitude = "N/A"

        if start_lon == "N/A" or end_lon == "N/A":
            longitude = "N/A"
        else:
            try:
                longitude = (float(start_lon) + float(end_lon)) / 2.0
            except ValueError:
                longitude = "N/A"
        
        joinkey = beach_info.get("SOURCE_JOINKEY", "N/A")
        
        result = {
            "beach_name": beach_name,
            "beach_county": beach_county,
            "beach_state": beach_state,
            "beach_tribe": beach_tribe,
            "beach_length": beach_length,
            "beach_access": beach_access,
            "latitude": latitude,
            "longitude": longitude,
            "joinkey": joinkey
        }

        return result
        
    # If requested beach ID doesnt not exist, exit and respond with an error response
    except KeyError as e:
        result = {
            "code": "ERROR",
            "error_type": "invalid_beach_id",
            "message": "The requested beach ID could not be found"
        }
        print(json.dumps(result, indent=4))
        exit()

# ~~ ~~ ~~ ~~ ~~ ~~ ~~