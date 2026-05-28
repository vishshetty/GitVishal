# Test Plan: VWO App Login

| Field | Value |
|-------|-------|
| **Version** | 1.0 |
| **Author** | Antigravity AI |
| **Date** | 2026-04-02 |
| **Environment** | Production |
| **Browser** | Chromium, Firefox, WebKit |

---

## 1. Introduction

This test plan describes the testing approach for **VWO App Login**. It outlines the scope, test strategy, resources, schedule, and deliverables for the testing effort.

## 2. Objectives

- Verify core functionality works as expected
- Identify defects before production release
- Ensure user flows are complete and error-free
- Validate UI elements and navigation

## 3. Scope

### In Scope
- Standard Login functionality with Email and Password
- "Toggle password visibility" interaction
- "Remember me" checkbox functionality
- "Forgot Password?" flow initiation
- Third-party providers initiation ("Sign in with Google", "Sign in using SSO", "Sign in with Passkey")
- "Start a FREE TRIAL" link navigation
- "Privacy policy" and "Terms" link navigation

### Out of Scope
- Full end-to-end third party authentication (Google, SSO, Passkey completion)
- Backend user creation / modifications
- Load and Performance Testing
- Security and Penetration Testing

## 4. Test Strategy

### Test Approach
- **Automation Tool:** Playwright with @playwright/test
- **Test Type:** End-to-end functional testing
- **Browser:** Chromium, Firefox, WebKit
- **Environment:** Production

### Test Levels
- Smoke Testing (critical paths)
- Functional Testing (all features)
- Negative Testing (invalid inputs, error handling)

## 5. Test Environment

| Component | Details |
|-----------|---------|
| Application URL | https://app.vwo.com/#/login |
| Browser | Chromium, Firefox, WebKit |
| OS | Cross-platform (Node.js) |
| Framework | Playwright v1.58+ |
| Reporter | HTML + JSON |

## 6. Entry Criteria

- Application is deployed and accessible
- Test environment is configured
- Test data is available
- Test cases are reviewed and approved

## 7. Exit Criteria

- All planned test cases executed
- All critical/high priority defects resolved
- Test report generated and reviewed
- No open blockers

## 8. Test Cases Summary

- **TC_001_Valid_Login**: Verify user can login successfully with valid email and password.
- **TC_002_Invalid_Credentials**: Verify error messages on invalid email or password.
- **TC_003_Empty_Fields**: Verify validation warnings when required fields are left blank.
- **TC_004_Password_Visibility**: Verify the toggle password visibility icon toggles the text visibility.
- **TC_005_Remember_Me**: Verify checking "Remember me" maintains session logic correctly.
- **TC_006_Forgot_Password**: Verify "Forgot Password?" button redirects to the reset page.
- **TC_007_Google_SSO**: Verify "Sign in with Google" button triggers Google OAuth.
- **TC_008_Corporate_SSO**: Verify "Sign in using SSO" button navigates to the SSO login page.
- **TC_009_Passkey**: Verify "Sign in with Passkey" button prompts for Passkey verification.
- **TC_010_Free_Trial**: Verify "Start a FREE TRIAL" opens the correct signup page URL.
- **TC_011_Legal_Links**: Verify "Privacy policy" and "Terms" navigate to the respective legal documents.

## 9. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Application downtime | High | Use stable test environment |
| Flaky tests | Medium | Implement proper waits, no retries |
| Environment differences | Medium | Use consistent browser version |

## 10. Schedule

| Phase | Duration |
|-------|----------|
| Test Planning | 1 day |
| Test Case Design | 1 day |
| Test Execution | 1 day |
| Defect Reporting | Ongoing |
| Test Closure | 1 day |

## 11. Deliverables

- [x] Test Plan (this document)
- [ ] Test Cases Document
- [ ] Test Execution Report (HTML)
- [ ] Defect Reports (Jira tickets)
- [ ] Test Summary Report
