"""
Enterprise QA Knowledge MCP Server v2.0
Transforms QA test repositories (Excel/CSV) into AI-accessible testing knowledge.
Built with FastMCP v2.x — supports Claude Desktop, Claude Code, Cursor, OpenCode, MCP Inspector.
"""

import json
import uuid
from difflib import SequenceMatcher
from pathlib import Path
from typing import Any, Dict, List, Optional

import pandas as pd
from fastmcp import FastMCP

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

FUZZY_THRESHOLD = 0.6
DEFAULT_FILE = Path(__file__).parent / "testcases" / "vwo_5000_testcases.xlsx"

SUPPORTED_EXTENSIONS = {".xlsx", ".csv"}

COLUMN_MAP_SCHEMA: Dict[str, List[str]] = {
    "id": ["id", "test_id", "tc_id", "testcase_id", "case_id"],
    "jira_id": ["jira_id", "jira", "issue_id", "ticket_id"],
    "summary": ["summary", "title", "testname", "scenario", "name", "description"],
    "module": ["module", "feature", "component", "area"],
    "priority": ["priority", "prio", "criticality"],
    "severity": ["severity", "severity_level"],
    "labels": ["labels", "tags", "categories"],
    "preconditions": ["preconditions", "precondition", "prerequisites", "prerequisite", "setup"],
    "steps": ["steps", "teststeps", "test_steps", "procedure"],
    "expected_result": ["expected_result", "expectedresult", "expected", "expected_outcome"],
    "test_type": ["test_type", "type", "category", "testcategory"],
    "owner": ["owner", "assignedto", "qaowner", "assignee", "tester"],
    "sprint": ["sprint", "cycle", "release", "iteration"],
    "status": ["status", "currentstatus", "state", "teststatus"],
    "automation_script": ["automation_script", "auto_script", "script_path"],
    "automation_status": ["automation_status", "auto_status", "automated"],
    "platform": ["platform", "os", "environment", "env"],
}

TEXT_SEARCH_FIELDS = ["summary", "steps", "expected_result", "preconditions"]


# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------

def _fuzzy_best(target: str, candidates: List[str], threshold: float = FUZZY_THRESHOLD) -> Optional[str]:
    """Return the best fuzzy match for *target* from *candidates*, or None."""
    target_lower = target.lower().strip()
    best_score = 0.0
    best: Optional[str] = None
    for candidate in candidates:
        score = SequenceMatcher(None, target_lower, candidate.lower().strip()).ratio()
        if score > best_score:
            best_score = score
            best = candidate
    return best if best_score >= threshold else None


def _exact_or_none(needle: str, haystack: List[str]) -> Optional[str]:
    """Return needle if it exists verbatim in haystack, else None."""
    return needle if needle in haystack else None


def _build_column_map(columns: List[str]) -> Dict[str, Optional[str]]:
    """Map actual DataFrame columns to logical field names via fuzzy + exact matching.

    Already-matched physical columns are excluded from subsequent mappings to prevent
    false matches (e.g. *automation_script* -> *priority*).
    """
    col_map: Dict[str, Optional[str]] = {}
    available = list(columns)

    for logical, aliases in COLUMN_MAP_SCHEMA.items():
        matched = _fuzzy_best(logical, available)
        if matched is None:
            for alias in aliases:
                ex = _exact_or_none(alias, available)
                if ex:
                    matched = ex
                    break
        col_map[logical] = matched
        if matched is not None and matched in available:
            available.remove(matched)

    return col_map


def _safe_col(col_map: Dict[str, Optional[str]], field: str) -> Optional[str]:
    """Return actual column name for a logical field, or None."""
    return col_map.get(field)


def _null_str(value: Any) -> str:
    """Convert any value to a lowercased trimmed string; handles None / NaN."""
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return ""
    return str(value).strip().lower()


def _matches(value: Any, query: str) -> bool:
    """Case-insensitive substring match."""
    return query.lower() in _null_str(value)


def _normalize_df(df: pd.DataFrame) -> pd.DataFrame:
    """Strip whitespace from all string columns, coerce nulls to empty string."""
    result = df.copy()
    for col in result.columns:
        if result[col].dtype == object:
            result[col] = result[col].apply(lambda x: str(x).strip() if pd.notna(x) else "")
    return result


def _safe_json(obj: Any) -> Any:
    """Convert numpy / pandas types to JSON-serializable Python primitives."""
    if isinstance(obj, pd.Timestamp):
        return obj.isoformat()
    if isinstance(obj, pd.Series):
        return obj.to_dict()
    if isinstance(obj, float) and pd.isna(obj):
        return None
    return obj


def _row_to_dict(row: pd.Series, col_map: Dict[str, Optional[str]]) -> Dict[str, Any]:
    """Project a DataFrame row into a logical-field dict."""
    record: Dict[str, Any] = {}
    for logical, actual in col_map.items():
        if actual and actual in row.index:
            record[logical] = _safe_json(row[actual])
        else:
            record[logical] = None
    return record


# ---------------------------------------------------------------------------
# QADataManager — encapsulates all data access & persistence
# ---------------------------------------------------------------------------

class QADataManager:
    """Loads, caches, queries, and persists QA test-case data from Excel/CSV."""

    def __init__(self, file_path: Optional[str] = None):
        self._file_path: Path = Path(file_path) if file_path else DEFAULT_FILE
        self._df: pd.DataFrame = pd.DataFrame()
        self._col_map: Dict[str, Optional[str]] = {}
        self._load()

    def _load(self) -> None:
        """Load test cases from Excel or CSV, normalise, and build column map."""
        if not self._file_path.exists():
            raise FileNotFoundError(f"Test case file not found: {self._file_path}")

        ext = self._file_path.suffix.lower()
        if ext not in SUPPORTED_EXTENSIONS:
            raise ValueError(f"Unsupported format: {ext}. Use .xlsx or .csv.")

        if ext == ".xlsx":
            self._df = pd.read_excel(self._file_path)
        else:
            self._df = pd.read_csv(self._file_path)

        self._df = _normalize_df(self._df)
        self._col_map = _build_column_map(list(self._df.columns))

    def reload(self) -> None:
        """Reload data from source file (useful after external edits)."""
        self._load()

    @property
    def df(self) -> pd.DataFrame:
        return self._df

    @property
    def col_map(self) -> Dict[str, Optional[str]]:
        return self._col_map

    def col(self, field: str) -> Optional[str]:
        return _safe_col(self._col_map, field)

    def get_test_case(self, test_case_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a single test case by its parsed ID."""
        id_col = self.col("id")
        if not id_col:
            return None
        mask = self._df[id_col].astype(str).str.strip().str.lower() == test_case_id.strip().lower()
        matched = self._df[mask]
        if matched.empty:
            return None
        return _row_to_dict(matched.iloc[0], self._col_map)

    def search(
        self,
        query: str = "",
        priority: str = "",
        module: str = "",
        label: str = "",
        owner: str = "",
        status: str = "",
        sprint: str = "",
        test_type: str = "",
        severity: str = "",
        limit: int = 20,
    ) -> List[Dict[str, Any]]:
        """Free-text + metadata filtering.  Returns matching rows up to *limit*."""
        mask = pd.Series(True, index=self._df.index)

        filters: Dict[str, str] = {
            "priority": priority,
            "module": module,
            "label": label,
            "owner": owner,
            "status": status,
            "sprint": sprint,
            "test_type": test_type,
            "severity": severity,
        }

        for field, value in filters.items():
            if not value:
                continue
            col_name = self.col(field)
            if not col_name:
                continue
            col_series = self._df[col_name]
            if field in ("priority", "status", "test_type", "severity"):
                mask &= col_series.str.lower().str.strip() == value.lower().strip()
            else:
                mask &= col_series.str.lower().str.contains(value.lower(), na=False)

        if query:
            text_cols = [self.col(f) for f in TEXT_SEARCH_FIELDS]
            text_cols = [c for c in text_cols if c is not None]
            if text_cols:
                text_mask = pd.Series(False, index=self._df.index)
                for col in text_cols:
                    text_mask |= self._df[col].str.lower().str.contains(query.lower(), na=False)
                mask &= text_mask

        results = self._df[mask].head(limit)
        return [_row_to_dict(results.iloc[i], self._col_map) for i in range(len(results))]

    def statistics(self) -> Dict[str, Any]:
        """Aggregate repository statistics."""
        stats: Dict[str, Any] = {"total_test_cases": len(self._df)}

        for field in ["priority", "status", "module", "owner", "test_type", "severity", "sprint"]:
            c = self.col(field)
            if c:
                counts = self._df[c].value_counts().to_dict()
                stats[f"by_{field}"] = {str(k): int(v) for k, v in counts.items()}

        auto_col = self.col("automation_status")
        if auto_col:
            total = len(self._df)
            automated = int((self._df[auto_col].str.lower().str.strip() == "automated").sum())
            stats["automation_coverage"] = {
                "automated": automated,
                "total": total,
                "percentage": round(automated / total * 100, 2) if total > 0 else 0,
            }
        else:
            stats["automation_coverage"] = "automation_status column not present"

        return stats

    def unique_values(self, field: str) -> List[str]:
        """Sorted unique non-null values for a logical field."""
        c = self.col(field)
        if not c:
            return []
        vals = self._df[c].dropna().astype(str).str.strip().unique()
        return sorted(v for v in vals if v)

    def add_test_case(self, summary: str, module: str, **kwargs: Any) -> Dict[str, Any]:
        """Append a new test case, auto-generate ID, and persist to disk."""
        id_col = self.col("id")
        if id_col:
            existing = (
                self._df[id_col]
                .astype(str)
                .str.extract(r"(\d+)", expand=False)
                .dropna()
                .astype(int)
            )
            if not existing.empty:
                new_id = f"TC-{existing.max() + 1:05d}"
            else:
                new_id = f"TC-{len(self._df) + 1:05d}"
        else:
            new_id = str(uuid.uuid4())[:8]

        jira_col = self.col("jira_id")
        new_jira = kwargs.get("jira_id", "") or (f"VWO-{len(self._df) + 5001}" if jira_col else "")

        row: Dict[str, Any] = {}
        for logical, actual in self._col_map.items():
            if actual is None:
                continue
            if logical == "id":
                row[actual] = new_id
            elif logical == "jira_id":
                row[actual] = new_jira
            elif logical == "summary":
                row[actual] = summary.strip()
            elif logical == "module":
                row[actual] = module.strip()
            elif logical in kwargs:
                row[actual] = str(kwargs[logical]).strip() if kwargs[logical] is not None else ""
            else:
                row[actual] = ""

        self._df = pd.concat([self._df, pd.DataFrame([row])], ignore_index=True)
        self._persist()

        return {"status": "created", "test_case_id": new_id, "summary": summary, "module": module}

    def _persist(self) -> None:
        """Write the in-memory DataFrame back to the source file."""
        ext = self._file_path.suffix.lower()
        if ext == ".xlsx":
            self._df.to_excel(self._file_path, index=False, engine="openpyxl")
        else:
            self._df.to_csv(self._file_path, index=False)


# ---------------------------------------------------------------------------
# MCP Server instance
# ---------------------------------------------------------------------------

mcp = FastMCP(name="EnterpriseQAMCP")
data_manager: QADataManager


def _init_data():
    """Lazy-initialise the data manager so the module is import-safe."""
    global data_manager
    try:
        data_manager = QADataManager()
    except FileNotFoundError:
        data_manager = QADataManager.__new__(QADataManager)
        data_manager._file_path = DEFAULT_FILE
        data_manager._df = pd.DataFrame()
        data_manager._col_map = {}


_init_data()

# ---------------------------------------------------------------------------
# Tools
# ---------------------------------------------------------------------------

@mcp.tool
def list_test_cases(limit: int = 20, offset: int = 0) -> str:
    """Return a paginated list of test cases."""
    total = len(data_manager.df)
    end = min(offset + limit, total)
    rows = data_manager.df.iloc[offset:end]
    results = [_row_to_dict(rows.iloc[i], data_manager.col_map) for i in range(len(rows))]
    return json.dumps({"total": total, "offset": offset, "limit": limit, "results": results}, indent=2, default=str)


@mcp.tool
def get_test_case(test_case_id: str) -> str:
    """Return full details of a single test case by its ID (e.g. TC-00001)."""
    record = data_manager.get_test_case(test_case_id)
    if record is None:
        return json.dumps({"error": f"Test case '{test_case_id}' not found."})
    return json.dumps(record, indent=2, default=str)


@mcp.tool
def search_by_priority(priority: str, limit: int = 50) -> str:
    """Search test cases by priority (P0, P1, P2, P3)."""
    results = data_manager.search(priority=priority, limit=limit)
    return json.dumps({"query": {"priority": priority}, "count": len(results), "results": results}, indent=2, default=str)


@mcp.tool
def search_by_module(module: str, limit: int = 50) -> str:
    """Search test cases by module name (partial match supported)."""
    results = data_manager.search(module=module, limit=limit)
    return json.dumps({"query": {"module": module}, "count": len(results), "results": results}, indent=2, default=str)


@mcp.tool
def search_by_label(label: str, limit: int = 50) -> str:
    """Search test cases by label.  Supports pipe-separated (e.g. regression|mobile|e2e)."""
    results = data_manager.search(label=label, limit=limit)
    return json.dumps({"query": {"label": label}, "count": len(results), "results": results}, indent=2, default=str)


@mcp.tool
def search_by_owner(owner: str, limit: int = 50) -> str:
    """Search test cases by owner name."""
    results = data_manager.search(owner=owner, limit=limit)
    return json.dumps({"query": {"owner": owner}, "count": len(results), "results": results}, indent=2, default=str)


@mcp.tool
def search_by_status(status: str, limit: int = 50) -> str:
    """Search test cases by status (Active, Draft, Blocked, Deprecated)."""
    results = data_manager.search(status=status, limit=limit)
    return json.dumps({"query": {"status": status}, "count": len(results), "results": results}, indent=2, default=str)


@mcp.tool
def search_by_sprint(sprint: str, limit: int = 50) -> str:
    """Search test cases by sprint identifier."""
    results = data_manager.search(sprint=sprint, limit=limit)
    return json.dumps({"query": {"sprint": sprint}, "count": len(results), "results": results}, indent=2, default=str)


@mcp.tool
def search_test_cases(
    query: str = "",
    priority: str = "",
    module: str = "",
    label: str = "",
    owner: str = "",
    status: str = "",
    sprint: str = "",
    test_type: str = "",
    severity: str = "",
    limit: int = 20,
) -> str:
    """Free-text search across summary/steps/expected_result + metadata filtering.

    Combine text search with priority, module, label, owner, status, sprint, test_type, or severity filters.
    """
    results = data_manager.search(
        query=query, priority=priority, module=module, label=label,
        owner=owner, status=status, sprint=sprint, test_type=test_type,
        severity=severity, limit=limit,
    )
    return json.dumps({"count": len(results), "results": results}, indent=2, default=str)


@mcp.tool
def get_statistics() -> str:
    """Return aggregate statistics: counts by priority, status, module, owner, and automation coverage."""
    return json.dumps(data_manager.statistics(), indent=2, default=str)


@mcp.tool
def add_test_case(
    summary: str,
    module: str,
    priority: str = "",
    severity: str = "",
    labels: str = "",
    preconditions: str = "",
    steps: str = "",
    expected_result: str = "",
    test_type: str = "",
    owner: str = "",
    sprint: str = "",
    status: str = "Draft",
    jira_id: str = "",
) -> str:
    """Create and persist a new test case to the repository.  Summary and module are required."""
    if not summary.strip():
        return json.dumps({"error": "summary is required."})
    if not module.strip():
        return json.dumps({"error": "module is required."})

    kwargs = {
        "priority": priority, "severity": severity, "labels": labels,
        "preconditions": preconditions, "steps": steps,
        "expected_result": expected_result, "test_type": test_type,
        "owner": owner, "sprint": sprint, "status": status or "Draft",
        "jira_id": jira_id,
    }
    result = data_manager.add_test_case(summary=summary, module=module, **kwargs)
    return json.dumps(result, indent=2, default=str)


@mcp.tool
def get_schema_info() -> str:
    """Return the detected column mappings, available field values, and file metadata."""
    return json.dumps({
        "file": str(data_manager._file_path),
        "total_records": len(data_manager.df),
        "detected_columns": list(data_manager.df.columns) if not data_manager.df.empty else [],
        "column_mappings": data_manager.col_map,
        "available_priorities": data_manager.unique_values("priority"),
        "available_statuses": data_manager.unique_values("status"),
        "available_modules": data_manager.unique_values("module"),
        "available_owners": data_manager.unique_values("owner"),
        "available_sprints": data_manager.unique_values("sprint"),
        "available_test_types": data_manager.unique_values("test_type"),
        "available_severities": data_manager.unique_values("severity"),
        "available_labels_sample": data_manager.unique_values("labels")[:50],
    }, indent=2, default=str)


@mcp.tool
def reload_data() -> str:
    """Reload test case data from the source file (useful after external edits to Excel/CSV)."""
    data_manager.reload()
    return json.dumps({"status": "reloaded", "total_records": len(data_manager.df)})


# ---------------------------------------------------------------------------
# Resources
# ---------------------------------------------------------------------------

@mcp.resource("testcases://all")
def resource_all_testcases() -> str:
    """Return all test cases as JSON (full dataset)."""
    results = [_row_to_dict(data_manager.df.iloc[i], data_manager.col_map) for i in range(len(data_manager.df))]
    return json.dumps({"total": len(results), "test_cases": results}, indent=2, default=str)


@mcp.resource("testcases://stats")
def resource_statistics() -> str:
    """Return statistics summary as JSON."""
    return json.dumps(data_manager.statistics(), indent=2, default=str)


@mcp.resource("testcases://priorities")
def resource_priorities() -> str:
    """Return list of unique priority values."""
    return json.dumps(data_manager.unique_values("priority"), indent=2)


@mcp.resource("testcases://modules")
def resource_modules() -> str:
    """Return list of unique module names."""
    return json.dumps(data_manager.unique_values("module"), indent=2)


@mcp.resource("testcases://owners")
def resource_owners() -> str:
    """Return list of unique owner names."""
    return json.dumps(data_manager.unique_values("owner"), indent=2)


@mcp.resource("testcases://statuses")
def resource_statuses() -> str:
    """Return list of unique status values."""
    return json.dumps(data_manager.unique_values("status"), indent=2)


@mcp.resource("testcases://test_types")
def resource_test_types() -> str:
    """Return list of unique test type values."""
    return json.dumps(data_manager.unique_values("test_type"), indent=2)


@mcp.resource("testcases://sprints")
def resource_sprints() -> str:
    """Return list of unique sprint identifiers."""
    return json.dumps(data_manager.unique_values("sprint"), indent=2)


@mcp.resource("testcases://{test_case_id}")
def resource_test_case(test_case_id: str) -> str:
    """Dynamic resource — retrieve a specific test case by ID (e.g. testcases://TC-00001)."""
    record = data_manager.get_test_case(test_case_id)
    if record is None:
        return json.dumps({"error": f"Test case '{test_case_id}' not found."})
    return json.dumps(record, indent=2, default=str)


# ---------------------------------------------------------------------------
# Prompts
# ---------------------------------------------------------------------------

@mcp.prompt
def review_test_case(test_case_id: str) -> str:
    """Review a test case for clarity, assertions, edge cases, coverage, and maintainability."""
    record = data_manager.get_test_case(test_case_id)
    if record is None:
        return f"Test case '{test_case_id}' not found. Please provide a valid test case ID."

    return f"""You are a Senior QA Reviewer. Analyze the following test case and provide a detailed review.

TEST CASE TO REVIEW:
{json.dumps(record, indent=2, default=str)}

Review Criteria:
1. Clarity — Are the summary, steps, and expected result clear and unambiguous?
2. Assertions — Are the expected results measurable and verifiable?
3. Edge Cases — What edge cases or negative scenarios are missing?
4. Coverage — Does this test cover all relevant paths for the module/feature?
5. Maintainability — Can this test be easily updated when requirements change?

Provide actionable recommendations for improvement, organized by criterion."""


@mcp.prompt
def suggest_regression_pack(module: str, max_cases: int = 20) -> str:
    """Suggest a regression test suite for a given module."""
    results = data_manager.search(module=module, test_type="Regression", limit=max_cases)
    all_mod_cases = data_manager.search(module=module, limit=500)
    priorities = data_manager.unique_values("priority")

    return f"""You are a QA Strategist. Suggest a regression test pack for the module: '{module}'.

Available regression tests for this module:
{json.dumps(results, indent=2, default=str)}

All test cases in this module ({len(all_mod_cases)} total, showing up to 30):
{json.dumps(all_mod_cases[:30], indent=2, default=str)}

Available priorities: {priorities}

Instructions:
1. Select up to {max_cases} test cases that provide optimal regression coverage.
2. Prioritize P0 and P1 tests first, then fill remaining slots with P2/P3.
3. Ensure coverage across different sub-features and test types within the module.
4. Include at least one edge case or negative scenario if available.
5. Return the recommended list with a brief justification for each selection."""


@mcp.prompt
def generate_bdd(test_case_id: str) -> str:
    """Convert a test case into Given/When/Then BDD (Gherkin) format."""
    record = data_manager.get_test_case(test_case_id)
    if record is None:
        return f"Test case '{test_case_id}' not found."

    return f"""You are a BDD Expert. Convert the following test case into Given / When / Then format.

TEST CASE:
{json.dumps(record, indent=2, default=str)}

Instructions:
1. Extract preconditions into Given clause(s).
2. Extract each step into a When clause.
3. Extract expected results into Then clause(s), adding And for multiple assertions.
4. Include a Scenario title derived from the summary.
5. Tag the scenario with @module_name, @priority and relevant @labels.
6. Output in standard Gherkin syntax (Feature / Scenario / Given / When / Then / And)."""


@mcp.prompt
def summarize_module_tests(module: str) -> str:
    """Generate a comprehensive module-level QA summary report."""
    results = data_manager.search(module=module, limit=1000)
    stats = data_manager.statistics()

    module_stats: Dict[str, Any] = {
        "total": len(results),
        "by_priority": {},
        "by_status": {},
        "by_test_type": {},
    }
    for r in results:
        for key in ["priority", "status", "test_type"]:
            val = r.get(key, "Unknown") or "Unknown"
            bucket = module_stats[f"by_{key}"]
            bucket[str(val)] = bucket.get(str(val), 0) + 1

    return f"""You are a QA Reporting Lead. Generate a comprehensive QA summary for the module: '{module}'.

MODULE STATISTICS:
{json.dumps(module_stats, indent=2, default=str)}

SAMPLE TEST CASES (up to 5):
{json.dumps(results[:5], indent=2, default=str)}

Instructions:
1. Provide a high-level executive summary of the module's QA health.
2. Analyze the distribution by priority, status, and test type — call out anomalies.
3. Identify coverage gaps (missing test types, low-priority overload, stale tests).
4. Suggest the top 3 actions the team should take to improve quality.
5. Give the module a health score (A-F) with a brief justification."""


# ---------------------------------------------------------------------------
# Entry Points
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    _init_data()
    mcp.run(transport="stdio")
