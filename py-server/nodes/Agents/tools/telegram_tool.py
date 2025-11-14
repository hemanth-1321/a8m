import os
import logging
from typing import Any, Dict

import requests
from requests.exceptions import RequestException

__all__ = ["send_telegram_message", "TelegramToolError"]


class TelegramToolError(RuntimeError):
    """Base exception for Telegram tool errors."""


def _load_env() -> Dict[str, str]:
    """Load and validate required environment variables."""
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_CHAT_ID")

    missing = [name for name, value in (("TELEGRAM_BOT_TOKEN", token), ("TELEGRAM_CHAT_ID", chat_id)) if not value]
    if missing:
        raise TelegramToolError(f"Missing required environment variables: {', '.join(missing)}")

    return {"token": token, "chat_id": chat_id}


def send_telegram_message(message: str, *, token: str | None = None, chat_id: str | None = None) -> Dict[str, Any]:
    """
    Send a message via the Telegram Bot API.

    Parameters
    ----------
    message : str
        The message text to send.
    token : str, optional
        Telegram bot token. If not provided, it is read from the
        TELEGRAM_BOT_TOKEN environment variable.
    chat_id : str, optional
        Telegram chat ID. If not provided, it is read from the
        TELEGRAM_CHAT_ID environment variable.

    Returns
    -------
    dict
        Parsed JSON response from the Telegram API.

    Raises
    ------
    TelegramToolError
        If required environment variables are missing or the API call fails.
    """
    env = _load_env()

    bot_token = token or env["token"]
    target_chat_id = chat_id or env["chat_id"]

    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {"chat_id": target_chat_id, "text": message}

    try:
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
    except RequestException as exc:
        logging.exception("Telegram API request failed")
        raise TelegramToolError(f"Failed to send message: {exc}") from exc

    try:
        result = response.json()
    except ValueError as exc:
        logging.exception("Invalid JSON response from Telegram API")
        raise TelegramToolError("Invalid JSON response") from exc

    if not result.get("ok"):
        raise TelegramToolError(f"Telegram API returned error: {result}")

    return result