import os
import json
import logging
from typing import Any, Dict, Optional

import requests

__all__ = ["send_telegram_message", "get_bot_token"]

# Configure a basic logger for debugging purposes
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
DEFAULT_CREDENTIALS_PATH = os.path.join(os.path.dirname(__file__), "credentials.json")
TELEGRAM_API_URL = "https://api.telegram.org/bot{token}/sendMessage"


def get_bot_token(credentials_path: str = DEFAULT_CREDENTIALS_PATH) -> str:
    """
    Retrieve the Telegram bot token from environment variable or a JSON credentials file.

    The function first checks the environment variable `TELEGRAM_TOKEN`. If not found,
    it attempts to read a JSON file containing a key named "telegram_token".
    Raises a RuntimeError if the token cannot be found.

    Args:
        credentials_path: Path to the credentials JSON file (default: credentials.json
            in the same directory as this module).

    Returns:
        The Telegram bot token as a string.
    """
    # 1. Check environment variable
    token = os.getenv("TELEGRAM_TOKEN")
    if token:
        logger.debug("Telegram token found in environment variable.")
        return token

    # 2. Attempt to read from JSON file
    if os.path.exists(credentials_path):
        try:
            with open(credentials_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            token = data.get("telegram_token") or data.get("telegramToken")
            if token:
                logger.debug(f"Telegram token loaded from {credentials_path}.")
                return token
        except (json.JSONDecodeError, IOError) as exc:
            logger.exception("Failed to read credentials file: %s", exc)

    # 3. Token not found
    raise RuntimeError(
        "Telegram bot token not found. Set the TELEGRAM_TOKEN environment variable "
        "or provide a credentials.json file with a 'telegram_token' key."
    )


def send_telegram_message(chat_id: str | int, text: str, *, token: Optional[str] = None) -> Dict[str, Any]:
    """
    Send a message via Telegram Bot API to the specified chat.

    Parameters
    ----------
    chat_id : str | int
        The unique identifier for the target chat or username of the target channel.
    text : str
        Text of the message to be sent.
    token : Optional[str], optional
        Telegram bot token. If None, the token will be retrieved from the
        environment variable or credentials file.

    Returns
    -------
    dict
        JSON-decoded response from the Telegram API.

    Raises
    ------
    RuntimeError
        If the bot token cannot be retrieved or the API call fails.
    """
    if token is None:
        token = get_bot_token()

    url = TELEGRAM_API_URL.format(token=token)
    payload = {"chat_id": chat_id, "text": text}

    try:
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
    except requests.RequestException as exc:
        logger.exception("Telegram API request failed: %s", exc)
        raise RuntimeError(f"Failed to send message via Telegram: {exc}") from exc

    try:
        result = response.json()
    except ValueError as exc:
        logger.exception("Failed to parse JSON response: %s", exc)
        raise RuntimeError("Telegram API returned non-JSON response") from exc

    # Telegram API returns a "ok" field to indicate success
    if not result.get("ok"):
        logger.error("Telegram API returned error: %s", result)
        raise RuntimeError(f"Telegram API error: {result}")

    logger.info("Message sent to chat_id=%s", chat_id)
    return result