import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import UserProfilePage from "./components/settings/UserProfilePage";
import FarmSettingsPage from "./components/settings/FarmSettingsPage";
import { ErrorBoundary } from "./components/ErrorBoundary";

let routes: unknown[] = [];
if (import.meta.env.VITE_TEMPO === "true") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    routes = require("tempo-routes");
  } catch (e) {
    routes = [];
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/farm-settings" element={<FarmSettingsPage />} />
        </Routes>
        {routes.length > 0 && useRoutes(routes)}
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;