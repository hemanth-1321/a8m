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

def weather_tool(location: str):
    """
    Retrieves current weather information for the specified location.
    """
    api_key = os.environ.get("OPENWEATHER_API_KEY")
    if not api_key:
        raise ValueError("OpenWeather API key not set in environment variable 'OPENWEATHER_API_KEY'")

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
        if data.get("cod") != 200:
            # API returned an error
            return f"Error retrieving weather for '{location}': {data.get('message', 'Unknown error')}"
        weather_desc = data["weather"][0]["description"].capitalize()
        temp = data["main"]["temp"]
        feels_like = data["main"]["feels_like"]
        humidity = data["main"]["humidity"]
        wind_speed = data["wind"]["speed"]
        result = (
            f"Current weather in {location}:\n"
            f"  Description: {weather_desc}\n"
            f"  Temperature: {temp}°C (feels like {feels_like}°C)\n"
            f"  Humidity: {humidity}%\n"
            f"  Wind Speed: {wind_speed} m/s"
        )
        print(result)
        return result
    except requests.RequestException as e:
        return f"Error connecting to weather service: {e}"

WEATHER_TOOL = Tool(
    name="Weather",
    func=weather_tool,
    description="Get the current weather for a specified location. Provide a city name or location query."
)