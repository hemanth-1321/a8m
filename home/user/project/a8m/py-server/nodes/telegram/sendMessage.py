import os
import logging
import requests
from typing import Optional, Dict, Any

# Configure logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Telegram Bot token from environment variable
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
if not BOT_TOKEN:
    raise RuntimeError("TELEGRAM_BOT_TOKEN environment variable not set")

BASE_URL = f"https://api.telegram.org/bot{BOT_TOKEN}/"

def _post(method: str, data: Dict[str, Any]) -> Dict[str, Any]:
    url = BASE_URL + method
    try:
        response = requests.post(url, json=data, timeout=10)
        response.raise_for_status()
        result = response.json()
        if not result.get("ok"):
            logger.warning("Telegram API returned not ok: %s", result)
        return result
    except requests.RequestException as exc:
        logger.error("Failed to call Telegram API: %s", exc)
        raise

def send_message(chat_id: str, text: str, parse_mode: Optional[str] = None) -> Dict[str, Any]:
    """
    Send a text message to a Telegram chat.

    Parameters
    ----------
    chat_id : str
        Identifier for the target chat or username of the target channel.
    text : str
        Text of the message to be sent.
    parse_mode : str, optional
        Mode for parsing entities in the message text. E.g., 'MarkdownV2', 'HTML'.

    Returns
    -------
    dict
        The JSON response from Telegram API.

    Raises
    ------
    RuntimeError
        If the Telegram API returns an error or the HTTP request fails.
    """
    payload = {
        "chat_id": chat_id,
        "text": text,
    }
    if parse_mode:
        payload["parse_mode"] = parse_mode

    result = _post("sendMessage", payload)

    if not result.get("ok"):
        raise RuntimeError(f"Telegram API error: {result}")

    return result

__all__ = ["send_message"]