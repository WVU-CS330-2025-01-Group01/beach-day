import requests
import json
from datetime import datetime

def check_event(time, beach_id, event_name, email_address):
    """
    Check an event for relevant alerts

    :param time: the datetime object for the event
    :param beach_id: the beach id for the event
    :param event_name: user-specified name for the event
    :returns: JSON-compatible object with the notifications or lack thereof
    """
    import beaches
    import basic_forecast

    beach = beaches.get_beach_info_by_id(beach_id)

    lat = float(beach["latitude"])
    lon = float(beach["longitude"])

    point_info = requests.get(f"https://api.weather.gov/zones?type=land&point={lat},{lon}&limit=500").json()

    try:
        zone_id = point_info["features"][0]["properties"]["id"]
    except IndexError:
        return {
            "action": "none"
        }

    alerts = get_alerts(time, zone_id)

    messages = []

    for alert in alerts:
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
        if not (email_address == None or email_address == "null" or email_address == ""):
            title = f"Your event '{event_name}' may be impacted by one or more National Weather Service alerts or advisories. Contact local authorities for accurate and up-to-date information. Advisories follow:\n"
            subject = f"Event '{event_name}' impacted by NWS Alert"

            body = ""
            with open("./email_template.html", 'r') as f:
                body = f.read()
            
            alert_template = ""
            with open("./email_alert_template.html", 'r') as f:
                alert_template = f.read()
            
            body = body.replace("%~^title^~%", title)

            message_alerts = ""
            for m in messages:
                message_alerts += alert_template.replace("%~^info^~%", m.strip())
            
            body = body.replace("%~^alerts^~%", message_alerts)
            send_email(email_address, subject, body)


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
    """
    Check alerts in a zone at a given time

    :param time: datetime object with the time to check
    :param zone_id: the zone id of the beach that the event occurs at
    :returns: features response for the alerts in the beach's zone at the given time
    """
    alerts = requests.get(f"https://api.weather.gov/alerts/active?status=actual&message_type=alert,update,cancel&zone={zone_id}&urgency=Immediate,Expected,Future&severity=Extreme,Severe,Moderate,Minor&certainty=Observed,Likely,Possible,Unlikely&limit=500")
    # print(json.dumps(alerts.json(), indent=4))
    
    alerts = alerts.json()["features"]

    return alerts

def send_email(address, subject, body):
    """
    Send an email from the beach day noreply address

    :param address: the address to send to
    :param subject: subject line for the message
    :param body: HTML body for the message
    """

    from_address = ""
    app_pass = ""
    with open("../.env", 'r') as f:
        for line in f.readlines():
            parts = line.split("=")
            if len(parts) == 2:
                if parts[0].strip() == "BEACH_DAY_EMAIL":
                    from_address = parts[1].strip()
                if parts[0].strip() == "BEACH_DAY_APP_PASS":
                    app_pass = parts[1].strip()
    
    if from_address == "" or app_pass == "":
        return

    import smtplib
    from email.mime.text import MIMEText

    email = MIMEText(body, 'html')
    email['Subject'] = subject
    email['From'] = from_address
    email['To'] = address

    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
        server.login(from_address, app_pass)
        server.sendmail(from_address, address, email.as_string())
    print("Message sent!")
