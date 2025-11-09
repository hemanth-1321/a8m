import getpass
import os
from dotenv import load_dotenv
from langchain_tavily import TavilySearch
from langchain_core.tools import Tool
import telegram

load_dotenv()

# Ensure Tavily API key is available
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

# Telegram tool
def telegram_send(message: str, chat_id: str):
    """
    Send a message via a Telegram bot.

    Parameters
    ----------
    message : str
        The text to send.
    chat_id : str
        The chat identifier to send the message to.

    Returns
    -------
    str
        Confirmation that the message was sent.
    """
    token = os.environ.get("TELEGRAM_TOKEN")
    if not token:
        token = getpass.getpass("Telegram Bot Token:\n")
        os.environ["TELEGRAM_TOKEN"] = token

    bot = telegram.Bot(token=token)
    bot.send_message(chat_id=chat_id, text=message)
    return f"Message sent to chat ID {chat_id}"

TELEGRAM_TOOL = Tool(
    name="TelegramSend",
    func=telegram_send,
    description="Send a message to a Telegram chat using a bot token. Provide the message and the chat_id."
)