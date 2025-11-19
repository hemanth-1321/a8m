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
    """Perform a web search using TavilySearch."""
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
    Retrieve current weather information for a specified location.
    
    Parameters:
    - location (str): The city name or location query (e.g., "New York", "Paris").

    Returns:
    - str: A human-readable summary of the current weather conditions.
    """
    api_key = os.environ["OPENWEATHER_API_KEY"]
    base_url = "http://api.openweathermap.org/data/2.5/weather"
    params = {
        "q": location,
        "appid": api_key,
        "units": "metric",
        "lang": "en"
    }
    try:
        response = requests.get(base_url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        weather_desc = data["weather"][0]["description"].capitalize()
        temp = data["main"]["temp"]
        feels_like = data["main"]["feels_like"]
        humidity = data["main"]["humidity"]
        wind_speed = data["wind"]["speed"]
        city = data["name"]
        country = data["sys"]["country"]
        summary = (
            f"Current weather in {city}, {country}:\n"
            f"  • Condition: {weather_desc}\n"
            f"  • Temperature: {temp}°C (feels like {feels_like}°C)\n"
            f"  • Humidity: {humidity}%\n"
            f"  • Wind Speed: {wind_speed} m/s"
        )
        return summary
    except requests.exceptions.RequestException as e:
        return f"Error retrieving weather data: {e}"
    except KeyError:
        return "Error: Could not parse weather information. Please check the location name."

WEATHER_TOOL = Tool(
    name="Weather",
    func=weather_tool,
    description=(
        "Provides current weather information for a specified location. "
        "Input should be a city name or location query (e.g., 'London', 'Tokyo')."
    )
)