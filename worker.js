
const SERVER = "arvelium.vanilla.cool";

export default {
  async fetch(request, env) {
    if (request.method === "GET") {
      return new Response("Arvelium Bot is running!");
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
      const update = await request.json();
      const message = update.message;

      // Информация о входящем сообщении
      console.log("Incoming message:", JSON.stringify({
        chat: message?.chat,
        message_thread_id: message?.message_thread_id,
        is_topic_message: message?.is_topic_message,
        text: message?.text
      }));

      const chatId = message?.chat?.id;
      const command = message?.text
        ?.trim()
        .split(/\s+/)[0]
        ?.split("@")[0];

      if (!chatId || !command) {
        return new Response("OK");
      }

      let text;

      if (command === "/start") {
        text =
          "👋 Привет! Это бот Arvelium.\n\n" +
          "Напиши /online, чтобы проверить сервер.";
      } else if (command === "/online") {
        try {
          const response = await fetch(
            `https://api.mcstatus.io/v2/status/java/${SERVER}`
          );

          if (!response.ok) {
            throw new Error("Minecraft API error");
          }

          const server = await response.json();

          if (server.online) {
            text =
              "🟢 Arvelium, статус активен\n\n" +
              `🌐 IP: ${SERVER}\n` +
              `👥 Игроки: ${server.players?.online ?? 0}/${server.players?.max ?? 100}`;
          } else {
            text =
              "🔴 Arvelium, статус неактивен\n\n" +
              `🌐 IP: ${SERVER}\n` +
              "👥 Игроки: недоступно";
          }
        } catch (error) {
          console.log("Minecraft API:", error.message);

          text =
            "⚠️ Не удалось проверить сервер\n\n" +
            `🌐 IP: ${SERVER}`;
        }
      } else {
        return new Response("OK");
      }

      if (!env.BOT_TOKEN) {
        console.log("BOT_TOKEN не найден!");
        return new Response("OK");
      }

      // Отправка ответа в ту же тему, откуда пришла команда
      const payload = {
        chat_id: chatId,
        text
      };

      if (message.message_thread_id) {
        payload.message_thread_id = message.message_thread_id;
      }

      try {
        const result = await fetch(
          `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          }
        );

        console.log("Telegram response:", await result.text());
      } catch (error) {
        console.log("Telegram send error:", error.message);
      }

      return new Response("OK");
    } catch (error) {
      console.log("Worker error:", error.message);
      return new Response("OK");
    }
  }
};
