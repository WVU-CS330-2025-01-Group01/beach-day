# Database Creation

This page describes the commands needed to be ran in the MySQL query so that it has all the fields needed to work with the code, whilst also making sure the fields have all their functionality/attributes.

  

# Temporary Commands

As for this current iteration, these commands will be queried manually.  However, we are working on a way to update this to be performed automatically.  It should sync the tables with what is expected.  This current command is DESTRUCTIVE.  It WILL REMOVE data.  This will be fixed when it is set up automatically, this compromise is for ease of running. 
  
## If Database/Table Exists Commands
This is how it's destructive.  This will delete the database, which will take the table with it. This allows the next commands to run.
```
DROP DATABASE authdb;
```

## Commands
Run these separately.

```
CREATE DATABASE authdb;
USE authdb;
```

```
CREATE TABLE users (
    username varchar(50) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(50) UNIQUE,
    favorite_beaches VARCHAR(3000) DEFAULT "NULL_BEACH",
    timezone VARCHAR(3) DEFAULT "GMT",
    notifications_enabled TINYINT(1) NOT NULL DEFAULT 0,
    id INT NOT NULL UNIQUE AUTO_INCREMENT,
    register_date DATE DEFAULT (CURRENT_DATE())
);