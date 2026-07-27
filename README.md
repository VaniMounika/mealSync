# MealSync

A shared meal planner for households — replaces typing out daily WhatsApp meal-plan texts. Everyone in your household sees and edits the same plan, and the app can suggest tomorrow's meals and estimate nutrition using AI.

Live app: https://meal-sync-pearl.vercel.app

---

## Using the app

### First time setup

1. Open the app link on your phone in Safari (or Chrome).
2. Tap **Create a new household** — this generates a 6-character code (e.g. `7K2QRT`) and remembers it on this device.
3. Tap the **"Household: XXXXXX"** button in the header to copy an invite message, and send it to the rest of your household (e.g. over WhatsApp).
4. On their phone, they open the same app link, tap **I have a code**, and enter the code you sent. From then on, you're both looking at and editing the same shared plan.
5. In Safari: **Share → Add to Home Screen** on each phone, so it behaves like a regular app icon instead of a browser tab.

### Day-to-day use

- **Plan tab**: shows one day at a time. Use the arrows to move between days. Each meal (Breakfast/Lunch/Dinner) has one text box per household member — type what's for that meal and it saves per person.
- **Suggest this day's plan**: on an empty day, tap this to get an AI-suggested plan for everyone, based on your pantry, preferences, and the last few days' meals (so it avoids repeats). Suggestions are a draft — edit anything before saving.
- **Save this day's plan**: locks in your edits for that day.
- **Estimate nutrition**: on any day with meals filled in, get an estimated calorie and protein/carb/fat breakdown per person per meal, plus a balanced/unbalanced read. These are AI estimates for typical home-cooked portions, not verified lab values.
- **Pantry & Preferences tab**:
  - **Who's eating** — add, rename, or remove household members.
  - **At home right now** — a running list of groceries/veggies you currently have; used to make suggestions realistic.
  - **Preferences & cuisine style** — free text for cooking style, likes, dislikes, anything to avoid. Feeds every AI suggestion.

### A note on privacy

There's no login — access is controlled only by knowing the household code. That's convenient for sharing between people you trust, but it also means anyone who has (or guesses) your code can see and edit your data. Don't put anything sensitive in it.

---

## Setting this up yourself (fork/clone)

You'll need three free accounts: **GitHub** (this repo), **Supabase**, and **Google AI Studio**.

### 1. Supabase (database)

1. Create a project at supabase.com.
2. In **SQL Editor → New query**, run the contents of `schema.sql` from this repo.
3. In **Project Settings → API**, copy the **Project URL** (e.g. `https://xxxxxxxx.supabase.co` — no path after `.co`) and the **anon public** key.

### 2. Gemini API key (AI suggestions/nutrition)

1. Go to aistudio.google.com → **Get API key** → **Create API key**.
2. Copy it. This key is never put in the frontend code — only into Vercel's environment variables (step 4).

### 3. Configure the app

In `index.html`, near the top of the `<script>` tag, set:

```js
var SUPABASE_URL = "https://xxxxxxxx.supabase.co"; // no trailing path
var SUPABASE_ANON_KEY = "your-anon-key-here";
```

### 4. Deploy on Vercel

1. Import this GitHub repo at vercel.com.
2. Before deploying, add an environment variable: `GEMINI_API_KEY` = your key from step 2.
3. Deploy. Vercel gives you a live URL and redeploys automatically on every push to `main`.

### Project structure

```
index.html         the whole frontend (no build step — plain HTML/CSS/JS)
api/suggest.js      serverless function — AI meal suggestion (Gemini)
api/nutrition.js    serverless function — AI nutrition estimate (Gemini)
schema.sql          Supabase table + policy definitions
```

### Known limitations

- No authentication — household code is a convenience shortcut, not real security (see privacy note above).
- Gemini's free tier has a modest per-minute/per-day request limit — fine for normal household use; watch usage at aistudio.google.com if `/api/suggest` or `/api/nutrition` start failing.
