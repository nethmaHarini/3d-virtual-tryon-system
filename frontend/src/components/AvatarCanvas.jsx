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
        maxWidth: "100%",
        height: "70vh",
        minHeight: "560px",
        background: "transparent",
        borderRadius: "18px",
        overflow: "hidden",
        boxShadow: "none",
        boxSizing: "border-box",
      }}
    >
      <Canvas camera={{ position: [0, 0.9, 2.8], fov: 35 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[2, 5, 2]} intensity={1.2} />
        <directionalLight position={[-2, 5, 2]} intensity={0.6} />

        <Suspense fallback={null}>
          <AvatarModel modelPath={modelPath} />
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.75}
          zoomSpeed={0.85}
          minDistance={1.4}
          maxDistance={4.6}
          minPolarAngle={Math.PI / 5}
          maxPolarAngle={(Math.PI * 4) / 5}
        />
      </Canvas>
    </div>
  );
}