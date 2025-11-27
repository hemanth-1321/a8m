import getpass
import os
import requests
from dotenv import load_dotenv
from langchain_tavily import TavilySearch
from langchain_core.tools import Tool

load_dotenv()

# Tavily web search tool
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

# Telegram send tool
if not os.environ.get("TELEGRAM_BOT_TOKEN"):
    os.environ["TELEGRAM_BOT_TOKEN"] = getpass.getpass("Telegram Bot Token:\n")

def telegram_send_tool(message: str, chat_id: str = None):
    """
    Send a message via Telegram Bot API.
    If chat_id is not provided, uses TELEGRAM_CHAT_ID from environment.
    """
    token = os.environ["TELEGRAM_BOT_TOKEN"]
    target_chat_id = chat_id or os.environ.get("TELEGRAM_CHAT_ID")
    if not target_chat_id:
        raise ValueError("Chat ID must be provided either as argument or TELEGRAM_CHAT_ID env variable.")
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {"chat_id": target_chat_id, "text": message}
    response = requests.post(url, data=payload)
    try:
        resp_json = response.json()
    except ValueError:
        resp_json = {"status": "failed", "content": response.text}
    print(f"Telegram response: {resp_json}")
    return resp_json

TELEGRAM_SEND_TOOL = Tool(
    name="TelegramSend",
    func=telegram_send_tool,
    description="Send a message to a Telegram chat using a bot. Provide the message text and optionally a chat ID. If no chat ID is provided, the tool will use the TELEGRAM_CHAT_ID environment variable."
)