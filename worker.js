
const SERVER = "arvelium.vanilla.cool";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Проверка, что Worker запущен
    if (request.method === "GET") {
      return new Response("Arvelium Telegram Bot is running!");
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
      const update = await request.json();
      const chatId = update.message?.chat?.id;
      const command = update.message?.text?.trim();

      if (!chatId || !command) {
        return new Response("OK");
      }

      if (command === "/start") {
        await sendMessage(
          env.BOT_TOKEN,
          chatId,
          "👋 Привет! Я бот мониторинга Arvelium Vanilla.\n\nНапиши /online, чтобы проверить сервер."
        );
      }

      if (command === "/online") {
        let message;

        try {
          const response = await fetch(
            `https://api.mcstatus.io/v2/status/java/${SERVER}`
          );

          if (!response.ok) {
            throw new Error("Status API error");
          }

          const server = await response.json();

          if (server.online) {
            const online = server.players?.online ?? 0;
            const max = server.players?.max ?? "?";

            message =
              "🟢 Arvelium Vanilla — РАБОТАЕТ\n\n" +
              `🌐 IP: ${SERVER}\n` +
              `👥 Игроки: ${online}/${max}`;
          } else {
            message =
              "🔴 Arvelium Vanilla — ВЫКЛЮЧЕН\n\n" +
              `🌐 IP: ${SERVER}\n` +
              "👥 Игроки: недоступно";
          }
        } catch (error) {
          message =
            "⚠️ Не удалось проверить сервер\n\n" +
            `🌐 IP: ${SERVER}\n` +
            "Попробуй позже.";
        }

        await sendMessage(env.BOT_TOKEN, chatId, message);
      }

      return new Response("OK");
    } catch (error) {
      return new Response("OK");
    }
  }
};

async function sendMessage(token, chatId, text) {
  if (!token) {
    throw new Error("BOT_TOKEN is not configured");
  }

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: text
    })
  });
}
