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

# Ensure OpenWeather API key is set
if not os.environ.get("OPENWEATHER_API_KEY"):
    os.environ["OPENWEATHER_API_KEY"] = getpass.getpass("OpenWeather API key:\n")

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

def get_weather(location: str):
    """
    Fetch current weather information for a given location using OpenWeatherMap API.
    """
    api_key = os.environ["OPENWEATHER_API_KEY"]
    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        "q": location,
        "appid": api_key,
        "units": "metric",
        "lang": "en"
    }
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        weather_desc = data["weather"][0]["description"].capitalize()
        temp = data["main"]["temp"]
        humidity = data["main"]["humidity"]
        wind_speed = data["wind"]["speed"]
        result = (
            f"Current weather in {location}:\n"
            f"• Description: {weather_desc}\n"
            f"• Temperature: {temp}°C\n"
            f"• Humidity: {humidity}%\n"
            f"• Wind speed: {wind_speed} m/s"
        )
        print(result)
        return result
    except requests.exceptions.RequestException as e:
        error_msg = f"Error fetching weather for '{location}': {e}"
        print(error_msg)
        return error_msg
    except KeyError:
        error_msg = f"Unexpected response format for location '{location}'."
        print(error_msg)
        return error_msg

WEATHER_TOOL = Tool(
    name="Weather",
    func=get_weather,
    description="Retrieve current weather information for a specified location using OpenWeatherMap."
)