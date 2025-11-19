import getpass
import os
from dotenv import load_dotenv
from langchain_tavily import TavilySearch
from langchain_core.tools import Tool
import telegram

load_dotenv()

# Ensure Tavily API key is set
if not os.environ.get("TAVILY_API_KEY"):
    os.environ["TAVILY_API_KEY"] = getpass.getpass("Tavily API key:\n")

# Ensure Telegram credentials are set
if not os.environ.get("TELEGRAM_BOT_TOKEN"):
    os.environ["TELEGRAM_BOT_TOKEN"] = getpass.getpass("Telegram bot token:\n")
if not os.environ.get("TELEGRAM_CHAT_ID"):
    os.environ["TELEGRAM_CHAT_ID"] = getpass.getpass("Telegram chat ID:\n")

def web_search_tool(query: str):
    """Search the web using Tavily and return the result."""
    search = TavilySearch(api_key=os.environ["TAVILY_API_KEY"])
    result = search.run(query)
    print(result)
    return result

WEBSEARCH_TOOL = Tool(
    name="WebSearch",
    func=web_search_tool,
    description="Search the web for the latest information."
)

def telegram_send_message(message: str):
    """
    Send a message to a predefined Telegram chat.
    """
    token = os.environ["TELEGRAM_BOT_TOKEN"]
    chat_id = os.environ["TELEGRAM_CHAT_ID"]
    bot = telegram.Bot(token=token)
    bot.send_message(chat_id=chat_id, text=message)
    return f"Message sent to chat {chat_id}."

TELEGRAM_TOOL = Tool(
    name="TelegramSendMessage",
    func=telegram_send_message,
    description="Send a message to a Telegram chat. Pass the message text as the input."
)