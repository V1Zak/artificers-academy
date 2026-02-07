# Actions vs Data

In Level 1, you built tools -- functions that do something when called. But MCP has another important concept: **resources**. Understanding the difference between tools and resources is key to building better servers.

## Tools: Things That Do Something

A tool is an action. When the AI calls a tool, something happens: a calculation runs, a message is sent, data is created or changed. You have already built two tools (`greet` and `add_numbers`).

Tools are like buttons. You press them, and something happens.

**Examples of tools:**
- Send an email
- Calculate a total
- Create a new file
- Convert a temperature

## Resources: Data That Already Exists

A resource is a piece of information that already exists and just needs to be read. Resources do not change anything -- they simply share data. Think of them as read-only files that the AI can look at whenever it needs information.

Resources are like documents in a filing cabinet. They are just sitting there, ready to be read.

**Examples of resources:**
- A list of files in a folder
- The contents of a configuration file
- A company's contact information
- Today's menu at a restaurant

## How Resources Work

Each resource has a unique address called a URI (like a web address). When the AI needs the data, it requests the resource by its URI, and your server sends back the contents.

For example, a resource at `file:///documents/readme.txt` would return the contents of that file. A resource at `config://settings` might return your application's settings.

## Why Both?

Having both tools and resources makes your server clearer and safer:

- **Resources** are always safe to call because they only read data, never change it
- **Tools** can have side effects (like sending a message or writing a file), so the AI and the user know to be more careful with them

This separation also helps the AI make better decisions about what to use and when.

## What You Will Build

In this level, you will build a file server with both tools and resources. Resources will list available files and share their contents. This will give you a solid understanding of both concepts and how they work together.
