# Production Readiness

## Beyond Deployment

Deploying a server is not the same as running it in production. This phase covers the operational concerns that distinguish a deployed server from a production-ready one.

## Health Check Endpoints

Add a health check endpoint that monitoring systems can poll:

```python
from starlette.responses import JSONResponse

@mcp.custom_route("/health", methods=["GET"])
async def health_check(request):
    """Health check endpoint for load balancers and monitoring.

    Returns 200 if the server is operational, 503 if degraded.
    """
    # Check critical dependencies
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get("https://api.openweathermap.org/data/2.5/weather?q=London&appid=" + OPENWEATHER_API_KEY)
            api_healthy = resp.status_code == 200
    except Exception:
        api_healthy = False

    status = {
        "status": "healthy" if api_healthy else "degraded",
        "server": "operational",
        "api_connectivity": api_healthy,
    }

    code = 200 if api_healthy else 503
    return JSONResponse(status, status_code=code)
```

Configure your deployment platform to poll `/health` at regular intervals (30-60 seconds).

## Structured Logging

Replace `print()` statements with structured logging:

```python
import logging
import json

# Configure JSON-formatted logging for production.
# JSON logs are parseable by log aggregation services
# (Datadog, CloudWatch, Loki, etc.)
logging.basicConfig(
    level=logging.INFO,
    format='{"time":"%(asctime)s","level":"%(levelname)s","message":"%(message)s"}'
)
logger = logging.getLogger(__name__)

@mcp.tool()
async def get_weather(city: str) -> str:
    logger.info(f"Weather request for city={city}")
    # ...
    logger.info(f"Weather response for city={city} status={response.status_code}")
```

Log at appropriate levels:
- `INFO`: Normal operations (request received, response sent)
- `WARNING`: Recoverable issues (cache miss, retry attempt)
- `ERROR`: Failures (API timeout, invalid configuration)

## Authentication

MCP does not define an authentication mechanism. For production SSE servers, implement authentication at the HTTP layer:

```python
from starlette.middleware.base import BaseHTTPMiddleware

class APIKeyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        # Skip auth for health checks
        if request.url.path == "/health":
            return await call_next(request)

        api_key = request.headers.get("Authorization")
        expected = os.getenv("MCP_API_KEY")

        if not api_key or api_key != f"Bearer {expected}":
            return JSONResponse(
                {"error": "Unauthorized"},
                status_code=401
            )

        return await call_next(request)
```

Clients include the key in the SSE connection headers. Note that not all MCP clients support custom headers yet; check your client's documentation.

## Rate Limiting

Protect against abuse with per-client rate limiting:

```python
from collections import defaultdict
import time

# Simple sliding window rate limiter
_request_counts: dict[str, list[float]] = defaultdict(list)
RATE_LIMIT = 60          # Max requests
RATE_WINDOW = 60.0       # Per time window (seconds)

def check_rate_limit(client_id: str) -> bool:
    """Return True if the request is within rate limits."""
    now = time.time()
    window_start = now - RATE_WINDOW

    # Remove expired entries
    _request_counts[client_id] = [
        t for t in _request_counts[client_id] if t > window_start
    ]

    if len(_request_counts[client_id]) >= RATE_LIMIT:
        return False

    _request_counts[client_id].append(now)
    return True
```

## Scaling Considerations

MCP SSE servers maintain long-lived connections. Consider these factors when scaling:

- **Connection limits**: Each SSE client holds an open HTTP connection. Monitor the `max open files` ulimit.
- **Horizontal scaling**: Use sticky sessions (session affinity) if running behind a load balancer, since SSE streams are stateful.
- **Memory**: In-memory caches are per-instance. For shared caching across instances, use Redis.
- **Graceful shutdown**: Handle SIGTERM to close SSE connections cleanly before the process exits.

## Production Checklist

| Category | Item | Status |
|----------|------|--------|
| Security | Non-root container user | Required |
| Security | API keys in environment variables | Required |
| Security | Authentication on SSE endpoints | Recommended |
| Reliability | Health check endpoint | Required |
| Reliability | Structured logging | Required |
| Reliability | Restart policy configured | Required |
| Performance | Response caching | Recommended |
| Performance | HTTP client timeouts | Required |
| Operations | Log aggregation | Recommended |
| Operations | Error alerting | Recommended |

## Curriculum Complete

You have progressed from MCP fundamentals through resource providers, API integration, and production deployment. The skills covered in these four modules provide the foundation for building production-grade MCP servers that extend LLM capabilities with custom tools and data sources.

For further learning, consult the MCP specification at https://spec.modelcontextprotocol.io and the FastMCP documentation.
