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

# Weather tool implementation
def weather_tool(location: str):
    """
    Fetches current weather information for the specified location using the OpenWeatherMap API.
    """
    api_key = os.environ.get("OPENWEATHER_API_KEY")
    if not api_key:
        api_key = getpass.getpass("OpenWeatherMap API key:\n")
        os.environ["OPENWEATHER_API_KEY"] = api_key

    # Build request URL
    url = (
        f"http://api.openweathermap.org/data/2.5/weather?"
        f"q={location}&units=metric&appid={api_key}"
    )
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        return f"Error fetching weather data: {e}"

    data = response.json()
    if data.get("cod") != 200:
        return f"Could not retrieve weather for '{location}'. Error: {data.get('message', 'unknown')}"

    temp = data["main"]["temp"]
    description = data["weather"][0]["description"].capitalize()
    humidity = data["main"]["humidity"]
    wind_speed = data["wind"]["speed"]

    return (
        f"Current weather in {location}:\n"
        f"- Temperature: {temp}°C\n"
        f"- Condition: {description}\n"
        f"- Humidity: {humidity}%\n"
        f"- Wind Speed: {wind_speed} m/s"
    )

WEATHER_TOOL = Tool(
    name="Weather",
    func=weather_tool,
    description=(
        "Provides current weather information for a specified location. "
        "Input should be a location name (e.g., city name, zip code, or 'lat,lon')."
    )
)