# Setting up Database
## To set up the user table in your database you just need to run a few simple lines MySQL Workbench. EACH CODE BLOCK MUST BE RAN BY ITSELF. DONT PUT ALL THE CODE TOGETHER AND TRY TO RUN, IT WILL NOT WORK

```sql
ALTER TABLE user
ADD favorite_beach varchar(50);
```

This adds a new column for the user's favorite beach.

```sql
ALTER TABLE user
ADD email varchar(50) AFTER password;
```

This adds two new columns for the user's email and password with the email column being put after the password column.

```sql
ALTER TABLE users
ADD timezone varchar(3);
```

This adds a new column for the user's timezone.

```sql
ALTER TABLE users
ADD notifications_enabled bool;
```

This adds a new column for if user notifications are enabled.

```sql
ALTER TABLE users
ALTER timezone SET DEFAULT "GMT";
```

This sets the default value of the user timezone to GMT.

```sql
ALTER TABLE users
ALTER notifications_enabled SET DEFAULT 0;
```

This turns on notifications by default for users.

```sql
SELECT * FROM users;
```

This will display the table to check if it is correctly set up.

