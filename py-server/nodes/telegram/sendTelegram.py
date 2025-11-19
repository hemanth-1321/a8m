import os
import logging
from typing import Optional, Dict, Any

import requests

__all__ = ["SendTelegram"]


class SendTelegram:
    """
    Minimal Telegram bot sender.

    Parameters
    ----------
    token : str | None, optional
        Telegram bot token. If not provided, the environment variable
        ``TELEGRAM_BOT_TOKEN`` will be used.
    chat_id : str | None, optional
        Target chat id. If not provided, the environment variable
        ``TELEGRAM_CHAT_ID`` will be used.

    Raises
    ------
    ValueError
        If either token or chat_id cannot be resolved.
    """

    def __init__(self, token: Optional[str] = None, chat_id: Optional[str] = None) -> None:
        self.token = token or os.getenv("TELEGRAM_BOT_TOKEN")
        self.chat_id = chat_id or os.getenv("TELEGRAM_CHAT_ID")

        if not self.token:
            raise ValueError("Telegram bot token is required")
        if not self.chat_id:
            raise ValueError("Telegram chat id is required")

        self.logger = logging.getLogger(__name__)

    def send(self, text: str, parse_mode: Optional[str] = None) -> Dict[str, Any]:
        """
        Send a message via the Telegram Bot API.

        Parameters
        ----------
        text : str
            Message text to send.
        parse_mode : str | None, optional
            Parse mode for the message (e.g., 'MarkdownV2', 'HTML').

        Returns
        -------
        dict
            JSON response from the Telegram API.

        Raises
        ------
        requests.RequestException
            If the HTTP request fails.
        """
        url = f"https://api.telegram.org/bot{self.token}/sendMessage"
        payload = {"chat_id": self.chat_id, "text": text}
        if parse_mode:
            payload["parse_mode"] = parse_mode

        try:
            response = requests.post(url, json=payload, timeout=10)
            response.raise_for_status()
            result = response.json()
            if not result.get("ok"):
                self.logger.warning("Telegram API returned error: %s", result)
            return result
        except requests.RequestException as exc:
            self.logger.error("Failed to send Telegram message: %s", exc)
            raise

# End of file