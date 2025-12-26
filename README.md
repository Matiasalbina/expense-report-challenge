🧾 Expense Report App – Full-Stack Technical Challenge
📌 Overview

This project is a full-stack expense reporting application built as part of a technical assessment.
The goal of the app is to allow employees to:

- Log in (mock authentication)
- Create expense reports manually or via bulk file upload
- Validate expenses against business rules
- Submit valid reports
- View submitted reports and their details
- Visualize expenses using analytics charts (bonus feature)
- The application focuses on clean architecture, strong validation, clear UX feedback, and type safety across frontend and backend.

🏗️ Tech Stack Frontend

React

- TypeScript
- Vite
- Tailwind CSS
- Chart.js (via react-chartjs-2)

Backend

- FastAPI
- Pydantic
- Python 3
- Persistence
- In-memory data structures / local JSON files
- No database required (as specified in the challenge)

✨ Features

🔐 Authentication (Mocked)

- Simple login page (email + password)
- Email format validation
- Password required
- Backend returns a mock token
- Token stored in LocalStorage
- Dashboard routes protected on the frontend

📊 Dashboard

Displays a list of submitted expense reports
Shows:

- Creation date
- Number of items
- Total amount
- Ability to view report

✍️ Manual Expense Entry

Create a single expense line item using a form with:

- Date (restricted to allowed range)
- Amount (must be > 0)
- Currency (fixed to USD)
- Department (dropdown from /data)
- Category (dropdown from /data)
- Description (minimum 3 characters)

UX highlights:

- Client-side validation
- Clear red error messages when fields are missing or invalid
- Visual field highlighting
- Success confirmation on submit

📂 Bulk Upload & Validation (Core Requirement)

Users can upload a .csv or .xlsx file containing multiple expenses.
Flow:

- Frontend sends file to POST /expenses/validate
- Backend parses and validates every row

Backend returns:

- Valid rows
- Invalid rows with detailed error messages

Frontend displays:

- Validation summary
- Row-level errors (e.g. “Row 3: Future date not allowed”)
- Users must remove or fix invalid rows before submitting
- Only valid rows can be submitted as a report

✅ Business Rules Implemented

- Amount: Must be greater than 0
- Date: Cannot be in the future
- Currency: Must be USD
- Description: Minimum 3 characters
- Department & Category: Must exist in /data reference files
  All rules are enforced on the backend, with additional UX validation on the frontend.

Analytics Dashboard

Visual summary of expenses using charts:

- Pie Chart: Total expenses by Category
- Bar Chart: Total expenses by Department
  These charts update dynamically based on submitted reports and help visualize spending distribution at a glance.

Libraries used:

- chart.js
- react-chartjs-2

Chosen because they are:

- Lightweight
- Widely adopted
- Well suited for dashboard-style analytics

🧠 Architectural Decisions
Frontend

Strong use of TypeScript interfaces and types
Clear separation between:

- UI components
- API layer
- Utilities / formatters

Centralized API handler with consistent error handling
Explicit loading, error, and success states for better UX

Backend

Clean separation of concerns:

- Routers
- Services
- Validation logic
- Schemas

Pydantic models used for:

- Request validation
- Response consistency

Validation rules centralized in one service
Defensive error handling to avoid leaking internals

🎨 UI & UX

Built with Tailwind CSS for:

- Rapid development
- Consistent design
- Easy responsiveness
- Responsive layout for dashboard and forms

Clear visual feedback:

- Loading indicators
- Red error alerts
- Green success messages

Currency formatted as USD ($1,200.00)
Dates displayed in US format (MM/DD/YYYY)

🚀 How to Run the Project
Backend:

cd backend

# Create virtual environment

python -m venv venv

# Activate virtual environment

venv\Scripts\Activate.ps1

# Install dependencies

pip install -r requirements.txt

# Run the backend

uvicorn app.main:app --reload

Backend will be available at:
http://localhost:8000

Health check:
http://localhost:8000/health

Frontend

- cd frontend
- npm install
- npm run dev

Login:

- email: test@test.com
- Password: 1234

✅ Conclusion

This project demonstrates a complete full-stack solution focused on clarity, validation, and maintainability.
It covers the full expense reporting workflow — from data entry and validation to submission and visualization — while respecting the constraints of the technical challenge.

Special emphasis was placed on:
Strong backend validation and clear error reporting
Type safety and predictable data flow between frontend and backend
A clean, user-friendly interface with meaningful feedback
Readable and modular code organization on both sides of the stack
The architecture is intentionally simple yet scalable, allowing the application to be easily extended with features such as persistent databases, real authentication, or role-based access control.
Overall, this implementation aims to balance correctness, usability, and code quality, reflecting real-world development practices in a controlled technical assessment environment.
