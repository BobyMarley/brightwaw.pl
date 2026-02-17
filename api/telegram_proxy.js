module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    res.status(405).json({ success: false, message: "Only POST method is allowed." });
    return;
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) {
    res.status(500).json({ success: false, message: "Missing Telegram env configuration." });
    return;
  }

  const body = req.body || {};
  if (!body.message) {
    res.status(400).json({ success: false, message: "Invalid or missing data." });
    return;
  }

  try {
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
    if (!tgRes.ok) {
      res.status(500).json({
        success: false,
        message: "Failed to send message to Telegram.",
        details: tgBody,
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
