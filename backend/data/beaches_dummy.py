import json
import os
# ~~ ~~ ~~ ~~ ~~ ~~ ~~
# temporary beach data

# Construct the correct absolute path
base_dir = os.path.dirname(__file__)  # Get the directory of the current script
json_path = os.path.join(base_dir, "beach_data", "beach_attributes.json")

beaches = {}
with open(json_path, 'r') as beaches_file:
    beaches = json.loads(beaches_file.read())

# Get dummy beach info
def get_dummy_beach_info_by_id(beach_id):
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
        

    except KeyError as e:
        result = {
            "code": "ERROR",
            "error_type": "invalid_beach_id",
            "message": "The requested beach ID could not be found"
        }
        print(json.dumps(result, indent=4))
        exit()

# ~~ ~~ ~~ ~~ ~~ ~~ ~~