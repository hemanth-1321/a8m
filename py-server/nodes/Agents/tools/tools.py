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

def telegram_send_message(message: str):
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_CHAT_ID")
    if not token:
        token = getpass.getpass("Telegram Bot Token:\n")
        os.environ["TELEGRAM_BOT_TOKEN"] = token
    if not chat_id:
        chat_id = getpass.getpass("Telegram Chat ID:\n")
        os.environ["TELEGRAM_CHAT_ID"] = chat_id
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {"chat_id": chat_id, "text": message}
    response = requests.post(url, json=payload)
    if response.status_code != 200:
        raise Exception(f"Telegram API error: {response.text}")
    return response.json()

TELEGRAM_SEND_MESSAGE_TOOL = Tool(
    name="TelegramSendMessage",
    func=telegram_send_message,
    description="Send a message via Telegram bot"
)