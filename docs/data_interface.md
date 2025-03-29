# Data Interface

There are a number of utilities available through the route "{todo}". These are accessed by constructing a JSON object and posting it to the aforementioned route. The response is another JSON object with the requested information. There is one key that every request must have: `"request_type"`, which identifies which kind of request you are making. This key determines which other keys are required, and which keys you can expect to receive. **Scroll to the bottom for possible error responses**

*In the below formatting, `{}` represent a piece of data that can be configured*

## Weather Info

Get the *current* weather report for a location. Can use either a ZIP code or a latitude and longitude.

### Request Format

With ZIP code:
```JSON
{
    "request_type": "current_basic_weather",
    "zip_code": "{zip code}"
}
```

With latitude and longitude:
```JSON
{
    "request_type": "current_basic_weather",
    "latitude": "{latitude}",
    "longitude": "{longitude}"
}
```

### Response Format

In either case, the response looks like:

```JSON
{
    "code": "current_basic_weather",
    "startTime": "{start time for the forecast block}",
    "endTime": "{end time for the forecast block}",
    "isDaytime": "{'true' if daytime, 'false' otherwise}",
    "temperature": "{current temperature}",
    "probPrecip": "{probability of precipitation in % *}",
    "relHumidity": "{relative humidity in % *}",
    "windSpeed": "{wind speed **}",
    "windDirection": "{direction wind is coming from}",
    "forecastSummary": "{short phrase describing the weather}"
}
```

\*: These are unreliable if you request by latitude and longitude. If they aren't found, you will receive an empty string instead.

\*\*: The way this is formatted is strange. It seems to be formatted for human readability, but only sometimes. Some responses will just have a number, which is presumably in mph, while others will say something like, "2 to 7 mph". Use with care.

---

## Dummy Beach Info

Get info about a beach by ID. This uses a really simple beach database that may be swapped out, which may require switching our ID system, so it is temporary.

### Request format

```JSON
{
    "request_type": "dummy_get_beach_info_by_id",
    "beach_id": "{requested beach id}"
}
```

### Response Format

```JSON
{
    "code": "dummy_get_beach_info_by_id",
    "beach_name": "{the registered name of the beach}",
    "beach_county": "{the county the beach is in}",
    "beach_state": "{the state the beach is in}",
    "beach_tribe": "{the indigenous tribe associated with the beach *}",
    "beach_length": "{the length of the beach in miles}",
    "beach_access": "{'Public' if the beach is open to the public, 'Private' otherwise}",
    "latitude": "{the latitude of the beach}",
    "longitude": "{the longitude of the beach}",
    "joinkey": "{a key for accessing this beach in the database}"
}
```

---

# Errors

There are circumstances where you may receive an error response. These errors are mostly to indicate when the request received is missing a required key, but there are a few instances where the database can fail. I recommend checking each response for an error, and printing an error to the console with the message field from the error response.

### Error Response Format

```JSON
{
    "code": "ERROR",
    "error_type": "{the type of error encountered}",
    "message": "{an informative message about the cause of the error}"
}
```

When you make a request, you should check the response for if the code is the literal "ERROR". If so, you should log an error to the console using the rest of the error keys. The message field should generally be informative enough to let you know why the request failed. If the "error_type" starts with DATABASE, the issue occurred during processing and was not the result of an improper request. This needs to be reported immediately if found, because it indicates an unexpected issue with the backend.