import getpass
import os
import requests
from bs4 import BeautifulSoup
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

def web_scrape_tool(url: str):
    """
    Scrape the given URL and return its textual content.
    """
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
    except requests.RequestException as e:
        return f"Error fetching URL: {e}"
    soup = BeautifulSoup(response.text, "html.parser")
    # Remove script and style elements
    for element in soup(["script", "style", "noscript"]):
        element.decompose()
    text = soup.get_text(separator=" ", strip=True)
    return text

WEBSCRAPE_TOOL = Tool(
    name="WebScrape",
    func=web_scrape_tool,
    description="Scrape a webpage and return its textual content"
)