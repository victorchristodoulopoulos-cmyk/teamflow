// index.tsx (EN LA RAÍZ DEL PROYECTO)
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { StoreProvider } from "./context/Store";
import { ThemeProvider } from "./context/Theme";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <StoreProvider>
        <App />
      </StoreProvider>
    </ThemeProvider>
  </React.StrictMode>
);
