"""
Validation Router - The Inspector's Chamber

Endpoints for validating MCP server code (Decklists).
"""

from fastapi import APIRouter

from app.models.schemas import ValidationRequest, ValidationResponse
from app.services.ast_validator import validate_code

router = APIRouter()


@router.post("/validate", response_model=ValidationResponse)
async def validate_mcp_code(request: ValidationRequest) -> ValidationResponse:
    """
    Submit a Decklist for inspection.

    The Inspector will analyze your Python code and verify:
    - fastmcp import is present
    - FastMCP is properly instantiated
    - All Sorceries (@mcp.tool) have Oracle Text (docstrings)
    - All Permanents (@mcp.resource) have valid URIs

    Returns a verdict with any Counterspells (errors) encountered.
    """
    return validate_code(request.code)
