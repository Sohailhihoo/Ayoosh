# Railway Frontend Setup (Fix Missing Products)

If your website loads but **no products appear**, your Frontend doesn't know where the Backend is. You need to tell it.

## 1. Get your Backend URL
1.  Go to [Railway.app](https://railway.app/).
2.  Click on your **Backend** service.
3.  Copy the **Public Domain** (e.g., `https://ayoosh-backend-production.up.railway.app`).
    *   *Note: Do not include `/api` yet.*

## 2. Configure Frontend Variables
1.  Click on your **Frontend** service in Railway.
2.  Go to the **Variables** tab.
3.  Add the following variable:

| Variable Name | Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://YOUR-BACKEND-URL/api` | **IMPORTANT**: Must end with `/api` |

**Example Value:**
`https://ayoosh-backend-production.up.railway.app/api`

## 3. Redeploy
1.  After adding the variable, click **Deploy** (or Redploy) on the **Frontend** service.
2.  Wait for the build to finish.
3.  Check your site again.

> [!TIP]
> **Why?** By default, the frontend tries to talk to `localhost:5000`. On the internet (Production), `localhost` refers to the user's own computer, which doesn't have your backend running!
