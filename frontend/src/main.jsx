import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App.jsx";
import Dashboard from "./Dashboard.jsx";
import AvatarViewer from "./AvatarViewer.jsx";
import ResetPassword from "./ResetPassword.jsx";
import Catalog from "./Catalog.jsx";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/avatar-viewer" element={<AvatarViewer />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/catalog" element={<Catalog />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);