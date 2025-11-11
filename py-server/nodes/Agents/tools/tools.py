import getpass
import os
import requests
from dotenv import load_dotenv
from langchain_tavily import TavilySearch
from langchain_core.tools import Tool

load_dotenv()

# Tavily API key
if not os.environ.get("TAVILY_API_KEY"):
    os.environ["TAVILY_API_KEY"] = getpass.getpass("Tavily API key:\n")

# Telegram Bot credentials
if not os.environ.get("TELEGRAM_BOT_TOKEN"):
    os.environ["TELEGRAM_BOT_TOKEN"] = getpass.getpass("Telegram Bot Token:\n")
if not os.environ.get("TELEGRAM_CHAT_ID"):
    os.environ["TELEGRAM_CHAT_ID"] = getpass.getpass("Telegram Chat ID:\n")

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

def telegram_send_tool(message: str):
    """
    Send a message via Telegram Bot API to a predefined chat.
    """
    token = os.environ["TELEGRAM_BOT_TOKEN"]
    chat_id = os.environ["TELEGRAM_CHAT_ID"]
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": message
    }
    response = requests.post(url, json=payload)
    try:
        response.raise_for_status()
    except requests.HTTPError as e:
        print(f"Telegram API error: {e}")
        return f"Failed to send message: {e}"
    result = response.json()
    print(result)
    return result

TELEGRAM_TOOL = Tool(
    name="TelegramSend",
    func=telegram_send_tool,
    description="Send a message to a Telegram chat using a bot."
)