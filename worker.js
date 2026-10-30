const SERVER = "arvelium.vanilla.cool";
const API = `https://api.mcsrvstat.us/3/${SERVER}`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Проверяем доступность Worker
    if (request.method !== "POST" || url.pathname !== "/telegram") {
      return new Response("Arvelium Monitor is running!");
    }

    // Диагностика переменных окружения
    console.log("ENV KEYS:", Object.keys(env));
    console.log("BOT_TOKEN EXISTS:", Boolean(env.BOT_TOKEN));

    if (!env.BOT_TOKEN) {
      console.error("BOT_TOKEN is missing!");
      return new Response("OK");
    }

    try {
      const update = await request.json();
      const msg = update.message;

      if (!msg || !msg.text) {
        return new Response("OK");
      }

      const chatId = msg.chat.id;

      const command = msg.text
        .trim()
        .split(/\s+/)[0]
        .split("@")[0]
        .toLowerCase();

      console.log("Received command:", command);

      let text;

      if (command === "/start") {
        text =
          "👋 Привет! Это Arvelium Monitor.\n\n" +
          "Команда /online — проверить сервер.";
      }

      else if (command === "/online") {
        text = "⏳ Проверяю сервер Arvelium...";

        try {
          const response = await fetch(API);

          if (!response.ok) {
            throw new Error("Minecraft API HTTP " + response.status);
          }

          const server = await response.json();

          if (server.online === true) {
            text =
              "🟢 Arvelium Vanilla — РАБОТАЕТ\n\n" +
              "🌐 IP: " + SERVER + "\n" +
              "👥 Игроки: " +
              (server.players?.online ?? 0) + "/" +
              (server.players?.max ?? "?");
          } else {
            text =
              "🔴 Arvelium Vanilla — ВЫКЛЮЧЕН\n\n" +
              "🌐 IP: " + SERVER + "\n" +
              "👥 Игроки: недоступно";
          }

        } catch (error) {
          console.error("Minecraft check error:", error);

          text =
            "🔴 Arvelium Vanilla — НЕДОСТУПЕН\n\n" +
            "🌐 IP: " + SERVER + "\n" +
            "👥 Игроки: недоступно";
        }
      }

      else {
        text = "Используй команду /online";
      }

      // Отправляем сообщение в Telegram
      const telegramResponse = await fetch(
        `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: text
          })
        }
      );

      const result = await telegramResponse.text();

      console.log("Telegram HTTP status:", telegramResponse.status);
      console.log("Telegram response:", result);

      return new Response("OK");

    } catch (error) {
      console.error("Worker error:", error);
      return new Response("OK");
    }
  }
};
