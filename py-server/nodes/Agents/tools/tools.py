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

# Ensure OpenWeatherMap API key is set
if not os.environ.get("OPENWEATHER_API_KEY"):
    os.environ["OPENWEATHER_API_KEY"] = getpass.getpass("OpenWeatherMap API key:\n")

def get_weather(city: str):
    api_key = os.environ["OPENWEATHER_API_KEY"]
    base_url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        "q": city,
        "appid": api_key,
        "units": "metric"
    }
    try:
        response = requests.get(base_url, params=params, timeout=10)
        response.raise_for_status()
    except requests.RequestException as e:
        return f"Error fetching weather data: {e}"

    data = response.json()
    if data.get("cod") != 200:
        return f"Error: {data.get('message', 'Unknown error')}"

    main = data.get("main", {})
    weather_desc = data.get("weather", [{}])[0].get("description", "No description")
    temp = main.get("temp")
    feels_like = main.get("feels_like")
    humidity = main.get("humidity")

    return (
        f"Current weather in {city}:\n"
        f"Temperature: {temp}°C (feels like {feels_like}°C)\n"
        f"Weather: {weather_desc}\n"
        f"Humidity: {humidity}%"
    )

WEATHER_TOOL = Tool(
    name="Weather",
    func=get_weather,
    description="Provides current weather information for a specified city. Input should be the city name."
)