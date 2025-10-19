/**
 * Main Entry Point with Redux Store
 * Hoạt động 6 - Frontend Redux & Protected Routes
 */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Note: Router is now handled inside App.jsx with Redux Provider

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
