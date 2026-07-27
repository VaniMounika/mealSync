# MealSync — deployment guide

You already have a GitHub account, so here's the path from this folder to a real, working URL.

## 1. Set up Supabase (free database)

1. Go to **supabase.com**, sign up, and create a new project (pick any name/region; the free tier is plenty for this).
2. Once it's created, open **SQL Editor** → **New query**, paste in the contents of `schema.sql` from this folder, and run it. This creates the two tables the app needs.
3. Go to **Project Settings → API**. Copy two values:
   - **Project URL** (looks like `https://xxxxxxxx.supabase.co`)
   - **anon public key** (a long string)

## 2. Get your Gemini API key (free)

1. Go to **aistudio.google.com**, sign in, click **Get API key** → **Create API key**.
2. Copy the key (starts with `AIza...`). Keep it private — you'll only paste it into Vercel, never into the frontend code.

## 3. Fill in your config

Open `index.html` in this folder and find these two lines near the top of the `<script>`:

```js
var SUPABASE_URL = "YOUR_SUPABASE_URL";
var SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
```

Replace both with the values you copied in step 1. Save the file.

(The Gemini key does **not** go in this file — it goes into Vercel's environment variables in step 5, so it stays private.)

## 4. Push this folder to GitHub

From inside this folder:

```bash
git init
git add .
git commit -m "MealSync initial deploy"
git branch -M main
git remote add origin https://github.com/<your-username>/mealSync.git
git push -u origin main
```

(Create the empty `mealSync` repo on GitHub first if it doesn't exist yet.)

## 5. Deploy on Vercel (free)

1. Go to **vercel.com**, sign in with your GitHub account.
2. Click **Add New → Project**, and import the `mealSync` repo you just pushed.
3. Before deploying, open **Environment Variables** and add:
   - Name: `GEMINI_API_KEY`
   - Value: the key from step 2
4. Click **Deploy**. After a minute, Vercel gives you a live URL like `https://mealSync.vercel.app`.

## 6. Try it out

1. Open the Vercel URL on your phone in Safari.
2. Tap **Create a new household** — this generates a 6-character code and saves it on your phone.
3. Tap the **"Household: XXXXXX"** button in the header to copy an invite message — send it to your husband.
4. On his phone, he opens the same URL, taps **"I have a code"**, and enters the code you sent.
5. From here you're both looking at the same shared data — try adding a meal on one phone and refreshing on the other.
6. In Safari, use **Share → Add to Home Screen** on both phones so it behaves like a regular app icon.

## Notes

- **This app has no login** — anyone who has your household code can see and edit your data. Fine for sharing between two people you trust; don't put anything sensitive in it.
- **Free tier limits**: Gemini's free tier allows a modest number of requests per minute/day — comfortably enough for a household using the "suggest" and "nutrition" buttons a few times a day. If you ever see errors specifically from `/api/suggest` or `/api/nutrition`, check your usage at aistudio.google.com.
- **If you change the code later**, just `git push` again — Vercel redeploys automatically on every push to `main`.
