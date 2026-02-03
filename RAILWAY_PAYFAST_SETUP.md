# Railway PayFast Production Setup Guide

To enable real payments on your deployed application, you must set the following **Environment Variables** in your Railway Project Settings.

1.  Go to your project on [Railway.app](https://railway.app/).
2.  Click on the **Backend** service.
3.  Go to the **Variables** tab.
4.  Add the following variables (Use your *REAL* PayFast account details):

| Variable Name | Value | Description |
| :--- | :--- | :--- |
| `PAYFAST_SANDBOX` | `false` | **CRITICAL**: Switches to Live Mode |
| `PAYFAST_MERCHANT_ID` | `YOUR_LIVE_MERCHANT_ID` | From your PayFast Dashboard |
| `PAYFAST_MERCHANT_KEY` | `YOUR_LIVE_MERCHANT_KEY` | From your PayFast Dashboard |
| `PAYFAST_PASSPHRASE` | `YOUR_SECURE_PASSPHRASE` | Set this in PayFast Settings > Integration |
| `FRONTEND_URL` | `https://your-frontend-url.up.railway.app` | Your deployed frontend URL |
| `BACKEND_URL` | `https://your-backend-url.up.railway.app` | Your deployed backend URL |

> [!CAUTION]
> **Passphrase**: Ensure the `PAYFAST_PASSPHRASE` matches *exactly* what is set in your PayFast account settings. If they don't match, payments will fail with "Signature Mismatch".

## How to Verify
After setting these variables and redeploying:
1.  Go to your website.
2.  Add an item to cart and Checkout.
3.  When you click "Pay", check the URL bar.
    - **Correct**: Starts with `https://www.payfast.co.za/...`
    - **Incorrect**: Starts with `https://sandbox.payfast.co.za/...` (This means `PAYFAST_SANDBOX` is still `true` or missing).
