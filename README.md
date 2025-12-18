# Full-Stack Technical Challenge: Expense Report App

## Overview

Welcome! This assessment evaluates your ability to build a realistic business application using **React**, **TypeScript**, and **FastAPI**.

The goal is to build an internal expense reporting tool where employees can draft expenses (manually or via file upload), validate them against business rules, and submit them.

- **Role:** Full Stack Developer
- **Stack:** React + TypeScript (Frontend), FastAPI (Backend)

## The Challenge

### 1. Architecture & Setup

- **Persistence:** You do **not** need a real database (Postgres/MySQL). You may use an in-memory structure (global variables) or a local JSON file to persist data on the backend.

### 2. Authentication (Mocked)

- Create a simple Login page (Email/Password).
- **Validation:** Email format must be valid. Password cannot be empty.
- **Flow:** On success, the backend returns a mock token. The frontend should persist this (e.g., LocalStorage) to protect dashboard routes.

### 3. Dashboard & Manual Entry

- **Dashboard:** Displays a list of submitted reports.
- **Create Report:** A form to add a single expense line item.
  - **Fields:** Date, Amount, Currency (Fixed to USD), Department, Category, Description.
  - **Dropdowns:** Populate Department and Category options using the JSON files provided in `/data`.

### 4. Bulk Upload & Validation (Key Requirement)

Users must be able to upload the provided `sample_expenses.xlsx` or `.csv` file.

1.  Frontend sends the file to Backend `POST /expenses/validate`.
2.  Backend parses the file and checks **every row**.
3.  Backend returns which rows are valid and which have errors.
4.  Frontend displays a summary (e.g., "Row 3 Error: Future date not allowed").
5.  User can only "Submit" the report once errors are fixed or invalid rows are removed.

### 5. Business Rules

- **Amount:** Must be > 0.
- **Date:** Cannot be in the future.
- **Currency:** **Must be 'USD'**. Any other currency should be flagged as invalid.
- **Description:** Minimum 3 characters.

---

## Technical Expectations

### 1. Frontend (React + TS)

- **Type Safety:** Strong usage of Interfaces/Types.
- **State Management:** Clear handling of "Draft" vs "Submitted" state.
- **UX:** Clear error feedback.

### 2. UI & Styling

- **Framework:** You are free to use any CSS framework or Component Library (explain your choice).
- **Responsiveness:** The Dashboard and Forms must be responsive.
- **Feedback:** The UI must communicate state changes clearly:
  - Show a **loading spinner** or progress bar during file upload.
  - Show **red error messages** (toasts or alerts) when validation fails.
  - Show a **success message** when a report is submitted.
- **Formatting:** Ensure all monetary values are formatted correctly as currency (e.g., `$1,200.00`) and dates follow the Us convention MM-DD-YYYY

### 3. Backend (FastAPI)

- **Pydantic:** Use models for schema validation.
- **Architecture:** Clean separation of concerns (don't put all logic in one file).
- Requirements reference file was provided, you can add aditional libraries if you consider they will add value to the solution.

## Evaluation Criteria

We look for:

1.  **Code Quality:** Readability and structure.
2.  **Validation Logic:** Handling of edge cases in the file upload.
3.  **Completeness:** Does the full flow (Login -> Upload -> Validate -> Submit) work?
4.  **UI/UX Implementation:**
    - Responsiveness &
    - Polish on user feedback (loading states, error handling).

## Setup & Deliverables

1. **How to Submit**:
   -Fork this repository to your own GitHub account.
   -Push your changes to your fork.
   -Send us the URL to your repository. (If you prefer to keep your submission private, please clone this repo, push to a private repo of your own, and invite us as collaborators.)
2. **Deliverables:**
   - Source code in `/frontend` and `/backend`.
   - `README.md` with instructions to run your solution.
3. **Inputs:** See the `/data` folder for allowed Departments, Categories, and a sample upload file.

## Bonus Points

## 🏆 Bonus Challenges (Optional)

Want to show off? Implementing one or more of these will make your submission stand out:

### 1. Integration

Integration: **Docker:** provide a `docker-compose.yml` file to run both the frontend and backend with a single command.

### 2. Analytics Dashboard

Add a visual summary to the Dashboard.

- Display a **Pie Chart** showing "Total Expenses by Category".
- Display a **Bar Chart** showing "Total Expenses by Department".

### 3. Smart Duplicate Detection

Prevent double-charging!

- If a user uploads an expense that matches an existing record (same Date, Amount, and Description), flag it as a **"Possible Duplicate"** during validation.
- Allow the user to "Ignore Warning" and submit anyway, or remove the duplicate.

### 4. Export to PDF

Allow users to download a submitted expense report as a clean, professional PDF file containing the list of expenses and the total calculation.

Good luck!
