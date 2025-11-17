import getpass
import os
import requests
from dotenv import load_dotenv
from langchain_tavily import TavilySearch
from langchain_core.tools import Tool

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

# Telegram Send Tool

def telegram_send_tool(chat_id: str, message: str) -> str:
    """
    Sends a message to a specified Telegram chat using the Bot API.
    
    Parameters:
        chat_id (str): The chat ID or username to send the message to.
        message (str): The message content to send.
    
    Returns:
        str: Success message or error description.
    """
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not token:
        # Attempt to prompt the user for the token if it's not set
        token = getpass.getpass("Telegram Bot token (not set in environment):\n")
        if not token:
            return "Telegram bot token is missing. Unable to send message."

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {"chat_id": chat_id, "text": message}
    try:
        response = requests.post(url, data=payload, timeout=10)
        response.raise_for_status()
        return f"Message sent to chat {chat_id}."
    except requests.RequestException as e:
        return f"Failed to send message: {e}"

TELEGRAM_TOOL = Tool(
    name="TelegramSend",
    func=telegram_send_tool,
    description=(
        "Send a message to a specified chat via the Telegram Bot API. "
        "Provide the chat_id (or username) and the message to send."
    )
)