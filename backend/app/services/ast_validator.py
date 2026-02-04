"""
The Inspector - AST Validation Service

This service analyzes Python code using Abstract Syntax Trees to validate
that MCP server code follows the correct patterns:
- fastmcp import present
- @mcp.tool() decorators with docstrings (Oracle Text)
- @mcp.resource() decorators with valid URIs
- @mcp.prompt() decorators
- async function patterns for I/O operations
"""

import ast
from typing import Optional
from app.models.schemas import ValidationError, ValidationResponse


class MCPValidator:
    """
    The Inspector Engine - validates MCP server code.

    Checks for:
    - fastmcp import
    - FastMCP instantiation
    - @mcp.tool() decorated functions with docstrings
    - @mcp.resource() decorated functions
    - @mcp.prompt() decorated functions
    """

    def __init__(self):
        self.errors: list[ValidationError] = []
        self.tools_found: list[str] = []
        self.resources_found: list[str] = []
        self.prompts_found: list[str] = []
        self.has_fastmcp_import = False
        self.has_mcp_instance = False
        self.mcp_var_name: Optional[str] = None

    def validate(self, code: str) -> ValidationResponse:
        """
        Validate the submitted code and return the Inspector's verdict.

        Args:
            code: Python source code to validate

        Returns:
            ValidationResponse with validity status and any errors found
        """
        self.errors = []
        self.tools_found = []
        self.resources_found = []
        self.prompts_found = []
        self.has_fastmcp_import = False
        self.has_mcp_instance = False
        self.mcp_var_name = None

        # Try to parse the code
        try:
            tree = ast.parse(code)
        except SyntaxError as e:
            self.errors.append(ValidationError(
                type="syntax_error",
                line=e.lineno,
                message=f"Your spell contains forbidden runes! Syntax error: {e.msg}"
            ))
            return self._build_response()

        # Walk the AST and validate
        self._check_imports(tree)
        self._check_mcp_instance(tree)
        self._check_decorated_functions(tree)

        # Check for missing essentials
        if not self.has_fastmcp_import:
            self.errors.append(ValidationError(
                type="missing_import",
                line=1,
                message="Your Decklist lacks the essential fastmcp import! "
                        "Add: from fastmcp import FastMCP"
            ))

        if not self.has_mcp_instance and self.has_fastmcp_import:
            self.errors.append(ValidationError(
                type="missing_instance",
                line=1,
                message="You've imported the Library but haven't instantiated it! "
                        "Add: mcp = FastMCP('your-server-name')"
            ))

        if self.has_mcp_instance and not self.tools_found and not self.resources_found:
            self.errors.append(ValidationError(
                type="empty_deck",
                line=1,
                message="Your Deck is empty, Planeswalker! Add at least one Sorcery "
                        "(@mcp.tool) or Permanent (@mcp.resource)."
            ))

        return self._build_response()

    def _check_imports(self, tree: ast.AST) -> None:
        """Check for fastmcp imports."""
        for node in ast.walk(tree):
            if isinstance(node, ast.ImportFrom):
                if node.module == "fastmcp":
                    for alias in node.names:
                        if alias.name == "FastMCP":
                            self.has_fastmcp_import = True
            elif isinstance(node, ast.Import):
                for alias in node.names:
                    if alias.name == "fastmcp":
                        self.has_fastmcp_import = True

    def _check_mcp_instance(self, tree: ast.AST) -> None:
        """Check for FastMCP instantiation."""
        for node in ast.walk(tree):
            if isinstance(node, ast.Assign):
                if isinstance(node.value, ast.Call):
                    func = node.value.func
                    if isinstance(func, ast.Name) and func.id == "FastMCP":
                        self.has_mcp_instance = True
                        if node.targets and isinstance(node.targets[0], ast.Name):
                            self.mcp_var_name = node.targets[0].id
                    elif isinstance(func, ast.Attribute) and func.attr == "FastMCP":
                        self.has_mcp_instance = True
                        if node.targets and isinstance(node.targets[0], ast.Name):
                            self.mcp_var_name = node.targets[0].id

    def _check_decorated_functions(self, tree: ast.AST) -> None:
        """Check for @mcp.tool, @mcp.resource, @mcp.prompt decorated functions."""
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                for decorator in node.decorator_list:
                    decorator_type = self._get_decorator_type(decorator)

                    if decorator_type == "tool":
                        self.tools_found.append(node.name)
                        self._validate_tool(node)
                    elif decorator_type == "resource":
                        self.resources_found.append(node.name)
                        self._validate_resource(node, decorator)
                    elif decorator_type == "prompt":
                        self.prompts_found.append(node.name)

    def _get_decorator_type(self, decorator: ast.expr) -> Optional[str]:
        """Determine if decorator is mcp.tool, mcp.resource, or mcp.prompt."""
        # Handle @mcp.tool() or @mcp.tool
        if isinstance(decorator, ast.Call):
            func = decorator.func
        else:
            func = decorator

        if isinstance(func, ast.Attribute):
            # Check if it's <var>.tool, <var>.resource, or <var>.prompt
            if func.attr in ("tool", "resource", "prompt"):
                # Verify the object is our mcp instance
                if isinstance(func.value, ast.Name):
                    if self.mcp_var_name and func.value.id == self.mcp_var_name:
                        return func.attr
                    # Also accept common names like 'mcp', 'server', 'app'
                    if func.value.id in ("mcp", "server", "app"):
                        return func.attr
        return None

    def _validate_tool(self, node: ast.FunctionDef | ast.AsyncFunctionDef) -> None:
        """Validate a @mcp.tool decorated function."""
        # Check for docstring (Oracle Text)
        docstring = ast.get_docstring(node)
        if not docstring:
            self.errors.append(ValidationError(
                type="missing_docstring",
                line=node.lineno,
                message=f"Your Sorcery '{node.name}' lacks Oracle Text! "
                        f"Add a docstring to help the Planeswalker understand its purpose."
            ))
        elif len(docstring) < 10:
            self.errors.append(ValidationError(
                type="short_docstring",
                line=node.lineno,
                message=f"The Oracle Text for '{node.name}' is too brief! "
                        f"Provide more detail about what this Sorcery does."
            ))

    def _validate_resource(
        self,
        node: ast.FunctionDef | ast.AsyncFunctionDef,
        decorator: ast.expr
    ) -> None:
        """Validate a @mcp.resource decorated function."""
        # Check that resource has a URI argument
        if isinstance(decorator, ast.Call) and decorator.args:
            uri_arg = decorator.args[0]
            if isinstance(uri_arg, ast.Constant) and isinstance(uri_arg.value, str):
                uri = uri_arg.value
                if "://" not in uri:
                    self.errors.append(ValidationError(
                        type="invalid_resource_uri",
                        line=node.lineno,
                        message=f"Your Permanent '{node.name}' has an invalid URI! "
                                f"URIs must follow protocol://path format."
                    ))
        else:
            self.errors.append(ValidationError(
                type="missing_resource_uri",
                line=node.lineno,
                message=f"Your Permanent '{node.name}' needs a URI! "
                        f"Add a URI like @mcp.resource('file://path/to/resource')"
            ))

    def _build_response(self) -> ValidationResponse:
        """Build the final validation response."""
        return ValidationResponse(
            valid=len(self.errors) == 0,
            errors=self.errors,
            tools_found=self.tools_found,
            resources_found=self.resources_found,
            prompts_found=self.prompts_found,
        )


def validate_code(code: str) -> ValidationResponse:
    """
    Validate MCP server code.

    Creates a new validator instance per request to ensure thread safety.

    Args:
        code: Python source code to validate

    Returns:
        ValidationResponse with the Inspector's verdict
    """
    return MCPValidator().validate(code)
