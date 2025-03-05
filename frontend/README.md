# `frontend` Folder

This directory contains the React-based frontend for the Beach Day application. The frontend is responsible for the user interface and interactions.

## Structure of the `frontend` Folder
```
frontend/
├── public/
│   ├── icons/
│   ├── index.html
│   └── manifest.json
├── src/
└── package.json
```

## Overview of Files and Subdirectories
- `public/`: Contains static files that are publicly accessible when the app is built.
    - `index.html`: The main HTML file that serves as the entry point for the React application. It includes references to the app's icons, manifest, and other metadata.
    - `icons/`: A folder containing various icon files for the web app.
    - `manifest.json`: A JSON file that provides metadata about the app, such as its name, icons, and display settings. This file is used when the app is installed on a user's device.
- `src/`: This folder contains the source code for the React application.
- `package.json`: Defines the dependencies and scripts for the frontend project.
    - It includes:
        - start: Starts the development server.
        - build: Bundles the app for production.
        - test: Placeholder for running tests (not currently configured).
