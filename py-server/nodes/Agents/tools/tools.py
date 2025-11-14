import getpass
import os
import requests
from dotenv import load_dotenv
from langchain_tavily import TavilySearch
from langchain_core.tools import Tool

load_dotenv()

# Ensure Tavily API key is set
if not os.environ.get("TAVILY_API_KEY"):
    os.environ["TAVILY_API_KEY"] = getpass.getpass("Tavily API key:\n")

# Ensure OpenWeatherMap API key is set
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

def weather_tool(city: str):
    """
    Retrieve current weather data for the specified city using OpenWeatherMap API.
    """
    api_key = os.environ["OPENWEATHER_API_KEY"]
    url = "http://api.openweathermap.org/data/2.5/weather"
    params = {
        "q": city,
        "appid": api_key,
        "units": "metric"
    }
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        weather_description = data["weather"][0]["description"].capitalize()
        temp = data["main"]["temp"]
        feels_like = data["main"]["feels_like"]
        humidity = data["main"]["humidity"]
        wind_speed = data["wind"]["speed"]
        result = (
            f"Current weather in {city}:\n"
            f"• Description: {weather_description}\n"
            f"• Temperature: {temp}°C (feels like {feels_like}°C)\n"
            f"• Humidity: {humidity}%\n"
            f"• Wind Speed: {wind_speed} m/s"
        )
        print(result)
        return result
    except requests.HTTPError as http_err:
        error_msg = f"HTTP error occurred while fetching weather for {city}: {http_err}"
        print(error_msg)
        return error_msg
    except Exception as err:
        error_msg = f"Error occurred while fetching weather for {city}: {err}"
        print(error_msg)
        return error_msg

WEATHER_TOOL = Tool(
    name="Weather",
    func=weather_tool,
    description="Retrieve current weather information for a specified city."
)

__all__ = ["WEBSEARCH_TOOL", "WEATHER_TOOL"]