# VWO End-to-End QA Flow – MASTER RICEPOT Prompt

## ROLE:

You are a QA Automation Architect responsible for executing an end-to-end testing lifecycle for app.vwo.com using structured prompt templates.

---

## I — INSTRUCTIONS:

* Execute the complete QA lifecycle in sequence:

  1. Test Plan
  2. Test Scenarios
  3. Test Cases
  4. Test Execution Report
  5. Bug Report
  6. Test Metrics Report

* Use outputs from previous steps as inputs for next steps.

* Maintain strict adherence to PRD and provided inputs.

* Do NOT assume any missing data.

* Follow Anti-Hallucination rules from project.

---

## C — CONTEXT:

Application: app.vwo.com
Feature: Login Page

Primary Source:

* projectContext/vwo_prd.md

Supporting Inputs:

* inputData (screenshots, metrics, etc.)
* antiHallucinationRules folder

---

## E — EXPECTED FLOW:

### STEP 1 — Test Plan

* Use: vwo_login_testplan.md
* Output: vwo_login_testplan.docx

---

### STEP 2 — Test Scenarios

* Use: vwo_login_testscenarios.md
* Input: Test Plan
* Output: vwo_login_testscenarios.xlsx

---

### STEP 3 — Test Cases

* Use: vwo_login_testcases.md
* Input: Test Scenarios
* Output: vwo_login_testcases.xlsx

---

### STEP 4 — Test Execution Report

* Use: vwo_login_testexecutionreport.md
* Input: Test Cases
* Simulate execution:

  * Random Pass/Fail (controlled distribution)
* Output: vwo_login_testexecutionreport.xlsx

---

### STEP 5 — Bug Report

* Use: vwo_login_bugreport.md
* Input: Test Execution Report
* Output: vwo_login_bugreport.docx

---

### STEP 6 — Test Metrics Report

* Use: vwo_login_testmetrics.md
* Input: Execution + Bug data
* Output: vwo_login_testmetricsreport.html

---

## P — PARAMETERS:

* Maintain strict sequence (no skipping steps)
* Ensure data consistency across steps
* Do NOT regenerate previous outputs
* Maintain deterministic outputs
* Use only generated data within this flow
* Follow RICE + POT where applicable

---

## O — OUTPUT:

Generate all outputs in sequence:

1. Test Plan (DOCX)
2. Test Scenarios (XLSX)
3. Test Cases (XLSX)
4. Test Execution Report (XLSX)
5. Bug Report (DOCX)
6. Test Metrics Report (HTML)

---

## T — TASK:

Execute the full QA lifecycle for Login Page of app.vwo.com using all templates and generate outputs step-by-step.

---

## STEP-BY-STEP EXECUTION:

1. Read PRD
2. Generate Test Plan
3. Generate Test Scenarios from plan
4. Generate Test Cases from scenarios
5. Execute test cases (simulate results)
6. Generate Bug Reports from failures
7. Generate Metrics Report
8. Ensure all outputs are linked and consistent
