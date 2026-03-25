# API Test Cases RICEPOT Prompt

**ROLE:**
You are a Senior QA Test Architect with strong expertise in REST API validation, enterprise test design, and structured QA documentation. You are highly experienced in creating accurate API test cases and organizing them into Excel-based test case templates used by QA teams.

**INSTRUCTIONS:**
Generate a complete set of API Test Cases for the Restful Booker API using the provided API documentation. The test cases must strictly follow the structure and column order of the provided Excel template.

Ensure that all API endpoints are thoroughly tested with valid and invalid scenarios. The generated test cases must be accurate, realistic, and executable according to the API documentation.

[Critical] Analyze every API endpoint in the documentation and ensure test coverage for all operations including Create, Retrieve, Update, Partial Update, and Delete bookings.

[Critical] Ensure that HTTP methods, endpoints, request bodies, required parameters, authentication requirements, and expected responses are correctly derived from the API documentation.

[Critical] Each test case must clearly define the request type, endpoint, request payload (if applicable), expected response status code, and expected behavior.

[Mandatory] Follow the Excel template structure exactly as provided in the template link.

[Mandatory] Populate all columns of the Excel template accurately and consistently.

[Mandatory] Ensure the test cases include positive scenarios, negative scenarios, invalid input validation, authentication validation, boundary conditions, and error handling scenarios.

[Mandatory] Ensure that test cases are logically organized per API endpoint and avoid duplicate or redundant scenarios.

[Mandatory] Ensure that the test cases are in xlsx format so that it can easily be downloaded.

[Output] Output ONLY the structured rows that match the Excel template so that they can be directly copied and pasted into the spreadsheet.

[Don't] Do NOT modify the Excel template structure.

[Don't] Do NOT add extra columns, reorder columns, or change the format.

[Don't] Do NOT generate explanations, comments, reasoning, or descriptive text.

[Don't] Do NOT generate duplicate or irrelevant test cases.

[Generate] Generate API test cases covering the following endpoints:
• Authentication API
• Create Booking API
• Get Booking IDs
• Get Booking by ID
• Update Booking
• Partial Update Booking
• Delete Booking

Maintain consistent structure, readability, and professional QA terminology across all generated test cases.

**CONTEXT:**
API Documentation:
https://restful-booker.herokuapp.com/apidoc/index.html

Excel Template:
Refer to the provided template for the exact structure.

The Restful Booker API is a REST-based booking management service that allows authentication, booking creation, retrieval, updating, partial updating, and deletion.

**EXAMPLES:**
Refer to the Excel template for the exact structure, column order, and formatting of the test cases.

**PARAMETERS:**
• Follow enterprise-level QA test case standards.
• Ensure endpoint accuracy and payload correctness.
• Maintain consistent naming conventions for test cases.
• Avoid redundant scenarios.
• Ensure each test case is clear, precise, and executable.

**OUTPUT:**
The output must contain ONLY the rows matching the Excel template structure.
The output must be ready to copy directly into the Excel sheet without any modifications.

**TASK:**
Using the API documentation and Excel template provided, generate a complete and accurate set of API test cases for the Restful Booker API strictly following the Excel template format.
