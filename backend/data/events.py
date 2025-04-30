import requests
import json
from datetime import datetime

def check_event(time, beach_id, event_name):
    import beaches
    import basic_forecast

    beach = beaches.get_beach_info_by_id(beach_id)

    lat = float(beach["latitude"])
    lon = float(beach["longitude"])

    point_info = requests.get(f"https://api.weather.gov/zones?type=land&point={lat},{lon}&limit=500").json()

    zone_id = point_info["features"][0]["properties"]["id"]

    alerts = get_alerts(time, zone_id)

    messages = []

    for alert in alerts:
        print(json.dumps(alert, indent=4))
        start = alert["properties"]["onset"]
        end = alert["properties"]["ends"]

        start = datetime.strptime(start,"%Y-%m-%dT%H:%M:%S%z")
        end = datetime.strptime(end,"%Y-%m-%dT%H:%M:%S%z")

        if start <= time and time <= end:
            messages.append(alert["properties"]["headline"])
    
    if len(messages) == 0:
        return {
            "action": "none"
        }
    
    else:
        title = f"Event '{event_name}' impacted by NWS Alert"
        message = f"Your registered event '{event_name}' may be impacted by one or more National Weather Service alerts or advisories. Consult local authorities for accurate and up-to-date information. The advisories are as follows:\n"
        for m in messages:
            message += "\n"
            message += m.strip()
        return {
            "action": "notify",
            "title": title,
            "message": message
        }

    return {
        "action": "none"
    }


def get_alerts(time, zone_id):
    alerts = requests.get(f"https://api.weather.gov/alerts/active?status=actual&message_type=alert,update,cancel&zone={zone_id}&urgency=Immediate,Expected,Future&severity=Extreme,Severe,Moderate,Minor&certainty=Observed,Likely,Possible,Unlikely&limit=500")
    # print(json.dumps(alerts.json(), indent=4))
    
    alerts = alerts.json()["features"]

    return alerts