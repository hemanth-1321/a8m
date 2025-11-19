import getpass
import os
from dotenv import load_dotenv
from langchain_tavily import TavilySearch
from langchain_core.tools import Tool
import math

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
    description="search the web for the latest information",
)


def calculator_tool(expression: str):
    """
    Evaluate a mathematical expression and return the result as a string.
    Supports basic arithmetic and math module functions like sqrt, sin, cos, etc.
    """
    # Define a safe namespace with selected math functions
    safe_globals = {
        "__builtins__": None,
        "sqrt": math.sqrt,
        "sin": math.sin,
        "cos": math.cos,
        "tan": math.tan,
        "pi": math.pi,
        "e": math.e,
        "log": math.log,
        "log10": math.log10,
        "exp": math.exp,
    }
    try:
        result = eval(expression, safe_globals, {})
        return str(result)
    except Exception as e:
        return f"Error: {e}"


CALCULATOR_TOOL = Tool(
    name="Calculator",
    func=calculator_tool,
    description="Perform basic arithmetic calculations, e.g., '2+2' or 'sqrt(16)'",
)