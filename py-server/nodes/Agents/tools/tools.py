import getpass
import os
import requests
from dotenv import load_dotenv
from langchain_tavily import TavilySearch
from langchain_core.tools import Tool
load_dotenv()
if not os.environ.get("TAVILY_API_KEY"):
    os.environ["TAVILY_API_KEY"] = getpass.getpass("Tavily API key:\n")
if not os.environ.get("OWM_API_KEY"):
    os.environ["OWM_API_KEY"] = getpass.getpass("OpenWeatherMap API key:\n")

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
    Fetch current weather information for the specified location.
    """
    api_key = os.environ["OWM_API_KEY"]
    base_url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        "q": location,
        "appid": api_key,
        "units": "metric",
        "lang": "en"
    }
    response = requests.get(base_url, params=params)
    if response.status_code != 200:
        return f"Could not retrieve weather data for '{location}'. Status code: {response.status_code}"
    data = response.json()
    weather_desc = data["weather"][0]["description"].capitalize()
    temp = data["main"]["temp"]
    humidity = data["main"]["humidity"]
    wind_speed = data["wind"]["speed"]
    return (f"Weather in {location}: {weather_desc}. "
            f"Temperature: {temp}°C, Humidity: {humidity}%, "
            f"Wind speed: {wind_speed} m/s.")

WEATHER_TOOL = Tool(
    name="Weather",
    func=weather_tool,
    description="Get the current weather for a specified location. Input should be a city name or location."
)