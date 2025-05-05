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
    "uvIndex": "{uv index of the nearest measurement location ***}",
    "forecastSummary": "{short phrase describing the weather}"
}
```

\*: These are unreliable if you request by latitude and longitude. If they aren't found, you will receive an empty string instead.

\*\*: The way this is formatted is strange. It seems to be formatted for human readability, but only sometimes. Some responses will just have a number, which is presumably in mph, while others will say something like, "2 to 7 mph". Use with care.

\*\*\*: Does not work in zip code mode. If you supply a zip code, this property with be and empty string `""`.

---

## Beach Info

Get info about a beach by ID. This is the final interface. This should be used instead of the dummy requests.

### Request format

```JSON
{
    "request_type": "get_beach_info_by_id",
    "beach_id": "{requested beach id}"
}
```

### Response Format

```JSON
{
    "code": "get_beach_info_by_id",
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

## Beach Info With Weather

Get info about a beach by ID. Identical to the `"get_beach_info_by_id"`, but has an additional key that is the result of calling the weather info request with latitude and longitude.

### Request format

```JSON
{
    "request_type": "get_beach_info_weather_by_id",
    "beach_id": "{requested beach id}"
}
```

### Response Format

```JSON
{
    "code": "get_beach_info_by_id",
    "beach_name": "{the registered name of the beach}",
    "beach_county": "{the county the beach is in}",
    "beach_state": "{the state the beach is in}",
    "beach_tribe": "{the indigenous tribe associated with the beach *}",
    "beach_length": "{the length of the beach in miles}",
    "beach_access": "{'Public' if the beach is open to the public, 'Private' otherwise}",
    "latitude": "{the latitude of the beach}",
    "longitude": "{the longitude of the beach}",
    "joinkey": "{a key for accessing this beach in the database}",
    "weather": {
        "startTime": "{start time for the forecast block}",
        "endTime": "{end time for the forecast block}",
        "isDaytime": "{'true' if daytime, 'false' otherwise}",
        "temperature": "{current temperature}",
        "probPrecip": "{probability of precipitation in % *}",
        "relHumidity": "{relative humidity in % *}",
        "windSpeed": "{wind speed **}",
        "windDirection": "{direction wind is coming from}",
        "uvIndex": "{uv index of the nearest measurement location ***}",
        "forecastSummary": "{short phrase describing the weather}"
    }
}
```

\*: These are unreliable if you request by latitude and longitude. If they aren't found, you will receive an empty string instead.

\*\*: The way this is formatted is strange. It seems to be formatted for human readability, but only sometimes. Some responses will just have a number, which is presumably in mph, while others will say something like, "2 to 7 mph". Use with care.

\*\*\*: Does not work in zip code mode. If you supply a zip code, this property with be and empty string `""`.

---

## Beach Info With Weather (Batch Mode)

Get beach information for multiple beaches at once. This reduces some overhead, but is still bottlenecked by the speed of the NOAA weather endpoint. Similar to the Beach Info With Weather request type, but modified to support multiple. The "beach_ids" key is *NOT* a JSON list because the Python JSON library sometimes handles them strangely. It should be a comma-separated list of beach ids in a string: "NJ291547,NJ291533". The result contains one key for each beach, identified by the given beach id. The contents of each entry is basically equivalent to calling "get_beach_info_weather_by_id" on that beach alone.

### Request format

```JSON
{
    "request_type": "get_beach_info_weather_by_id_batch",
    "beach_ids": "{beach_1},{beach_2},{...}"
}
```

### Response Format

```JSON
{
    "{beach_1}": {
        "beach_name": "{the registered name of the beach}",
        "beach_county": "{the county the beach is in}",
        "beach_state": "{the state the beach is in}",
        "beach_tribe": "{the indigenous tribe associated with the beach *}",
        "beach_length": "{the length of the beach in miles}",
        "beach_access": "{'Public' if the beach is open to the public, 'Private' otherwise}",
        "latitude": "{the latitude of the beach}",
        "longitude": "{the longitude of the beach}",
        "joinkey": "{a key for accessing this beach in the database}",
        "weather": {
            ...see above
        }
    },
    "{beach_2}": {
        "beach_name": "{the registered name of the beach}",
        "beach_county": "{the county the beach is in}",
        "beach_state": "{the state the beach is in}",
        "beach_tribe": "{the indigenous tribe associated with the beach *}",
        "beach_length": "{the length of the beach in miles}",
        "beach_access": "{'Public' if the beach is open to the public, 'Private' otherwise}",
        "latitude": "{the latitude of the beach}",
        "longitude": "{the longitude of the beach}",
        "joinkey": "{a key for accessing this beach in the database}",
        "weather": {
            ...see above
        }
    },
    ...etc.
}
```

## Dummy Beach Info

Get info about a beach by ID. [Deprecated]

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

## Beach Search by County, State

Search for beaches in a given state and county. State must match exactly (use a dropdown box or something), but county uses Levenshtein distance so the user can mistype the county and still get a reasonable result. Results are sorted by Levenshtein distance, with beach_id1 being the id of the closest match, etc.

**List of valid states (All others will return an error):**
AK, AL, AS, CA, CT, DE, FL, GA, GU, HI, IL, IN, LA, MA, MD, ME, MI, MN, MP, MS, NC, NH, NJ, NY, OH, OR, PA, PR, RI, SC, ST, TX, VA, VI, WA, WI

### Request format

```JSON
{
    "request_type": "search_beach_by_county_state",
    "county": "{county to search for}",
    "state": "{state to search for}",
    "start": "{search result to start at}",
    "stop": "{search result to end before (exclusive)}"
}
```

### Response Format

```JSON
{
    "order": [
        "{beach_id1}",
        "{beach_id2}",
        "{beach_id3}",
        ...etc
    ],
    "result": {
        "{beach_id1}": {
            "beach_name": "{beach_name}",
            "beach_county": "{beach_county}",
            ...etc
            "weather": {
                ...etc
            }
        },
        "{beach_id2}": {
            ..etc
        },
        "{beach_id3}": {
            ...etc
        }
    },
    "code": "search_beach_by_lat_lon"
}
```


---

## Beach Search by Latitude and Longitude

Search for beaches near a location. Get results from `start` (inclusive) to `stop` (exclusive) in a search sorting by distance to target latitude and longitude. Returns a key containing the order (`order`), and a set of beaches identified by their ids that are not necessarily in order (`result`). The beach info are similar to the beach info requests above, and include the weather in the same way as other request types include the weather.

### Request format

```JSON
{
    "request_type": "search_beach_by_lat_lon",
    "latitude": "{latitude}",
    "longitude": "{longitude}",
    "start": "{search result to start at}",
    "stop": "{search result to end before (exclusive)}"
}
```

### Response Format

```JSON
{
    "order": [
        "{beach_id1}",
        "{beach_id2}",
        "{beach_id3}",
        ...etc
    ],
    "result": {
        "{beach_id1}": {
            "beach_name": "{beach_name}",
            "beach_county": "{beach_county}",
            ...etc
            "weather": {
                ...etc
            }
        },
        "{beach_id2}": {
            ..etc
        },
        "{beach_id3}": {
            ...etc
        }
    },
    "code": "search_beach_by_lat_lon"
}
```


---

## Beach Search by County, State without weather

Search for beaches in a given state and county. State must match exactly (use a dropdown box or something), but county uses Levenshtein distance so the user can mistype the county and still get a reasonable result. Results are sorted by Levenshtein distance, with beach_id1 being the id of the closest match, etc.

**List of valid states (All others will return an error):**
AK, AL, AS, CA, CT, DE, FL, GA, GU, HI, IL, IN, LA, MA, MD, ME, MI, MN, MP, MS, NC, NH, NJ, NY, OH, OR, PA, PR, RI, SC, ST, TX, VA, VI, WA, WI

### Request format

```JSON
{
    "request_type": "search_beach_by_county_state",
    "county": "{county to search for}",
    "state": "{state to search for}",
    "start": "{search result to start at}",
    "stop": "{search result to end before (exclusive)}"
}
```

### Response Format

```JSON
{
    "order": [
        "{beach_id1}",
        "{beach_id2}",
        "{beach_id3}",
        ...etc
    ],
    "result": {
        "{beach_id1}": {
            "beach_name": "{beach_name}",
            "beach_county": "{beach_county}",
            ...etc
            "weather": {
                ...etc
            }
        },
        "{beach_id2}": {
            ..etc
        },
        "{beach_id3}": {
            ...etc
        }
    },
    "code": "search_beach_by_lat_lon"
}
```


---

## Beach Search by Latitude and Longitude without weather

Search for beaches near a location. Get results from `start` (inclusive) to `stop` (exclusive) in a search sorting by distance to target latitude and longitude. Returns a key containing the order (`order`), and a set of beaches identified by their ids that are not necessarily in order (`result`). The beach info are similar to the beach info requests above.

### Request format

```JSON
{
    "request_type": "search_beach_by_lat_lon",
    "latitude": "{latitude}",
    "longitude": "{longitude}",
    "start": "{search result to start at}",
    "stop": "{search result to end before (exclusive)}"
}
```

### Response Format

```JSON
{
    "order": [
        "{beach_id1}",
        "{beach_id2}",
        "{beach_id3}",
        ...etc
    ],
    "result": {
        "{beach_id1}": {
            "beach_name": "{beach_name}",
            "beach_county": "{beach_county}",
            ...etc
            "weather": {
                ...etc
            }
        },
        "{beach_id2}": {
            ..etc
        },
        "{beach_id3}": {
            ...etc
        }
    },
    "code": "search_beach_by_lat_lon"
}
```


---

## Check Event for Alerts

Checks if an event has any relevant National Weather Service alerts or advisories, and responds with details for a relevant notification.

### Request format

```JSON
{
    "request_type": "check_event",
    "time": "{ISO 8601-compliant datetime for the event}",
    "beach_id": "{beach id for the event}",
    "event_name": "{the user-specified name for the event, used in emails and notification}",
    "email_address": "{the email address for the user}"
}
```

### Response Format

If there are no alerts or warnings:
```JSON
{
    "action": "none",
    "code": "check_event"
}
```

If there are alerts or warnings:
```JSON
{
    "action": "notify",
    "title": "{the title for the notification}",
    "message": "{the message for the notification}"
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
