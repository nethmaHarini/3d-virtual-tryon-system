import React from "react";
import AvatarViewer from "./components/AvatarViewer";

export default function AvatarResult() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f8fc",
        padding: "32px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            marginBottom: "12px",
            color: "#1a1a1a",
          }}
        >
          Your Generated Avatar
        </h1>

        <p
          style={{
            fontSize: "16px",
            color: "#555",
            marginBottom: "24px",
          }}
        >
          This is the 3D avatar generated from the uploaded front, side, and back images.
          You can rotate and zoom to inspect it.
        </p>

        <AvatarViewer />

        <div
          style={{
            marginTop: "24px",
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <button
            style={{
              padding: "12px 20px",
              borderRadius: "12px",
              border: "none",
              background: "#13245f",
              color: "#fff",
              cursor: "pointer",
              fontSize: "15px",
            }}
          >
            Download Avatar
          </button>

          <button
            style={{
              padding: "12px 20px",
              borderRadius: "12px",
              border: "1px solid #ccc",
              background: "#fff",
              color: "#222",
              cursor: "pointer",
              fontSize: "15px",
            }}
          >
            Generate Again
          </button>

          <button
            style={{
              padding: "12px 20px",
              borderRadius: "12px",
              border: "none",
              background: "#0d8b5a",
              color: "#fff",
              cursor: "pointer",
              fontSize: "15px",
            }}
          >
            Continue to Try-On
          </button>
        </div>
      </div>
    </div>
  );
}
