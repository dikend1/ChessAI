const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-sonnet-4-5";

function buildPrompt(body) {
  return [
    "Разбери шахматную партию для игрока-любителя.",
    "Отвечай по-русски, коротко и практично.",
    "Найди 1-3 ключевых момента. Если видишь явную ошибку, назови номер хода и лучший план или ход.",
    "Не выдумывай точную engine-оценку. Если данных недостаточно, говори уверенно только о понятных стратегических идеях.",
    "",
    `Режим: ${body.gameMode}`,
    `Результат/статус: ${body.status}`,
    `Финальная FEN: ${body.finalFen}`,
    "",
    "Ходы:",
    body.moveText || JSON.stringify(body.moves ?? []),
  ].join("\n");
}

function extractText(data) {
  return data?.content
    ?.filter((item) => item.type === "text" && typeof item.text === "string")
    .map((item) => item.text)
    .join("\n")
    .trim();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY is not configured" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  if (!body?.finalFen || !Array.isArray(body.moves) || body.moves.length === 0) {
    return res.status(400).json({ error: "Game data is missing" });
  }

  const anthropicResponse = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
      max_tokens: 900,
      system: "Ты шахматный тренер. Давай честный, полезный разбор без длинной теории.",
      messages: [
        {
          role: "user",
          content: buildPrompt(body),
        },
      ],
    }),
  });

  const data = await anthropicResponse.json().catch(() => ({}));
  if (!anthropicResponse.ok) {
    return res.status(anthropicResponse.status).json({
      error: data?.error?.message || "Claude API request failed",
    });
  }

  const analysis = extractText(data);
  if (!analysis) {
    return res.status(502).json({ error: "Claude returned an empty response" });
  }

  return res.status(200).json({ analysis });
}
