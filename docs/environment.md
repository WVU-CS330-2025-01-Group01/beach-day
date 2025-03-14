# Environment
This page describes any setup that needs to be done to your environment to get Beach Day to work. Most notably, this page talks about your `.env` files and how you set them up.

# Your `.env` Files
The `.env` files are files we have that allow us to declare constant variables that are not version controlled. This is for anything that needs to be different between our local machines and the Azure machines. For example, we will want the frontend to be hosted on port 80 in production so that clients do not need to specify a port, but we do not want it to be 80 on our development machines so that we do not need root/Administrator access to run the server. Below is all the environment variables recognized by Beach Day (if you add an environment variable, add it to this document).

## Frontend
In your `frontend/` folder, you must make a `.env` file that contains the following entries. Note: Since the frontend is in React, the variables must start with `REACT_APP` otherwise React will ignore it with one exception. That exception is `PORT` which is described below.
<details>
    <summary>`PORT`</summary>
    <p>This environment variable is recognized by React directly and does not need implemented in the frontend code. It tells React which port to host the frontend on. If it isn't set, React defaults to 3000.</p>
</details>
<details>
    <summary>`REACT_APP_BACKEND_HOST`</summary>
    <p>This is the hostname of the backend. If this is not set, you will get weird errors. For your local development machine, you most likely want to set it to `localhost`.</p>
</details>
<details>
    <summary>`REACT_APP_BACKEND_PORT`</summary>
    <p>This is the port the backend is hosted on. If this is not set, you will get weird errors. You need to make sure this is the same as `BEACH_DAY_BACKEND_PORT` in your `backend/.env` file.</p>
</details>

## Backend
In your `backend/` folder, you must make a `.env` file that contains the following entries.
<details>
    <summary>`BEACH_DAY_BACKEND_PORT`</summary>
    <p>This is the port the backend will be hosted on. If this is not set, the code will select 3010 by default. You must set `REACT_APP_BACKEND_PORT` to the same value.</p>
</details>
<details>
    <summary>`BEACH_DAY_JWT_SECRET`</summary>
    <p>This is the value of the jwt secret. If this is not set, you will get an error. For your local development environment, its not very important what this value is set to as you should not be storing sensitive user data on your local machine. This will need to be a truly random and truly secret value on the Azure server.</p>
</details>

## Example
The following is an example of what your `frontend/.env` and `backend/.env` should look like.
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
```
