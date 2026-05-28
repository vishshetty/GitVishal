# Prompts & MCP Client Configuration

---

## Claude Desktop Configuration

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "EnterpriseQAMCP": {
      "command": "python",
      "args": ["E:/AI/Projects/Projects_Profile/01_MCPCreation_TestCases/server.py"]
    }
  }
}
```

---

## Cursor / Claude Code / OpenCode Configuration

```json
{
  "mcpServers": {
    "EnterpriseQAMCP": {
      "command": "fastmcp",
      "args": ["run", "E:/AI/Projects/Projects_Profile/01_MCPCreation_TestCases/server.py:mcp"]
    }
  }
}
```

---

## MCP Inspector

```bash
npx @modelcontextprotocol/inspector fastmcp run server.py:mcp
```

---

## Built-in MCP Prompts

These prompts are registered in the MCP server and can be invoked directly by any MCP client.

### 1. `review_test_case`

```
Review TC-00042 for gaps, clarity, and edge cases.
```

Instructs the LLM to analyze a test case across five dimensions: clarity, assertions, edge cases, coverage, and maintainability.

### 2. `suggest_regression_pack`

```
Suggest a regression pack for the Login module (max 15 cases).
```

Instructs the LLM to curate an optimal regression suite from the available test cases, prioritizing P0/P1 tests and ensuring breadth of coverage.

### 3. `generate_bdd`

```
Convert TC-00100 into BDD format.
```

Instructs the LLM to transform a traditional test case into Gherkin syntax (Given / When / Then) with tags for module, priority, and labels.

### 4. `summarize_module_tests`

```
Generate a QA summary report for the Dashboard module.
```

Instructs the LLM to produce an executive QA health report with distribution analysis, coverage gap identification, and an A-F health score.

---

## Natural Language Query Examples

These queries leverage MCP tools automatically when interpreted by a connected LLM client:

### Severity & Priority

| Query | Tools used |
|-------|-----------|
| "Show all P0 test cases" | `search_by_priority` |
| "Find all Blocker severity tests" | `search_test_cases(severity="Blocker")` |
| "Show count by priority" | `get_statistics` |

### Module & Feature

| Query | Tools used |
|-------|-----------|
| "Find login-related regression tests" | `search_test_cases(query="login", test_type="Regression")` |
| "Show accessibility tests for Admin module" | `search_test_cases(module="Admin", test_type="Accessibility")` |
| "Generate smoke suite for Login" | `suggest_regression_pack` + `search_test_cases(test_type="Smoke")` |

### Ownership & Status

| Query | Tools used |
|-------|-----------|
| "Find tests owned by Vishal" | `search_by_owner("vishal")` |
| "Show inactive test cases" | `search_by_status("Draft")` or `search_by_status("Deprecated")` |
| "Find tests by sara.patel in sprint VWO-26.S05" | `search_test_cases(owner="sara", sprint="S05")` |

### Sprint & Distribution

| Query | Tools used |
|-------|-----------|
| "Show sprint-wise test distribution" | `get_statistics` |
| "Tests in sprint VWO-26.S10" | `search_by_sprint("VWO-26.S10")` |

### Labels & Tags

| Query | Tools used |
|-------|-----------|
| "Find tests tagged with 'api' and 'regression'" | `search_by_label("api|regression")` |
| "Find RGBW light test cases" | `search_test_cases(query="rgbw")` |
| "Find tests linked to Flutter automation" | `search_test_cases(query="flutter")` or `search_by_label("flutter")` |

### Creation

| Query | Tools used |
|-------|-----------|
| "Create a new test case for password reset" | `add_test_case` |
| "Add a P0 smoke test for MFA login in Auth module" | `add_test_case` |

### Review & Analysis

| Query | Tools used |
|-------|-----------|
| "Review this test case for gaps" | `review_test_case` prompt |
| "Generate BDD scenarios for Login module" | `generate_bdd` prompt |
| "Summarize QA coverage for Billing module" | `summarize_module_tests` prompt |

---

## Troubleshooting

**Server fails to start with `ModuleNotFoundError: fastmcp`**

```bash
pip install fastmcp pandas openpyxl
```

**"Test case file not found" error**

Ensure `testcases/vwo_5000_testcases.xlsx` exists relative to `server.py`. Override with an environment variable or edit `DEFAULT_FILE` in `server.py`.

**MCP client cannot connect**

- Verify the Python path in your MCP client config is correct.
- Run `python server.py` directly to see startup errors.
- Use `npx @modelcontextprotocol/inspector` to debug the connection.

**Data not refreshing after external edits**

Call the `reload_data` tool, or restart the MCP server.
