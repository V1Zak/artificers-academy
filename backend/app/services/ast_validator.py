"""
The Inspector - AST Validation Service

This service analyzes Python code using Abstract Syntax Trees to validate
that MCP server code follows the correct patterns:
- fastmcp import present
- @mcp.tool() decorators with docstrings (Oracle Text)
- @mcp.resource() decorators with valid URIs
- @mcp.prompt() decorators
- async function patterns for I/O operations
- httpx usage for API calls
- Caching patterns
- Path security validation
"""

import ast
import re
from typing import Optional
from app.models.schemas import ValidationError, ValidationResponse


class MCPValidator:
    """
    The Inspector Engine - validates MCP server code.

    Checks for:
    - fastmcp import
    - FastMCP instantiation
    - @mcp.tool() decorated functions with docstrings
    - @mcp.resource() decorated functions with valid URIs
    - @mcp.prompt() decorated functions
    - Level-specific requirements (async, httpx, caching, security)
    """

    def __init__(self, level: Optional[str] = None):
        """
        Initialize the validator.

        Args:
            level: Optional level identifier for level-specific validation
                   (e.g., "level2", "level3", "level4")
        """
        self.level = level
        self.errors: list[ValidationError] = []
        self.warnings: list[ValidationError] = []
        self.tools_found: list[str] = []
        self.resources_found: list[str] = []
        self.prompts_found: list[str] = []
        self.has_fastmcp_import = False
        self.has_mcp_instance = False
        self.has_httpx_import = False
        self.has_async_client = False
        self.has_caching = False
        self.has_path_validation = False
        self.mcp_var_name: Optional[str] = None

    def validate(self, code: str, level: Optional[str] = None) -> ValidationResponse:
        """
        Validate the submitted code and return the Inspector's verdict.

        Args:
            code: Python source code to validate
            level: Optional level override for validation rules

        Returns:
            ValidationResponse with validity status and any errors found
        """
        # Reset state
        self.level = level or self.level
        self.errors = []
        self.warnings = []
        self.tools_found = []
        self.resources_found = []
        self.prompts_found = []
        self.has_fastmcp_import = False
        self.has_mcp_instance = False
        self.has_httpx_import = False
        self.has_async_client = False
        self.has_caching = False
        self.has_path_validation = False
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
        self._check_level_specific(tree, code)

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
        """Check for required imports."""
        for node in ast.walk(tree):
            if isinstance(node, ast.ImportFrom):
                if node.module == "fastmcp":
                    for alias in node.names:
                        if alias.name == "FastMCP":
                            self.has_fastmcp_import = True
                elif node.module == "httpx" or (node.module and "httpx" in node.module):
                    self.has_httpx_import = True
            elif isinstance(node, ast.Import):
                for alias in node.names:
                    if alias.name == "fastmcp":
                        self.has_fastmcp_import = True
                    elif alias.name == "httpx":
                        self.has_httpx_import = True

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

        # Level 3+: Check for async when using HTTP calls
        if self.level in ("level3", "level4"):
            if not isinstance(node, ast.AsyncFunctionDef):
                # Check if function uses httpx
                for subnode in ast.walk(node):
                    if isinstance(subnode, ast.Attribute):
                        if subnode.attr in ("get", "post", "put", "delete", "request"):
                            self.warnings.append(ValidationError(
                                type="sync_http_call",
                                line=node.lineno,
                                message=f"Your Sorcery '{node.name}' uses HTTP calls but is not async! "
                                        f"Consider using 'async def' for non-blocking I/O."
                            ))
                            break

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
                # Check for URI template parameters
                if "{" in uri and "}" in uri:
                    # Verify function has matching parameters
                    template_params = re.findall(r'\{(\w+)\}', uri)
                    func_params = [arg.arg for arg in node.args.args]
                    for param in template_params:
                        if param not in func_params:
                            self.errors.append(ValidationError(
                                type="uri_param_mismatch",
                                line=node.lineno,
                                message=f"URI template parameter '{{{param}}}' has no matching "
                                        f"function parameter in '{node.name}'."
                            ))
        else:
            self.errors.append(ValidationError(
                type="missing_resource_uri",
                line=node.lineno,
                message=f"Your Permanent '{node.name}' needs a URI! "
                        f"Add a URI like @mcp.resource('file://path/to/resource')"
            ))

        # Check for docstring on resources too
        docstring = ast.get_docstring(node)
        if not docstring:
            self.warnings.append(ValidationError(
                type="missing_resource_docstring",
                line=node.lineno,
                message=f"Your Permanent '{node.name}' lacks Oracle Text! "
                        f"Consider adding a docstring for discoverability."
            ))

    def _check_level_specific(self, tree: ast.AST, code: str) -> None:
        """Check level-specific requirements."""
        if self.level == "level2":
            self._check_level2_requirements(tree, code)
        elif self.level == "level3":
            self._check_level3_requirements(tree, code)
        elif self.level == "level4":
            self._check_level4_requirements(tree, code)

    def _check_level2_requirements(self, tree: ast.AST, code: str) -> None:
        """
        Level 2 specific checks:
        - At least one resource with URI template
        - Path validation function present
        """
        # Check for resources with URI templates
        has_template_resource = False
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                for decorator in node.decorator_list:
                    if self._get_decorator_type(decorator) == "resource":
                        if isinstance(decorator, ast.Call) and decorator.args:
                            uri_arg = decorator.args[0]
                            if isinstance(uri_arg, ast.Constant) and "{" in str(uri_arg.value):
                                has_template_resource = True
                                break

        if not has_template_resource and self.resources_found:
            self.warnings.append(ValidationError(
                type="no_uri_template",
                line=1,
                message="Your Archive lacks URI templates! Consider adding dynamic resources "
                        "with parameters like @mcp.resource('archive://spells/{category}')."
            ))

        # Check for path validation (security)
        security_patterns = [
            "is_relative_to",
            "resolve()",
            ".." in code and "not" in code,  # Checking for path traversal
            "is_safe_path",
        ]
        has_security = any(
            pattern in code if isinstance(pattern, str) else pattern
            for pattern in security_patterns
        )

        if self.resources_found and not has_security:
            self.warnings.append(ValidationError(
                type="missing_path_security",
                line=1,
                message="Your Archive lacks path security! Add validation to prevent "
                        "path traversal attacks (e.g., checking for '..' in paths)."
            ))
        else:
            self.has_path_validation = True

    def _check_level3_requirements(self, tree: ast.AST, code: str) -> None:
        """
        Level 3 specific checks:
        - httpx import present
        - AsyncClient usage
        - At least one async tool
        - Caching pattern present
        """
        # Check for httpx
        if not self.has_httpx_import:
            self.errors.append(ValidationError(
                type="missing_httpx",
                line=1,
                message="Your Aetheric Conduit lacks httpx! Add: import httpx"
            ))

        # Check for async tools
        has_async_tool = False
        for node in ast.walk(tree):
            if isinstance(node, ast.AsyncFunctionDef):
                for decorator in node.decorator_list:
                    if self._get_decorator_type(decorator) == "tool":
                        has_async_tool = True
                        break

        if self.tools_found and not has_async_tool:
            self.errors.append(ValidationError(
                type="no_async_tools",
                line=1,
                message="Your API tools should use async! Change 'def' to 'async def' "
                        "for non-blocking I/O operations."
            ))

        # Check for AsyncClient usage
        async_client_patterns = ["AsyncClient", "async with httpx"]
        if any(pattern in code for pattern in async_client_patterns):
            self.has_async_client = True
        elif self.has_httpx_import:
            self.warnings.append(ValidationError(
                type="no_async_client",
                line=1,
                message="Consider using httpx.AsyncClient() for async HTTP requests. "
                        "Use 'async with httpx.AsyncClient() as client:' pattern."
            ))

        # Check for caching
        caching_patterns = ["_cache", "get_cached", "set_cached", "cache[", "lru_cache"]
        if any(pattern in code for pattern in caching_patterns):
            self.has_caching = True
        else:
            self.warnings.append(ValidationError(
                type="no_caching",
                line=1,
                message="Your Conduit lacks a Memory Stone! Consider adding caching "
                        "to reduce API calls and respect rate limits."
            ))

        # Check for error handling
        has_try_except = any(isinstance(node, ast.Try) for node in ast.walk(tree))
        if not has_try_except:
            self.warnings.append(ValidationError(
                type="no_error_handling",
                line=1,
                message="Your tools lack error handling! Wrap API calls in try/except "
                        "to handle timeouts and failures gracefully."
            ))

    def _check_level4_requirements(self, tree: ast.AST, code: str) -> None:
        """
        Level 4 specific checks:
        - SSE transport configuration
        - Health check endpoint
        - Proper command-line argument handling
        """
        # Check for transport configuration
        transport_patterns = ["transport=", '"sse"', "'sse'", "--transport"]
        has_transport_config = any(pattern in code for pattern in transport_patterns)

        if not has_transport_config:
            self.warnings.append(ValidationError(
                type="no_transport_config",
                line=1,
                message="Your server lacks transport configuration! Add support for "
                        "SSE transport: mcp.run(transport='sse', host='0.0.0.0', port=8080)"
            ))

        # Check for health check resource
        health_patterns = ["health://", "health_check", "health_status", "/health"]
        has_health_check = any(pattern in code for pattern in health_patterns)

        if not has_health_check:
            self.warnings.append(ValidationError(
                type="no_health_check",
                line=1,
                message="Your production server lacks a health check! Add a resource "
                        "like @mcp.resource('health://status') for monitoring."
            ))

        # Check for argument parsing (for production flexibility)
        argparse_patterns = ["argparse", "ArgumentParser", "add_argument"]
        has_argparse = any(pattern in code for pattern in argparse_patterns)

        env_patterns = ["os.getenv", "os.environ", "dotenv"]
        has_env_config = any(pattern in code for pattern in env_patterns)

        if not has_argparse and not has_env_config:
            self.warnings.append(ValidationError(
                type="hardcoded_config",
                line=1,
                message="Your server has hardcoded configuration! Use environment variables "
                        "or argparse for production flexibility."
            ))

        # Also run Level 3 checks (Level 4 builds on Level 3)
        self._check_level3_requirements(tree, code)

    def _build_response(self) -> ValidationResponse:
        """Build the final validation response."""
        return ValidationResponse(
            valid=len(self.errors) == 0,
            errors=self.errors,
            warnings=self.warnings,
            tools_found=self.tools_found,
            resources_found=self.resources_found,
            prompts_found=self.prompts_found,
            has_async=self.has_async_client,
            has_caching=self.has_caching,
            has_security=self.has_path_validation,
        )


def validate_code(code: str, level: Optional[str] = None) -> ValidationResponse:
    """
    Validate MCP server code.

    Creates a new validator instance per request to ensure thread safety.

    Args:
        code: Python source code to validate
        level: Optional level for level-specific validation rules

    Returns:
        ValidationResponse with the Inspector's verdict
    """
    return MCPValidator(level=level).validate(code)
