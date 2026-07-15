import React from "react";
import { Routes, Route } from "react-router-dom";

import LandingPage from "./LandingPage";
import Login from "./Login";
import Dashboard from "./Dashboard";
import AvatarViewer from "./AvatarViewer";
import Catalog from "./Catalog";
import GarmentDetail from "./GarmentDetail";
import TryOn from "./TryOn";
import ResetPassword from "./ResetPassword";
import ProtectedRoute from "./ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
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
    </Routes>
  );
}
