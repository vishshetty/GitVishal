# MCP_CreationTests - Playwright Test Server

A comprehensive MCP (Model Context Protocol) server built with the official `mcp` Python SDK, featuring 25+ dummy Playwright browser automation tools, resources, and prompts for QA testing workflows.

---

## Project Structure

```
MCP_CreationTests/
├── server.py           # Main MCP server using official mcp SDK (PlaywrightTestServer)
└── README.md           # This file
```

---

## Components Overview

### 1. Resources (3 Resources with Data)

| Resource URI | Description |
|-------------|-------------|
| `resource://browser-config` | Browser configuration settings (headless, viewport, timeout, screenshot) |
| `resource://test-data` | Sample test data for QA automation (username, password, URL, product) |
| `resource://env-variables` | Environment configuration variables (ENV, API_BASE, DB_HOST, LOG_LEVEL) |

### 2. Prompts (5 Prompts)

| Prompt | Description | Parameters |
|--------|-------------|------------|
| `review_test_case` | Review a QA test case for completeness | `test_case: str` |
| `generate_bug_report` | Generate a structured bug report | `title, steps, expected, actual: str` |
| `playwright_test_script` | Generate a Playwright test script template | `url, action: str` |
| `analyze_test_results` | Analyze test execution results | `results: str` |
| `test_plan` | Generate a comprehensive test plan | `feature, scope: str` |

### 3. Tools (25+ Dummy Playwright Tools)

All tools print their action and return `"Ok started"`.

#### Navigation Tools
| Tool | Description | Parameters |
|------|-------------|------------|
| `browser_to_url` | Navigate to a URL | `url: str` |
| `browser_go_back` | Navigate back in history | - |
| `browser_go_forward` | Navigate forward in history | - |
| `browser_reload` | Reload current page | - |

#### Interaction Tools
| Tool | Description | Parameters |
|------|-------------|------------|
| `browser_click` | Click an element | `selector: str` |
| `browser_fill` | Fill an input field | `selector, value: str` |
| `browser_type` | Type text with optional delay | `selector, text: str`, `delay: int` |
| `browser_select_option` | Select dropdown option | `selector, option: str` |
| `browser_check` | Check a checkbox | `selector: str` |
| `browser_uncheck` | Uncheck a checkbox | `selector: str` |
| `browser_hover` | Hover over an element | `selector: str` |
| `browser_double_click` | Double-click element | `selector: str` |
| `browser_right_click` | Right-click element | `selector: str` |
| `browser_drag_and_drop` | Drag and drop | `source, target: str` |
| `browser_press_key` | Press keyboard key | `key: str` |
| `browser_clear_input` | Clear input field | `selector: str` |

#### Assertion Tools
| Tool | Description | Parameters |
|------|-------------|------------|
| `browser_assert_visible` | Assert element is visible | `selector: str` |
| `browser_assert_text` | Assert element contains text | `selector, expected_text: str` |
| `browser_assert_url` | Assert current URL | `expected_url: str` |

#### Utility Tools
| Tool | Description | Parameters |
|------|-------------|------------|
| `browser_scroll_to` | Scroll to element | `selector: str` |
| `browser_screenshot` | Take screenshot | `path: str`, `full_page: bool` |
| `browser_wait_for_selector` | Wait for element | `selector: str`, `timeout: int` |
| `browser_wait_for_navigation` | Wait for navigation | `timeout: int` |
| `browser_get_text` | Get element text | `selector: str` |
| `browser_get_attribute` | Get element attribute | `selector, attribute: str` |
| `browser_set_viewport` | Set viewport size | `width, height: int` |
| `browser_close` | Close browser | - |

---

## Running the Server

### Direct execution (stdio transport)
```bash
cd E:\AI\Projects\24May_MCP\MCP_CreationTests
python server.py
```

### With MCP Inspector (for testing)
```bash
npx @modelcontextprotocol/inspector python server.py
```

---

## Client Configuration

### OpenCode (`opencode.json`)
```json
{
  "mcp": {
    "playwright-test-server": {
      "type": "local",
      "command": ["python", "E:/AI/Projects/24May_MCP/MCP_CreationTests/server.py"],
      "enabled": true
    }
  }
}
```

### Claude Desktop (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "playwright-test-server": {
      "command": "python",
      "args": ["E:/AI/Projects/24May_MCP/MCP_CreationTests/server.py"]
    }
  }
}
```

---

## Example Usage

### Using Tools
```
AI: "Navigate to https://app.vwo.com/#/login"
→ Calls browser_to_url(url="https://app.vwo.com/#/login")
→ Returns: "Ok started"

AI: "Fill the email field with test@example.com"
→ Calls browser_fill(selector="[name='email']", value="test@example.com")
→ Returns: "Ok started"

AI: "Click the sign in button"
→ Calls browser_click(selector="button[type='submit']")
→ Returns: "Ok started"

AI: "Take a full page screenshot"
→ Calls browser_screenshot(path="login-page.png", full_page=true)
→ Returns: "Ok started"
```

### Using Prompts
```
AI: "Review this test case: 'Login with valid credentials'"
→ Calls review_test_case(test_case="Login with valid credentials")
→ Returns structured review criteria and score

AI: "Generate a test plan for the checkout feature"
→ Calls test_plan(feature="Checkout", scope="E2E testing")
→ Returns comprehensive test plan document
```

### Using Resources
```
AI: "What browser config should I use?"
→ Fetches resource://browser-config
→ Returns viewport, headless, timeout settings

AI: "What test data is available?"
→ Fetches resource://test-data
→ Returns sample username, password, URL
```

---

## Extending the Server

Adding new tools is simple. Add to the `TOOLS` list and update the `handle_call_tool` function:
```python
# Add to TOOLS list
{
    "name": "browser_upload_file",
    "description": "Upload a file to an input element",
    "inputSchema": {
        "type": "object",
        "properties": {
            "selector": {"type": "string", "description": "CSS selector of the file input"},
            "file_path": {"type": "string", "description": "Path to the file to upload"}
        },
        "required": ["selector", "file_path"]
    }
}

# The tool handler automatically handles all tools!
```

---

## References

- [Model Context Protocol Docs](https://modelcontextprotocol.io)
- [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)

---

## Author

Built for QA automation testing with Playwright and MCP integration.
