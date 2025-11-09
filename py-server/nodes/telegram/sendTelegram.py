import json
import logging
from typing import Any, Dict

import requests

# Assuming a credentials helper exists in the project. Adjust the import path as needed.
try:
    from ..credentials import get_credentials
except Exception:  # pragma: no cover
    # Fallback stub if the real credentials module is unavailable during testing.
    def get_credentials(key: str) -> str | None:
        """Stub implementation of get_credentials. Replace with actual implementation."""
        return None

__all__ = ["send_telegram"]


def send_telegram(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Send a message to a Telegram chat using a bot token stored in credentials.

    Parameters
    ----------
    data : dict
        Must contain the keys:
        - 'chat_id' : str or int
            Identifier for the target chat.
        - 'text' : str
            The message text to send.

    Returns
    -------
    dict
        JSON-decoded response from the Telegram Bot API.

    Raises
    ------
    ValueError
        If required data keys are missing or the bot token cannot be retrieved.
    requests.HTTPError
        If the HTTP request to Telegram fails.
    """
    if not isinstance(data, dict):
        raise ValueError("Input data must be a dictionary.")

    chat_id = data.get("chat_id")
    text = data.get("text")

    if chat_id is None:
        raise ValueError("Missing required field 'chat_id' in input data.")
    if text is None:
        raise ValueError("Missing required field 'text' in input data.")

    bot_token = get_credentials("telegram_bot_token")
    if not bot_token:
        raise ValueError("Telegram bot token not found in credentials.")

    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"

    payload = {"chat_id": chat_id, "text": text}
    headers = {"Content-Type": "application/json"}

    try:
        response = requests.post(url, headers=headers, data=json.dumps(payload), timeout=10)
        response.raise_for_status()
    except requests.RequestException as exc:
        logging.error("Failed to send message via Telegram: %s", exc)
        raise

    try:
        return response.json()
    except json.JSONDecodeError as exc:
        logging.error("Failed to parse JSON response from Telegram: %s", exc)
        raise ValueError("Invalid JSON response from Telegram API.") from exc

# End of file