# COS30049-Assignment-3

### Requirements
- `Node 24.21.0 LTS`

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

## Run backend
`uvicorn main:app --reload --port 8000`

## Threat model

This app is a phishing-URL classifier: a caller submits a URL and gets back
a legitimacy score. There are no logins, no stored files, and no outbound
requests from the server itself - the whole attack surface is one API call.

**Attacker profile.** Two realistic attackers: a phisher who wants their
malicious link to be scored "legitimate," so a victim or an automated
filter trusts it; and someone probing the API directly (not through the
UI) to see how the classifier decides, copy its behaviour, or disrupt it
for other users.

**Attacker goals.** Evade detection - get a phishing URL misclassified as
legitimate. Model extraction - learn how the model decides well enough to
copy or defeat it. Denial of service - make the endpoint slow or
unavailable for everyone else.

**Attack surface and which threats apply.** The entire surface is
`POST /check`, which takes a URL string. The app never fetches the pages
it's given, never logs users in, never stores files, never runs a shell
command, and never queries a database, so **SQL injection, SSRF, broken
access control and unsafe file upload do not apply** to this design. What
*is* realistic is request *volume* (nothing stops someone flooding the
endpoint) and server configuration/dependency hygiene - which is why those
are the two defences built below.

## Security defences (section 2.7)

### 1. Denial of Service (Advanced)
`POST /check` allows at most `MAX_CONCURRENT_PREDICTIONS = 8` predictions to
run at the same time (`threading.Semaphore(8)`, non-blocking `acquire`).
Past that limit, a new request gets an immediate `503` instead of queueing,
so flooding the endpoint can't make it hang or starve other users - it can
only be turned away cleanly. Measured result: firing 40 requests at once,
8 succeeded (200) and 32 were rejected (503) with 0 errors, and a health
check immediately after returned in ~0.01s, showing the server was never
degraded. With the limit removed, all 40 succeed but each is measurably
slower, since they genuinely contend for the same worker threads instead of
the excess being turned away instantly. Cost: under a genuine burst of
legitimate traffic, a few users could receive a `503` and need to retry -
the trade-off for guaranteed responsiveness under attack.

### 2. Misconfiguration & vulnerable dependencies (Intermediate)
A response middleware sets `X-Content-Type-Options: nosniff`,
`X-Frame-Options: DENY` and `Referrer-Policy: no-referrer` on every
response, and strips the `Server` header - none of these are on by default
in FastAPI. `pip-audit` on the backend: no known vulnerabilities found.
`npm audit` on the frontend: fixed down to 34 remaining findings, all
inside `react-scripts`' build tooling (`webpack-dev-server`, a Terser
plugin, `jsonpath`/`underscore` via `bfj`). These only run on a developer's
machine during `npm start`/`npm build` and never ship in the bundle a
user's browser downloads; fixing them requires `npm audit fix --force`,
which downgrades `react-scripts` to a broken version and breaks the build,
so they were assessed and consciously accepted rather than fixed by
breaking the app. Cost: negligible for the headers; the accepted frontend
findings are the one real trade-off, weighed against breaking the build.

*(Not used: SSRF, command injection, SQL injection, unsafe file upload and
broken access control do not apply to this design - no outbound requests,
no shell commands, no database, no file uploads, no user accounts.)*

## What doesn't work yet / next steps
- The model's confidence is inconsistent - it flags `google.com` and
  `en.wikipedia.org` as phishing with 78-80% confidence, while an actual
  phishing-shaped URL barely clears 50%. This is a model-quality issue
  inherited from Assignment 2's limited feature set, not a backend bug;
  accuracy isn't marked in this assignment, but it's worth stating honestly.
- No OWASP ZAP baseline scan was run against the running app - the next
  security check we'd add.
- No global exception handler yet for a genuinely unexpected backend
  failure (e.g. the model call itself failing) - invalid *input* already
  returns clean, consistent errors via Pydantic validation.


### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
