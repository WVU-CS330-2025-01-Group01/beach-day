# Database Abstractions
To abstract away SQL semantics from the rest of the codebase, all SQL code will be put in the `backend/dbabs/` folder. In this folder is the `backend/dbabs/index.js` file which exports functions and exceptions that allow other parts of the codebase to make use of the database. These functions enumerate all the operations a user is allowed to perform on the database.

## `initDB()`
Ensures that the database is accessable and programmatically ensures that the database contains the correct schemas and columns.

### Arguments
None.

### Returns
Nothing.

### Exceptions
<dl>
<dt>

ProblemWithDB

</dt>
<dd>

This is thrown if there are any issues accessing the database or updating its columns and schemas.  This uses database name as "authdb" and table "users".  Primary keys should never be changed again for the scope of the progress.  That being said, if you have anything set to primary key that
is not usernames (if ID, it may correct itself), initDB will fail.  This cannot delete/account for columns you made that are not known by us.  It can delete extra columns that have been deprecated by us.

</dd>
</dl>

## `attemptToMakeUser(username, password)`
Attempts to register a new user in the database. This function should hash the password before storing it into the database.

### Arguments
<dl>
<dt>

username

</dt>
<dd>

This is an unsanitized string containing the username of the user to be created.

</dd>
<dt>

password

</dt>
<dd>

This is an unsanitized and unhashed string containing the password of the user to be created.

</dd>
</dl>

### Returns
Nothing.

### Exceptions
<dl>
<dt>

UserAlreadyExists

</dt>
<dd>

This is thrown if a user with the given username already exists.

</dd>
<dt>

ProblemWithDB

</dt>
<dd>

This is thrown if the user cannot be created to due issues with accessing or updating the database.

</dd>
</dl>

## `tryLogIn(username, password)`
Tests the given credentials to see if they are correct.

### Arguments
<dl>
<dt>

username

</dt>
<dd>

This is an unsanitized string containing the username of the user.

</dd>
<dt>

password

</dt>
<dd>

This is an unsanitized and unhashed string containing the password of the user.

</dd>
</dl>

### Returns
Nothing.

### Exceptions
<dl>
<dt>

UserNotFound

</dt>
<dd>

This exception is thrown if a user with the given username does not exist in the database.

</dd>
<dt>

IncorrectPassword

</dt>
<dd>

This exception is thrown if the hash of the given password does not match the hash stored on the database.

</dd>
<dt>

ProblemWithDB

</dt>
<dd>

This is exception is thrown if there are issues reading from the database.

</dd>
</dl>

## `getFavorites(username)`
Getter function for the user's favorite beaches. Since this is accessing user data, calling code should verify the user is authenticated before calling this function.

### Arguments
<dl>
<dt>

username

</dt>
<dd>

The username of the user whose favorites to access.

</dd>
</dl>

### Returns
This function returns an array of strings where the strings are beach ids of the user's favorited beaches.

### Exceptions
<dl>
<dt>

UserNotFound

</dt>
<dd>

This exception is thrown if the user does not exist in the database.

</dd>
<dt>

ProblemWithDB

</dt>
<dd>

This is exception is thrown if there are issues reading from the database.

</dd>
</dl>

## `addFavorite(username, favorite)`
Adds a favorite beach to the user's favorited beaches.

### Arguments
<dl>
<dt>

username

</dt>
<dd>

The username of the user whose favorite to add.

</dd>
<dt>

favorite

</dt>
<dd>

The beach id to be added to the user's favorites.

</dd>
</dl>

### Returns
Nothing.

### Exceptions
<dl>
<dt>

UserNotFound

</dt>
<dd>

This exception is thrown if the user does not exist in the database.

</dd>
<dt>

ProblemWithDB

</dt>
<dd>

This is exception is thrown if there are issues reading from the database.

</dd>
<dt>

BeachAlreadyFavorited

</dt>
<dd>

This exception is thrown if the user favorites a beach already favorited.

</dd>
</dl>

## `removeFavorite(username, favorite)`
Removes a favorite beach from the user's favorited beaches.

### Arguments
<dl>
<dt>

username

</dt>
<dd>

The username of the user whose favorite to remove.

</dd>
<dt>

favorite

</dt>
<dd>

The beach id to be removed from the user's favorites.

</dd>
</dl>

### Returns
Nothing.

### Exceptions
<dl>
<dt>

UserNotFound

</dt>
<dd>

This exception is thrown if the user does not exist in the database.

</dd>
<dt>

ProblemWithDB

</dt>
<dd>

This exception is thrown if there are issues modifying the database.

</dd>
<dt>

BeachNotPresent

</dt>
<dd>

This exception is thrown when attempting to remove a beach not in favorited beaches.

</dd>
</dl>

## `clearFavorites(username)`
Clears all favorited beaches from the user's favorited beaches.

### Arguments
<dl>
<dt>

username

</dt>
<dd>

The username of the user whose favorited beaches to clear.

</dd>
</dl>

### Returns
Nothing.

### Exceptions
<dl>
<dt>

UserNotFound

</dt>
<dd>

This exception is thrown if the user does not exist in the database.

</dd>
<dt>

ProblemWithDB

</dt>
<dd>

This is exception is thrown if there are issues modifying the database.

</dd>
</dl>

## `getNotificationCount(username)`
Get a total number of notifcations for a user.

### Arguments
<dl>
<dt>

username

</dt>
<dd>

The username of the user whose notifications to count.

</dd>
</dl>

### Returns
Notification Amount.

### Exceptions
<dl>
<dt>

UserNotFound

</dt>
<dd>

This exception is thrown if the user does not exist in the database.

</dd>
<dt>

ProblemWithDB

</dt>
<dd>

This is exception is thrown if there are issues accessing the database.

</dd>
</dl>

## `receivedNotification(username, notification_id)`
Marks a notifcation as received and will no longer be accessed when grabbing all notifications of a user.

### Arguments
<dl>
<dt>

username

</dt>
<dd>

The username of the user whose notifications to access.  Could be considered redundant, but is incorporated so that the one to call the function needs to know the user too, making it a bit more secure.

</dd>

<dt>

notification_id

</dt>
<dd>

The exact id of the notification to mark as received.

</dd>
</dl>

### Returns
Nothing.

### Exceptions
<dl>
<dt>

UserNotFound

</dt>
<dd>

This exception is thrown if the user does not exist in the database.

</dd>
<dt>

ZeroNotifications

</dt>
<dd>

This is exception is thrown if there are zero notifications at specified paramaters.  If desired, it can be changed to not throw an error.

</dd>
<dt>

ProblemWithDB

</dt>
<dd>

This is exception is thrown if there are issues accessing the database.

</dd>
</dl>

## `addNotification(username, title, message)`
Adds a pending notification for a user.

### Arguments
<dl>
<dt>

username

</dt>
<dd>

The username of the user who to add the given notification to.

</dd>

<dt>

title

</dt>
<dd>

The header of the new notification.

</dd>
<dt>

message

</dt>
<dd>

The main content of the notification.

</dd>
</dl>

### Returns
Nothing.

### Exceptions
<dl>
<dt>

UserNotFound

</dt>
<dd>

This exception is thrown if the user does not exist in the database.

</dd>
<dt>

ProblemWithDB

</dt>
<dd>

This is exception is thrown if there are issues accessing the database.

</dd>

## `getUserNotifications(username)`
Retrives all notifications for a user.

### Arguments
<dl>
<dt>

username

</dt>
<dd>

The username of the user who retrive the notifications from.

</dd>

### Returns
An array of objects in which each object is its own notification.  It contains the time the notifcation was created, its given title, message.  It also contains the notification id, corresponding email, whether they have notifications enabled, and username if needed.  THIS NOTIFIFCATION OBJECT IS CONSISTENT FOR EVERY METHOD THAT RETURNS AN NOTIFICATION.  Also note that it can return an email that is null, that just means the user has never set an email, and that is for you to check and then decide the next course of action.

### Exceptions
<dl>
<dt>

UserNotFound

</dt>
<dd>

This exception is thrown if the user does not exist in the database.

</dd>
<dt>

ZeroNotifications

</dt>
<dd>

This is exception is thrown if there are zero notifications at specified paramaters.  If desired, it can be changed to return an empty array.

</dd>
<dt>

ProblemWithDB

</dt>
<dd>

This is exception is thrown if there are issues accessing the database.

</dd>

## `removeAllNotificationsFromUser(username)`
Removes all notifications for a user, regardless of pending status.

### Arguments
<dl>
<dt>

username

</dt>
<dd>

The username of the user who remove the notifications from.

</dd>

### Returns
Nothing

### Exceptions
<dl>
<dt>

UserNotFound

</dt>
<dd>

This exception is thrown if the user does not exist in the database.

</dd>
<dt>

ZeroNotifications

</dt>
<dd>

This is exception is thrown if there are zero notifications at specified paramaters.

</dd>
<dt>

ProblemWithDB

</dt>
<dd>

This is exception is thrown if there are issues accessing the database.

</dd>

## `removeNotificationFromID(notificationID)`
Removes a notification of given Notification ID, regardless of pending status.

### Arguments
<dl>
<dt>

notificationID

</dt>
<dd>

The id of the notification to remove.

</dd>

### Returns
Nothing

### Exceptions
<dl>
<dt>

ZeroNotifications

</dt>
<dd>

This is exception is thrown if there are zero notifications at specified paramaters.

</dd>
<dt>

ProblemWithDB

</dt>
<dd>

This is exception is thrown if there are issues accessing the database.

</dd>

## `getNotificationFromID(notificationID)`
Access a notification of a given Notification ID, regardless of pending status.

### Arguments
<dl>
<dt>

notificationID

</dt>
<dd>

The id of the notification to grab.

</dd>

### Returns
An object containing the notification's details.

### Exceptions
<dl>
<dt>

ZeroNotifications

</dt>
<dd>

This is exception is thrown if there are zero notifications at specified paramaters.

</dd>
<dt>

ProblemWithDB

</dt>
<dd>

This is exception is thrown if there are issues accessing the database.

</dd>

## `getUserPendingNotifications(username)`
Retrives all pending notifications for a user.

### Arguments
<dl>
<dt>

username

</dt>
<dd>

The username of the user who retrive the notifications from.

</dd>

### Returns
An array of objects in which each object is its own notification. These are only those that have not been marked as received.  It contains the time the notifcation was created, its given title, message.  It also contains the notification id, corresponding email, whether they have notifications enabled, and username if needed.  THIS NOTIFIFCATION OBJECT IS CONSISTENT FOR EVERY METHOD THAT RETURNS AN NOTIFICATION.  Also note that it can return an email that is null, that just means the user has never set an email, and that is for you to check and then decide the next course of action.

### Exceptions
<dl>
<dt>

UserNotFound

</dt>
<dd>

This exception is thrown if the user does not exist in the database.

</dd>
<dt>

ZeroNotifications

</dt>
<dd>

This is exception is thrown if there are zero notifications at specified paramaters.  If desired, it can be changed to return an empty array.

</dd>
<dt>

ProblemWithDB

</dt>
<dd>

This is exception is thrown if there are issues accessing the database.

</dd>

## `removeAllReceivedNotificationsFromUser(username)`
Removes all notifications for a user that have been marked as received.

### Arguments
<dl>
<dt>

username

</dt>
<dd>

The username of the user who remove the notifications from.

</dd>

### Returns
Nothing

### Exceptions
<dl>
<dt>

UserNotFound

</dt>
<dd>

This exception is thrown if the user does not exist in the database.

</dd>
<dt>

ZeroNotifications

</dt>
<dd>

This is exception is thrown if there are zero notifications at specified paramaters.

</dd>
<dt>

ProblemWithDB

</dt>
<dd>

This is exception is thrown if there are issues accessing the database.

</dd>

## `setEmail(username, email)`
Sets a users email to given param.

### Arguments
<dl>
<dt>

username

</dt>
<dd>

The username of the user who we will change their email for.

</dd>

<dt>

email

</dt>
<dd>

The value for what the user wants to set their email to.  We are assuming you are checking it for valid input, but we can do so if requested.  We are still protecting against injection regardless.

</dd>

### Returns
Nothing.

### Exceptions
<dl>
<dt>

UserNotFound

</dt>
<dd>

This exception is thrown if the user does not exist in the database.

</dd>
<dt>

ProblemWithDB

</dt>
<dd>

This is exception is thrown if there are issues accessing the database. We also have this error be thrown if the email provided is used elsewhere in the Database.  We can change this to it's own error if requested.

</dd>