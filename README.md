# QRONO Event Transformation

QRONO Event Transformation is a single-page marketing website for QRONO Lifestyle, built with Node.js and Express. It presents a premium event-transformation offering for weddings, engagements, birthdays, photoshoots, corporate events, and celebrations, while also providing AI-powered personalization tools for visitors.

The project combines:

- A polished landing page experience
- A transformation planner that suggests a suitable package based on event type, date, and goal
- A concierge chat assistant that answers common questions from the website content
- A lightweight server-side AI layer that keeps the API key secure

---

## Project purpose

This app is designed to help QRONO Lifestyle convert interested visitors into clients by making the process feel personal and guided. Instead of a generic brochure, it offers:

- a clear event journey from assessment to event-day preparation
- package recommendations based on timeline
- AI-generated transformation plans
- a concierge assistant that answers product and timing questions in natural language

The main business proposition is that QRONO is not just fitness coaching, but a full lifestyle transformation system covering training, nutrition, posture, grooming, styling, and confidence-building.

---

## Tech stack

- Node.js 18+
- Express.js for the web server and API
- Anthropic SDK for AI responses
- dotenv for environment variables
- Static frontend files served from the public folder

Package overview:

```json
{
  "name": "qrono-event-transformation",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.40.0",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "express-rate-limit": "^7.4.0"
  }
}
```

---

## Project structure

```text
Site/
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── server.js
├── README.md
└── public/
    ├── app.js
    ├── index.html
    ├── style.css
    └── videos/
        └── hero.mp4
```

### Key files

- `server.js`: Express app, business context, AI endpoints, rate limiting, and application logic
- `public/index.html`: landing page content and sections for journey, packages, partner network, and CTA
- `public/app.js`: frontend behavior, event planner logic, and chat interactions
- `public/style.css`: visuals, layout, and branding styles
- `public/videos/hero.mp4`: background video for the landing page hero section (muted, looping; replace the file to change it)
- `.env.example`: sample environment variables

---

## Features

### 1. Landing page

The homepage includes:

- a premium hero section
- transformation journey steps
- included-services blocks
- AI planner section
- package cards
- partner network section
- WhatsApp and email call-to-action

### 2. AI transformation planner

The planner allows users to choose:

- event type
- event date
- personal goal
- optional notes

It calculates the number of days until the event and recommends the best package:

- Event 60 for shorter timelines
- Event 90 for standard plans
- Signature 180 for longer transformation programs

The server sends a structured prompt to Anthropic and returns a plain-text plan with sections such as:

- headline
- phase roadmap
- weekly rhythm
- event-week checklist
- package-fit explanation

### 3. Concierge chat assistant

The floating chat widget provides quick answers about:

- packages
- suitability of timeframes
- services and partners
- how the program works

This is limited to the business facts defined in the application and is protected by a server-side prompt and rate limiter.

### 4. Rate limiting and security

The app protects its AI endpoints with request throttling:

- 20 requests per 10-minute window per IP
- secure server-side API key handling
- frontend only communicates with server endpoints, not directly with Anthropic

---

## Environment configuration

Create a `.env` file in the project root based on `.env.example`.

```bash
cp .env.example .env
```

Example:

```env
ANTHROPIC_API_KEY=your-api-key-here
ANTHROPIC_MODEL=claude-sonnet-5-5
PORT=3000
```

### Variables

- `ANTHROPIC_API_KEY`: required for AI features
- `ANTHROPIC_MODEL`: optional model override
- `PORT`: optional port for the Express server, default is `3000`

If `ANTHROPIC_API_KEY` is absent, the app still loads, but the AI endpoints return a 503-style friendly error instead of generating content.

---

## Local development

### Create a virtual environment

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
```

### Install dependencies

```bash
pip install -r requirements.txt
```

### Start the app

```bash
python app.py
```

Then open:

```text
http://localhost:3000
```

---

## Application behavior

### Backend routes

`server.js` exposes the following endpoints:

#### `GET /health`

Returns app status and whether the AI client is configured.

Example response:

```json
{
  "ok": true,
  "ai": true
}
```

#### `POST /api/plan`

Generates a personalized transformation plan for a user.

Request body:

```json
{
  "event": "Wedding",
  "goal": "Build muscle",
  "days": 90,
  "notes": "Desk job, focus on posture and confidence"
}
```

#### `POST /api/chat`

Answers user questions using the QRONO business knowledge base.

Request body:

```json
{
  "messages": [
    { "role": "user", "content": "Which package is best for me?" }
  ]
}
```

---

## Business data and customisation

The app's core business knowledge is stored in the `BUSINESS` constant inside `server.js`.

This includes:

- brand positioning
- event categories
- package pricing and descriptions
- partner network
- contact details
- free consultation details

Because the chatbot is explicitly grounded in this content, it is important to keep the website copy and the `BUSINESS` text aligned.

### Main editable business information

Update these sections in `server.js` when needed:

- package pricing
- contact numbers
- email address
- Instagram handle
- service partner categories
- transformation model wording

Also update the visible site copy in `public/index.html` if you change the front-end claims or pricing displayed to users.

---

## Styling and branding

The UI is built in `public/style.css` and uses a premium editorial aesthetic with warm neutrals and gold accents.

Common styling areas:

- color variables at the top of the stylesheet
- navigation and hero layout
- cards and package sections
- planner blocks and buttons
- floating chat widget

If you want to change the visual brand, the style file is the first place to edit.

---

## Deployment

This app is ready for deployment on any Node-compatible hosting platform such as:

- Render
- Railway
- Fly.io
- a VPS or Linux server
- a container environment

### Example deployment settings

- Install command: `pip install -r requirements.txt`
- Start command: `python app.py`
- Environment variable: `ANTHROPIC_API_KEY`

Make sure the hosting environment supports Python 3.11+ and the required packages listed in `requirements.txt`.

---

## Production notes

- Keep the API key in environment variables, never in source files
- Use HTTPS in production
- Consider adding request logging, analytics, and lead collection later
- If traffic grows, revisit the AI rate limit and cost model

---

## Recommended next improvements

Potential enhancements for this project include:

- lead capture form with WhatsApp or email integration
- admin dashboard for saving and reviewing plan requests
- real client testimonials and gallery images
- SEO and social metadata improvements
- analytics with a privacy-friendly tool such as Plausible
- database storage for user interactions and leads

---

## Troubleshooting

### AI features are not working

Check that:

- `.env` exists
- `ANTHROPIC_API_KEY` is set correctly
- server was restarted after environment changes

### App does not open on localhost

Verify:

- dependencies are installed
- Node version is 18 or newer
- port 3000 is free or update `PORT` in `.env`

### Chatbot gives generic responses

Ensure the business content in `server.js` still matches the current service offerings, pricing, and contact details. The chatbot answers only from that data.

---

## Contact

QRONO Lifestyle

- WhatsApp: +91 96111 42974
- Email: QRONO.lifestyle@gmail.com
- Instagram: @iammanjunath12
- Location: Bengaluru, India

This documentation is intended to be the single source of truth for the project setup, architecture, and operational details.

