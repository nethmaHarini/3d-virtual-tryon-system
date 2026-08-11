import React from "react";

import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Layout from "./components/Layout";

import LandingPage from "./LandingPage";
import Login from "./Login";
import Dashboard from "./Dashboard";
import AvatarViewer from "./AvatarViewer";
import Catalog from "./Catalog";
import GarmentDetail from "./GarmentDetail";
import TryOn from "./TryOn";
import ViewHistory from "./ViewHistory";
import Profile from "./Profile";
import ResetPassword from "./ResetPassword";
import ProtectedRoute from "./ProtectedRoute";
import Settings from "./Settings";

export default function App() {
  return (
    <Routes>
      {/* =============================================
          PUBLIC ROUTES
      ============================================== */}

      <Route element={<Layout />}>
        {/* Main landing page */}
        <Route
          path="/"
          element={<LandingPage />}
        />

        {/* Old landing aliases */}
        <Route
          path="/Landingpage"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

        <Route
          path="/landingpage"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

        {/* Old standalone pages now redirect
            into LandingPage sections */}

        <Route
          path="/features"
          element={
            <Navigate
              to="/#features"
              replace
            />
          }
        />

        <Route
          path="/how-it-works"
          element={
            <Navigate
              to="/#how-it-works"
              replace
            />
          }
        />

        <Route
          path="/faq"
          element={
            <Navigate
              to="/#faq"
              replace
            />
          }
        />

        <Route
          path="/contact"
          element={
            <Navigate
              to="/#contact"
              replace
            />
          }
        />

        {/* Authentication */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />
      </Route>

      {/* =============================================
          PROTECTED ROUTES
      ============================================== */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/avatar-viewer"
        element={
          <ProtectedRoute>
            <AvatarViewer />
          </ProtectedRoute>
        }
      />

      <Route
        path="/catalog"
        element={
          <ProtectedRoute>
            <Catalog />
          </ProtectedRoute>
        }
      />

      <Route
        path="/garment-detail"
        element={
          <ProtectedRoute>
            <GarmentDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/try-on"
        element={
          <ProtectedRoute>
            <TryOn />
          </ProtectedRoute>
        }
      />

      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <ViewHistory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}