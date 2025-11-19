import os
import requests
from typing import Optional

API_URL = "http://api.openweathermap.org/data/2.5/weather"


class WeatherTool:
    """
    Fetches current weather information for a given city using the OpenWeatherMap API.

    The API key must be set in the environment variable `OPENWEATHER_API_KEY`.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("OPENWEATHER_API_KEY")
        if not self.api_key:
            raise ValueError(
                "OpenWeatherMap API key not found. Set OPENWEATHER_API_KEY environment variable."
            )

    def get_weather(self, city: str) -> str:
        """
        Retrieve current weather for the specified city.

        Parameters
        ----------
        city : str
            Name of the city (e.g., "London", "New York").

        Returns
        -------
        str
            Human‑readable summary of the current weather.

        Raises
        ------
        requests.HTTPError
            If the API request fails.
        """
        params = {
            "q": city,
            "appid": self.api_key,
            "units": "metric",
            "lang": "en",
        }
        response = requests.get(API_URL, params=params, timeout=10)
        try:
            response.raise_for_status()
        except requests.HTTPError as exc:
            # Provide a clearer error message for common cases
            if response.status_code == 404:
                raise ValueError(f"City '{city}' not found.") from exc
            raise

        data = response.json()

        temp = data["main"]["temp"]
        description = data["weather"][0]["description"].capitalize()
        humidity = data["main"]["humidity"]
        wind_speed = data["wind"]["speed"]

        summary = (
            f"The current weather in {city} is {description} "
            f"with a temperature of {temp}°C, humidity {humidity}%, "
            f"and wind speed {wind_speed} m/s."
        )
        return summary

    def __call__(self, city: str) -> str:
        return self.get_weather(city)


__all__ = ["WeatherTool"]