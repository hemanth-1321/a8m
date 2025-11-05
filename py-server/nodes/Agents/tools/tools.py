import getpass
import os
import json
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


def send_telegram_tool(payload):
    """
    Send a Telegram message.

    Accepts a JSON string (or a dict) with the fields:
      - bot_token: the Telegram bot token
      - chat_id: the target chat id (string or int)
      - message: the message text to send

    Returns a string describing the result or an error.
    """
    try:
        if isinstance(payload, str):
            data = json.loads(payload)
        elif isinstance(payload, dict):
            data = payload
        else:
            return "Invalid input type: expected JSON string or dict."

        bot_token = data.get("bot_token")
        chat_id = data.get("chat_id")
        message = data.get("message")

        if not bot_token or chat_id is None or message is None:
            return "Missing required fields: bot_token, chat_id, message."

        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        resp = requests.post(url, data={"chat_id": str(chat_id), "text": str(message)})

        try:
            resp_json = resp.json()
        except ValueError:
            return f"Telegram API returned non-JSON response: {resp.text}"

        if resp.status_code == 200 and resp_json.get("ok"):
            return f"Message sent: {json.dumps(resp_json)}"
        else:
            return f"Telegram API error (status {resp.status_code}): {json.dumps(resp_json)}"
    except Exception as e:
        return f"Exception while sending Telegram message: {str(e)}"


TELEGRAM_TOOL = Tool(
    name="SendTelegram",
    func=send_telegram_tool,
    description='Send a Telegram message. Input should be a JSON string with keys: "bot_token", "chat_id", "message".'
)