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
    Fetches current weather data for the specified city using OpenWeatherMap API.
    """
    api_key = os.environ["OPENWEATHER_API_KEY"]
    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        "q": city,
        "appid": api_key,
        "units": "metric"
    }
    response = requests.get(url, params=params)
    if response.status_code != 200:
        return f"Could not retrieve weather data for {city}. (HTTP {response.status_code})"
    data = response.json()
    weather_desc = data.get("weather", [{}])[0].get("description", "No description")
    temp = data.get("main", {}).get("temp", "N/A")
    feels_like = data.get("main", {}).get("feels_like", "N/A")
    humidity = data.get("main", {}).get("humidity", "N/A")
    wind_speed = data.get("wind", {}).get("speed", "N/A")
    return (f"Current weather in {city}:\n"
            f"Description: {weather_desc}\n"
            f"Temperature: {temp}°C (feels like {feels_like}°C)\n"
            f"Humidity: {humidity}%\n"
            f"Wind Speed: {wind_speed} m/s")

WEATHER_TOOL = Tool(
    name="Weather",
    func=weather_tool,
    description="Get current weather information for a specified city using OpenWeatherMap."
)