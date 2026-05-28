# Test Cases: VWO App Login

| Field | Value |
|-------|-------|
| **Version** | 1.0 |
| **Author** | Antigravity AI |
| **Date** | 2026-04-02 |
| **Total Test Cases** | 5 |

---

## Test Case Format

Each test case follows this structure:

| Field | Description |
|-------|-------------|
| **TC ID** | Unique identifier (TC-001, TC-002, ...) |
| **Title** | Brief description of what is tested |
| **Preconditions** | What must be true before the test |
| **Steps** | Step-by-step instructions |
| **Expected Result** | What should happen |
| **Priority** | High / Medium / Low |
| **Category** | Smoke / Functional / Negative |
| **Spec File** | Corresponding Playwright spec file |

---

## Test Cases

### TC-N001: Invalid Email Format
| Field | Description |
|-------|-------------|
| **TC ID** | TC-N001 |
| **Title** | Verify login fails when an invalid email format is entered |
| **Preconditions** | User is on `https://app.vwo.com/#/login` |
| **Steps** | 1. Enter `invalid_email_format` into the "Email address" field.<br>2. Enter a valid password (e.g., `Password123!`) into the "Password" field.<br>3. Click the "Sign in" button. |
| **Expected Result** | An inline validation error should appear under the email field prompting for a valid email address format. The user should not be able to log in. |
| **Priority** | High |
| **Category** | Negative |
| **Spec File** | `login_negative.spec.ts` |

### TC-N002: Empty Email Field
| Field | Description |
|-------|-------------|
| **TC ID** | TC-N002 |
| **Title** | Verify login fails when the email field is left blank |
| **Preconditions** | User is on `https://app.vwo.com/#/login` |
| **Steps** | 1. Leave the "Email address" field blank.<br>2. Enter a valid password (e.g., `Password123!`) in the "Password" field.<br>3. Click the "Sign in" button. |
| **Expected Result** | Immediate validation error indicating the email is required must be displayed. Form submission does not proceed to backend. |
| **Priority** | High |
| **Category** | Negative |
| **Spec File** | `login_negative.spec.ts` |

### TC-N003: Empty Password Field
| Field | Description |
|-------|-------------|
| **TC ID** | TC-N003 |
| **Title** | Verify login fails when the password field is left blank |
| **Preconditions** | User is on `https://app.vwo.com/#/login` |
| **Steps** | 1. Enter a valid email format (e.g., `test.user@example.com`) in the "Email address" field.<br>2. Leave the "Password" field blank.<br>3. Click the "Sign in" button. |
| **Expected Result** | Immediate validation error indicating the password is required must be displayed. Form submission does not proceed to backend. |
| **Priority** | High |
| **Category** | Negative |
| **Spec File** | `login_negative.spec.ts` |

### TC-N004: Incorrect Password Credentials
| Field | Description |
|-------|-------------|
| **TC ID** | TC-N004 |
| **Title** | Verify login fails with a valid email but incorrect password |
| **Preconditions** | User is on `https://app.vwo.com/#/login`. An existing VWO valid user account is known (`valid_user@vwo.com`). |
| **Steps** | 1. Enter the valid registered email (`valid_user@vwo.com`) into the "Email address" field.<br>2. Enter an incorrect wrong password (e.g., `IncorrectPass!123`) in the "Password" field.<br>3. Click the "Sign in" button. |
| **Expected Result** | Backend validation fails and returns an "Invalid credentials" error banner or message on the UI. The user's session is not established. |
| **Priority** | High |
| **Category** | Negative |
| **Spec File** | `login_negative.spec.ts` |

### TC-N005: Password Contains Only Spaces
| Field | Description |
|-------|-------------|
| **TC ID** | TC-N005 |
| **Title** | Verify login fails when password contains only spaces |
| **Preconditions** | User is on `https://app.vwo.com/#/login` |
| **Steps** | 1. Enter a valid email format (e.g., `test.user@example.com`) in the "Email address" field.<br>2. Enter multiple space characters (`   `) into the "Password" field.<br>3. Click the "Sign in" button. |
| **Expected Result** | The application rejects the input, treating the spaces as an invalid or functionally empty input, displaying a relevant "invalid or empty password" message. |
| **Priority** | High |
| **Category** | Negative |
| **Spec File** | `login_negative.spec.ts` |

---

## Summary

| Priority | Count |
|----------|-------|
| High | 5 |
| Medium | 0 |
| Low | 0 |
| **Total** | **5** |

| Category | Count |
|----------|-------|
| Smoke | 0 |
| Functional | 0 |
| Negative | 5 |
