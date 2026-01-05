import React from "react";
import * as ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Initialize Supabase diagnostics (exposes window.runSupabaseDiagnostics)
import '@/lib/supabase-diagnostics';

// Make React and ReactDOM globally available immediately (not in useEffect)
window.React = React;
window.ReactDOM = ReactDOM;

console.log('⚛️ React Version:', React.version);
console.log('📦 Node Environment:', process.env.NODE_ENV);

function Main() {
  return (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(<Main />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
