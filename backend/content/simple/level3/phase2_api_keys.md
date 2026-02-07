# Getting API Keys

Most APIs require an **API key** -- a unique code that identifies you and lets the service track usage. Think of it like a library card: you need one to borrow books, and the library uses it to keep track of who has what.

## Step 1: Create Your Project

```bash
mkdir api-server
cd api-server
uv init
uv add "fastmcp[cli]" httpx python-dotenv
```

We are adding two new packages:
- **httpx** -- A modern library for making web requests from Python
- **python-dotenv** -- A tool for loading secret values (like API keys) from a file

## Step 2: Get a Weather API Key

We will use **OpenWeatherMap**, which has a free tier:

1. Go to [openweathermap.org](https://openweathermap.org/) and create a free account
2. After signing in, go to "API keys" in your profile
3. You will see a default key, or you can generate a new one
4. Copy the key -- it will look something like `a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4`

> **Note:** New API keys can take up to 2 hours to activate. If you get errors later, wait a bit and try again.

## Step 3: Get a News API Key

We will use **NewsAPI** for headlines:

1. Go to [newsapi.org](https://newsapi.org/) and create a free account
2. Your API key will be shown on the dashboard after signing in
3. Copy this key as well

## Step 4: Store Your Keys Safely

Create a file called `.env` in your project folder:

```
OPENWEATHER_API_KEY=your_weather_key_here
NEWS_API_KEY=your_news_key_here
```

Replace the placeholder values with your actual keys.

**Important:** Never share your API keys publicly or include them directly in your code. The `.env` file keeps them separate from your code, and you should add `.env` to your `.gitignore` file if you use version control.

## Step 5: Start Your Server File

Create `server.py`:

```python
import os
from dotenv import load_dotenv
from fastmcp import FastMCP

load_dotenv()

mcp = FastMCP("API Server")

WEATHER_KEY = os.getenv("OPENWEATHER_API_KEY")
NEWS_KEY = os.getenv("NEWS_API_KEY")
```

The `load_dotenv()` function reads your `.env` file, and `os.getenv()` retrieves each value. If the `.env` file is missing or a key is not set, the variable will be `None` -- we will handle that with error messages later.

Your project is now ready. Next, we will build the weather tool.
