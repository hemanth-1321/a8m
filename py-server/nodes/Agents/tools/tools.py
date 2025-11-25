import getpass
import os
from dotenv import load_dotenv
from langchain_tavily import TavilySearch
from langchain_core.tools import Tool
from telegram import Bot

load_dotenv()

# Ensure Tavily API key is set
if not os.environ.get("TAVILY_API_KEY"):
    os.environ["TAVILY_API_KEY"] = getpass.getpass("Tavily API key:\n")

def web_search_tool(query: str):
    search = TavilySearch(api_key=os.environ["TAVILY_API_KEY"])
    result = search.run(query)
    print(result)
    return result

WEBSEARCH_TOOL = Tool(
    name="WebSearch",
    func=web_search_tool,
    description="search the web for the latest information"
)

# Telegram sending tool
def telegram_send_message(message: str):
    """
    Sends a message to a Telegram chat using the Bot API.

    Environment variables required:
    - TELEGRAM_BOT_TOKEN: Bot token obtained from BotFather.
    - TELEGRAM_CHAT_ID: The chat ID to send the message to (can be a user ID, group ID, or channel username).
    """
    token = os.environ.get("TELEGRAM_BOT_TOKEN")
    chat_id = os.environ.get("TELEGRAM_CHAT_ID")
    if not token or not chat_id:
        return "Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID environment variables."

    bot = Bot(token=token)
    try:
        bot.send_message(chat_id=chat_id, text=message)
        return f"Message sent to chat {chat_id}"
    except Exception as e:
        return f"Error sending message: {e}"

TELEGRAM_TOOL = Tool(
    name="TelegramSend",
    func=telegram_send_message,
    description="Send a message to a Telegram chat via a bot. Requires TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables."
)