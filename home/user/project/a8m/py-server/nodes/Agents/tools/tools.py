import getpass
import os
import ast
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

def _is_allowed(node):
    """Recursively check if the AST node is safe for evaluation."""
    if isinstance(node, ast.Expression):
        return _is_allowed(node.body)
    if isinstance(node, (ast.BinOp, ast.UnaryOp)):
        return _is_allowed(node.left if hasattr(node, "left") else node.operand) and \
               _is_allowed(node.right if hasattr(node, "right") else node.operand)
    if isinstance(node, (ast.Num, ast.Constant)):
        return isinstance(node.value, (int, float, complex))
    if isinstance(node, ast.Add):
        return True
    if isinstance(node, ast.Sub):
        return True
    if isinstance(node, ast.Mult):
        return True
    if isinstance(node, ast.Div):
        return True
    if isinstance(node, ast.Pow):
        return True
    if isinstance(node, ast.Mod):
        return True
    if isinstance(node, ast.USub):
        return True
    if isinstance(node, ast.UAdd):
        return True
    return False

def calculator_tool(expression: str) -> str:
    """
    Safely evaluate a simple arithmetic expression.
    """
    try:
        node = ast.parse(expression, mode='eval')
        if not _is_allowed(node):
            return "Error: Expression contains disallowed operations."
        # Evaluate the expression with no builtins or globals
        result = eval(compile(node, filename="<ast>", mode="eval"), {}, {})
        return str(result)
    except Exception as e:
        return f"Error: {e}"

CALCULATOR_TOOL = Tool(
    name="Calculator",
    func=calculator_tool,
    description="Evaluates simple arithmetic expressions safely."
)