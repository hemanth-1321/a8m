from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field, validator

class CalculationRequest(BaseModel):
    a: float = Field(..., description="First operand")
    b: float = Field(..., description="Second operand")
    operation: str = Field(..., description="Operation: add, subtract, multiply, divide")

    @validator("operation")
    def validate_operation(cls, value: str) -> str:
        allowed_ops = {"add", "subtract", "multiply", "divide"}
        if value not in allowed_ops:
            raise ValueError(f"operation must be one of {', '.join(allowed_ops)}")
        return value

router = APIRouter()

@router.post("/calculate")
async def calculate(request: CalculationRequest):
    try:
        if request.operation == "add":
            result = request.a + request.b
        elif request.operation == "subtract":
            result = request.a - request.b
        elif request.operation == "multiply":
            result = request.a * request.b
        elif request.operation == "divide":
            if request.b == 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Division by zero is not allowed",
                )
            result = request.a / request.b
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported operation",
            )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {exc}",
        )
    return {"result": result}

__all__ = ["router"]