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
