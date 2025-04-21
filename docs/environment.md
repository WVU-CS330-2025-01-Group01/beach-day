# Environment
This page describes any setup that needs to be done to your environment to get Beach Day to work. Most notably, this page talks about your `.env` files and how you set them up.

# Your `.env` Files
The `.env` files are files we have that allow us to declare constant variables that are not version controlled. This is for anything that needs to be different between our local machines and the Azure machines. For example, we will want the frontend to be hosted on port 80 in production so that clients do not need to specify a port, but we do not want it to be 80 on our development machines so that we do not need root/Administrator access to run the server. Below is all the environment variables recognized by Beach Day (if you add an environment variable, add it to this document).

## Frontend
In your `frontend/` folder, you must make a `.env` file that contains the following entries. Note: Since the frontend is in React, the variables must start with `REACT_APP` otherwise React will ignore it with one exception. That exception is `PORT` which is described below.
<details>
<summary>

##### `PORT`

</summary>

This environment variable is recognized by React directly and does not need implemented in the frontend code. It tells React which port to host the frontend on. If it isn't set, React defaults to 3000.

</details>
<details>
<summary>

##### `REACT_APP_BACKEND_HOST`

</summary>

This is the hostname of the backend. If this is not set, you will get weird errors. For your local development machine, you most likely want to set it to `localhost`.

</details>
<details>
<summary>

##### `REACT_APP_BACKEND_PORT`

</summary>

This is the port the backend is hosted on. If this is not set, you will get weird errors. You need to make sure this is the same as `BEACH_DAY_BACKEND_PORT` in your `backend/.env` file.

</details>

## Backend
In your `backend/` folder, you must make a `.env` file that contains the following entries.  Both the local DB and remote DB will have different credentials, your .env must reflect that to switch between DBs.
<details>
<summary>

##### `BEACH_DAY_BACKEND_PORT`

</summary>

This is the port the backend will be hosted on. If this is not set, the code will select 3010 by default. You must set `REACT_APP_BACKEND_PORT` to the same value.

</details>
<details>
<summary>

##### `BEACH_DAY_JWT_SECRET`

</summary>

This is the value of the jwt secret. If this is not set, you will get an error. For your local development environment, its not very important what this value is set to as you should not be storing sensitive user data on your local machine. This will need to be a truly random and truly secret value on the Azure server.

</details>

<details>
<summary>

##### `BEACH_DAY_DB_HOST`

</summary>

This is the name of your MySQL connection HostName.  For your local development environment, you will have set this when creating your SQL connection.  Without it, the code and database can not communicate. Typically for a local environment, you call it localhost.  However, this sometimes does not resolve properly.  If that's an issue, or you want to try this first, enter it as `127.0.0.1` .  This is equivelent to localhost.

</details>
<details>
<summary>

##### `BEACH_DAY_BD_USER`

</summary>

This is the name of the user that is linked with the MySQL connection.  For your local development environment, you will have set this when creating your SQL connection.  These are more credentials needed to link the connection.

</details>
<details>
<summary>

##### `BEACH_DAY_DB_PASSWORD`

</summary>

This is the password used to open your MySQL connection. For your local development environment, you will have set this when creating your SQL connection.  These are more credentials needed to link the connection. 

</details>
<details>
<summary>

##### `BEACH_DAY_DB_NAME`

</summary>

This is the name of the database found in your MySQL connection.  These are needed to link the connection.  For now, we are using arbitrary but consistent name.  We have kept it as `authdb` for ease.

</details>
<details>
<summary>

##### `BEACH_DAY_DB_PORT`

</summary>

This is the port that links the MySQL connection to the code.  The default we opted to use is `3306`. This may possible be set during install of MySQL.  

</details>
<details>
<summary>

##### `BEACH_DAY_DB_SSL_FLAG`

</summary>

If this value has any valid value, preferably 1 for readability.  This will make your connection use SSL.

</details>
<details>
<summary>

##### `BEACH_DAY_DB_SSL_CERT`

</summary>

If you would like to use a specific public key, you can include this field in your .env.  If it is not included, it will use your systems root authority automatically. Include double quotes around your key if provided.

</details>

## Example
The following is an example of what your `frontend/.env` and `backend/.env` should look like. The backend example is for a non-SSL connection.
```
# frontend
PORT=3020
REACT_APP_BACKEND_HOST=localhost
REACT_APP_BACKEND_PORT=3010
```
```
# backend
BEACH_DAY_BACKEND_PORT=3010
BEACH_DAY_JWT_SECRET=a
BEACH_DAY_DB_HOST=127.0.0.1
BEACH_DAY_DB_USER=root
BEACH_DAY_DB_PASSWORD=password
BEACH_DAY_DB_NAME=authdb
BEACH_DAY_DB_PORT=3306
```

# Conda
Our python script(s) rely on conda to setup an environment for them to work. You will need to install conda on your system and ensure that it can be invoked by a terminal as `conda`.
