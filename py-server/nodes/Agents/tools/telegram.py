import os
import logging
from typing import Any, Dict, Union

import requests

logger = logging.getLogger(__name__)


class TelegramTool:
    """
    Send a message via the Telegram Bot API.

    The tool can be instantiated with a bot token or use the
    ``TELEGRAM_BOT_TOKEN`` environment variable.

    Example
    -------
    >>> tool = TelegramTool()
    >>> result = tool.run(chat_id="123456789", text="Hello, world!")
    """

    name: str = "telegram_send"
    description: str = (
        "Send a message to a Telegram chat. Provide `chat_id` and `text`. "
        "Optional keyword arguments are forwarded to the Telegram API (e.g. "
        "parse_mode, disable_web_page_preview)."
    )

    def __init__(self, token: str | None = None) -> None:
        """
        Parameters
        ----------
        token : str, optional
            Telegram bot token. If omitted, the ``TELEGRAM_BOT_TOKEN`` env
            variable is used. A missing token raises ``ValueError``.
        """
        self.token = token or os.getenv("TELEGRAM_BOT_TOKEN")
        if not self.token:
            raise ValueError(
                "Telegram bot token not provided and TELEGRAM_BOT_TOKEN env var is unset."
            )

    def run(
        self,
        chat_id: Union[str, int],
        text: str,
        **kwargs: Any,
    ) -> Dict[str, Any]:
        """
        Send a message.

        Parameters
        ----------
        chat_id : str | int
            Target chat ID or username.
        text : str
            Message text.
        **kwargs : Any
            Optional parameters forwarded to the Telegram API.

        Returns
        -------
        dict
            Parsed JSON response from Telegram.
        """
        url = f"https://api.telegram.org/bot{self.token}/sendMessage"
        payload = {"chat_id": chat_id, "text": text}
        payload.update(kwargs)

        try:
            resp = requests.post(url, json=payload, timeout=10)
            resp.raise_for_status()
            data = resp.json()
            if not data.get("ok"):
                raise RuntimeError(
                    f"Telegram API error: {data.get('description', 'unknown')}"
                )
            return data
        except requests.RequestException as exc:
            logger.exception("Telegram message failed")
            raise RuntimeError(f"Telegram request failed: {exc}") from exc

    def __call__(self, *args, **kwargs):
        """
        Allow the tool to be called like a function.

        If called with two positional arguments, they are interpreted as
        ``chat_id`` and ``text``. Otherwise, keyword arguments are forwarded
        to :meth:`run`.
        """
        if len(args) == 2:
            return self.run(args[0], args[1], **kwargs)
        return self.run(**kwargs)


__all__ = ["TelegramTool"]