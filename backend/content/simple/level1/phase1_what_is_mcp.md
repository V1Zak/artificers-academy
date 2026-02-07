# What is MCP?

AI assistants like Claude are great at understanding language and generating text. But on their own, they can't do things like check the weather, read your files, or look up information in a database. They are limited to what they already know.

**MCP** (Model Context Protocol) is a way to give an AI new abilities. Think of it like adding apps to your phone. Your phone can make calls out of the box, but you install apps to do more -- order food, check your bank balance, or play games. MCP works the same way for AI.

## How It Works

MCP has three parts:

1. **The Server** -- This is what you will build. It is a small program that offers one or more "tools" for an AI to use. For example, a tool that looks up a word's definition, or a tool that fetches the latest stock price.

2. **The Client** -- This is the application the AI lives inside, like Claude Desktop. The client knows how to discover and call the tools your server offers.

3. **The AI** -- When a user asks a question, the AI decides whether it needs to use a tool. If it does, it asks the client to call your server, gets the result, and uses it to answer the question.

## A Simple Example

Imagine you ask Claude: "What is the current weather in Tokyo?"

Without MCP, Claude would say it does not have access to live weather data. With an MCP weather server connected, Claude can call a `get_weather` tool, receive the current temperature and conditions, and give you an accurate answer.

## Why This Matters

MCP is an open standard created by Anthropic. That means anyone can build servers, and any AI client that supports MCP can use them. You build a tool once, and it works everywhere.

## What You Will Build

In this first level, you will build a simple server with one tool. By the end, you will have it connected to Claude Desktop and working. No prior server experience is needed -- we will walk through every step together.

Let's get started.
