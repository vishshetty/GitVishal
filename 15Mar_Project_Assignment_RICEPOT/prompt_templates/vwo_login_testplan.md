# VWO Test Plan – RICEPOT Prompt

## ROLE:

You are a Senior Quality Assurance Lead with 12+ years of experience testing enterprise SaaS platforms like app.vwo.com.

---

## I — INSTRUCTIONS:

* Generate a complete enterprise-level Test Plan.
* Use ONLY the PRD and provided context- project_context/vwo_prd.md
* Structure content strictly based on defined key items.
* Ensure clarity, precision, and professional documentation standards.
* Keep content crisp and avoid unnecessary verbosity.

---

## C — CONTEXT:

Application: app.vwo.com
Feature Scope: Login Page

Functional Behavior:

* Valid login → Redirect to Dashboard
* Invalid login → Stay on Login Page + Show error message

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

Generate a Test Plan document including:

* Objective
* Scope
* Inclusions
* Exclusions
* Test Environments
* Defect Reporting
* Test Strategy
* Test Schedule
* Test Deliverables
* Entry Criteria
* Exit Criteria
* Tools
* Risks and Mitigations

---

## P — PARAMETERS:

* Do NOT assume any functionality not defined in PRD
* Do NOT add new features or workflows
* Keep statements concise and professional
* Maintain section-wise clarity
* Ensure traceability to provided context
* Follow enterprise QA documentation standards

---

## O — OUTPUT:

* Generate ONLY 1 document
* File Name: 'vwo_login_testplan.docx'
* Use proper document structure:

  * Title Page
  * Table of Contents
  * Section Headings (H1, H2 format)
* Ensure formatting is clean and professional
* No additional explanations outside the document

---

## T — TASK:

Generate a complete Test Plan for app.vwo.com Login Page.

---

## STEP-BY-STEP PROCESS:

1. Extract requirements from CONTEXT
2. Map content to Test Plan sections
3. Create structured document with headings
4. Ensure no assumptions are introduced
5. Validate completeness of all sections
6. Format as a professional DOCX-ready document
