# Setting Up
When you clone the project, there are six steps that must be completed to get the project running.
1. In the `backend/` folder, run `npm install`. This will install the dependencies required by node. Note that the `node_modules/` folder it creates is `.gitignore`d. This is as it should be. Never push your `node_modules/` folder to the github.
2. In the `frontend/` folder, run `npm install`. Same as above.
3. Create your `backend/.env` file and your `frontend/.env` file. This too is `.gitignore`d and should not be pushed to github. Details on what your `.env` file can be found on the [Environment](environment.md) page.
4. Install conda on your system and ensure that it can be invoked from a terminal as `conda`.
5. In the `backend/` folder, run `npm start` to start the backend.
6. In the `frontend/` folder, run `npm start` to start the frontend.
As long as you setup your `.env` files correctly, the frontend should be hosted on `localhost` at the port you chose, and it should be talking to the backend.
