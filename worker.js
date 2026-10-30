export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method !== "POST" || url.pathname !== "/telegram") {
      return new Response("Arvelium Bot is running!");
    }

    try {
      const update = await request.json();

      if (!update.message || !update.message.text) {
        return new Response("OK");
      }

      const chatId = update.message.chat.id;
      const command = update.message.text.split(" ")[0].split("@")[0];

      let message;

      if (command === "/start") {
        message = "Привет! Я бот сервера Arvelium Vanilla. Напиши /online, чтобы узнать онлайн.";
      } 
      else if (command === "/online") {
        try {
          const response = await fetch(
            "https://api.mcsrvstat.us/3/Arvelium.vanilla.cool"
          );

          const server = await response.json();

          if (server.online) {
            const online = server.players?.online ?? 0;
            const max = server.players?.max ?? "?";

            message =
              "🟢 Arvelium Vanilla\n" +
              "👥 Онлайн игроков: " + online + "/" + max;
          } else {
            message =
              "🔴 Arvelium Vanilla\n" +
              "👥 Сервер Offline";
          }
        } catch {
          message =
            "🔴 Arvelium Vanilla\n" +
            "👥 Сервер Offline";
        }
      } 
      else {
        return new Response("OK");
      }

      await fetch(
        "https://api.telegram.org/bot" + env.BOT_TOKEN + "/sendMessage",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: message
          })
        }
      );

      return new Response("OK");

    } catch (error) {
      return new Response("Error");
    }
  }
};
