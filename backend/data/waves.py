import requests
import xml.etree.ElementTree as ET
from math import radians, sin, cos, sqrt, atan2

# Put beach coordinates here
your_lat = 36.863140 
your_lon = -76.015778

# Get list of active buoys from NOAA
url = "https://www.ndbc.noaa.gov/activestations.xml"
response = requests.get(url)
root = ET.fromstring(response.content)

stations = []

#Parse station XML
for station in root.findall('station'):
    try:
        station_id = station.attrib['id']
        lat = float(station.attrib['lat'])
        lon = float(station.attrib['lon'])
        stations.append((station_id, lat, lon))
    except Exception:
        continue

# Haversine distance function
def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # km
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2)**2
    return R * 2 * atan2(sqrt(a), sqrt(1 - a))

#Sort by distance
stations_with_distance = sorted(
    stations, key=lambda x: haversine(your_lat, your_lon, x[1], x[2])
)

#Try each station until one returns wave data
found_data = False
for station_id, lat, lon in stations_with_distance:
    try:
        wave_url = f"https://www.ndbc.noaa.gov/data/realtime2/{station_id}.txt"
        wave_response = requests.get(wave_url)
        text = wave_response.text

        if "WVHT" in text:  # "Wave Height" column exists
            print(f"\n Nearest buoy with wave data: {station_id} ({lat}, {lon})")
            print("Wave data:\n")
            print("\n".join(text.splitlines()[:15]))
            found_data = True
            break
    except Exception:
        continue

if not found_data:
    print(" No nearby buoys with wave data found. Try a more coastal location.")


