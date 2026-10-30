export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method !== "POST" || url.pathname !== "/telegram") {
      return new Response("Arvelium Bot is running!");
    }

    try {
      const update = await request.json();

      if (!update.message?.text) {
        return new Response("OK");
      }

      const chatId = update.message.chat.id;
      const command = update.message.text.split(" ")[0].split("@")[0];

      if (command !== "/online") {
        return new Response("OK");
      }

      let message;

      try {
        const response = await fetch(
          "https://api.mcsrvstat.us/3/Arvelium.vanilla.cool"
        );

        const server = await response.json();

        if (server.online) {
          message =
            "🟢 Arvelium Vanilla\n" +
            👥 Онлайн игроков: ${server.players.online}/${server.players.max};
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

      await fetch(
        https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: message
          })
        }
      );

      return new Response("OK");
    } catch {
      return new Response("Error");
    }
  }
};
