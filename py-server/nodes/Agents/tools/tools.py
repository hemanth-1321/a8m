import getpass
import os
import requests
from dotenv import load_dotenv
from langchain_tavily import TavilySearch
from langchain_core.tools import Tool

load_dotenv()

# Ensure Tavily API key is available
if not os.environ.get("TAVILY_API_KEY"):
    os.environ["TAVILY_API_KEY"] = getpass.getpass("Tavily API key:\n")

# Ensure Weather API key is available (using OpenWeatherMap as an example)
if not os.environ.get("OPENWEATHER_API_KEY"):
    os.environ["OPENWEATHER_API_KEY"] = getpass.getpass("OpenWeatherMap API key:\n")

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

def weather_tool(location: str):
    """
    Fetch current weather information for a given location using OpenWeatherMap API.
    """
    api_key = os.environ["OPENWEATHER_API_KEY"]
    base_url = "http://api.openweathermap.org/data/2.5/weather"
    params = {
        "q": location,
        "appid": api_key,
        "units": "metric",
        "lang": "en"
    }
    response = requests.get(base_url, params=params)
    if response.status_code != 200:
        return f"Could not retrieve weather data for {location}. (HTTP {response.status_code})"

    data = response.json()
    weather_desc = data["weather"][0]["description"].capitalize()
    temp = data["main"]["temp"]
    feels_like = data["main"]["feels_like"]
    humidity = data["main"]["humidity"]
    wind_speed = data["wind"]["speed"]

    result = (
        f"Weather in {location}:\n"
        f"- Description: {weather_desc}\n"
        f"- Temperature: {temp}°C (feels like {feels_like}°C)\n"
        f"- Humidity: {humidity}%\n"
        f"- Wind Speed: {wind_speed} m/s"
    )
    return result

WEATHER_TOOL = Tool(
    name="Weather",
    func=weather_tool,
    description="Provide current weather information for a specified location. Input should be the city name or location query."
)