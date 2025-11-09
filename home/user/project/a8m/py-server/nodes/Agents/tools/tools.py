import getpass
import os
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from langchain_tavily import TavilySearch
from langchain_core.tools import Tool

load_dotenv()

# Ensure Tavily API key is set
if not os.environ.get("TAVILY_API_KEY"):
    os.environ["TAVILY_API_KEY"] = getpass.getpass("Tavily API key:\n")

def web_search_tool(query: str):
    """Search the web for the latest information using Tavily."""
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
    Scrape a web page and return its title and a summary of the main text content.
    """
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        title = soup.title.string.strip() if soup.title and soup.title.string else "No title"
        # Extract visible text
        texts = soup.stripped_strings
        body_text = " ".join(texts)
        # Return a truncated summary to keep output manageable
        summary = body_text[:2000] + ("..." if len(body_text) > 2000 else "")
        return f"Title: {title}\n\nSummary:\n{summary}"
    except Exception as e:
        return f"Error scraping {url}: {str(e)}"

WEBSCRAPE_TOOL = Tool(
    name="WebScrape",
    func=web_scrape_tool,
    description="Scrape a web page and return its title and a summary of the main text content."
)