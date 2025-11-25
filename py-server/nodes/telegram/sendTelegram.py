import os
from typing import Dict, Optional

import requests


def send_telegram(
    token: str,
    chat_id: str,
    text: str,
    *,
    parse_mode: Optional[str] = None,
    disable_web_page_preview: bool = False,
) -> Dict:
    """
    Send a message to a Telegram chat using the Bot API.

    Parameters
    ----------
    token : str
        Bot token obtained from BotFather.
    chat_id : str
        Identifier of the chat to send the message to.
    text : str
        Text of the message to send.
    parse_mode : str, optional
        Parse mode for message formatting (e.g., "MarkdownV2", "HTML").
    disable_web_page_preview : bool, default False
        Whether to disable link previews.

    Returns
    -------
    dict
        JSON response from Telegram.

    Raises
    ------
    RuntimeError
        If the HTTP request fails or Telegram returns an error.
    """
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
    }
    if parse_mode:
        payload["parse_mode"] = parse_mode
    if disable_web_page_preview:
        payload["disable_web_page_preview"] = True

    try:
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
    except requests.RequestException as exc:
        raise RuntimeError(f"Telegram request failed: {exc}") from exc

    result = response.json()
    if not result.get("ok"):
        raise RuntimeError(f"Telegram API error: {result}")

    return result


def run(
    *,
    text: str,
    token: Optional[str] = None,
    chat_id: Optional[str] = None,
    parse_mode: Optional[str] = None,
    disable_web_page_preview: bool = False,
) -> Dict:
    """
    Workflow node entry point for sending a Telegram message.

    The node automatically resolves the bot token and chat ID from environment
    variables ``TELEGRAM_BOT_TOKEN`` and ``TELEGRAM_CHAT_ID`` if they are not
    explicitly provided.

    Parameters
    ----------
    text : str
        Message text.
    token : str, optional
        Bot token. Falls back to ``TELEGRAM_BOT_TOKEN`` env var.
    chat_id : str, optional
        Chat identifier. Falls back to ``TELEGRAM_CHAT_ID`` env var.
    parse_mode : str, optional
        Message parse mode.
    disable_web_page_preview : bool, default False
        Disable link previews.

    Returns
    -------
    dict
        Response from the Telegram API.
    """
    token = token or os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = chat_id or os.getenv("TELEGRAM_CHAT_ID")

    if not token:
        raise ValueError("Telegram bot token is required (provide 'token' or set TELEGRAM_BOT_TOKEN env var).")
    if not chat_id:
        raise ValueError("Telegram chat ID is required (provide 'chat_id' or set TELEGRAM_CHAT_ID env var).")

    return send_telegram(
        token=token,
        chat_id=chat_id,
        text=text,
        parse_mode=parse_mode,
        disable_web_page_preview=disable_web_page_preview,
    )


__all__ = ["send_telegram", "run"]