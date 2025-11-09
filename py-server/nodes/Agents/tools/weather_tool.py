import os
import requests
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


class WeatherTool:
    """
    Lightweight tool for retrieving current weather information for a given location.
    Uses the Open-Meteo API which does not require an API key.
    """

    GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search"
    WEATHER_URL = "https://api.open-meteo.com/v1/forecast"

    def __init__(self, timeout: int = 10) -> None:
        self.timeout = timeout

    def _geocode(self, location: str) -> Optional[Dict[str, Any]]:
        """Convert a location name to latitude and longitude using Open-Meteo geocoding."""
        params = {"name": location, "count": 1, "language": "en", "format": "json"}
        try:
            resp = requests.get(self.GEOCODE_URL, params=params, timeout=self.timeout)
            resp.raise_for_status()
            data = resp.json()
            if "results" in data and data["results"]:
                return data["results"][0]
        except requests.RequestException as exc:
            logger.error("Geocoding request failed for %s: %s", location, exc)
        return None

    def _fetch_weather(self, latitude: float, longitude: float) -> Optional[Dict[str, Any]]:
        """Fetch current weather data for the specified coordinates."""
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "current_weather": True,
            "timezone": "auto",
        }
        try:
            resp = requests.get(self.WEATHER_URL, params=params, timeout=self.timeout)
            resp.raise_for_status()
            return resp.json()
        except requests.RequestException as exc:
            logger.error("Weather request failed for (%s, %s): %s", latitude, longitude, exc)
        return None

    def get_current_weather(self, location: str) -> Dict[str, Any]:
        """
        Retrieve current weather for a given location.

        Parameters
        ----------
        location : str
            Human-readable location name (e.g., "New York, NY").

        Returns
        -------
        dict
            Weather information including temperature, wind speed, wind direction,
            weather code, and the timestamp of the measurement.
        """
        geo = self._geocode(location)
        if not geo:
            raise ValueError(f"Could not geocode location: {location}")

        weather = self._fetch_weather(geo["latitude"], geo["longitude"])
        if not weather or "current_weather" not in weather:
            raise RuntimeError(f"Could not retrieve weather for {location}")

        current = weather["current_weather"]
        result = {
            "location": location,
            "latitude": geo["latitude"],
            "longitude": geo["longitude"],
            "temperature": current.get("temperature"),
            "windspeed": current.get("windspeed"),
            "winddirection": current.get("winddirection"),
            "weathercode": current.get("weathercode"),
            "time": current.get("time"),
        }
        return result

    def __repr__(self) -> str:
        return f"<WeatherTool timeout={self.timeout}s>"


def get_tool() -> WeatherTool:
    """Factory function for the platform to instantiate the weather tool."""
    return WeatherTool()


__all__ = ["WeatherTool", "get_tool"]