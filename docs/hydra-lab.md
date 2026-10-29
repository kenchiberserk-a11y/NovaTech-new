# NovaTech HTTP authentication lab

Optional test-only credential-check endpoint, separate from the actual NovaTech login. It must not create sessions, grant roles, or expose business data. Keep it disabled by default and use a private Vercel Preview deployment only.

## Configuration

Set these variables only in a private Preview environment:

- `LAB_LOGIN_ENABLED=true`
- `LAB_ACCESS_TOKEN` to a long random secret sent in the `x-lab-token` request header
- `LAB_ALLOWED_IP` to the exact public IP running the authorized test
- `LAB_TEST_USERNAME` and `LAB_TEST_PASSWORD` to unique fictitious lab credentials

Redeploy after changing variables. After the test, set `LAB_LOGIN_ENABLED=false` and redeploy.

Endpoint: `POST /api/lab-login`; accepts URL-encoded form data or JSON containing `username` and `password`. It returns HTTP 200 with `LAB_LOGIN_OK` on a match, HTTP 401 with `LAB_LOGIN_FAILED` on a mismatch, 403 when the lab token/IP gate fails, and 404 when disabled. It never authenticates a user into NovaTech.

Manual validation (replace placeholders; do not publish the token):

```sh
curl -i -X POST 'https://YOUR-PRIVATE-PREVIEW-URL/api/lab-login' \\
  -H 'x-lab-token: YOUR_LAB_ACCESS_TOKEN' \\
  -H 'Content-Type: application/x-www-form-urlencoded' \\
  --data-urlencode 'username=YOUR_LAB_USERNAME' \\
  --data-urlencode 'password=YOUR_LAB_PASSWORD'
```

## Safety notes

This route has no distributed rate limiter. Keep it on a private Preview deployment, protect it with both the token and exact source-IP allowlist, and disable it immediately after testing. Do not enable it on public Production. If you cannot verify the trusted `x-real-ip` header value, leave the route disabled rather than removing the gate.
