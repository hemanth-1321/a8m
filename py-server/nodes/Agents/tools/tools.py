import getpass
import os
import requests
from dotenv import load_dotenv
from langchain_tavily import TavilySearch
from langchain_core.tools import Tool

load_dotenv()

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

def telegram_tool(bot_token: str, chat_id: str, message_text: str):
    """
    Send a message via the Telegram Bot API.

    Parameters:
    - bot_token: str, the Telegram bot token.
    - chat_id: str, the chat ID to send the message to.
    - message_text: str, the message content.

    Returns:
    - str: JSON response from the Telegram API.
    """
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": message_text
    }
    try:
        response = requests.post(url, data=payload, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        return {"error": str(e)}

TELEGRAM_TOOL = Tool(
    name="TelegramSendMessage",
    func=telegram_tool,
    description="Send a message using the Telegram Bot API. Provide bot_token, chat_id, and message_text."
)