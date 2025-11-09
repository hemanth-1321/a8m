import getpass
import os
import requests
from dotenv import load_dotenv
from langchain_tavily import TavilySearch
from langchain_core.tools import Tool

load_dotenv()

# Ensure Tavily API key is set
if not os.environ.get("TAVILY_API_KEY"):
    os.environ["TAVILY_API_KEY"] = getpass.getpass("Tavily API key:\n")

# Ensure Telegram Bot token is set
if not os.environ.get("TELEGRAM_BOT_TOKEN"):
    os.environ["TELEGRAM_BOT_TOKEN"] = getpass.getpass("Telegram Bot token:\n")

def web_search_tool(query: str):
    """
    Search the web using Tavily for the given query.

    Args:
        query (str): The search query.

    Returns:
        str: The search results as a string.
    """
    search = TavilySearch(api_key=os.environ["TAVILY_API_KEY"])
    result = search.run(query)
    print(result)
    return result

WEBSEARCH_TOOL = Tool(
    name="WebSearch",
    func=web_search_tool,
    description="Search the web for the latest information."
)

def send_telegram_message(chat_id: str, message: str):
    """
    Send a message to a specified Telegram chat using the Bot API.

    Args:
        chat_id (str): The Telegram chat ID or username to send the message to.
        message (str): The text message to send.

    Returns:
        str: Confirmation message or error details.
    """
    token = os.environ["TELEGRAM_BOT_TOKEN"]
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {"chat_id": chat_id, "text": message}
    try:
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
        return f"Message sent to {chat_id}."
    except requests.exceptions.RequestException as e:
        return f"Failed to send message: {e}"

TELEGRAM_TOOL = Tool(
    name="TelegramSend",
    func=send_telegram_message,
    description="Send a message to a Telegram chat. Requires 'chat_id' and 'message' arguments."
)