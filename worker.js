
const SERVER = "arvelium.vanilla.cool";
const API = `https://api.mcsrvstat.us/3/${SERVER}`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method !== "POST" || url.pathname !== "/telegram") {
      return new Response("Arvelium Monitor is running!");
    }

    try {
      const update = await request.json();
      const msg = update.message;

      if (!msg?.text) return new Response("OK");

      const chatId = msg.chat.id;
      const command = msg.text.split(" ")[0].split("@")[0];

      // Команда /online
      if (command !== "/online") {
        return new Response("OK");
      }

      let text;

      try {
        const response = await fetch(API);

        if (!response.ok) throw new Error("API error");

        const server = await response.json();

        if (server.online) {
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
        text =
          "🔴 Arvelium Vanilla — НЕДОСТУПЕН\n\n" +
          "🌐 IP: " + SERVER + "\n" +
          "👥 Игроки: недоступно";
      }

      await fetch(
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

      return new Response("OK");

    } catch (error) {
      console.error(error);
      return new Response("Error", { status: 500 });
    }
  }
};
