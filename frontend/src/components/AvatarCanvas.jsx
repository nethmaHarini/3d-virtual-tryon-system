import React, {
  Suspense,
  useEffect,
  useMemo,
} from "react";

import {
  Canvas,
  useLoader,
} from "@react-three/fiber";

import { OrbitControls } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import * as THREE from "three";


function AvatarModel({ modelPath }) {
  const loadedObject = useLoader(
    OBJLoader,
    modelPath
  );

  const avatarObject = useMemo(() => {
    const clonedObject =
      loadedObject.clone(true);

    // -----------------------------------------
    // 0. Correct avatar orientation
    // -----------------------------------------
    clonedObject.rotation.z = Math.PI;

    clonedObject.updateMatrixWorld(true);

    // -----------------------------------------
    // 1. Improve mesh material
    // -----------------------------------------
    clonedObject.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        child.material =
          new THREE.MeshStandardMaterial({
            color: 0xd6d9df,
            roughness: 0.72,
            metalness: 0.02,
            side: THREE.DoubleSide,
          });
      }
    });

    // -----------------------------------------
    // 2. Get original bounding box
    // -----------------------------------------
    let boundingBox =
      new THREE.Box3().setFromObject(
        clonedObject
      );

    const originalSize =
      new THREE.Vector3();

    boundingBox.getSize(
      originalSize
    );

    // -----------------------------------------
    // 3. Scale avatar to consistent height
    // -----------------------------------------
    const targetDisplayHeight = 2.0;

    if (originalSize.y > 0) {
      const scaleFactor =
        targetDisplayHeight /
        originalSize.y;

      clonedObject.scale.setScalar(
        scaleFactor
      );
    }

    clonedObject.updateMatrixWorld(
      true
    );

    // -----------------------------------------
    // 4. Recalculate bounding box after scaling
    // -----------------------------------------
    boundingBox =
      new THREE.Box3().setFromObject(
        clonedObject
      );

    const center =
      new THREE.Vector3();

    boundingBox.getCenter(
      center
    );

    // -----------------------------------------
    // 5. Center avatar horizontally
    // -----------------------------------------
    clonedObject.position.x -=
      center.x;

    clonedObject.position.z -=
      center.z;

    // -----------------------------------------
    // 6. Position avatar vertically
    // -----------------------------------------
    clonedObject.position.y -=
      boundingBox.min.y;

    // Move avatar so its center is around Y = 0
    clonedObject.position.y -= 1.0;

    clonedObject.updateMatrixWorld(
      true
    );

    return clonedObject;

  }, [loadedObject]);

  // -----------------------------------------
  // Cleanup Three.js resources
  // -----------------------------------------
  useEffect(() => {
    return () => {
      avatarObject.traverse(
        (child) => {
          if (child.isMesh) {
            child.geometry?.dispose();

            if (
              Array.isArray(
                child.material
              )
            ) {
              child.material.forEach(
                (material) =>
                  material.dispose()
              );
            } else {
              child.material?.dispose();
            }
          }
        }
      );
    };
  }, [avatarObject]);

  return (
    <primitive
      object={avatarObject}
    />
  );
}


function LoadingAvatar() {
  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry
        args={[
          0.08,
          24,
          24,
        ]}
      />

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

        background:
          "transparent",

        borderRadius: "18px",

        overflow: "hidden",

        boxShadow: "none",

        boxSizing:
          "border-box",
      }}
    >
      <Canvas
        camera={{
          position: [
            0,
            0,
            4.2,
          ],
          fov: 32,
          near: 0.1,
          far: 100,
        }}
        shadows
      >
        {/* Ambient lighting */}
        <hemisphereLight
          intensity={0.9}
          groundColor={
            0x202020
          }
        />

        {/* Main light */}
        <directionalLight
          position={[
            3,
            5,
            4,
          ]}
          intensity={1.4}
          castShadow
        />

        {/* Fill light */}
        <directionalLight
          position={[
            -3,
            2,
            2,
          ]}
          intensity={0.7}
        />

        {/* Front light */}
        <directionalLight
          position={[
            0,
            2,
            5,
          ]}
          intensity={0.6}
        />

        <Suspense
          fallback={
            <LoadingAvatar />
          }
        >
          <AvatarModel
            key={modelPath}
            modelPath={
              modelPath
            }
          />
        </Suspense>

        <OrbitControls
          target={[
            0,
            0,
            0,
          ]}
          enablePan={false}
          enableDamping
          dampingFactor={
            0.08
          }
          rotateSpeed={
            0.75
          }
          zoomSpeed={
            0.85
          }
          minDistance={2}
          maxDistance={6}
          minPolarAngle={
            Math.PI / 8
          }
          maxPolarAngle={
            (Math.PI * 7) /
            8
          }
        />
      </Canvas>
    </div>
  );
}