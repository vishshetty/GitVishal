import openpyxl
from openpyxl import Workbook
import random, os

# Define columns
columns = [
    "Test Case ID",
    "Module Name",
    "Feature",
    "Test Scenario",
    "Preconditions",
    "Test Steps",
    "Expected Result",
    "Priority",
    "Regression Category"
]

modules = ["Authentication", "Dashboard", "Experiment Management", "Targeting", "Reporting", "User Management", "Integration", "Settings"]
features = {
    "Authentication": ["Login", "Logout", "Password Reset", "Multi-Factor Authentication"],
    "Dashboard": ["Overview Metrics", "Custom Widgets", "Time Range Filter"],
    "Experiment Management": ["Create Experiment", "Edit Experiment", "Delete Experiment", "Pause/Resume"],
    "Targeting": ["Audience Builder", "Geo Targeting", "Device Targeting"],
    "Reporting": ["Export CSV", "Scheduled Reports", "Real-time Analytics"],
    "User Management": ["Add User", "Edit Role", "Deactivate User"],
    "Integration": ["Google Analytics", "Segment", "Zapier"],
    "Settings": ["Account Settings", "Billing", "Notifications"]
}
priorities = ["High", "Medium", "Low"]
regression_categories = ["Critical", "Major", "Minor"]

wb = Workbook()
ws = wb.active
ws.append(columns)

for i in range(1, 101):
    module = random.choice(modules)
    feature = random.choice(features[module])
    test_id = f"TC{i:03d}"
    # Determine scenario description safely
    scenario_option = random.choice(["valid", "invalid", "edge case"])
    scenario = f"Verify {feature} functionality under {scenario_option} conditions"
    preconditions = "User is logged in" if module != "Authentication" else "User is on login page"
    steps = [
        "Navigate to the appropriate page",
        f"Perform action related to {feature}",
        "Submit the form",
        "Observe the outcome"
    ]
    test_steps = "; ".join(steps)
    expected = f"{feature} behaves as expected with proper success/failure messages"
    priority = random.choice(priorities)
    regression = random.choice(regression_categories)
    ws.append([
        test_id,
        module,
        feature,
        scenario,
        preconditions,
        test_steps,
        expected,
        priority,
        regression
    ])

# Ensure data folder exists
os.makedirs("data", exist_ok=True)
excel_path = os.path.join("data", "test_cases.xlsx")
wb.save(excel_path)
print(f"Generated {excel_path} with 100 test cases.")
