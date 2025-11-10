import json
import logging
from typing import Optional

import requests

__all__ = ["send_telegram_message"]

_LOGGER = logging.getLogger(__name__)
_DEFAULT_TIMEOUT = 10  # seconds


def send_telegram_message(
    bot_token: str,
    chat_id: str,
    text: str,
    *,
    parse_mode: Optional[str] = None,
    disable_web_page_preview: bool = False,
    timeout: int = _DEFAULT_TIMEOUT,
) -> None:
    """
    Send a message to a Telegram chat using the Bot API.

    Parameters
    ----------
    bot_token : str
        The token of the Telegram bot (e.g. ``123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11``).
    chat_id : str
        The unique identifier for the target chat or username of the target channel.
    text : str
        Text of the message to be sent.
    parse_mode : str, optional
        Mode for parsing entities in the message. Supported values: ``Markdown``, ``MarkdownV2``, ``HTML``.
    disable_web_page_preview : bool, optional
        Disables link previews for links in this message.
    timeout : int, optional
        Timeout for the HTTP request in seconds.

    Raises
    ------
    RuntimeError
        If the Telegram API returns an error or the HTTP request fails.

    Notes
    -----
    The function uses ``requests`` to perform an HTTP POST to
    ``https://api.telegram.org/bot{bot_token}/sendMessage``. It raises a
    ``RuntimeError`` with the error message from the API if the request is
    unsuccessful. On success the function returns ``None``.
    """
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "disable_web_page_preview": disable_web_page_preview,
    }
    if parse_mode:
        payload["parse_mode"] = parse_mode

    try:
        _LOGGER.debug("Sending Telegram message to chat_id=%s", chat_id)
        response = requests.post(url, json=payload, timeout=timeout)
        response.raise_for_status()
        data = response.json()
        if not data.get("ok"):
            error_message = data.get("description", "Unknown error")
            _LOGGER.error("Telegram API error: %s", error_message)
            raise RuntimeError(f"Telegram API error: {error_message}")
        _LOGGER.debug("Telegram message sent successfully")
    except requests.RequestException as exc:
        _LOGGER.exception("Failed to send Telegram message")
        raise RuntimeError("Failed to send Telegram message") from exc


if __name__ == "__main__":
    import argparse
    import os

    parser = argparse.ArgumentParser(description="Send a Telegram message.")
    parser.add_argument("--token", help="Telegram bot token", default=os.getenv("TELEGRAM_BOT_TOKEN"))
    parser.add_argument("--chat-id", help="Target chat ID or username", required=True)
    parser.add_argument("--text", help="Message text", required=True)
    parser.add_argument("--parse-mode", help="Parse mode (Markdown|HTML)", default=None)
    parser.add_argument("--disable-preview", action="store_true", help="Disable web page preview")
    args = parser.parse_args()

    if not args.token:
        raise SystemExit("Telegram bot token not provided. Use --token or TELEGRAM_BOT_TOKEN env var.")

    send_telegram_message(
        bot_token=args.token,
        chat_id=args.chat_id,
        text=args.text,
        parse_mode=args.parse_mode,
        disable_web_page_preview=args.disable_preview,
    )