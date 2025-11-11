import getpass
import os
import requests
from dotenv import load_dotenv
from langchain_tavily import TavilySearch
from langchain_core.tools import Tool

load_dotenv()

if not os.environ.get("TAVILY_API_KEY"):
    os.environ["TAVILY_API_KEY"] = getpass.getpass("Tavily API key:\n")

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

def get_weather(city: str):
    """
    Retrieve current weather information for the specified city.
    """
    api_key = os.environ["OPENWEATHER_API_KEY"]
    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        weather_desc = data["weather"][0]["description"].capitalize()
        temp = data["main"]["temp"]
        humidity = data["main"]["humidity"]
        wind_speed = data["wind"]["speed"]
        return (
            f"Current weather in {city}:\n"
            f"  • Description: {weather_desc}\n"
            f"  • Temperature: {temp}°C\n"
            f"  • Humidity: {humidity}%\n"
            f"  • Wind Speed: {wind_speed} m/s"
        )
    except requests.exceptions.RequestException as e:
        return f"Error retrieving weather data for '{city}': {e}"
    except KeyError:
        return f"Unexpected response structure while retrieving weather for '{city}'."

WEATHER_TOOL = Tool(
    name="Weather",
    func=get_weather,
    description="Get current weather information for a specified city"
)