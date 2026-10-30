
const BOT_TOKEN = TELEGRAM_TOKEN_PLACEHOLDER;
const SERVER = "arvelium.vanilla.cool";

export default {
  async fetch(request, env) {
    if (request.method === "POST") {
      const update = await request.json();

      if (update.message?.text === "/online") {
        const chatId = update.message.chat.id;

        let message;

        try {
          const response = await fetch(
            `https://api.mcstatus.io/v2/status/java/${SERVER}`
          );

          if (!response.ok) {
            throw new Error("Ошибка получения статуса сервера");
          }

          const server = await response.json();

          if (server.online) {
            message =
              `🟢 Arvelium Vanilla — РАБОТАЕТ\n\n` +
              `🌐 IP: ${SERVER}\n` +
              `👥 Игроки: ${server.players.online}/${server.players.max}`;
          } else {
            message =
              `🔴 Arvelium Vanilla — ВЫКЛЮЧЕН\n\n` +
              `🌐 IP: ${SERVER}\n` +
              `👥 Игроки: недоступно`;
          }
        } catch (error) {
          message =
            `⚠️ Не удалось проверить сервер\n\n` +
            `🌐 IP: ${SERVER}`;
        }

        await fetch(
          `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: message
            })
          }
        );
      }

      return new Response("OK");
    }

    return new Response("Arvelium Bot работает!");
  }
};
