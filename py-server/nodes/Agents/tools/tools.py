import getpass
import os
import requests
from dotenv import load_dotenv
from langchain_tavily import TavilySearch
from langchain_core.tools import Tool

load_dotenv()
if not os.environ.get("TAVILY_API_KEY"):
    os.environ["TAVILY_API_KEY"] = getpass.getpass("Tavily API key:\n")

def web_search_tool(query: str):
    search = TavilySearch(api_key=os.environ["TAVILY_API_KEY"])
    result = search.run(query)
    print(result)
    return result

WEBSEARCH_TOOL = Tool(
    name="WebSearch",
    func=web_search_tool,
    description="search the web for the latest information"
)

def _geocode_location(location: str):
    """
    Uses Nominatim to convert a location string into latitude and longitude.
    """
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": location,
        "format": "json",
        "limit": 1
    }
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        if not data:
            return None, None
        lat = float(data[0]["lat"])
        lon = float(data[0]["lon"])
        return lat, lon
    except Exception:
        return None, None

def weather_tool(location: str):
    """
    Retrieves current weather for the given location using the Open-Meteo API.
    """
    lat, lon = _geocode_location(location)
    if lat is None or lon is None:
        return f"Could not find coordinates for location: {location}"
    try:
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": lat,
            "longitude": lon,
            "current_weather": True,
            "timezone": "auto"
        }
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        current = data.get("current_weather", {})
        if not current:
            return f"No current weather data available for {location}"
        temp = current.get("temperature")
        windspeed = current.get("windspeed")
        winddirection = current.get("winddirection")
        weather = current.get("weathercode", "unknown")
        return (f"Current weather in {location} (lat: {lat:.2f}, lon: {lon:.2f}): "
                f"Temperature: {temp}°C, Wind: {windspeed} km/h at {winddirection}°, "
                f"Weather code: {weather}")
    except Exception as e:
        return f"Error retrieving weather for {location}: {str(e)}"

WEATHER_TOOL = Tool(
    name="Weather",
    func=weather_tool,
    description="Retrieve current weather information for a specified location. "
                "Provide a location name or address as input."
)