import os
import logging
from typing import Any, Dict

import requests

# Configure a simple logger for this node
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
handler.setFormatter(
    logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
)
logger.addHandler(handler)

__all__ = ["run"]


def _build_api_url(token: str) -> str:
    """
    Construct the Telegram Bot API URL for sending a message.
    """
    return f"https://api.telegram.org/bot{token}/sendMessage"


def run(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Node entry point to send a message via Telegram.

    Expected input_data keys:
        - token (str): Telegram bot token.
        - chat_id (str|int): Target chat identifier.
        - text (str): Message text.
        Optional keys:
        - parse_mode (str): e.g., "MarkdownV2", "HTML".
        - disable_web_page_preview (bool)
        - disable_notification (bool)

    Returns a dictionary containing:
        - status: "success" or "error".
        - response: raw JSON response from Telegram API or error message.
    """
    token = input_data.get("token") or os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = input_data.get("chat_id")
    text = input_data.get("text")

    if not all([token, chat_id, text]):
        error_msg = "Missing required parameters: token, chat_id, and text are required."
        logger.error(error_msg)
        return {"status": "error", "response": error_msg}

    api_url = _build_api_url(token)

    payload = {
        "chat_id": chat_id,
        "text": text,
    }

    # Optional parameters
    if "parse_mode" in input_data:
        payload["parse_mode"] = input_data["parse_mode"]
    if "disable_web_page_preview" in input_data:
        payload["disable_web_page_preview"] = input_data["disable_web_page_preview"]
    if "disable_notification" in input_data:
        payload["disable_notification"] = input_data["disable_notification"]

    try:
        logger.info(f"Sending message to chat_id {chat_id}")
        response = requests.post(api_url, json=payload, timeout=10)
        response.raise_for_status()
        json_resp = response.json()
        if json_resp.get("ok"):
            logger.info("Message sent successfully.")
            return {"status": "success", "response": json_resp}
        else:
            logger.error(f"Telegram API error: {json_resp}")
            return {"status": "error", "response": json_resp}
    except requests.RequestException as e:
        logger.exception("Failed to send message via Telegram.")
        return {"status": "error", "response": str(e)}