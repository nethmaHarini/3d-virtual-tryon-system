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

    // -------------------------------------------------
    // IMPORTANT:
    // Do NOT rotate the SMPL avatar 180 degrees.
    // The generated OBJ already uses Y as its vertical axis.
    // -------------------------------------------------

    clonedObject.rotation.set(
      0,
      0,
      0
    );

    clonedObject.updateMatrixWorld(
      true
    );

    // -------------------------------------------------
    // Avatar material
    // -------------------------------------------------

    clonedObject.traverse(
      (child) => {
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
      }
    );

    // -------------------------------------------------
    // Calculate original bounding box
    // -------------------------------------------------

    let boundingBox =
      new THREE.Box3().setFromObject(
        clonedObject
      );

    const originalSize =
      new THREE.Vector3();

    boundingBox.getSize(
      originalSize
    );

    // -------------------------------------------------
    // Scale avatar for viewer
    // -------------------------------------------------

    const targetDisplayHeight =
      2.0;

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

    // -------------------------------------------------
    // Bounding box after scaling
    // -------------------------------------------------

    boundingBox =
      new THREE.Box3().setFromObject(
        clonedObject
      );

    const center =
      new THREE.Vector3();

    boundingBox.getCenter(
      center
    );

    // -------------------------------------------------
    // Center avatar horizontally
    // -------------------------------------------------

    clonedObject.position.x -=
      center.x;

    clonedObject.position.z -=
      center.z;

    // -------------------------------------------------
    // Center avatar vertically
    // -------------------------------------------------

    clonedObject.position.y -=
      center.y;

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
    <mesh position={[0, 0, 0]}>
      <sphereGeometry
        args={[0.08, 24, 24]}
      />

      <meshStandardMaterial
        color={0x8b5cf6}
      />
    </mesh>
  );
}

const viewerBackgrounds = {
  dark:
    "radial-gradient(circle at 50% 30%, #18233a 0%, #0a111d 58%, #050a12 100%)",

  neutral:
    "radial-gradient(circle at 50% 30%, #777d88 0%, #505660 58%, #353a42 100%)",

  light:
    "radial-gradient(circle at 50% 30%, #ffffff 0%, #edf1f6 58%, #d8dee7 100%)",
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
            0,
            4.2,
          ],

          fov: 32,
          near: 0.1,
          far: 100,
        }}
        shadows
      >
        {/* AMBIENT LIGHT */}

        <hemisphereLight
          intensity={
            selectedBackground ===
            "light"
              ? 1.15
              : 0.9
          }
          groundColor={
            selectedBackground ===
            "light"
              ? 0x777777
              : 0x202020
          }
        />

        {/* MAIN LIGHT */}

        <directionalLight
          position={[
            3,
            5,
            4,
          ]}
          intensity={1.4}
          castShadow
        />

        {/* FILL LIGHT */}

        <directionalLight
          position={[
            -3,
            2,
            2,
          ]}
          intensity={0.7}
        />

        {/* FRONT LIGHT */}

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
          rotateSpeed={0.75}
          zoomSpeed={0.85}
          minDistance={2}
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