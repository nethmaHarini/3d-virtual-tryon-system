import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import LandingPage from "./LandingPage";
import Features from "./Features";
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

export default function App() {
  return (
    <Routes>
      {/* 1. PUBLIC ROUTES 
        Wrapped in the Layout component so the Navbar appears at the top 
      */}
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<Features />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Route>

      {/* 2. PROTECTED ROUTES 
        Kept outside the Layout so they have their own independent styling 
      */}
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