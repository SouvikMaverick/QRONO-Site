# QRONO Event Transformation

QRONO Event Transformation is a single-page marketing website for QRONO Lifestyle, built with Python and Flask. It presents a premium event-transformation program for weddings, engagements, birthdays, photoshoots, corporate events and celebrations, and gives visitors two AI-powered tools:

- a **transformation planner** that recommends a package and drafts a personal plan
- a **concierge chat** that answers questions using only the business information in the app

The site is designed to turn visitors into clients by making the process feel personal and guided: a clear journey from assessment to event day, package recommendations based on the time available, and natural-language answers to common questions.

---

## Tech stack

- **Python 3.11+**
- **Flask 3.0.3**: web server, JSON API and static file serving
- **OpenAI Python SDK**: client for an OpenAI-compatible API (NVIDIA by default)
- **python-dotenv**: loads settings from `.env`
- **Gunicorn**: production WSGI server
- **HTML, CSS and vanilla JavaScript** for the frontend in `public/`

---

## Project structure

```text
Site/
├── .env                  # Local secrets and settings (not committed)
├── .gitignore
├── app.py                # Flask app: routes, AI client, rate limiting, business data
├── diagnose_ai.py        # Standalone script to test the AI connection
├── requirements.txt
├── README.md
└── public/
    ├── app.js            # Planner and chat UI logic
    ├── index.html        # Landing page content
    ├── style.css         # Layout, branding and animations
    └── videos/
        └── hero.mp4      # Background video for the hero section
```

### Key files

- `app.py`: all server logic. The `BUSINESS` text, the `EVENTS` and `GOALS` lists, the rate limits and the AI prompts are defined here.
- `public/index.html`: landing page sections for the journey, services, planner, packages, partner network and call to action.
- `public/app.js`: planner form, package recommendation display, and the concierge chat widget. It calls `/api/plan` and `/api/chat`.
- `public/style.css`: colours, layout and the hero background video styling.
- `public/videos/hero.mp4`: background video for the hero. It plays muted and on a loop, and is hidden for users who have "reduce motion" enabled in their OS settings. Replace the file to change the video; keep the name, or update the `<source>` path in `index.html`.
- `diagnose_ai.py`: checks the AI configuration and sends one test request.

---

## Features

### 1. Landing page

- Hero section with a looping background video
- Transformation journey steps
- What's included, by service area
- AI planner section
- Package cards and the couple package
- Partner network
- WhatsApp and email call to action
- Floating concierge chat button

### 2. AI transformation planner

Visitors choose an event type, a goal, the number of days until the event and optional notes. The server:

1. Validates the input.
2. Recommends a package based on the days remaining (see [How package recommendation works](#how-package-recommendation-works)).
3. Asks the AI model for a plain-text plan with a headline, phases with day ranges, a weekly rhythm, an event-week checklist and a short explanation of the package fit.

### 3. Concierge chat

The chat widget answers questions about packages, timing, services and partners. Answers are limited to the facts in the `BUSINESS` text, kept under 70 words, and point visitors to a free WhatsApp consultation when a question is not covered.

### 4. Rate limiting and security

- AI endpoints (`/api/*`) allow **20 requests per 10 minutes per IP address**. Requests over the limit receive `429` with a `Retry-After: 600` header.
- Request bodies are limited to **64 KB**.
- The API key stays on the server. The browser only calls this app's endpoints.
- User notes and chat messages are treated as data, not instructions, and are truncated before they reach the model.

---

## Setup

### 1. Prerequisites

- Python 3.11 or newer
- An API key for NVIDIA's API (or another OpenAI-compatible provider, set with `AI_BASE_URL`)

### 2. Create a virtual environment and install dependencies

```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

On macOS or Linux, activate with `source .venv/bin/activate`.

### 3. Create the `.env` file

Create a file named `.env` in the project root. The repository does not include a sample file.

```env
NVIDIA_API_KEY=your-api-key-here
NVIDIA_MODEL=meta/muse-glimmer-30b
PORT=3000
```

`.env` is listed in `.gitignore`, so it will not be committed. Never put the API key in source files.

### 4. Run the app

```powershell
python app.py
```

Open [http://localhost:3000](http://localhost:3000).

The development server listens on `0.0.0.0`, so other devices on your network can reach it at `http://<your-computer-ip>:3000`. Use Gunicorn for public deployments (see [Deployment](#deployment)).

---

## Configuration

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `NVIDIA_API_KEY` | For AI features | none | API key. `OPENAI_API_KEY` is used as a fallback. |
| `NVIDIA_MODEL` | No | `meta/muse-glimmer-30b` | Model name. `OPENAI_MODEL` is used as a fallback. |
| `AI_BASE_URL` | No | `https://integrate.api.nvidia.com/v1` | OpenAI-compatible API base URL. |
| `AI_TIMEOUT_SECONDS` | No | `90` | Timeout for each AI request. |
| `AI_MAX_RETRIES` | No | `3` | Retries the AI client makes on transient errors. |
| `PORT` | No | `3000` | Port the server listens on. |
| `LOG_LEVEL` | No | `INFO` | Python logging level. |

If no API key is set, the app still starts. The AI endpoints return `503` with the message "The AI assistant isn't configured yet.", and `/health` reports `"ai": false`.

---

## API reference

### `GET /health`

Reports whether the AI is configured. It does not check whether the AI provider is reachable, and it never returns secrets.

```json
{
  "ok": true,
  "ai": true
}
```

### `POST /api/plan`

Generates a personal transformation plan.

Request:

```json
{
  "event": "Wedding",
  "goal": "Build muscle",
  "days": 90,
  "notes": "Desk job, focus on posture and confidence"
}
```

| Field | Rules |
|---|---|
| `event` | One of `Wedding`, `Engagement`, `Birthday`, `Photoshoot`, `Corporate`, `Celebration` |
| `goal` | One of `Lean & fit`, `Build muscle`, `Posture & confidence`, `Total makeover` |
| `days` | Whole number from 1 to 730. Booleans and fractional values are rejected. |
| `notes` | Optional text. Only the first 300 characters are used. |

Response:

```json
{
  "text": "…plain-text plan…"
}
```

### `POST /api/chat`

Answers a visitor's question from the QRONO business information.

Request:

```json
{
  "messages": [
    { "role": "user", "content": "Which package is best for me?" }
  ]
}
```

- `role` must be `user` or `assistant`.
- Only the most recent 10 messages are used. Each is truncated to 500 characters.
- The conversation must end with a `user` message.
- More than 100 messages in a request is rejected.

Response:

```json
{
  "text": "…reply…"
}
```

### Errors

Error responses have the form `{"error": "message"}`.

| Status | Meaning |
|---|---|
| `400` | Invalid JSON or invalid input |
| `404` | Unknown route, including unknown `/api/*` paths |
| `413` | Request body larger than 64 KB |
| `429` | Rate limit reached (20 requests per 10 minutes per IP) |
| `500` | Unexpected server error |
| `502` | The AI provider returned an empty response or rejected the request |
| `503` | AI not configured, the provider is busy, or the provider is unreachable |
| `504` | The AI provider timed out |

---

## How package recommendation works

The days remaining decide the recommended package:

| Days remaining | Recommended package |
|---|---|
| 1 to 75 | Event 60 |
| 76 to 135 | Event 90 |
| 136 to 730 | Signature 180 |

The Couple Transformation package is shown on the site but is not selected automatically.

---

## Business data and customisation

The business information the AI is allowed to use lives in the `BUSINESS` constant in [app.py](app.py). It covers:

- brand positioning and the journey steps
- event categories
- package names, durations, prices and inclusions
- the partner network
- contact details and the free consultation offer

The chat assistant answers only from this text, so keep it in line with the website copy.

When you change any of the following, update the matching places:

- **Prices, packages or contact details**: `BUSINESS` in `app.py`, and the visible copy in `public/index.html`.
- **Event types or goals**: the `EVENTS` and `GOALS` lists in `app.py`, and the option lists in `public/app.js` (the planner options) and `public/index.html` (the event chips). The server rejects any value not in `EVENTS` or `GOALS`.
- **Package recommendation thresholds**: the `recommend()` function in `app.py`, and the matching text in the planner.
- **Prompt rules** (tone, length, safety wording): `build_system_prompt()` and the plan and chat prompts in `app.py`.

---

## Styling and branding

The UI is built in `public/style.css` with a premium editorial look: warm neutrals, gold accents and a serif heading font. The main areas are:

- colour variables at the top of the stylesheet
- the fixed navigation bar and the hero, including its background video
- cards and package sections
- planner blocks and buttons
- the floating chat widget

---

## Diagnosing the AI connection

If the AI features fail, run:

```powershell
python diagnose_ai.py
```

The script reads `.env`, prints whether a key is set (it never prints the key itself), shows the model and base URL, and sends one test request with no retries. The output shows the response status or the error type and message.

---

## Deployment

The app runs on any Python host that can install `requirements.txt` and run Gunicorn, such as Render, Railway, Fly.io or a Linux VPS.

- **Build command**: `pip install -r requirements.txt`
- **Start command**: `gunicorn app:app --bind 0.0.0.0:$PORT --workers 1 --threads 4`
- **Environment variables**: set `NVIDIA_API_KEY` (and any optional variables above) in the host's settings, not in a committed file.

Use a single worker process. The rate limiter is stored in memory, so each worker keeps its own count.

### Production notes

- Use HTTPS.
- Keep API keys in environment variables.
- The rate limiter uses the connection's IP address (`request.remote_addr`). Behind a reverse proxy or load balancer, every visitor can appear to come from the proxy's address, which means they share one limit. If your host sits behind a proxy, configure Werkzeug's `ProxyFix` so the real client address is used. `X-Forwarded-For` is not trusted by default, because clients can spoof it.
- Consider request logging, analytics and lead collection.
- Revisit the AI rate limit and cost model as traffic grows.

---

## Recommended next improvements

- Lead capture form with WhatsApp or email integration
- Admin view for saving and reviewing plan requests
- Real client testimonials and gallery images
- SEO and social metadata
- Privacy-friendly analytics such as Plausible
- Database storage for interactions and leads

---

## Troubleshooting

### AI features return "isn't configured" or 503

- Confirm `.env` is in the project root and contains `NVIDIA_API_KEY`.
- Restart `python app.py` after changing `.env`.
- Open `/health` and check that `"ai"` is `true`.
- Run `python diagnose_ai.py` to see the provider's response.

### AI features return 429 or "reached the limit"

The IP has made more than 20 AI requests in 10 minutes. Wait for the `Retry-After` period (600 seconds), or raise `RATE_LIMIT_MAX_REQUESTS` in `app.py` if the limit is too strict.

### The app does not start

- Make sure the virtual environment is activated and `pip install -r requirements.txt` has run.
- Use Python 3.11 or newer.
- Check that the port in `PORT` is free, or change it in `.env`.

### The hero video does not play

- Confirm the file is at `public/videos/hero.mp4`.
- Open `http://localhost:3000/videos/hero.mp4` and check that it loads.
- The video is hidden when the operating system's "reduce motion" setting is on. This is intentional.

### The chatbot gives generic answers

Check that the `BUSINESS` text in `app.py` matches the current packages, prices and contact details.

---

## Contact

QRONO Lifestyle

- WhatsApp: +91 96111 42974
- Email: QRONO.lifestyle@gmail.com
- Instagram: @iammanjunath12
- Location: Bengaluru, India