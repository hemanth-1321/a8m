import getpass
import os
import requests
from dotenv import load_dotenv
from langchain_tavily import TavilySearch
from langchain_core.tools import Tool

load_dotenv()

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

def weather_tool(city: str):
    """
    Fetches the current weather for the specified city using the wttr.in service.
    No API key is required.
    """
    try:
        url = f"https://wttr.in/{city}?format=j1"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        current = data["current_condition"][0]
        temp_c = current["temp_C"]
        weather_desc = current["weatherDesc"][0]["value"]
        humidity = current["humidity"]
        wind_speed_kmph = current["windspeedKmph"]
        return (
            f"Current weather in {city}:\n"
            f"Temperature: {temp_c}°C\n"
            f"Condition: {weather_desc}\n"
            f"Humidity: {humidity}%\n"
            f"Wind: {wind_speed_kmph} km/h"
        )
    except Exception as e:
        return f"Unable to fetch weather for {city}. Error: {e}"

WEATHER_TOOL = Tool(
    name="Weather",
    func=weather_tool,
    description="Get the current weather for a specified city. No API key is required."
)