# VWO Login Test Cases – RICEPOT Prompt

## ROLE:

You are a Senior QA Engineer with 10+ years of experience in testing enterprise SaaS applications like app.vwo.com.

---

## I — INSTRUCTIONS:

* Generate comprehensive Test Cases for the Login Page.
* Apply RICE + POT method for coverage.
* Use ONLY the PRD and provided inputs.
* Ensure no assumptions or external data is used.
* Cover functional, validation, security, and navigation scenarios.
* Maintain enterprise-level quality and clarity.
* There should be a way to map the test cases to the test scenarios in the output Test Cases sheet.

---

## C — CONTEXT:

Application: app.vwo.com
Feature: Login Page

Functional Behavior:

* Valid login → Redirect to Dashboard
* Invalid login → Stay on Login Page + Show error message

UI Elements:

* Email field
* Password field
* Sign in button

Validations:

* Password must be minimum 8 characters and alphanumeric
* Error message: "Your email, password, IP address or location did not match"

Security:

* Rate limiting after 3 failed attempts
* Session timeout: 60 minutes

Navigation:

* Dashboard URL: https://app.vwo.com/#/dashboard

Additional Context:
Refer PRD from project_context/vwo_prd.md
Refer screenshots from input_data/login_screen.png and input_data/login_error.png
Refer all the folders inside the project directory for more context like anti_hallucination folder, etc.
Refer test scenarios from output/vwo_login_testscenarios.xlsx


---

## E — EXPECTED:

Generate test cases covering:

### RICE Coverage:

* Risk scenarios
* Impact scenarios
* Coverage scenarios
* Edge cases

### POT Coverage:

* Positive scenarios
* Negative scenarios
* Technical scenarios

---

## P — PARAMETERS:

* Do NOT assume behavior not explicitly defined
* Do NOT add new features or flows
* Use only provided UI elements and rules
* Keep statements crisp and precise
* Maintain test case independence
* Ensure traceability to input
* Total number of test cases must be EXACTLY 15

---

## O — OUTPUT:

Generate output in table format with columns:

* Test Case ID
* Title
* Preconditions
* Steps
* Expected Result
* Type (Positive / Negative / Edge / Technical)
* Priority (High / Medium / Low)

Also include:

* Total number of test cases generated (must be 15)
* Generate test cases in Excel format in test_deliverables/vwo_login_testcases.xlsx



---

## T — TASK:

Generate complete Test Cases for Login Page of app.vwo.com using RICE + POT method.

---

## STEP-BY-STEP PROCESS:

1. Extract facts from CONTEXT
2. Identify coverage using RICE
3. Classify scenarios using POT
4. Create structured test cases
5. Validate against constraints
6. Provide total count
