# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

# Song Checker Frontend

## Running locally

Install dependencies (only needed once):

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Vite will print a local URL (usually `http://localhost:5173`).

## AI Mode feature flag

The **AI Mode** button on the search screen is controlled by a [Firebase Remote Config](https://firebase.google.com/docs/remote-config) boolean parameter:

| Parameter | Type | Default (in-app) |
|-----------|------|------------------|
| `ai_mode_enabled` | Boolean | `false` |

When the flag is off, the button is hidden and users cannot enter AI Mode. When it is on, the button appears after Remote Config is fetched (typically on first load).

### Toggle from the Firebase console

1. Open the [Firebase console](https://console.firebase.google.com/) and select the **song-checker-5a454** project.
2. Go to **Build** → **Remote Config**.
3. Edit the **ai_mode_enabled** parameter and set its value to `true` or `false`.
4. Click **Publish changes**. Draft values are not sent to the app until you publish.

After publishing, refresh the app to pick up the new value (in local dev, fetches are not throttled as aggressively). With real-time Remote Config updates enabled in the app, some users may see the change without a full reload once the client receives the update.

## Deploying to Firebase Hosting

Build the production bundle and deploy to Firebase:

```bash
npm run build
firebase deploy --only hosting
```

The build step type-checks with `tsc -b` and outputs static assets to `dist/`, which Firebase then uploads.

## Live URL

Once deployed, the app is available at:

- https://song-checker-5a454.web.app
- https://song-checker-5a454.firebaseapp.com

Both URLs serve the same deployment.
