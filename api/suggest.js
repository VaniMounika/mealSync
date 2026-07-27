// Vercel serverless function — POST /api/suggest
// Calls Google Gemini (free tier) to suggest a full day's meal plan.
// Requires the GEMINI_API_KEY environment variable to be set in your Vercel project settings.

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const { profiles, pantry, preferences, recentHistory, targetDate } =
      req.body || {};
    if (!profiles || !targetDate) {
      res.status(400).json({ error: "Missing profiles or targetDate" });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "Server is missing GEMINI_API_KEY" });
      return;
    }

    const profileIdList = profiles.map((p) => `${p.id}=${p.name}`).join(", ");
    const pantryList =
      pantry && pantry.length ? pantry.join(", ") : "(not specified)";
    const prefs = preferences || "(none specified)";

    const prompt = `You are a meal-planning assistant for a home kitchen.
Respond with ONLY raw JSON, no markdown fences, no preamble, no explanation outside the JSON.

People eating: ${profiles.map((p) => p.name).join(", ")}
Groceries/veggies currently at home: ${pantryList}
Preferences / cuisine style / likes / avoid: ${prefs}

Recent meals (avoid repeating these, keep variety):
${recentHistory || "(no recent history yet)"}

Suggest a full meal plan (breakfast, lunch, dinner) for ${targetDate} for each person. Keep dish names short (as if texting a family member), realistic for a home kitchen, and prioritize using what's already at home when reasonable. Also give a concise nutrition estimate per person per meal.

Person id map: ${profileIdList}

Return JSON exactly in this shape (use the person ids as keys, keep notes under 12 words):
{"slots":{"breakfast":{"<personId>":"dish text"},"lunch":{"<personId>":"dish text"},"dinner":{"<personId>":"dish text"}},"nutrition":{"breakfast":{"<personId>":{"calories":0,"protein_g":0,"carbs_g":0,"fat_g":0,"balanced":true,"note":"short note"}},"lunch":{"<personId>":{}},"dinner":{"<personId>":{}}},"notes":"one short sentence on approach"}`;

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      },
    );

    if (!resp.ok) {
      const errText = await resp.text();
      res.status(502).json({ error: "Gemini request failed", detail: errText });
      return;
    }

    const data = await resp.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
    const clean = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const parsed = JSON.parse(clean);
    res.status(200).json(parsed);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to generate suggestion", detail: String(err) });
  }
};
