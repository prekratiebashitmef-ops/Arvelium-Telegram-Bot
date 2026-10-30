
const SERVER = "arvelium.vanilla.cool";

export default {
  async fetch(request, env) {
    if (request.method === "GET") {
      return new Response("Arvelium bot is running!");
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
      const update = await request.json();
      const message = update.message;
      const chatId = message?.chat?.id;
      const command = message?.text?.trim().split(/\s+/)[0];

      console.log("Получено сообщение:", command);

      if (!chatId || !command) {
        return new Response("OK");
      }

      let text;

      if (command === "/start") {
        text =
          "👋 Привет! Это бот Arvelium Vanilla.\n\n" +
          "Напиши /online, чтобы проверить сервер.";
      } else if (command === "/online") {
        try {
          const response = await fetch(
            `https://api.mcstatus.io/v2/status/java/${SERVER}`
          );

          if (!response.ok) {
            throw new Error(`Minecraft API HTTP ${response.status}`);
          }

          const server = await response.json();

          if (server.online) {
            text =
              "🟢 Arvelium Vanilla — РАБОТАЕТ\n\n" +
              `🌐 IP: ${SERVER}\n` +
              `👥 Игроки: ${server.players?.online ?? 0}/${server.players?.max ?? "?"}`;
          } else {
            text =
              "🔴 Arvelium Vanilla — ВЫКЛЮЧЕН\n\n" +
              `🌐 IP: ${SERVER}\n` +
              "👥 Игроки: недоступно";
          }
        } catch (error) {
          console.log("Ошибка проверки Minecraft:", error.message);
          text =
            "⚠️ Не удалось проверить сервер\n\n" +
            `🌐 IP: ${SERVER}`;
        }
      } else {
        return new Response("OK");
      }

      if (!env.BOT_TOKEN) {
        console.log("ОШИБКА: BOT_TOKEN не найден!");
        return new Response("BOT_TOKEN missing", { status: 500 });
      }

      const telegramResponse = await fetch(
        `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: text
          })
        }
      );

      const telegramResult = await telegramResponse.text();
      console.log("Ответ Telegram:", telegramResult);

      return new Response("OK");
    } catch (error) {
      console.log("Ошибка Worker:", error.message);
      return new Response("Internal Error", { status: 500 });
    }
  }
};
