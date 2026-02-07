# What is Deployment?

Everything you have built so far runs on your own computer. When you close the terminal, the server stops. Nobody else can use it. **Deployment** means putting your server on a computer in the cloud that runs 24/7, so anyone with permission can connect to it.

## Local vs Remote

Right now, your MCP server communicates with Claude Desktop through something called **stdio** (standard input/output). This is like two people passing notes back and forth while sitting at the same desk. It is fast and simple, but it only works when both programs are on the same computer.

To make your server accessible over the internet, you need a different communication method called **SSE** (Server-Sent Events). SSE works over HTTP -- the same technology that powers websites. This means your server can run on a computer in a data center, and Claude Desktop can connect to it from anywhere.

**Stdio (local):** Your computer runs both the server and Claude Desktop. They talk directly.

**SSE (remote):** A cloud computer runs the server. Claude Desktop connects to it over the internet.

## What is Docker?

When you run your server on your own computer, all the right software is already installed. But a cloud computer starts with nothing. You need a way to package your server along with everything it needs -- Python, your libraries, your code, your configuration -- into a single bundle.

**Docker** does exactly that. It creates a "container" (think of it as a lightweight virtual computer) that includes your code and all its dependencies. You build the container once, and it runs the same way everywhere -- on your computer, on a cloud server, on your coworker's laptop.

## What is Railway?

You need somewhere to put your Docker container. **Railway** is a cloud platform that makes this easy. You upload your project, Railway builds the container, and your server starts running on the internet with a public URL.

Other platforms like Heroku, Fly.io, and AWS work too, but Railway has a generous free tier and a simple interface.

## The Plan

In this level, you will:
1. Create a Docker configuration for your server
2. Change your server to use SSE instead of stdio
3. Deploy it to Railway
4. Connect Claude Desktop to your cloud server

By the end, you will have a server running on the internet that you (or anyone you share the URL with) can connect to from anywhere.
