import getpass
import os
import requests
from dotenv import load_dotenv
from langchain_tavily import TavilySearch
from langchain_core.tools import Tool

load_dotenv()

# Tavily web search setup
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

# Weather tool setup
if not os.environ.get("WEATHER_API_KEY"):
    os.environ["WEATHER_API_KEY"] = getpass.getpass("OpenWeatherMap API key:\n")

def weather_tool(city: str):
    """
    Retrieves current weather information for the specified city.
    """
    api_key = os.environ["WEATHER_API_KEY"]
    base_url = "http://api.openweathermap.org/data/2.5/weather"
    params = {
        "q": city,
        "appid": api_key,
        "units": "metric",
    }
    try:
        response = requests.get(base_url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        weather_desc = data["weather"][0]["description"].capitalize()
        temp = data["main"]["temp"]
        humidity = data["main"]["humidity"]
        wind_speed = data["wind"]["speed"]
        city_name = data["name"]
        country = data["sys"]["country"]
        result = (
            f"Weather in {city_name}, {country}:\n"
            f"  • Description: {weather_desc}\n"
            f"  • Temperature: {temp}°C\n"
            f"  • Humidity: {humidity}%\n"
            f"  • Wind Speed: {wind_speed} m/s"
        )
        return result
    except requests.RequestException as e:
        return f"Error fetching weather data: {e}"
    except KeyError:
        return "Error parsing weather data. Please check the city name."

WEATHER_TOOL = Tool(
    name="Weather",
    func=weather_tool,
    description=(
        "Provides current weather information for a specified city. "
        "Input should be the city name (e.g., 'London'). "
        "Returns temperature in Celsius, humidity, wind speed, and a short description."
    )
)