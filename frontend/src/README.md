# Beach Day – `src/` Directory

This folder contains the main source code for the **Beach Day** frontend application, built with React. It manages user authentication, beach search and weather info, favorites, notifications, and settings — all styled with modular CSS.

---

## Overview

| File/Folder     | Description                                                                 |
|----------------|-----------------------------------------------------------------------------|
| `App.js`        | Root component that defines routes and integrates global structure.         |
| `App.css`       | Global styles shared across the app.                                        |
| `index.js`      | Entry point of the app; renders the React tree and wraps it with context.   |
| `index.css`     | Global stylesheet for font, layout, and base HTML element styles.           |

---

## Core Components

| Component/File       | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| `Navbar.js`          | Navigation bar with links, search form, geolocation, and user dropdown.     |
| `Home.js`            | Displays beach search results with dynamic distance info.                   |
| `BeachInfo.js`       | Shows detailed info for a selected beach including weather and metadata.    |
| `Favorites.js`       | Displays saved beaches with weather preview and editing options.            |
| `Notifications.js`   | Manages weather alerts and manual notification creation.                    |
| `Login.js`           | Handles user login and session initialization.                              |
| `Register.js`        | Handles user sign-up with password confirmation.                            |
| `Settings.js`        | Manages user email, password, alert preferences, and account deletion.      |
| `About.js`           | Displays information about the project and team as well as sources used.    |

---

## Context & Utilities

| File/Module        | Description                                                                 |
|--------------------|-----------------------------------------------------------------------------|
| `UserContext.js`    | Global React context for user session, geolocation, favorites, and errors.  |
| `utils.js`          | Utility functions for fetching beach info, caching, and refreshing data.    |
| `api.js`            | Centralized API endpoint definitions used throughout the app.               |

---

## Stylesheets (CSS Modules)

| File                 | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| `Navbar.css`         | Styles the navbar, search bar, dropdown, and error bar.                     |
| `Home.css`           | Layout and visuals for the beach search result cards.                       |
| `BeachInfo.css`      | Styles for beach detail view cards and weather data blocks.                 |
| `Favorites.css`      | Layout for favorites list with edit/remove buttons and loading states.      |
| `LogReg.css`         | Shared styles for login and registration forms.                             |
| `Settings.css`       | Account settings layout, modals, form inputs, and checkbox sections.        |
| `Notifications.css`  | Styling for notification lists, form inputs, and button layouts.            |
| `About.css`          | Styles for the about page                                                   |

---

## Optional

| File                  | Description                                                                 |
|-----------------------|-----------------------------------------------------------------------------|
| `reportWebVitals.js`  | Optional performance monitoring using the `web-vitals` library.             |

---

## Notes

- Authentication state and session are managed through cookies and `localStorage`.
- Global error handling is centralized via `UserContext` and surfaced in the navbar.
- Most API interactions are isolated in `utils.js` for logic and `api.js` for endpoint definitions.
