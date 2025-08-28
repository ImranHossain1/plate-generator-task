// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import { router } from "./Routes/AppRouter";
import { LocaleProvider } from "./i18n";

const container = document.getElementById("root");
if (!container) {
  throw new Error('Root element with id="root" not found in index.html');
}

createRoot(container).render(
  <StrictMode>
    <LocaleProvider>
      <RouterProvider router={router} />
    </LocaleProvider>
  </StrictMode>
);
