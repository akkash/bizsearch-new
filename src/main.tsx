import React from "react";
import * as ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

if (import.meta.env.DEV) {
  import("@/lib/supabase-diagnostics");
  (window as unknown as { React: typeof React; ReactDOM: typeof ReactDOM }).React = React;
  (window as unknown as { React: typeof React; ReactDOM: typeof ReactDOM }).ReactDOM = ReactDOM;
  console.log("⚛️ React Version:", React.version);
}

function Main() {
  return (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(<Main />);
