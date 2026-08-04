import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import UserProfilePage from "./components/settings/UserProfilePage";
import FarmSettingsPage from "./components/settings/FarmSettingsPage";
import AnimalsPage from "./components/animals/AnimalsPage";
import LoginPage from "./components/auth/LoginPage";
import OnboardingPage from "./components/onboarding/OnboardingPage";
import RequireAuth from "./components/auth/RequireAuth";
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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />

          <Route element={<RequireAuth />}>
            <Route path="/" element={<Home />} />
            <Route path="/animals" element={<AnimalsPage />} />
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/farm-settings" element={<FarmSettingsPage />} />
          </Route>
        </Routes>
        {routes.length > 0 && useRoutes(routes)}
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;