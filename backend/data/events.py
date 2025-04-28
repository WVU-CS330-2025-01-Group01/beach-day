

def check_event(time, beach_id):
    import beaches
    import basic_forecast

    beach = beaches.get_beach_info_by_id(beach_id)

    lat = float(beach["latitude"])
    lon = float(beach["longitude"])

    print(time)

    forecast = basic_forecast.get_forecast_at_time(lat, lon, time)

    if forecast != None:

        title = ""
        message = ""

        return {
            "action": "notify",

            "title": title,
            "message": message
        }

    return {
        "action": "none"
    }