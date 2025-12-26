import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import { isAuthed, clearToken } from "./lib/auth";

export default function App() {
  const [authed, setAuthed] = useState(isAuthed());

  if (!authed) {
    return <LoginPage onSuccess={() => setAuthed(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between rounded-lg bg-white p-4 shadow">
        <h1 className="text-xl font-bold text-gray-800">Expense Report App</h1>

        <button
          onClick={() => {
            clearToken();
            setAuthed(false);
          }}
          className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition"
        >
          Logout
        </button>
      </header>

      {/* Main content */}
      <main className="rounded-lg bg-white p-6 shadow">
        <DashboardPage />
      </main>
    </div>
  );
}
