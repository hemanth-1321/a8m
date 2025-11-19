import getpass
import os
from dotenv import load_dotenv
from langchain_tavily import TavilySearch
from langchain_core.tools import Tool
import requests

load_dotenv()

if not os.environ.get("TAVILY_API_KEY"):
    os.environ["TAVILY_API_KEY"] = getpass.getpass("Tavily API key:\n")

def web_search_tool(query: str):
    search = TavilySearch(api_key=os.environ["TAVILY_API_KEY"])
    result = search.run(query)
    return result

WEBSEARCH_TOOL = Tool(
    name="WebSearch",
    func=web_search_tool,
    description="search the web for the latest information"
)

def get_weather(city: str):
    """
    Fetch current weather information for the specified city using the wttr.in API.
    """
    url = f"http://wttr.in/{city}?format=j1"
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        current = data.get("current_condition", [{}])[0]
        temp_c = current.get("temp_C")
        weather_desc = current.get("weatherDesc", [{}])[0].get("value")
        humidity = current.get("humidity")
        wind_kmph = current.get("windspeedKmph")
        return (
            f"Weather in {city}: {weather_desc}, "
            f"temp {temp_c}°C, humidity {humidity}%, "
            f"wind {wind_kmph} km/h"
        )
    except Exception as e:
        return f"Could not fetch weather for {city}: {e}"

WEATHER_TOOL = Tool(
    name="Weather",
    func=get_weather,
    description="Get current weather for a specified city"
)