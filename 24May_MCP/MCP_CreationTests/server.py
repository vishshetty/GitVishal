from mcp.server import Server
from mcp.types import (
    TextContent,
    Tool,
    Resource,
    Prompt,
    GetPromptResult,
)
import json

# Create the MCP server
server = Server("PlaywrightTestServer")

# =============================================================================
# RESOURCES (3 Resources with Data)
# =============================================================================

RESOURCES = {
    "resource://browser-config": {
        "name": "Browser Configuration",
        "content": """Browser Config:
- headless: false
- viewport: 1920x1080
- timeout: 30000ms
- screenshot: full-page
- userAgent: default"""
    },
    "resource://test-data": {
        "name": "Test Data",
        "content": """Test Data:
- username: testuser@example.com
- password: TestPass123!
- url: https://app.vwo.com/#/login
- product: VWO Testing Platform
- role: admin"""
    },
    "resource://env-variables": {
        "name": "Environment Variables",
        "content": """Environment Variables:
- ENV: staging
- API_BASE: https://api-staging.vwo.com
- DB_HOST: localhost:5432
- LOG_LEVEL: debug
- FEATURE_FLAGS: enabled"""
    }
}

# =============================================================================
# PROMPTS (5 Prompts)
# =============================================================================

PROMPTS = {
    "review_test_case": {
        "description": "Review a QA test case for completeness and clarity",
        "args": ["test_case"]
    },
    "generate_bug_report": {
        "description": "Generate a structured bug report",
        "args": ["title", "steps", "expected", "actual"]
    },
    "playwright_test_script": {
        "description": "Generate a Playwright test script template",
        "args": ["url", "action"]
    },
    "analyze_test_results": {
        "description": "Analyze test execution results",
        "args": ["results"]
    },
    "test_plan": {
        "description": "Generate a comprehensive test plan",
        "args": ["feature", "scope"]
    }
}

# =============================================================================
# TOOLS (25+ Dummy Playwright Tools)
# =============================================================================

TOOLS = [
    {
        "name": "browser_to_url",
        "description": "Navigate browser to specified URL",
        "inputSchema": {
            "type": "object",
            "properties": {
                "url": {"type": "string", "description": "URL to navigate to"}
            },
            "required": ["url"]
        }
    },
    {
        "name": "browser_click",
        "description": "Click an element on the page",
        "inputSchema": {
            "type": "object",
            "properties": {
                "selector": {"type": "string", "description": "CSS selector of the element to click"}
            },
            "required": ["selector"]
        }
    },
    {
        "name": "browser_fill",
        "description": "Fill an input field with text",
        "inputSchema": {
            "type": "object",
            "properties": {
                "selector": {"type": "string", "description": "CSS selector of the input field"},
                "value": {"type": "string", "description": "Text value to fill"}
            },
            "required": ["selector", "value"]
        }
    },
    {
        "name": "browser_type",
        "description": "Type text into an element with optional delay between keystrokes",
        "inputSchema": {
            "type": "object",
            "properties": {
                "selector": {"type": "string", "description": "CSS selector of the element"},
                "text": {"type": "string", "description": "Text to type"},
                "delay": {"type": "integer", "description": "Delay between keystrokes in ms", "default": 50}
            },
            "required": ["selector", "text"]
        }
    },
    {
        "name": "browser_select_option",
        "description": "Select an option from a dropdown",
        "inputSchema": {
            "type": "object",
            "properties": {
                "selector": {"type": "string", "description": "CSS selector of the dropdown"},
                "option": {"type": "string", "description": "Option text or value to select"}
            },
            "required": ["selector", "option"]
        }
    },
    {
        "name": "browser_check",
        "description": "Check a checkbox",
        "inputSchema": {
            "type": "object",
            "properties": {
                "selector": {"type": "string", "description": "CSS selector of the checkbox"}
            },
            "required": ["selector"]
        }
    },
    {
        "name": "browser_uncheck",
        "description": "Uncheck a checkbox",
        "inputSchema": {
            "type": "object",
            "properties": {
                "selector": {"type": "string", "description": "CSS selector of the checkbox"}
            },
            "required": ["selector"]
        }
    },
    {
        "name": "browser_hover",
        "description": "Hover over an element",
        "inputSchema": {
            "type": "object",
            "properties": {
                "selector": {"type": "string", "description": "CSS selector of the element"}
            },
            "required": ["selector"]
        }
    },
    {
        "name": "browser_scroll_to",
        "description": "Scroll to an element",
        "inputSchema": {
            "type": "object",
            "properties": {
                "selector": {"type": "string", "description": "CSS selector of the element"}
            },
            "required": ["selector"]
        }
    },
    {
        "name": "browser_screenshot",
        "description": "Take a screenshot of the current page",
        "inputSchema": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "File path to save screenshot"},
                "full_page": {"type": "boolean", "description": "Capture full page or viewport only", "default": False}
            },
            "required": ["path"]
        }
    },
    {
        "name": "browser_wait_for_selector",
        "description": "Wait for an element to appear on the page",
        "inputSchema": {
            "type": "object",
            "properties": {
                "selector": {"type": "string", "description": "CSS selector to wait for"},
                "timeout": {"type": "integer", "description": "Timeout in milliseconds", "default": 5000}
            },
            "required": ["selector"]
        }
    },
    {
        "name": "browser_wait_for_navigation",
        "description": "Wait for page navigation to complete",
        "inputSchema": {
            "type": "object",
            "properties": {
                "timeout": {"type": "integer", "description": "Timeout in milliseconds", "default": 10000}
            }
        }
    },
    {
        "name": "browser_assert_visible",
        "description": "Assert that an element is visible",
        "inputSchema": {
            "type": "object",
            "properties": {
                "selector": {"type": "string", "description": "CSS selector of the element"}
            },
            "required": ["selector"]
        }
    },
    {
        "name": "browser_assert_text",
        "description": "Assert that an element contains expected text",
        "inputSchema": {
            "type": "object",
            "properties": {
                "selector": {"type": "string", "description": "CSS selector of the element"},
                "expected_text": {"type": "string", "description": "Expected text content"}
            },
            "required": ["selector", "expected_text"]
        }
    },
    {
        "name": "browser_assert_url",
        "description": "Assert that current URL matches expected",
        "inputSchema": {
            "type": "object",
            "properties": {
                "expected_url": {"type": "string", "description": "Expected URL"}
            },
            "required": ["expected_url"]
        }
    },
    {
        "name": "browser_press_key",
        "description": "Press a keyboard key (Enter, Escape, Tab, etc.)",
        "inputSchema": {
            "type": "object",
            "properties": {
                "key": {"type": "string", "description": "Key to press (Enter, Escape, Tab, ArrowDown, etc.)"}
            },
            "required": ["key"]
        }
    },
    {
        "name": "browser_drag_and_drop",
        "description": "Drag and drop an element from source to target",
        "inputSchema": {
            "type": "object",
            "properties": {
                "source": {"type": "string", "description": "CSS selector of the source element"},
                "target": {"type": "string", "description": "CSS selector of the target element"}
            },
            "required": ["source", "target"]
        }
    },
    {
        "name": "browser_double_click",
        "description": "Double-click an element",
        "inputSchema": {
            "type": "object",
            "properties": {
                "selector": {"type": "string", "description": "CSS selector of the element"}
            },
            "required": ["selector"]
        }
    },
    {
        "name": "browser_right_click",
        "description": "Right-click (context menu) on an element",
        "inputSchema": {
            "type": "object",
            "properties": {
                "selector": {"type": "string", "description": "CSS selector of the element"}
            },
            "required": ["selector"]
        }
    },
    {
        "name": "browser_clear_input",
        "description": "Clear the contents of an input field",
        "inputSchema": {
            "type": "object",
            "properties": {
                "selector": {"type": "string", "description": "CSS selector of the input field"}
            },
            "required": ["selector"]
        }
    },
    {
        "name": "browser_get_text",
        "description": "Get text content of an element",
        "inputSchema": {
            "type": "object",
            "properties": {
                "selector": {"type": "string", "description": "CSS selector of the element"}
            },
            "required": ["selector"]
        }
    },
    {
        "name": "browser_get_attribute",
        "description": "Get an attribute value of an element",
        "inputSchema": {
            "type": "object",
            "properties": {
                "selector": {"type": "string", "description": "CSS selector of the element"},
                "attribute": {"type": "string", "description": "Attribute name to retrieve"}
            },
            "required": ["selector", "attribute"]
        }
    },
    {
        "name": "browser_set_viewport",
        "description": "Set the browser viewport size",
        "inputSchema": {
            "type": "object",
            "properties": {
                "width": {"type": "integer", "description": "Viewport width in pixels"},
                "height": {"type": "integer", "description": "Viewport height in pixels"}
            },
            "required": ["width", "height"]
        }
    },
    {
        "name": "browser_go_back",
        "description": "Navigate back in browser history",
        "inputSchema": {
            "type": "object",
            "properties": {}
        }
    },
    {
        "name": "browser_go_forward",
        "description": "Navigate forward in browser history",
        "inputSchema": {
            "type": "object",
            "properties": {}
        }
    },
    {
        "name": "browser_reload",
        "description": "Reload the current page",
        "inputSchema": {
            "type": "object",
            "properties": {}
        }
    },
    {
        "name": "browser_close",
        "description": "Close the browser",
        "inputSchema": {
            "type": "object",
            "properties": {}
        }
    }
]

# =============================================================================
# MCP SERVER HANDLERS
# =============================================================================

@server.list_resources()
async def handle_list_resources():
    """List available resources"""
    return [
        Resource(
            uri=uri,
            name=data["name"],
            mimeType="text/plain",
            description=f"Resource: {data['name']}"
        )
        for uri, data in RESOURCES.items()
    ]

@server.read_resource()
async def handle_read_resource(uri: str) -> str:
    """Read a resource by URI - returns the resource content as string"""
    uri_str = str(uri)
    if uri_str in RESOURCES:
        return RESOURCES[uri_str]["content"]
    raise ValueError(f"Resource not found: {uri_str}")

@server.list_prompts()
async def handle_list_prompts():
    """List available prompts"""
    return [
        Prompt(
            name=name,
            description=data["description"],
            arguments=[
                {"name": arg, "description": f"Parameter: {arg}", "required": True}
                for arg in data["args"]
            ]
        )
        for name, data in PROMPTS.items()
    ]

@server.get_prompt()
async def handle_get_prompt(name: str, arguments: dict = None) -> GetPromptResult:
    """Get a prompt with arguments"""
    if name not in PROMPTS:
        raise ValueError(f"Prompt not found: {name}")
    
    if name == "review_test_case":
        test_case = arguments.get("test_case", "") if arguments else ""
        text = f"""Review this test case and provide feedback:

{test_case}

Please evaluate:
1. Clarity - Is the test case easy to understand?
2. Coverage - Does it cover all necessary steps?
3. Assertions - Are the expected results clearly defined?
4. Reproducibility - Can anyone run this test?
5. Edge cases - Are boundary conditions considered?

Provide a score (1-10) and suggestions for improvement."""
    
    elif name == "generate_bug_report":
        title = arguments.get("title", "") if arguments else ""
        steps = arguments.get("steps", "") if arguments else ""
        expected = arguments.get("expected", "") if arguments else ""
        actual = arguments.get("actual", "") if arguments else ""
        text = f"""Generate a professional bug report with the following details:

**Title:** {title}

**Steps to Reproduce:**
{steps}

**Expected Result:**
{expected}

**Actual Result:**
{actual}

Please format this as a complete bug report including:
- Severity assessment
- Priority recommendation
- Environment details
- Screenshots suggestions
- Possible root cause analysis"""
    
    elif name == "playwright_test_script":
        url = arguments.get("url", "") if arguments else ""
        action = arguments.get("action", "") if arguments else ""
        text = f"""Generate a Playwright test script for:

URL: {url}
Action: {action}

Please provide:
1. Complete test setup with imports
2. Page navigation and wait strategies
3. Element interaction code
4. Assertion examples
5. Cleanup and teardown

Use best practices for:
- Locator strategies (prefer data-testid)
- Wait conditions (avoid fixed sleeps)
- Error handling and retries"""
    
    elif name == "analyze_test_results":
        results = arguments.get("results", "") if arguments else ""
        text = f"""Analyze the following test results and provide insights:

{results}

Please provide:
1. Summary of pass/fail rates
2. Identify patterns in failures
3. Flaky test detection
4. Recommendations for improvement
5. Priority order for fixing failures"""
    
    elif name == "test_plan":
        feature = arguments.get("feature", "") if arguments else ""
        scope = arguments.get("scope", "") if arguments else ""
        text = f"""Create a detailed test plan for:

**Feature:** {feature}
**Scope:** {scope}

Include:
1. Test objectives and goals
2. In-scope and out-of-scope items
3. Test types (unit, integration, e2e, visual)
4. Entry and exit criteria
5. Risk assessment and mitigation
6. Timeline and milestones
7. Resource requirements
8. Deliverables"""
    
    else:
        text = "Prompt not implemented"
    
    return GetPromptResult(
        description=PROMPTS[name]["description"],
        messages=[{"role": "user", "content": {"type": "text", "text": text}}]
    )

@server.list_tools()
async def handle_list_tools():
    """List available tools"""
    return [
        Tool(
            name=tool["name"],
            description=tool["description"],
            inputSchema=tool["inputSchema"]
        )
        for tool in TOOLS
    ]

@server.call_tool()
async def handle_call_tool(name: str, arguments: dict = None):
    """Handle tool calls - all tools print and return 'Ok started'"""
    args_str = json.dumps(arguments) if arguments else "{}"
    print(f"[TOOL] {name}: Called with arguments: {args_str}")
    
    # All tools return the same simple response
    return [TextContent(type="text", text="Ok started")]

# =============================================================================
# MAIN ENTRY POINT
# =============================================================================

if __name__ == "__main__":
    from mcp.server.stdio import stdio_server
    import asyncio
    
    async def main():
        async with stdio_server() as (read_stream, write_stream):
            await server.run(
                read_stream,
                write_stream,
                server.create_initialization_options()
            )
    
    asyncio.run(main())
