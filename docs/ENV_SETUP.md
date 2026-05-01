# Environment setup (quick)

1) Create a local `.env` file at the project root by copying `.env.example`:

```
copy .env.example .env
```

2) Edit `.env` and set real values:

- `EXPO_PUBLIC_BACKEND_URL` — your production backend base URL.
- `EXPO_PUBLIC_ADMOB_APP_ID` and ad unit IDs — taken from your AdMob account.

3) For production builds, do NOT commit `.env` containing secrets. Add `.env` to `.gitignore`.

4) If you use EAS, you can also set environment variables in the EAS project config or use EAS secrets to avoid storing them in repo.

5) Example Expo build-time injection (EAS):

```
eas secret:create --name EXPO_PUBLIC_BACKEND_URL --value "https://your.backend.example"
eas secret:create --name EXPO_PUBLIC_ADMOB_APP_ID --value "ca-app-pub-..."
```

6) After updating `.env`, restart the Expo dev server so variables are reloaded.

If you want, I can also replace placeholders in other files (for example set a default backend URL in `app/utils/api.js`) once you provide the real values.
