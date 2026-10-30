import os
import requests
from mcstatus import JavaServer
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

TOKEN = os.getenv("BOT_TOKEN")
SERVER_ADDRESS = "Arvelium.vanilla.cool"

async def online(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        server = JavaServer.lookup(SERVER_ADDRESS)
        status = server.status()

        message = (
            "🟢 Arvelium Vanilla\n"
            f"👥 Онлайн игроков: {status.players.online}/{status.players.max}"
        )
    except Exception:
        message = "🔴 Arvelium Vanilla\n👥 Сервер Offline"

    await update.message.reply_text(message)

app = Application.builder().token(TOKEN).build()
app.add_handler(CommandHandler("online", online))

app.run_polling()
