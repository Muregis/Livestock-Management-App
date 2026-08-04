import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

if (import.meta.env.DEV) {
  import("tempo-devtools").then(({ TempoDevtools }) => {
    TempoDevtools.init();
  }).catch(() => {});
}

const basename = import.meta.env.BASE_URL;

import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/toaster";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <AuthProvider>
        <App />
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
