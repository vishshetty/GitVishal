# Enterprise QA Knowledge MCP Server v2.0

Transforms a 5,000-case QA test repository (Excel/CSV) into an AI-accessible testing knowledge platform via the Model Context Protocol (MCP).

Built with **FastMCP v2.x** — compatible with Claude Desktop, Claude Code, Cursor, OpenCode, and MCP Inspector.

---

## Quick Start

```bash
# Install dependencies
pip install fastmcp pandas openpyxl

# Run the server (stdio transport)
python server.py

# Or via FastMCP CLI
fastmcp run server.py:mcp

# Inspect with MCP Inspector
npx @modelcontextprotocol/inspector fastmcp run server.py:mcp
```

---

## Supported Data Sources

| Format | Extension | Engine |
|--------|-----------|--------|
| Excel  | `.xlsx`   | `openpyxl` |
| CSV    | `.csv`    | `pandas` |

The server auto-detects column names via fuzzy matching. It will **never crash** due to missing or renamed columns.

---

## MCP Client Configuration

### Claude Desktop (`claude_desktop_config.json`)

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

### Cursor / Claude Code / OpenCode

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

> Adjust paths to match your local directory structure.

---

## Tools (13)

| Tool | Description |
|------|-------------|
| `list_test_cases` | Paginated listing (`limit`, `offset`) |
| `get_test_case` | Full details by ID (e.g. `TC-00001`) |
| `search_by_priority` | Filter by P0 / P1 / P2 / P3 |
| `search_by_module` | Filter by module name (partial match) |
| `search_by_label` | Filter by pipe-separated labels (`regression\|mobile`) |
| `search_by_owner` | Filter by owner name |
| `search_by_status` | Filter by Active / Draft / Blocked / Deprecated |
| `search_by_sprint` | Filter by sprint ID |
| `search_test_cases` | Free-text search (summary, steps, expected) + combined metadata filtering |
| `get_statistics` | Aggregate counts by priority, status, module, owner, automation coverage |
| `add_test_case` | Create and persist a new test case (auto-generates ID) |
| `get_schema_info` | Detected column mappings and available field values |
| `reload_data` | Hot-reload from source file |

---

## Resources (8)

| URI | Content |
|-----|---------|
| `testcases://all` | Full dataset as JSON |
| `testcases://stats` | Statistics summary |
| `testcases://priorities` | Unique priorities |
| `testcases://modules` | Unique module names |
| `testcases://owners` | Unique owner names |
| `testcases://statuses` | Unique statuses |
| `testcases://test_types` | Unique test types |
| `testcases://sprints` | Unique sprint IDs |
| `testcases://{test_case_id}` | Dynamic — single test case (e.g. `testcases://TC-00042`) |

---

## Prompts (4)

| Prompt | Purpose |
|--------|---------|
| `review_test_case` | Deep review of clarity, assertions, edge cases, coverage, maintainability |
| `suggest_regression_pack` | Recommends optimal regression suite for a module |
| `generate_bdd` | Converts a test case to Given / When / Then Gherkin format |
| `summarize_module_tests` | Executive QA summary with health score |

---

## Example Queries

After connecting an MCP client, try these natural-language requests:

- "Show all P0 test cases"
- "Find login-related regression tests"
- "Find failed mobile automation scenarios"
- "Show accessibility tests for Admin module"
- "Find tests owned by Vishal"
- "Show inactive test cases"
- "Generate smoke suite for Alexa"
- "Find tests linked to Flutter automation"
- "Create a new test case for password reset"
- "Show count by priority"
- "Show sprint-wise test distribution"
- "Generate BDD scenarios for Login module"
- "Review this test case for gaps"

---

## Dataset Summary

| Field | Details |
|-------|---------|
| **Total test cases** | 5,000 |
| **Priorities** | P0, P1, P2, P3 |
| **Severities** | Blocker, Critical, Major, Minor |
| **Statuses** | Active, Draft, Blocked, Deprecated |
| **Test types** | Smoke, Regression, Functional, Integration, Accessibility |
| **Modules** | 20 (A/B Testing through User Management) |
| **Owners** | 6 team members |
| **Sprints** | 12 (VWO-26.S01 through VWO-26.S12) |

---

## Architecture

```
server.py
├── Helper Functions       — fuzzy matching, null-safe, JSON serialization
├── QADataManager          — load, cache, search, persist, statistics
├── MCP Tools (13)         — @mcp.tool decorators
├── MCP Resources (8)      — @mcp.resource decorators
├── MCP Prompts (4)        — @mcp.prompt decorators
└── Entry Point            — mcp.run(transport="stdio")
```

### Design Principles

- **Dynamic schema mapping** — fuzzy-matches column names; never breaks on missing fields
- **Single-file** — no separate modules; easy to distribute and audit
- **Memory-safe** — state encapsulated in `QADataManager`, not in globals
- **Persistent writes** — `add_test_case` appends to in-memory cache and rewrites source file
- **Extensible** — modular search layer ready for embeddings / vector DB; `jira_id` field ready for Jira integration; `automation_script` / `automation_status` fields ready for automation CI linkage

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `fastmcp` | MCP server framework |
| `pandas` | Data loading, transformation, search |
| `openpyxl` | Excel read/write (transitive through pandas) |

All are available on PyPI. No other dependencies required.

---

## Roadmap

- Vector embeddings + Chroma / Qdrant for semantic search
- Jira integration (bi-directional sync of test case ↔ ticket)
- CI/CD automation linkage (trigger runs from matching `automation_script` paths)
- Web dashboard for browsing and editing test cases
- Export filtered test sets as PDF / Markdown
