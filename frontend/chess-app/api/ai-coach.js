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

function formatMoveList(moves) {
  const rows = [];

  for (let i = 0; i < moves.length; i += 2) {
    const moveNumber = i / 2 + 1;
    const white = moves[i]?.san || `${moves[i]?.from}-${moves[i]?.to}`;
    const black = moves[i + 1]?.san || (
      moves[i + 1] ? `${moves[i + 1].from}-${moves[i + 1].to}` : ""
    );

    rows.push(`${moveNumber}. ${white}${black ? ` ${black}` : ""}`);
  }

  return rows.join("\n");
}

function buildLocalAnalysis(body, apiNote = "") {
  const moves = Array.isArray(body.moves) ? body.moves : [];
  const moveCount = moves.length;
  const lastMove = moves.at(-1);
  const checks = moves.filter((move) => typeof move.san === "string" && move.san.includes("+")).length;
  const captures = moves.filter((move) => move.captured).length;
  const castles = moves.filter((move) => typeof move.san === "string" && move.san.includes("O-O")).length;
  const queenMoves = moves.filter((move) => typeof move.san === "string" && move.san.includes("Q")).length;
  const earlyQueen = moves.slice(0, 10).some((move) => typeof move.san === "string" && move.san.includes("Q"));

  const resultLine = body.status === "checkmate"
    ? `Партия закончилась матом после ${moveCount} полуходов.`
    : body.status === "draw"
      ? `Партия закончилась ничьей после ${moveCount} полуходов.`
      : `Партия завершилась со статусом: ${body.status}.`;

  const ideas = [];
  if (lastMove?.san?.includes("#")) {
    ideas.push(`Ключевой момент: финальный ход ${lastMove.san} поставил мат. Перед таким ходом важно искать не только шах, но и клетки отхода короля.`);
  }
  if (captures >= Math.max(3, Math.floor(moveCount / 5))) {
    ideas.push(`В партии было много разменов: ${captures}. После каждого размена проверяй, кто активнее и не осталась ли фигура без защиты.`);
  }
  if (checks > 1) {
    ideas.push(`Было несколько шахов: ${checks}. Шахи полезны, но перед ними стоит проверять, улучшают ли они позицию после ответа соперника.`);
  }
  if (!castles && moveCount >= 16) {
    ideas.push("Рокировка не встретилась в записи. В следующих партиях попробуй раньше увести короля в безопасность и связать ладьи.");
  }
  if (earlyQueen || queenMoves >= 4) {
    ideas.push("Ферзь активно выходил в игру. Это может давать угрозы, но ранний ферзь часто теряет темпы под атаками фигур соперника.");
  }
  if (ideas.length === 0) {
    ideas.push("Главный совет: после каждого хода соперника сначала ищи его угрозу, потом уже выбирай свой план.");
    ideas.push("Старайся развивать лёгкие фигуры к центру и не делать много ходов одной фигурой в дебюте.");
  }

  const moveText = body.moveText || formatMoveList(moves);

  return [
    apiNote ? `Локальный разбор: ${apiNote}` : "Локальный бесплатный разбор.",
    resultLine,
    "",
    "Что проверить:",
    ...ideas.slice(0, 3).map((idea) => `- ${idea}`),
    "",
    "Ходы партии:",
    moveText || "Нет записи ходов.",
  ].join("\n");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  if (!body?.finalFen || !Array.isArray(body.moves) || body.moves.length === 0) {
    return res.status(400).json({ error: "Game data is missing" });
  }

  if (!apiKey) {
    return res.status(200).json({
      analysis: buildLocalAnalysis(body, "Claude API ключ не настроен, поэтому использую бесплатный анализ по ходам."),
      source: "local",
    });
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
    return res.status(200).json({
      analysis: buildLocalAnalysis(
        body,
        data?.error?.message || "Claude сейчас недоступен, поэтому использую бесплатный анализ по ходам."
      ),
      source: "local",
    });
  }

  const analysis = extractText(data);
  if (!analysis) {
    return res.status(200).json({
      analysis: buildLocalAnalysis(body, "Claude вернул пустой ответ, поэтому использую бесплатный анализ по ходам."),
      source: "local",
    });
  }

  return res.status(200).json({ analysis, source: "claude" });
}
