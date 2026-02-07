# Resources vs Tools

## Two Primitives, Different Control Models

MCP defines two primary data-exchange primitives: **tools** and **resources**. While both allow a server to expose functionality, they differ fundamentally in who controls invocation.

## Tools: Model-Controlled

Tools are functions that the LLM decides to invoke based on conversation context. The model reads the tool's JSON Schema and description, determines that the tool is relevant, and generates a `tools/call` request.

Key characteristics:
- **Invoked by the model** during inference
- **Perform actions**: API calls, computations, side effects
- **Require user approval** in most host implementations
- **Dynamic arguments**: the model generates parameters per invocation

```python
@mcp.tool()
async def get_card(card_name: str) -> str:
    """Look up a card by name."""
    # Model decides when to call this
```

## Resources: Application-Controlled

Resources are read-only data endpoints that the host application (not the model) exposes to the LLM. They are identified by URIs and return structured content. The host decides which resources to include in the LLM's context.

Key characteristics:
- **Controlled by the application** (host), not the model
- **Read-only**: no side effects, no mutations
- **URI-addressable**: each resource has a unique identifier
- **Stable content**: suitable for inclusion in system prompts

```python
@mcp.resource("file://docs/{filename}")
async def read_doc(filename: str) -> str:
    """Read a document from the docs directory."""
    # Application decides when to surface this
```

## When to Use Which

| Use Case | Primitive | Reason |
|----------|-----------|--------|
| Fetch live data from an API | Tool | Dynamic, has side effects (network call) |
| Expose a configuration file | Resource | Static data, read-only |
| Run a database query | Tool | Action with dynamic parameters |
| List available files | Resource | Directory structure is stable data |
| Send an email | Tool | Side effect (mutation) |
| Read a specific file by path | Resource | URI-addressable read-only access |

## Protocol Differences

The JSON-RPC methods differ:

**Tool discovery and invocation:**
```
tools/list     → Returns available tools with schemas
tools/call     → Executes a specific tool with arguments
```

**Resource discovery and reading:**
```
resources/list      → Returns available resources with URIs
resources/read      → Reads a specific resource by URI
resources/templates/list → Returns URI templates for dynamic resources
```

## Resource URI Schemes

Resource URIs follow standard URI conventions. Common schemes include:

- `file://path/to/resource` - Filesystem resources
- `db://table/record` - Database records
- `config://settings` - Application configuration

FastMCP uses URI templates (RFC 6570) to define parameterized resource paths. The template `file://docs/{filename}` matches any URI of the form `file://docs/readme.txt`.

## The Subscription Model

Resources support a change notification mechanism. When a resource's content changes, the server can emit a `notifications/resources/updated` message. Clients that have subscribed to that resource URI will re-read the data. This is useful for live-updating dashboards or configuration that changes at runtime.

## Building a Resource Server

In the following phases, you will build a filesystem resource provider that:

1. Lists files in a directory via a resource
2. Reads file contents via URI-addressed resources
3. Prevents directory traversal attacks with path validation
4. Integrates with Claude Desktop for resource discovery

This pattern is directly applicable to building documentation servers, config managers, and data catalogs.
