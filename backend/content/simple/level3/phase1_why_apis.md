# Why Connect to APIs?

So far, your servers have worked with local data -- greeting messages, math, and files on your computer. But some of the most useful tools need **live data from the internet**. That is where APIs come in.

## What is an API?

API stands for Application Programming Interface. It is a way for one program to request information from another over the internet. When you check the weather on your phone, the app sends a request to a weather API, which sends back the current conditions.

APIs are everywhere:
- Weather services provide temperature and forecasts
- News services provide headlines
- Maps services provide directions
- Stock services provide market prices

## Why This is Powerful for AI

Without APIs, an AI can only work with information it already has -- and that information has a cutoff date. By connecting an MCP server to APIs, you give the AI access to information that is updated in real time.

Imagine asking Claude: "What is the weather in Paris right now?" Without an API connection, Claude cannot answer accurately. With your MCP weather tool connected, Claude calls the tool, which calls the weather API, and returns a fresh answer.

## How It Works

The flow looks like this:

1. The user asks Claude a question
2. Claude decides it needs live data and calls your MCP tool
3. Your tool sends a request to an external API (like a weather service)
4. The API sends back data (temperature, conditions, etc.)
5. Your tool formats the data and returns it to Claude
6. Claude uses the data to answer the user's question

Your MCP server acts as a bridge between the AI and the outside world.

## What is "Async"?

When your server calls an API over the internet, it takes time -- maybe a few hundred milliseconds, maybe a few seconds. During that wait, your server could be handling other requests instead of just sitting idle.

**Async** (short for asynchronous) programming lets your server do other work while waiting for an API response. We will use Python's `async` and `await` keywords to make this happen. Do not worry if this is new to you -- it is simpler than it sounds, and we will walk through it step by step.

## What You Will Build

In this level, you will create a server with two API-connected tools: one for weather data and one for news headlines. You will learn how to make API requests, handle errors, and cache results to avoid making too many requests.
