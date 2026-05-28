# MCP_Creation - FastMCP DataServer

A simple yet powerful [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server built with [FastMCP](https://github.com/jlowin/fastmcp) (Python).

---

## What is MCP?

The **Model Context Protocol (MCP)** is an open standard that allows AI assistants (like Claude, GPT, or OpenCode) to connect to external data sources, tools, and services. Think of it as a "USB-C for AI applications" — a universal way for AI to interact with your code, databases, APIs, and local files.

An MCP server exposes three types of capabilities to AI clients:

| Capability | Description | Example |
|------------|-------------|---------|
| **Resource** | Read-only data that the AI can fetch | `resource://greeting` returns "Hello from FastMCP" |
| **Prompt** | Pre-defined templates the AI can use | `review_test_case` generates a structured QA review |
| **Tool** | Functions the AI can call to perform actions | `add(2, 3)` returns `5` |

---

## Project Structure

```
MCP_Creation/
├── server.py           # Main FastMCP server (DataServer)
├── requirements.txt    # Python dependencies
└── README.md           # This file
```

---

## Installation

1. Ensure Python 3.10+ is installed:
   ```bash
   python --version
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

   The main dependency is `fastmcp` (v3.x), which provides a high-level, decorator-based API for building MCP servers.

---

## Server Components Explained

### 1. Resource: `resource://greeting`

```python
@mcp.resource("resource://greeting")
def greeting() -> str:
    """Returns greeting"""
    return "Hello from FastMCP"
```

**What it does:**
- Exposes a read-only data endpoint at URI `resource://greeting`
- When an AI client requests this resource, it receives the greeting string
- Resources are ideal for static/dynamic data: configuration values, database queries, file contents, API responses

**How AI uses it:**
```
AI: "What does the greeting resource say?"
→ Fetches resource://greeting
→ Returns: "Hello from FastMCP"
```

---

### 2. Prompt: `review_test_case`

```python
@mcp.prompt
def review_test_case(test_case: str) -> str:
    """Review QA test case"""
    return f"""
Review this test case:
{test_case}

Check:
- Clarity
- Coverage
- Assertions
"""
```

**What it does:**
- Provides a reusable prompt template for reviewing QA test cases
- Accepts a `test_case` parameter and injects it into a structured review format
- Prompts help the AI maintain consistency and follow best practices

**How AI uses it:**
```
AI: "Review this test case using the review_test_case prompt"
→ Calls prompt with the test case text
→ AI receives structured review instructions to evaluate Clarity, Coverage, and Assertions
```

---

### 3. Tool: `add`

```python
@mcp.tool
def add(a: int, b: int) -> int:
    """Add two numbers"""
    return a + b
```

**What it does:**
- Exposes a callable function that the AI can execute
- Performs an action (computation) and returns the result
- Tools can do anything: calculations, API calls, database operations, file I/O

**How AI uses it:**
```
User: "What is 15 + 27?"
AI: "I'll use the add tool to calculate that."
→ Calls add(a=15, b=27)
→ Returns: 42
AI: "15 + 27 = 42"
```

---

## Running the Server

### Method 1: Direct execution (stdio transport)

```bash
cd E:\AI\Projects\24May_MCP\MCP_Creation
python server.py
```

By default, `mcp.run()` starts the server using **stdio** (standard input/output), which is the most common transport for local MCP servers.

### Method 2: SSE (Server-Sent Events) transport

```python
if __name__ == "__main__":
    mcp.run(transport="sse")  # Runs on http://localhost:8000
```

SSE transport allows remote clients to connect over HTTP.

---

## Connecting from an MCP Client

### Using MCP Inspector (for testing)

```bash
npx @modelcontextprotocol/inspector python server.py
```

This opens the MCP Inspector UI where you can interactively test resources, prompts, and tools.

### Configuring in OpenCode (opencode.json)

```json
{
  "mcp": {
    "dataserver": {
      "type": "local",
      "command": ["python", "E:/AI/Projects/24May_MCP/MCP_Creation/server.py"],
      "enabled": true
    }
  }
}
```

### Configuring in Claude Desktop (claude_desktop_config.json)

```json
{
  "mcpServers": {
    "dataserver": {
      "command": "python",
      "args": ["E:/AI/Projects/24May_MCP/MCP_Creation/server.py"]
    }
  }
}
```

---

## Extending the Server

Adding new capabilities is simple:

### Add a new tool:
```python
@mcp.tool
def multiply(a: int, b: int) -> int:
    """Multiply two numbers"""
    return a * b
```

### Add a new resource:
```python
@mcp.resource("resource://timestamp")
def get_timestamp() -> str:
    """Returns current timestamp"""
    from datetime import datetime
    return datetime.now().isoformat()
```

### Add a new prompt:
```python
@mcp.prompt
def summarize_bug(bug_report: str) -> str:
    """Summarize a bug report"""
    return f"Summarize the following bug report in 3 bullet points:\n{bug_report}"
```

---

## Key Concepts

### Resource vs Tool vs Prompt

| Aspect | Resource | Tool | Prompt |
|--------|----------|------|--------|
| **Purpose** | Provide data | Perform actions | Guide AI behavior |
| **Read/Write** | Read-only | Can have side effects | Read-only (template) |
| **Called by** | AI fetches it | AI executes it | AI uses it as context |
| **Returns** | Data/string | Result of computation | Formatted text |
| **Example** | Config values, DB data | API calls, calculations | Review templates, instructions |

### Transport Protocols

1. **stdio** (default): Server reads/writes JSON-RPC messages via stdin/stdout. Best for local integrations.
2. **SSE**: Server exposes HTTP endpoints for Server-Sent Events. Best for remote/network access.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `ModuleNotFoundError: No module named 'fastmcp'` | Run `pip install fastmcp` |
| Server not responding | Check that Python 3.10+ is being used |
| MCP client can't connect | Verify the `command` path in config is absolute and correct |

---

## References

- [Model Context Protocol Docs](https://modelcontextprotocol.io)
- [FastMCP GitHub](https://github.com/jlowin/fastmcp)
- [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)

---

## Author

Built for learning and experimenting with the Model Context Protocol.
