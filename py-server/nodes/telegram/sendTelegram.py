import os
import logging
from typing import Any, Dict, Optional

import requests

# Configure module-level logger
logger = logging.getLogger(__name__)
logging.getLogger("urllib3").setLevel(logging.WARNING)  # Reduce noise from requests

# Default environment variable names
TOKEN_ENV_VAR = "TELEGRAM_BOT_TOKEN"
CHAT_ID_ENV_VAR = "TELEGRAM_CHAT_ID"

# Telegram API base URL
BASE_URL = "https://api.telegram.org/bot{token}/sendMessage"


def _get_token() -> str:
    """
    Retrieve the Telegram bot token from environment variables.
    Raises an informative error if the token is missing.
    """
    token = os.getenv(TOKEN_ENV_VAR)
    if not token:
        raise EnvironmentError(
            f"Telegram bot token not found. Please set the environment variable '{TOKEN_ENV_VAR}'."
        )
    return token


def _get_chat_id() -> str:
    """
    Retrieve the default chat ID from environment variables.
    Raises an informative error if the chat ID is missing.
    """
    chat_id = os.getenv(CHAT_ID_ENV_VAR)
    if not chat_id:
        raise EnvironmentError(
            f"Default Telegram chat ID not found. Please set the environment variable '{CHAT_ID_ENV_VAR}'."
        )
    return chat_id


def send_telegram_message(
    message: str,
    chat_id: Optional[str] = None,
    *,
    token: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Send a message via the Telegram Bot API.

    Parameters
    ----------
    message : str
        The text message to send.
    chat_id : str, optional
        The target chat ID. If omitted, the default from the environment is used.
    token : str, optional
        The bot token. If omitted, the default from the environment is used.

    Returns
    -------
    dict
        The JSON response from the Telegram API.

    Raises
    ------
    RuntimeError
        If the HTTP request fails or the API returns an error.
    """
    if token is None:
        token = _get_token()
    if chat_id is None:
        chat_id = _get_chat_id()

    url = BASE_URL.format(token=token)
    payload = {"chat_id": chat_id, "text": message}
    try:
        response = requests.post(url, data=payload, timeout=10)
        response.raise_for_status()
    except requests.RequestException as exc:
        logger.error("Failed to send Telegram message: %s", exc, exc_info=True)
        raise RuntimeError(f"Telegram API request failed: {exc}") from exc

    data = response.json()
    if not data.get("ok"):
        error_description = data.get("description", "Unknown error")
        logger.error("Telegram API returned error: %s", error_description)
        raise RuntimeError(f"Telegram API error: {error_description}")

    logger.debug("Telegram message sent successfully: %s", data)
    return data


class SendTelegramNode:
    """
    Node for sending messages via Telegram Bot API.

    This node expects the following inputs:
        - message (str): The text to send.
        - chat_id (str, optional): Target chat ID. If omitted, the default
          from the environment variable TELEGRAM_CHAT_ID is used.

    It returns a dictionary containing the raw response from the Telegram API.
    """

    name = "SendTelegram"
    description = (
        "Send a message to a Telegram chat using the Bot API. "
        "Requires TELEGRAM_BOT_TOKEN and optionally TELEGRAM_CHAT_ID environment variables."
    )
    inputs = {
        "message": {"type": str, "required": True},
        "chat_id": {"type": str, "required": False},
    }
    outputs = {"response": {"type": dict, "required": True}}

    def execute(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the node.

        Parameters
        ----------
        inputs : dict
            Dictionary containing 'message' and optionally 'chat_id'.

        Returns
        -------
        dict
            The node's output containing the 'response' key.
        """
        message = inputs.get("message")
        if not message:
            raise ValueError("Input 'message' is required.")

        chat_id = inputs.get("chat_id")

        try:
            response = send_telegram_message(message, chat_id=chat_id)
        except Exception as exc:
            logger.exception("Error while sending Telegram message.")
            raise RuntimeError(f"Failed to send Telegram message: {exc}") from exc

        return {"response": response}


__all__ = ["SendTelegramNode"]