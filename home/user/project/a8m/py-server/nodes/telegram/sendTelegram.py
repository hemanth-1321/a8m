import json
from typing import Any, Dict

import requests

# Import the credentials helper. Adjust the import path if needed.
try:
    from a8m.utils.credentials import get_credentials
except Exception:  # pragma: no cover
    # Fallback stub in case the helper is not available.
    def get_credentials(user_id: str, service: str) -> Dict[str, Any]:
        """Return an empty dict if credentials are unavailable."""
        return {}

__all__ = ["run_telegram_node"]


def run_telegram_node(node: Any, input_data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
    """
    Send a message via Telegram Bot API.

    Parameters
    ----------
    node : Any
        The node object (unused in this implementation but kept for API consistency).
    input_data : dict
        Dictionary containing at least 'chat_id' and 'text' keys.
    user_id : str
        Identifier of the user executing the node, used to fetch credentials.

    Returns
    -------
    dict
        Parsed JSON response from Telegram API, or an error dictionary.
    """
    # Retrieve the bot token
    credentials = get_credentials(user_id, "telegram")
    token = credentials.get("token")

    if not token:
        return {"error": "Missing Telegram bot token. Please provide credentials."}

    # Validate input data
    chat_id = input_data.get("chat_id")
    text = input_data.get("text")

    if not chat_id or not text:
        missing = []
        if not chat_id:
            missing.append("chat_id")
        if not text:
            missing.append("text")
        return {"error": f"Missing required input data: {', '.join(missing)}."}

    # Prepare the request
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {"chat_id": chat_id, "text": text}
    headers = {"Content-Type": "application/json"}

    try:
        response = requests.post(url, headers=headers, data=json.dumps(payload), timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        # Return a generic error dict with details
        return {"error": f"Telegram API request failed: {str(e)}"}
    except ValueError:
        # JSON decoding failed
        return {"error": "Invalid JSON response from Telegram API."}