export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method !== "POST" || url.pathname !== "/telegram") {
      return new Response("Arvelium Bot is running!");
    }

    try {
      const update = await request.json();

      console.log("Получено сообщение:", JSON.stringify({
        text: update.message?.text,
        chatId: update.message?.chat?.id
      }));

      if (!update.message || !update.message.text) {
        return new Response("OK");
      }

      const chatId = update.message.chat.id;
      const command = update.message.text.split(" ")[0].split("@")[0];

      let message;

      if (command === "/start") {
        message = "Привет! Я бот сервера Arvelium Vanilla. Напиши /online, чтобы узнать онлайн.";
      } else if (command === "/online") {
        try {
          const response = await fetch(
            "https://api.mcsrvstat.us/3/Arvelium.vanilla.cool"
          );

          const server = await response.json();

          message = server.online
            ? "🟢 Arvelium Vanilla\n👥 Онлайн игроков: " +
              (server.players?.online ?? 0) + "/" +
              (server.players?.max ?? "?")
            : "🔴 Arvelium Vanilla\n👥 Сервер Offline";
        } catch (error) {
          console.error("Ошибка проверки сервера:", error);
          message = "🔴 Arvelium Vanilla\n👥 Сервер Offline";
        }
      } else {
        return new Response("OK");
      }

      const telegramResponse = await fetch(
        "https://api.telegram.org/bot" + env.BOT_TOKEN + "/sendMessage",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: message
          })
        }
      );

      const telegramResult = await telegramResponse.json();

      console.log("Ответ Telegram:", JSON.stringify(telegramResult));

      return new Response("OK");
    } catch (error) {
      console.error("Ошибка Worker:", error);
      return new Response("Error", { status: 500 });
    }
  }
};
