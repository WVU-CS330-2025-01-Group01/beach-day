# Documentation Root

This is the root of the documentation for the project. Any aspect of the project that needs documentation should have documentation and it should be in this folder. All interfaces between the teams especially need documentation.

## Getting The Project Running
This app has multiple moving parts and requires setup on the developer's end before it can be run. Instructions for getting the project running can be found on the [Setting Up](setup.md) page.

## Routing
Routing refers to routes hosted by the backend. All communication between the frontend and backend is done through one of these routes. Documentation for these routes can be found on the [Routing](routing.md) page.

## Database Abstractions
To keep SQL code from being strewn about the codebase, all SQL code will be relegated to the `backend/dbabs/` folder. To allow other backend components to access the database, all operations that the user can perform have corresponding functions exported by the `backend/dbabs/index.js` file. Documentation for these abstraction functions can be found on the [Database Abstractions](dbabs.md) page.

## Beach Data
All beach data for the project will be gathered by the python scripts in the `backend/data/` folder. You can access this data through the `backend/data/get_weather.py` file. The interface of this file is described on the [Data Interface](data_interface.md) page.
