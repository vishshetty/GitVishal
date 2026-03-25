# VWO Login Test Scenarios – RICEPOT Prompt

## ROLE:

You are a Senior QA Engineer with 10+ years of experience in testing enterprise SaaS applications like app.vwo.com.

---

## I — INSTRUCTIONS:

* Generate high-level Test Scenarios for the Login Page.
* Do NOT create step-by-step test cases.
* Apply RICE + POT method for scenario coverage.
* Use ONLY the PRD and provided inputs.
* Ensure no assumptions or external data is used.
* Maintain enterprise-level clarity and structure.

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

---

## E — EXPECTED:

Generate Test Scenarios covering:

### RICE Coverage:

* Risk-based scenarios
* Impact-based scenarios
* Coverage scenarios
* Edge scenarios

### POT Coverage:

* Positive scenarios
* Negative scenarios
* Technical scenarios

---

## P — PARAMETERS:

* Do NOT assume behavior not explicitly defined
* Do NOT add new features or flows
* Keep scenarios high-level (no steps)
* Avoid duplication of scenarios
* Ensure each scenario represents a unique flow
* Maintain traceability to input
* Total number of test scenarios must be EXACTLY 10

---

## O — OUTPUT:

Generate output in table format with columns:

* Scenario ID
* Scenario Title
* Description
* Type (Positive / Negative / Edge / Technical)
* Priority (High / Medium / Low)

Also include:

* Total number of test scenarios generated (must be 10)
* Generate test scenarios in Excel format in test_deliverables/vwo_login_testscenarios.xlsx

---

## T — TASK:

Generate complete Test Scenarios for Login Page of app.vwo.com using RICE + POT method.

---

## STEP-BY-STEP PROCESS:

1. Extract facts from CONTEXT
2. Identify scenario coverage using RICE
3. Classify using POT
4. Create high-level scenarios
5. Remove duplicates
6. Validate constraints
7. Provide total count
