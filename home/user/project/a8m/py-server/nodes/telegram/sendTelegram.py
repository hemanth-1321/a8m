import os
import json
import requests
from typing import Any, Dict

__all__ = ["send_telegram"]


def send_telegram(context: Dict[str, Any], chat_id: str, text: str) -> Dict[str, Any]:
    """
    Send a message to a Telegram chat using the Bot API.

    Parameters
    ----------
    context : dict
        Workflow context containing configuration values. Expected to have a
        ``telegram_bot_token`` key or the token must be available as the
        environment variable ``TELEGRAM_BOT_TOKEN``.
    chat_id : str
        The unique identifier for the target chat or username of the target
        channel (e.g. ``@channelname``).
    text : str
        The message text to send.

    Returns
    -------
    dict
        The JSON-decoded response from Telegram.

    Raises
    ------
    ValueError
        If the bot token is missing.
    RuntimeError
        If the HTTP request fails or Telegram returns an error.
    """
    token = context.get("telegram_bot_token") or os.getenv("TELEGRAM_BOT_TOKEN")
    if not token:
        raise ValueError("Telegram bot token not provided in context or environment")

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {"chat_id": chat_id, "text": text}

    try:
        response = requests.post(url, json=payload, timeout=10)
    except requests.RequestException as exc:
        raise RuntimeError(f"Failed to connect to Telegram API: {exc}") from exc

    if response.status_code != 200:
        try:
            error_info = response.json()
        except json.JSONDecodeError:
            error_info = response.text
        raise RuntimeError(
            f"Telegram API returned error {response.status_code}: {error_info}"
        )

    try:
        return response.json()
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"Invalid JSON response from Telegram: {exc}") from exc