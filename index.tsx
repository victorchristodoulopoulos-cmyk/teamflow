// index.tsx (EN LA RAÍZ DEL PROYECTO)
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { StoreProvider } from "./context/Store";
import { ThemeProvider } from "./context/Theme";
import "./index.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // 1 min sin “refetch” si ya está en cache
      gcTime: 10 * 60_000, // 10 min guardado en memoria
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <StoreProvider>
          <App />
        </StoreProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
