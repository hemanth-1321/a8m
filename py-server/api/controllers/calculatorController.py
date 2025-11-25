from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import ast
import operator

# Data model for the request body
class ExpressionRequest(BaseModel):
    expression: str

# Mapping of allowed binary operators
_BINARY_OPERATORS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Pow: operator.pow,
    ast.Mod: operator.mod,
}

# Mapping of allowed unary operators
_UNARY_OPERATORS = {
    ast.UAdd: operator.pos,
    ast.USub: operator.neg,
}

def _eval_node(node: ast.AST) -> float:
    """Recursively evaluate an AST node safely."""
    if isinstance(node, ast.Constant):  # Python 3.8+
        if isinstance(node.value, (int, float)):
            return node.value
        raise ValueError("Only numeric constants are allowed.")
    if isinstance(node, ast.Num):  # Python <3.8
        return node.n
    if isinstance(node, ast.BinOp):
        left = _eval_node(node.left)
        right = _eval_node(node.right)
        op_func = _BINARY_OPERATORS.get(type(node.op))
        if op_func is None:
            raise ValueError(f"Unsupported binary operator: {type(node.op).__name__}")
        return op_func(left, right)
    if isinstance(node, ast.UnaryOp):
        operand = _eval_node(node.operand)
        op_func = _UNARY_OPERATORS.get(type(node.op))
        if op_func is None:
            raise ValueError(f"Unsupported unary operator: {type(node.op).__name__}")
        return op_func(operand)
    raise ValueError(f"Unsupported expression type: {type(node).__name__}")

def safe_eval(expression: str) -> float:
    """
    Safely evaluate a mathematical expression containing only numbers
    and the operators +, -, *, /, **, and %.
    """
    try:
        parsed = ast.parse(expression, mode="eval")
    except SyntaxError as exc:
        raise ValueError("Invalid syntax") from exc

    return _eval_node(parsed.body)

router = APIRouter()

@router.post("/calculator")
async def calculate(request: ExpressionRequest):
    """
    Evaluate a mathematical expression sent in the request body.
    The request body must contain a JSON object with an 'expression' field.
    """
    try:
        result = safe_eval(request.expression)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return {"result": result}

__all__ = ["router"]