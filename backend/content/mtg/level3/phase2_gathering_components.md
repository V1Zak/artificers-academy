# Phase 2: Gathering Components

*"Every great spell requires the right components, measured precisely."*

---

## Creating the Aether Conduit Project

Let's build the foundation for your API-connected MCP server.

### Project Structure

Our finished project will look like:

```
aether-conduit/
├── server.py           # Your MCP server
├── pyproject.toml      # Dependencies
├── .env                # API keys (never commit!)
└── .env.example        # Template for others
```

---

## Step 1: Initialize the Project

```bash
# Create project directory
mkdir aether-conduit
cd aether-conduit

# Initialize with uv
uv init

# Add dependencies
uv add "fastmcp[cli]" httpx python-dotenv
```

Your dependencies:
- **fastmcp** - The MCP framework
- **httpx** - Async HTTP client for API calls
- **python-dotenv** - Load environment variables from .env files

---

## Step 2: Get Your API Keys

### OpenWeatherMap

1. Go to https://openweathermap.org/api
2. Click "Sign Up" and create a free account
3. After email verification, go to "API Keys" in your profile
4. Copy your default API key

> **Note:** New API keys may take up to 2 hours to activate.

### NewsAPI (Optional)

1. Go to https://newsapi.org/
2. Click "Get API Key" and register
3. Copy your API key from the dashboard

If you skip NewsAPI, we'll provide a fallback implementation.

---

## Step 3: Create Environment Files

Create `.env` with your actual keys:

```bash
# .env - Your actual API keys (NEVER commit this file!)
OPENWEATHER_API_KEY=your_actual_key_here
NEWS_API_KEY=your_actual_key_here
```

Create `.env.example` as a template for others:

```bash
# .env.example - Template for environment variables
OPENWEATHER_API_KEY=your_openweathermap_api_key
NEWS_API_KEY=your_newsapi_key
```

---

## Step 4: Add .gitignore

Create or update `.gitignore`:

```
# Environment files with secrets
.env
.env.local
.env.*.local

# Python
__pycache__/
*.py[cod]
.venv/

# IDE
.idea/
.vscode/
*.swp
```

---

## Step 5: Create the Server Skeleton

Create `server.py`:

```python
from fastmcp import FastMCP
import httpx
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Create the server - The Aether Conduit
mcp = FastMCP("Aether Conduit")

# API Configuration
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5"

NEWS_API_KEY = os.getenv("NEWS_API_KEY")
NEWS_API_BASE_URL = "https://newsapi.org/v2"

# Validate required keys
if not OPENWEATHER_API_KEY:
    print("Warning: OPENWEATHER_API_KEY not set. Weather features will be disabled.")

if not NEWS_API_KEY:
    print("Warning: NEWS_API_KEY not set. News features will be disabled.")


if __name__ == "__main__":
    mcp.run()
```

---

## Step 6: Test API Access Directly

Before integrating with MCP, verify your API keys work.

### Test OpenWeatherMap

Create a test script `test_apis.py`:

```python
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

def test_weather():
    api_key = os.getenv("OPENWEATHER_API_KEY")
    if not api_key:
        print("No OPENWEATHER_API_KEY found")
        return

    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        "q": "London",
        "appid": api_key,
        "units": "metric"
    }

    response = httpx.get(url, params=params, timeout=10)
    print(f"Weather API Status: {response.status_code}")

    if response.status_code == 200:
        data = response.json()
        print(f"Temperature in London: {data['main']['temp']}°C")
    else:
        print(f"Error: {response.text}")


def test_news():
    api_key = os.getenv("NEWS_API_KEY")
    if not api_key:
        print("No NEWS_API_KEY found (optional)")
        return

    url = "https://newsapi.org/v2/top-headlines"
    params = {
        "country": "us",
        "apiKey": api_key
    }

    response = httpx.get(url, params=params, timeout=10)
    print(f"News API Status: {response.status_code}")

    if response.status_code == 200:
        data = response.json()
        print(f"Found {data['totalResults']} articles")
    else:
        print(f"Error: {response.text}")


if __name__ == "__main__":
    print("Testing OpenWeatherMap...")
    test_weather()
    print("\nTesting NewsAPI...")
    test_news()
```

Run the tests:

```bash
uv run python test_apis.py
```

Expected output:
```
Testing OpenWeatherMap...
Weather API Status: 200
Temperature in London: 15.2°C

Testing NewsAPI...
News API Status: 200
Found 38 articles
```

---

## Understanding httpx

Let's break down how we use httpx:

### Basic GET Request

```python
import httpx

# Simple synchronous request
response = httpx.get("https://api.example.com/data")
data = response.json()
```

### With Parameters

```python
response = httpx.get(
    "https://api.example.com/search",
    params={"q": "magic", "limit": 10}
)
# URL becomes: https://api.example.com/search?q=magic&limit=10
```

### With Headers (for authentication)

```python
response = httpx.get(
    "https://api.example.com/data",
    headers={"Authorization": f"Bearer {API_KEY}"}
)
```

### Async Version

```python
async with httpx.AsyncClient() as client:
    response = await client.get("https://api.example.com/data")
```

---

## Environment Variables Best Practices

### Loading with python-dotenv

```python
from dotenv import load_dotenv
import os

# Load .env file (call early in your script)
load_dotenv()

# Access variables
api_key = os.getenv("API_KEY")

# With default value
timeout = os.getenv("TIMEOUT", "30")

# Required (fails if missing)
required_key = os.environ["REQUIRED_KEY"]  # Raises KeyError if missing
```

### Validation Pattern

```python
def validate_config():
    """Validate all required environment variables."""
    required = ["OPENWEATHER_API_KEY"]
    optional = ["NEWS_API_KEY"]

    missing = [key for key in required if not os.getenv(key)]
    if missing:
        raise ValueError(f"Missing required environment variables: {missing}")

    for key in optional:
        if not os.getenv(key):
            print(f"Optional key {key} not set - some features disabled")
```

---

## Project Checklist

Before proceeding, verify:

- [ ] `aether-conduit/` directory created
- [ ] `pyproject.toml` with all dependencies
- [ ] `.env` file with at least OPENWEATHER_API_KEY
- [ ] `.env.example` template file
- [ ] `.gitignore` excluding `.env`
- [ ] `server.py` skeleton with environment loading
- [ ] API test script runs successfully

---

## Troubleshooting

### "API Key Invalid" Error

- New OpenWeatherMap keys take up to 2 hours to activate
- Ensure no extra spaces in your `.env` file
- Verify you copied the full key

### "Module not found" Errors

```bash
# Reinstall dependencies
uv sync
```

### Environment Variables Not Loading

- Ensure `load_dotenv()` is called before `os.getenv()`
- Verify `.env` is in the same directory as your script
- Check for typos in variable names

---

## What's Next?

Your components are gathered, your mana sources are prepared. In Phase 3, you'll create your first API-connected tool: the Weather Divination spell.

*"The components are assembled. Now we begin the enchantment."*

---

**Phase Complete!**

Your Aether Conduit project is set up with API access. Proceed to Phase 3 to create the weather tool.
