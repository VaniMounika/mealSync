// Vercel serverless function — POST /api/nutrition
// Calls Google Gemini (free tier) to estimate nutrition for a day's meals.
// Requires the GEMINI_API_KEY environment variable to be set in your Vercel project settings.

const SLOTS = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "dinner", label: "Dinner" },
];

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const { profiles, plan } = req.body || {};
    if (!profiles || !plan) {
      res.status(400).json({ error: "Missing profiles or plan" });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "Server is missing GEMINI_API_KEY" });
      return;
    }

    const profileIdList = profiles.map((p) => `${p.id}=${p.name}`).join(", ");
    const mealLines = [];
    SLOTS.forEach((s) => {
      profiles.forEach((p) => {
        const v = plan[s.key] && plan[s.key][p.id];
        if (v) mealLines.push(`${s.label} (${p.name}): ${v}`);
      });
    });

    const prompt = `You are a nutrition estimation assistant. Respond with ONLY raw JSON, no markdown fences, no preamble.

Estimate nutrition for this day's home-cooked meals, per person per meal. Give reasonable estimates based on typical home-cooked portion sizes — this is an estimate, not a lab measurement.

Meals:
${mealLines.join("\n")}

Person id map: ${profileIdList}

Return JSON exactly in this shape:
{"nutrition":{"breakfast":{"<personId>":{"calories":0,"protein_g":0,"carbs_g":0,"fat_g":0,"balanced":true,"note":"short note under 12 words"}},"lunch":{"<personId>":{}},"dinner":{"<personId>":{}}}}`;

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
      .json({ error: "Failed to estimate nutrition", detail: String(err) });
  }
};
