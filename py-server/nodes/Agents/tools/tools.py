import getpass
import os
from dotenv import load_dotenv
from langchain_tavily import TavilySearch
from langchain_core.tools import Tool
from telegram import Bot

load_dotenv()

if not os.environ.get("TAVILY_API_KEY"):
    os.environ["TAVILY_API_KEY"] = getpass.getpass("Tavily API key:\n")

if not os.environ.get("TELEGRAM_BOT_TOKEN"):
    os.environ["TELEGRAM_BOT_TOKEN"] = getpass.getpass("Telegram bot token:\n")

if not os.environ.get("TELEGRAM_CHAT_ID"):
    os.environ["TELEGRAM_CHAT_ID"] = getpass.getpass("Telegram chat ID:\n")

def web_search_tool(query: str):
    search = TavilySearch(api_key=os.environ["TAVILY_API_KEY"])
    result = search.run(query)
    print(result)
    return result

def telegram_send_tool(message: str):
    bot_token = os.environ["TELEGRAM_BOT_TOKEN"]
    chat_id = os.environ["TELEGRAM_CHAT_ID"]
    bot = Bot(token=bot_token)
    sent_message = bot.send_message(chat_id=chat_id, text=message)
    confirmation = f"Message sent to chat {chat_id} with message ID {sent_message.message_id}"
    print(confirmation)
    return confirmation

WEBSEARCH_TOOL = Tool(
    name="WebSearch",
    func=web_search_tool,
    description="search the web for the latest information"
)

TELEGRAM_TOOL = Tool(
    name="TelegramSend",
    func=telegram_send_tool,
    description="send a message via Telegram Bot API to a predefined chat"
)