# 📡 Google Ads API Integration Guide

ProfitGuard AI is designed to run in two modes:
1.  **Simulation Mode:** Uses mock data (Default for public demo).
2.  **Live API Mode:** Connects to real Google Ads accounts.

To enable Live Mode, you must configure your Google Cloud credentials.

## 1. Prerequisites
* A **Google Ads Manager Account** (MCC).
* A **Google Cloud Console Project** with the "Google Ads API" enabled.
* **Developer Token** (Basic Access is sufficient).

## 2. Credentials Setup
1.  Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2.  Create **OAuth 2.0 Client IDs** (Application Type: *Web Application*).
3.  Add `http://localhost:3000/oauth2callback` to **Authorized Redirect URIs**.
4.  Download your `Client ID` and `Client Secret`.

## 3. Generating a Refresh Token
We have included a utility script to help you generate the necessary Refresh Token.

1.  Open `scripts/getRefreshToken.js` and input your `CLIENT_ID` and `CLIENT_SECRET`.
2.  Run the script locally:
    ```bash
    node scripts/getRefreshToken.js
    ```
3.  Follow the console prompts to authenticate via your browser.
4.  Copy the generated **Refresh Token**.

## 4. Environment Variables
Create a `.env` file in the root directory (do not commit this file):

```env
VITE_GOOGLE_ADS_CLIENT_ID=your_client_id_here
VITE_GOOGLE_ADS_CLIENT_SECRET=your_client_secret_here
VITE_GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token_here
VITE_GOOGLE_ADS_REFRESH_TOKEN=your_generated_refresh_token_here
VITE_GOOGLE_ADS_CUSTOMER_ID=your_target_customer_id
```
## 5. Enabling Live Mode in Code
By default, ProfitGuard ships in Simulation Mode so the UI works immediately without credentials.

To switch to Live API Mode:

Open the file services/adsService.ts.

Locate the configuration flag at the top of the file.

Change USE_LIVE_API from false to true.

TypeScript

// services/adsService.ts

// CHANGE THIS TO TRUE TO ENABLE REAL DATA
export const USE_LIVE_API = true; 
Note: If you revert this to false, the app will seamlessly fallback to using the mock data generator for demonstration purposes.

Security Note: Never commit your .env file or hardcode API tokens in public repositories.
