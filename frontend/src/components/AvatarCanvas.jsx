import React, {
  Suspense,
  useEffect,
  useMemo,
} from "react";

import {
  Canvas,
  useLoader,
} from "@react-three/fiber";

import {
  OrbitControls,
} from "@react-three/drei";

import {
  OBJLoader,
} from "three/examples/jsm/loaders/OBJLoader";

import * as THREE from "three";

function AvatarModel({
  modelPath,
}) {
  const loadedObject = useLoader(
    OBJLoader,
    modelPath
  );

  const avatarObject = useMemo(() => {
    const clonedObject =
      loadedObject.clone(true);

    // Keep original generated geometry orientation
    clonedObject.rotation.set(
      0,
      0,
      0
    );

    clonedObject.updateMatrixWorld(
      true
    );

    // -----------------------------------------
    // Material
    // -----------------------------------------
    clonedObject.traverse(
      (child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          child.material =
            new THREE.MeshStandardMaterial({
              color: 0xc9cdd4,
              roughness: 0.82,
              metalness: 0.0,
              side: THREE.DoubleSide,
            });
        }
      }
    );

    // -----------------------------------------
    // Calculate original dimensions
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
    // Scale for consistent viewer size
    // -----------------------------------------
    const targetDisplayHeight =
      2.35;

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
    // Recalculate bounds
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
    // Center avatar
    // -----------------------------------------
    clonedObject.position.x -=
      center.x;

    clonedObject.position.y -=
      center.y;

    clonedObject.position.z -=
      center.z;

    clonedObject.updateMatrixWorld(
      true
    );

    return clonedObject;
  }, [loadedObject]);

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
    <mesh>
      <sphereGeometry
        args={[
          0.07,
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

const viewerBackgrounds = {
  dark:
    "radial-gradient(circle at 50% 32%, #263247 0%, #111927 55%, #080d15 100%)",

  neutral:
    "radial-gradient(circle at 50% 32%, #a1a7b0 0%, #737983 58%, #4b5058 100%)",

  light:
    "radial-gradient(circle at 50% 32%, #ffffff 0%, #eef2f7 56%, #d7dde6 100%)",
};

export default function AvatarCanvas({
  modelPath =
    "/models/final_avatar.obj",

  backgroundMode,
}) {
  const storedBackground =
    localStorage.getItem(
      "viewer-background"
    ) || "dark";

  const selectedBackground =
    backgroundMode ||
    storedBackground;

  const background =
    viewerBackgrounds[
      selectedBackground
    ] ||
    viewerBackgrounds.dark;

  const isLight =
    selectedBackground ===
    "light";

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "100%",
        height: "70vh",
        minHeight: "560px",
        background,
        borderRadius: "18px",
        overflow: "hidden",
        boxShadow: "none",
        boxSizing: "border-box",
        transition:
          "background 250ms ease",
      }}
    >
      <Canvas
        camera={{
          position: [
            0,
            0.05,
            4.0,
          ],
          fov: 30,
          near: 0.1,
          far: 100,
        }}
        shadows
        gl={{
          antialias: true,
        }}
      >
        {/* General ambient light */}
        <ambientLight
          intensity={
            isLight
              ? 0.28
              : 0.22
          }
        />

        {/* Soft environment-style light */}
        <hemisphereLight
          intensity={
            isLight
              ? 0.55
              : 0.42
          }
          skyColor={
            isLight
              ? 0xffffff
              : 0xb8c8e8
          }
          groundColor={
            isLight
              ? 0x767676
              : 0x141820
          }
        />

        {/* Main light from upper-left */}
        <directionalLight
          position={[
            3.8,
            5.5,
            5,
          ]}
          intensity={1.15}
          castShadow
        />

        {/* Side contour light */}
        <directionalLight
          position={[
            -4,
            1.8,
            1.5,
          ]}
          intensity={0.48}
        />

        {/* Opposite side contour */}
        <directionalLight
          position={[
            4,
            0.8,
            -1,
          ]}
          intensity={0.26}
        />

        {/* Front fill — intentionally weaker */}
        <directionalLight
          position={[
            0,
            1.5,
            5,
          ]}
          intensity={0.32}
        />

        {/* Slight overhead definition */}
        <directionalLight
          position={[
            0,
            6,
            0.5,
          ]}
          intensity={0.24}
        />

        <Suspense
          fallback={
            <LoadingAvatar />
          }
        >
          <AvatarModel
            key={modelPath}
            modelPath={modelPath}
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
          dampingFactor={0.08}
          rotateSpeed={0.7}
          zoomSpeed={0.8}
          minDistance={2.4}
          maxDistance={6}
          minPolarAngle={
            Math.PI / 8
          }
          maxPolarAngle={
            (Math.PI * 7) / 8
          }
        />
      </Canvas>
    </div>
  );
}