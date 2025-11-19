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

def _is_safe_node(node: ast.AST) -> bool:
    """
    Recursively check whether an AST node is safe for evaluation.
    Allowed nodes: Expression, BinOp, UnaryOp, Constant (Num in Python <3.8), 
    operators: Add, Sub, Mult, Div, Mod, Pow, FloorDiv, UAdd, USub.
    """
    if isinstance(node, ast.Expression):
        return _is_safe_node(node.body)
    elif isinstance(node, ast.BinOp):
        return (
            isinstance(node.op, (ast.Add, ast.Sub, ast.Mult, ast.Div,
                                 ast.Mod, ast.Pow, ast.FloorDiv))
            and _is_safe_node(node.left)
            and _is_safe_node(node.right)
        )
    elif isinstance(node, ast.UnaryOp):
        return (
            isinstance(node.op, (ast.UAdd, ast.USub))
            and _is_safe_node(node.operand)
        )
    elif isinstance(node, (ast.Constant, ast.Num)):
        return isinstance(getattr(node, "value", None), (int, float, complex))
    elif isinstance(node, ast.Paren):
        return _is_safe_node(node.value)
    else:
        return False

def safe_eval(expr: str):
    """
    Safely evaluate a simple arithmetic expression.
    Raises ValueError if the expression contains unsafe nodes.
    """
    try:
        parsed = ast.parse(expr, mode="eval")
    except SyntaxError as e:
        raise ValueError(f"Invalid syntax: {e}") from e

    if not _is_safe_node(parsed):
        raise ValueError("Expression contains unsafe operations")

    # Evaluate with no builtins
    return eval(compile(parsed, filename="<ast>", mode="eval"), {"__builtins__": None}, {})

def calculator_tool(expression: str):
    """
    Evaluate a mathematical expression safely and return the result as a string.
    """
    try:
        result = safe_eval(expression)
        return str(result)
    except Exception as e:
        return f"Error: {e}"

CALCULATOR_TOOL = Tool(
    name="Calculator",
    func=calculator_tool,
    description="Safely evaluate mathematical expressions (e.g., 2 + 3 * 4)."
)