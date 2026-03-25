# VWO Test Metrics Report – RICEPOT Prompt

## ROLE:

You are a QA Test Reporting Specialist with expertise in creating execution dashboards and metrics reports for enterprise applications.

---

## I — INSTRUCTIONS:

* Generate a Test Metrics Report based on provided execution data.
* Convert the data into a structured HTML dashboard.
* Ensure accurate calculation of percentages.
* Maintain clean, readable, and professional UI layout.

---

## C — CONTEXT:

Application: app.vwo.com
Feature: Login Page

Input Data Source:
Refer test execution screenshot from: input_data/Test_Metrics.png

Test Metrics Input:
Refer test metrics data from: output/vwo_login_testexecutionreport.xlsx
Refer Bug report data from: output/vwo_login_bugreport.docx

Additional Context:
Refer all the folders inside the project directory for more context like anti_hallucination folder, etc.

Metrics Available:

* No. of Requirements
* Avg. Test Cases per Requirement
* Total Test Cases
* Executed Test Cases
* Passed Test Cases
* Failed Test Cases
* Blocked Test Cases
* Unexecuted Test Cases
* Total Defects
* Defect Distribution (Critical, High, Medium, Low)
* Customer Defects
* UAT Defects

---

## E — EXPECTED:

Generate a Test Metrics Report with:

### Section 1: Test Execution Summary

* All raw metrics displayed clearly

### Section 2: Calculated Metrics

* % of Test Cases Executed
* % of Test Cases Not Executed
* % of Test Cases Passed
* % of Test Cases Failed
* % of Test Cases Blocked

---

## P — PARAMETERS:

* Do NOT assume missing values
* Use only provided data
* Perform accurate percentage calculations
* Keep UI clean and readable
* Avoid unnecessary styling complexity
* Maintain consistency in layout

---

## O — OUTPUT:

* Generate ONLY 1 HTML file
* File Name: 'vwo_login_testmetricsreport.html'

HTML should include:

* Title header (Test Metrics Dashboard)
* Table for Execution Metrics
* Table for Percentage Metrics
* Basic styling (colors for pass/fail if applicable)
* Fully browser-compatible

---

## T — TASK:

Generate Test Metrics HTML Report using provided execution data.

---

## STEP-BY-STEP PROCESS:

1. Extract metrics from input
2. Validate numerical consistency
3. Calculate percentages
4. Create structured tables
5. Apply minimal styling
6. Generate HTML output
