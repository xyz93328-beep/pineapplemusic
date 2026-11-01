# Music

A web music player built with Vite, React, TypeScript, Tailwind, Framer Motion, and Zustand. It uses the Spotify Web API and Web Playback SDK, with synced lyrics from LRCLIB.

## Setup

1. **Create a Spotify app.** Open the Spotify Developer Dashboard, click *Create app*, and give it any name. Choose *Web API* and *Web Playback SDK*.
2. **Add the redirect URI.** In the app settings, add your app's address followed by `/callback`, for example `https://your-app-address/callback` (for local development, `http://127.0.0.1:5173/callback`). The address must match exactly.
3. **Add your account.** In development mode, add the Spotify account you will sign in with under *User Management*. The account owning the app needs Spotify Premium, and development apps allow up to five users.
4. **Connect the app.** Open the app and paste the Client ID from the app's settings into the setup form on the sign-in page. It is saved in your browser, so you only do this once per browser. You can switch to a different Spotify app later with *Use a different Spotify app*.

   The Client Secret is never needed. This app uses the PKCE sign-in flow, so do not add the secret to the project or the browser.
5. **Run the app.** Start the development server and open the app in your browser.

Developers can instead set `VITE_SPOTIFY_CLIENT_ID` in a local `.env` file. The app uses it when no Client ID has been saved in the browser.

## Notes

- Spotify removed its browse-categories and new-releases endpoints for development-mode apps in February 2026. The Browse page therefore uses a curated set of genres and moods, and each tile opens a Spotify search.
