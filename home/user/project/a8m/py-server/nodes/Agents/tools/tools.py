import getpass
import os
import json
import requests
from dotenv import load_dotenv
from langchain_tavily import TavilySearch
from langchain_core.tools import Tool

load_dotenv()

# Tavily API key setup
if not os.environ.get("TAVILY_API_KEY"):
    os.environ["TAVILY_API_KEY"] = getpass.getpass("Tavily API key:\n")

# Weather API key setup (e.g., OpenWeatherMap)
if not os.environ.get("WEATHER_API_KEY"):
    os.environ["WEATHER_API_KEY"] = getpass.getpass("Weather API key (e.g., OpenWeatherMap):\n")

def web_search_tool(query: str):
    search = TavilySearch(api_key=os.environ["TAVILY_API_KEY"])
    result = search.run(query)
    print(result)
    return result

WEBSEARCH_TOOL = Tool(
    name="WebSearch",
    func=web_search_tool,
    description="Search the web for the latest information."
)

def get_weather(location: str):
    """
    Fetch current weather information for the given location.

    Parameters
    ----------
    location : str
        Name of the city or location to fetch weather for.

    Returns
    -------
    str
        JSON string containing weather data (temperature, description, humidity, etc.).
    """
    api_key = os.environ["WEATHER_API_KEY"]
    base_url = "http://api.openweathermap.org/data/2.5/weather"
    params = {
        "q": location,
        "appid": api_key,
        "units": "metric",
        "lang": "en"
    }
    try:
        response = requests.get(base_url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        # Format a readable summary
        weather_desc = data["weather"][0]["description"].capitalize()
        temp = data["main"]["temp"]
        humidity = data["main"]["humidity"]
        wind_speed = data["wind"]["speed"]
        summary = (
            f"Current weather in {location}:\n"
            f"  • Condition: {weather_desc}\n"
            f"  • Temperature: {temp}°C\n"
            f"  • Humidity: {humidity}%\n"
            f"  • Wind Speed: {wind_speed} m/s"
        )
        result = {
            "location": location,
            "summary": summary,
            "data": data
        }
        return json.dumps(result, indent=2)
    except requests.RequestException as e:
        error_msg = f"Error fetching weather for {location}: {str(e)}"
        print(error_msg)
        return json.dumps({"error": error_msg})

WEATHER_TOOL = Tool(
    name="Weather",
    func=get_weather,
    description=(
        "Fetches current weather information for a specified location. "
        "Input should be a city name or location string."
    )
)