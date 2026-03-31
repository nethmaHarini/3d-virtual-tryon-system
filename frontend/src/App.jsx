import React from "react";
import { Routes, Route } from "react-router-dom";

import Login from "./Login";
import Dashboard from "./Dashboard";
import AvatarViewer from "./AvatarViewer";
import Catalog from "./Catalog";
import GarmentDetail from "./GarmentDetail";
import TryOn from "./TryOn";
import ProtectedRoute from "./ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

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
