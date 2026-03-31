import React, { Suspense } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

function AvatarModel({ modelPath }) {
  const obj = useLoader(OBJLoader, modelPath);
  return (
    <primitive
      object={obj}
      scale={1.0}
      position={[0, -0.2, 0]}
      rotation={[Math.PI, 0, 0]}
    />
  );
}

export default function AvatarCanvas({ modelPath = "/models/final_avatar.obj" }) {
  return (
    <div
      style={{
        width: "100%",
        height: "80vh",
        minHeight: "700px",
        background: "#0a1a2e",
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
      }}
    >
      <Canvas camera={{ position: [0, 0.9, 2.8], fov: 35 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[2, 5, 2]} intensity={1.2} />
        <directionalLight position={[-2, 5, 2]} intensity={0.6} />

        <Suspense fallback={null}>
          <AvatarModel modelPath={modelPath} />
        </Suspense>

        <OrbitControls />
      </Canvas>
    </div>
  );
}