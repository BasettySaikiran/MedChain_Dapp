import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // Global CSS for styling
import App from "./App"; // Main App component

// Entry point
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// You can add React Router or error boundaries here if needed in the future.
