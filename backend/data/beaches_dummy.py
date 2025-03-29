import json

# ~~ ~~ ~~ ~~ ~~ ~~ ~~
# temporary beach data

beaches = {}
with open("beach_data/beach_attributes.json", 'r') as beaches_file:
    beaches = json.loads(beaches_file.read())

# Get dummy beach info
def get_dummy_beach_info_by_id(beach_id):
    try:
        beach_info = beaches[beach_id]

        beach_name = beach_info["BEACH_NAME"]
        beach_county = beach_info["BEACH_COUNTY"]
        beach_state = beach_info["BEACH_STATE"]
        beach_tribe = beach_info["BEACH_TRIBE_CODE"]
        beach_length = beach_info["BEACH_LEN_IN_MI"]
        beach_access = beach_info["BEACH_ACCESS"]
        latitude = (float(beach_info["START_LATITUDE_MEASURE"]) + float(beach_info["END_LATITUDE_MEASURE"])) / 2.0
        longitude = (float(beach_info["START_LONGITUDE_MEASURE"]) + float(beach_info["END_LONGITUDE_MEASURE"])) / 2.0
        joinkey = beach_info["SOURCE_JOINKEY"]

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