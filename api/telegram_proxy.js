module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    res.status(405).json({ success: false, message: "Only POST method is allowed." });
    return;
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) {
    res.status(500).json({ success: false, message: "Missing Telegram configuration." });
    return;
  }

  const { message } = req.body || {};
  if (!message) {
    res.status(400).json({ success: false, message: "Invalid or missing data." });
    return;
  }

  try {
    const tgResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });

    const tgJson = await tgResponse.json().catch(() => ({}));
    if (!tgResponse.ok) {
      res.status(500).json({
        success: false,
        message: "Failed to send message to Telegram.",
        details: tgJson,
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
