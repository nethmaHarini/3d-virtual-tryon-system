import React, { Suspense, useEffect, useMemo } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import * as THREE from "three";


function AvatarModel({ modelPath }) {
  const loadedObject = useLoader(
    OBJLoader,
    modelPath
  );

  const avatarObject = useMemo(() => {
    const clonedObject = loadedObject.clone(true);

    const boundingBox = new THREE.Box3().setFromObject(
      clonedObject
    );

    const size = new THREE.Vector3();
    const center = new THREE.Vector3();

    boundingBox.getSize(size);
    boundingBox.getCenter(center);

    // Move the avatar horizontally to the scene centre.
    clonedObject.position.x -= center.x;
    clonedObject.position.z -= center.z;

    // Place the lowest point of the avatar at Y = 0.
    clonedObject.position.y -= boundingBox.min.y;

    // Scale different OBJ files to a consistent display height.
    const targetDisplayHeight = 2.0;

    if (size.y > 0) {
      const scaleFactor =
        targetDisplayHeight / size.y;

      clonedObject.scale.setScalar(
        scaleFactor
      );
    }

    // Improve the appearance of the OBJ mesh.
    clonedObject.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        child.material = new THREE.MeshStandardMaterial({
          color: 0xd6d9df,
          roughness: 0.72,
          metalness: 0.02,
          side: THREE.DoubleSide,
        });
      }
    });

    return clonedObject;
  }, [loadedObject]);

  useEffect(() => {
    return () => {
      avatarObject.traverse((child) => {
        if (child.isMesh) {
          child.geometry?.dispose();

          if (Array.isArray(child.material)) {
            child.material.forEach(
              (material) => material.dispose()
            );
          } else {
            child.material?.dispose();
          }
        }
      });
    };
  }, [avatarObject]);

  return (
    <primitive
      object={avatarObject}
      position={[0, -1, 0]}
    />
  );
}


function LoadingAvatar() {
  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[0.08, 24, 24]} />

      <meshStandardMaterial
        color={0x8b5cf6}
      />
    </mesh>
  );
}


export default function AvatarCanvas({
  modelPath = "/models/final_avatar.obj",
}) {
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
      <Canvas
        camera={{
          position: [0, 0.1, 3.2],
          fov: 32,
        }}
        shadows
      >
        <ambientLight intensity={1.1} />

        <hemisphereLight
          intensity={0.8}
          groundColor={0x202020}
        />

        <directionalLight
          position={[3, 5, 4]}
          intensity={1.4}
          castShadow
        />

        <directionalLight
          position={[-3, 2, 2]}
          intensity={0.7}
        />

        <Suspense fallback={<LoadingAvatar />}>
          <AvatarModel
            key={modelPath}
            modelPath={modelPath}
          />
        </Suspense>

        <OrbitControls
          target={[0, 0, 0]}
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.75}
          zoomSpeed={0.85}
          minDistance={1.6}
          maxDistance={5}
          minPolarAngle={Math.PI / 8}
          maxPolarAngle={(Math.PI * 7) / 8}
        />
      </Canvas>
    </div>
  );
}