# Routing
There are currently three files in the `backend/routes/` folder. The following sections are for each of these files.

## `routes/auth.js`
This file contains the routing related to authentication and account management.

### `/register`
This is a POST route. It will register a new user in the database.

#### Request

The request should be a JSON object of the following form.

| Key | Value |
| --- | --- |
| `username` | The username of the user to register. |
| `password` | The password, unhashed, of the user to register. |

#### Response

The response should be a JSON object of the following form.

| Key | Value |
| --- | --- |
| `message` | String describing if the registration succeeded or what went wrong. |

The following are the status codes and `message`s of the possible outcomes.

| Outcome | Status Code | `message` value |
| --- | --- | --- |
| Success | 201 | `User registered successfully.` |
| User Already Exists | 500 | `This user already exists.` |
| Database Error | 500 | `Trouble accessing database.` |
| Other Error | 500 | `Undefined error.` |

### `/login`
This is a POST route. It will attempt to login with the given credentials.

#### Request

The request should be a JSON object of the following form.

| Key | Value |
| --- | --- |
| `username` | The username of the user to login. |
| `password` | The password, unhashed, of the user to login. |

#### Response

The response should be a JSON object of the following form.

| Key | Value |
| --- | --- |
| `message` | String describing if the login succeeded or what went wrong. |
| `jwt` | Only present during success. String containing the json web token. |

The following are the status codes and `message`s of the possible outcomes.

| Outcome | Status Code | `message` value |
| --- | --- | --- |
| Success | 200 | `Login successful.` |
| User Doesn't Exist | 500 | `This user does not exist.` |
| Wrong Password | 500 | `Password is incorrect.` |
| Database Error | 500 | `Trouble accessing database.` |
| Other Error | 500 | `Undefined error.` |

In the event of Success, a cookie named `token` is created. This token has a payload of the following form.

| Key | Value |
| --- | --- |
| `username` | The username of the user who has logged in. |

## `routes/weather.js`
This file contains routing related to weather.

### `/weather`
This is a POST route. It will always return a status of 200. The JSON sent to this route will be forwarded directly to the `get_weather.py` script. Caden intends to document the API of this file seperately because it will be rather complicated. This section will be revised to link to this file when it is completed.

### `/favorites`
This is a POST route. It returns the ids of the beaches the user has favorited.

#### Request

The request should be a JSON object of the following form.

| Key | Value |
| --- | --- |
| `jwt` | The json web token of the user whose favorites to access. |

#### Response

The response should be a JSON object of the following form.

| Key | Value |
| --- | --- |
| `message` | String describing if the registration succeeded or what went wrong. |
| `favorites` | This member is only present in the event of a success. It is a list of strings containing the ids of the beaches the user has favorited. |

The following are the status codes and `message`s of the possible outcomes.

| Outcome | Status Code | `message` value |
| --- | --- | --- |
| Success | 200 | `Success.` |
| Token Problem | 500 | `User authentication token absent or invalid.` |
| Other Error | 500 | `Undefined error.` |

### `/update_favorites`
This is a POST route. It allows frontend to modify a user's favorited beaches.

#### Request

The request should be a JSON object of the following form.

| Key | Value |
| --- | --- |
| `jwt` | The json web token of the user whose favorites to modify. |
| `type` | The type of request. Should be one of `clear`, `add`, or `remove`. |
| `favorite` | The beach id of the beach to add or remove. Not required to be present for clear. |

#### Response

The response should be a JSON object of the following form.

| Key | Value |
| --- | --- |
| `message` | String describing if the registration succeeded or what went wrong. |

The following are the status codes and `message`s of the possible outcomes.

| Outcome | Status Code | `message` value |
| --- | --- | --- |
| Success | 200 | `Success.` |
| Invalid Request | 500 | `Invalid request.` |
| Token Problem | 500 | `User authentication token absent or invalid.` |
| Database Problem | 500 | `Trouble accessing database.` |
| User Doesn't Exist | 500 | `This user does not exist.` |
| Beach Already Favorited | 500 | `Beach is already in favorites.` |
| Beach Not Present | 500 | `Attempted to remove beach not in favorites.` |
| Other Error | 500 | `Undefined error.` |

### `/add_notification`
This is a POST route. It allows frontend to add a new notification for a user.

#### Request

The request should be a JSON object of the following form.

| Key | Value |
| --- | --- |
| `jwt` | The json web token of the user whose favorites to modify. |
| `title` | The title of the notification. |
| `message` | The body of the notification. |

#### Response

The response should be a JSON object of the following form.

| Key | Value |
| --- | --- |
| `message` | String describing if the registration succeeded or what went wrong. |

The following are the status codes and `message`s of the possible outcomes.

| Outcome | Status Code | `message` value |
| --- | --- | --- |
| Success | 200 | `Success.` |
| Token Problem | 500 | `User authentication token absent or invalid.` |
| Database Problem | 500 | `Trouble accessing database.` |
| User Doesn't Exist | 500 | `This user does not exist.` |
| Other Error | 500 | `Undefined error.` |

### `/count_notifications`
This is a POST route. It allows frontend to access the number of notifications for a user.

#### Request

The request should be a JSON object of the following form.

| Key | Value |
| --- | --- |
| `jwt` | The json web token of the user whose favorites to modify. |

#### Response

The response should be a JSON object of the following form.

| Key | Value |
| --- | --- |
| `message` | String describing if the registration succeeded or what went wrong. |
| `count` | Only present during success. Integer containing the amount of notifications a user has. |

The following are the status codes and `message`s of the possible outcomes.

| Outcome | Status Code | `message` value |
| --- | --- | --- |
| Success | 200 | `Success.` |
| Token Problem | 500 | `User authentication token absent or invalid.` |
| Database Problem | 500 | `Trouble accessing database.` |
| User Doesn't Exist | 500 | `This user does not exist.` |
| Other Error | 500 | `Undefined error.` |

### `/receive_notifications`
This is a POST route. It allows frontend to mark a notification as received.

#### Request

The request should be a JSON object of the following form.

| Key | Value |
| --- | --- |
| `jwt` | The json web token of the user whose favorites to modify. |
| `id` | The id of the notification to be marked as received. |

#### Response

The response should be a JSON object of the following form.

| Key | Value |
| --- | --- |
| `message` | String describing if the registration succeeded or what went wrong. |

The following are the status codes and `message`s of the possible outcomes.

| Outcome | Status Code | `message` value |
| --- | --- | --- |
| Success | 200 | `Success.` |
| Zero Notifications | 500 | `No notifications of specified type.` |
| Token Problem | 500 | `User authentication token absent or invalid.` |
| Database Problem | 500 | `Trouble accessing database.` |
| User Doesn't Exist | 500 | `This user does not exist.` |
| User Doesn't Own Notification | 500 | `User does not own this notification.` |
| Other Error | 500 | `Undefined error.` |

### `/get_notifications`
This is a POST route. It allows frontend to get notifications. You can request either all pending notifications, all notifications, or a single notification by id.

#### Request

The request should be a JSON object of the following form.

| Key | Value |
| --- | --- |
| `jwt` | The json web token of the user whose favorites to modify. |
| `type` | The type of request. Should be one of `pending`, `all`, or `by_id`. |
| `id` | The id of the notification. Only used if request type is `by_id`. |

#### Response

The response should be a JSON object of the following form.

| Key | Value |
| --- | --- |
| `message` | String describing if the registration succeeded or what went wrong. |
| `notifications` | An array of notifications. I don't really know what this will look like. |

The following are the status codes and `message`s of the possible outcomes.

| Outcome | Status Code | `message` value |
| --- | --- | --- |
| Success | 200 | `Success.` |
| Zero Notifications | 500 | `No notifications of specified type.` |
| Token Problem | 500 | `User authentication token absent or invalid.` |
| Database Problem | 500 | `Trouble accessing database.` |
| User Doesn't Exist | 500 | `This user does not exist.` |
| User Doesn't Own Notification | 500 | `User does not own this notification.` |
| Invalid Request | 500 | `Invalid request.` |
| Other Error | 500 | `Undefined error.` |

### `/remove_notifications`
This is a POST route. It allows frontend to remove notifications. You can remove either all received notifications, all notifications, or a single notification by id.

#### Request

The request should be a JSON object of the following form.

| Key | Value |
| --- | --- |
| `jwt` | The json web token of the user whose favorites to modify. |
| `type` | The type of request. Should be one of `received`, `all`, or `by_id`. |
| `id` | The id of the notification. Only used if request type is `by_id`. |

#### Response

The response should be a JSON object of the following form.

| Key | Value |
| --- | --- |
| `message` | String describing if the registration succeeded or what went wrong. |

The following are the status codes and `message`s of the possible outcomes.

| Outcome | Status Code | `message` value |
| --- | --- | --- |
| Success | 200 | `Success.` |
| Zero Notifications | 500 | `No notifications of specified type.` |
| Token Problem | 500 | `User authentication token absent or invalid.` |
| Database Problem | 500 | `Trouble accessing database.` |
| User Doesn't Exist | 500 | `This user does not exist.` |
| User Doesn't Own Notification | 500 | `User does not own this notification.` |
| Invalid Request | 500 | `Invalid request.` |
| Other Error | 500 | `Undefined error.` |
