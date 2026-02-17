module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ success: false, message: "Only POST method is allowed." });
    return;
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatIds = (process.env.TELEGRAM_CHAT_ID || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  if (!botToken || chatIds.length === 0) {
    res.status(500).json({ success: false, message: "Missing Telegram env configuration." });
    return;
  }

  const body = req.body || {};
  if (!body.message) {
    res.status(400).json({ success: false, message: "Invalid or missing data." });
    return;
  }

  try {
    const results = await Promise.all(chatIds.map(async (chatId) => {
      const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: body.message,
          parse_mode: "HTML",
        }),
      });
      const tgBody = await tgRes.json().catch(() => ({}));
      return { ok: tgRes.ok, status: tgRes.status, chatId, body: tgBody };
    }));

    const failed = results.filter((r) => !r.ok);
    if (failed.length > 0) {
      res.status(500).json({
        success: false,
        message: "Failed to send message to Telegram.",
        details: failed,
      });
      return;
    }

    res.status(200).json({ success: true, message: "Message sent successfully." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send message to Telegram.",
      details: String(error),
    });
  }
};
