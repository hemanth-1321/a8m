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

# Weather tool
def get_weather(location: str):
    """
    Query OpenWeatherMap API for current weather of the given location.
    """
    api_key = os.environ.get("WEATHER_API_KEY")
    if not api_key:
        api_key = getpass.getpass("OpenWeatherMap API key:\n")
        os.environ["WEATHER_API_KEY"] = api_key

    base_url = "http://api.openweathermap.org/data/2.5/weather"
    params = {
        "q": location,
        "appid": api_key,
        "units": "metric"
    }

    try:
        response = requests.get(base_url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        # Format a simple readable response
        weather_desc = data["weather"][0]["description"].capitalize()
        temp = data["main"]["temp"]
        humidity = data["main"]["humidity"]
        wind_speed = data["wind"]["speed"]
        city = data.get("name", location)
        country = data["sys"].get("country", "")
        result = (
            f"Current weather in {city}, {country}:\n"
            f"- Description: {weather_desc}\n"
            f"- Temperature: {temp}°C\n"
            f"- Humidity: {humidity}%\n"
            f"- Wind Speed: {wind_speed} m/s"
        )
        print(result)
        return result
    except requests.exceptions.RequestException as e:
        error_msg = f"Error fetching weather data: {e}"
        print(error_msg)
        return error_msg

WEATHER_TOOL = Tool(
    name="Weather",
    func=get_weather,
    description="Get current weather for a specified location using OpenWeatherMap API"
)