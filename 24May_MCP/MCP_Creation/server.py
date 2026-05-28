from fastmcp import FastMCP

mcp = FastMCP("DataServer")

# Resource
@mcp.resource("resource://greeting")
def greeting() -> str:
    """Returns greeting"""
    return "Hello from FastMCP"

# Prompt
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

# Tool
@mcp.tool
def add(a: int, b: int) -> int:
    """Add two numbers"""
    return a + b

if __name__ == "__main__":
    mcp.run()
