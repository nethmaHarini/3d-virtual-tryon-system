import React, {
  Suspense,
  useEffect,
  useMemo,
  useRef,
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

import {
  GLTFLoader,
} from "three/examples/jsm/loaders/GLTFLoader";

import * as THREE from "three";

function AvatarModel({
  modelPath,
  objectRef,
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

    console.log(
      "AVATAR SIZE:",
      originalSize.x,
      originalSize.y,
      originalSize.z
    );

    console.log(
      "AVATAR MIN:",
      boundingBox.min.x,
      boundingBox.min.y,
      boundingBox.min.z
    );

    console.log(
      "AVATAR MAX:",
      boundingBox.max.x,
      boundingBox.max.y,
      boundingBox.max.z
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
      ref={objectRef}
      object={avatarObject}
    />
  );
}

function GarmentModel({
  garmentPath,
  objectRef,
}) {
  const gltf = useLoader(
    GLTFLoader,
    garmentPath
  );

  const garmentObject = useMemo(() => {
    const clonedObject =
      gltf.scene.clone(true);

    clonedObject.updateMatrixWorld(true);

    const garmentBox =
      new THREE.Box3().setFromObject(clonedObject);

    const garmentSize =
      new THREE.Vector3();

    const garmentCenter =
      new THREE.Vector3();

    garmentBox.getSize(garmentSize);
    garmentBox.getCenter(garmentCenter);

    console.log(
      "GARMENT SIZE:",
      garmentSize.x,
      garmentSize.y,
      garmentSize.z
    );

    console.log(
      "GARMENT CENTER:",
      garmentCenter.x,
      garmentCenter.y,
      garmentCenter.z
    );

    console.log(
      "GARMENT MIN:",
      garmentBox.min.x,
      garmentBox.min.y,
      garmentBox.min.z
    );

    console.log(
      "GARMENT MAX:",
      garmentBox.max.x,
      garmentBox.max.y,
      garmentBox.max.z
    );

    clonedObject.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material =
          child.material?.clone();
      }
    });

    // -----------------------------------------
    // Align garment with displayed avatar
    // -----------------------------------------

    // Avatar original height from generated SMPL model
    const avatarOriginalHeight = 1.5299999713897705;

    // AvatarCanvas displays avatar at this height
    const targetDisplayHeight = 2.35;

    // Use exactly the same scale applied to the avatar
    const avatarScale =
      targetDisplayHeight /
      avatarOriginalHeight;

    clonedObject.scale.setScalar(
      avatarScale
    );

    clonedObject.updateMatrixWorld(true);

    // Get garment bounds after scaling
    const alignedBox =
      new THREE.Box3().setFromObject(
        clonedObject
      );

    const alignedCenter =
      new THREE.Vector3();

    alignedBox.getCenter(
      alignedCenter
    );

    // Center garment horizontally/depth-wise
    clonedObject.position.x -=
      alignedCenter.x;

    clonedObject.position.z -=
      alignedCenter.z;

    // Position shirt around upper torso.
    // Avatar is centered at Y = 0 after display transformation.
    const targetTorsoY = 0.35;

    clonedObject.position.y +=
      targetTorsoY -
      alignedCenter.y;

    clonedObject.updateMatrixWorld(true);

    return clonedObject;
  }, [gltf]);

  return (
    <primitive
      ref={objectRef}
      object={garmentObject}
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

  garmentPath = null,

  backgroundMode,

  onFitAnalysis,
}) {
  const avatarRef = useRef(null);
  const garmentRef = useRef(null);

  const calculateFitAnalysis = () => {
    const avatar = avatarRef.current;
    const garment = garmentRef.current;

    if (!avatar || !garment) {
      console.log("FIT: models not ready");
      return;
    }

    try {
      avatar.updateMatrixWorld(true);
      garment.updateMatrixWorld(true);

      // Collect all mesh vertices in WORLD coordinates.
      const collectVertices = (object) => {
        const vertices = [];
        const point = new THREE.Vector3();

        object.traverse((child) => {
          if (!child.isMesh) return;

          const position =
            child.geometry?.attributes?.position;

          if (!position) return;

          for (let i = 0; i < position.count; i++) {
            point.fromBufferAttribute(position, i);
            point.applyMatrix4(child.matrixWorld);

            vertices.push(point.clone());
          }
        });

        return vertices;
      };

      const avatarVertices =
        collectVertices(avatar);

      const garmentVertices =
        collectVertices(garment);

      console.log(
        "FIT VERTEX COUNTS:",
        "avatar =",
        avatarVertices.length,
        "garment =",
        garmentVertices.length
      );

      const sampleVertices = (
        vertices,
        maxSamples = 1500
      ) => {
        if (vertices.length <= maxSamples) {
          return vertices;
        }

        const step =
          Math.ceil(
            vertices.length / maxSamples
          );

        const sampled = [];

        for (
          let i = 0;
          i < vertices.length;
          i += step
        ) {
          sampled.push(vertices[i]);
        }

        return sampled;
      };

      const sampledAvatar =
        sampleVertices(
          avatarVertices,
          1500
        );

      const sampledGarment =
        sampleVertices(
          garmentVertices,
          1500
        );

      console.log(
        "FIT SAMPLED COUNTS:",
        "avatar =",
        sampledAvatar.length,
        "garment =",
        sampledGarment.length
      );

      const nearestDistance = (
        point,
        targetVertices
      ) => {
        let minDistanceSq = Infinity;

        for (const target of targetVertices) {
          const dx = point.x - target.x;
          const dy = point.y - target.y;
          const dz = point.z - target.z;

          const distanceSq =
            dx * dx +
            dy * dy +
            dz * dz;

          if (distanceSq < minDistanceSq) {
            minDistanceSq = distanceSq;
          }
        }

        return Math.sqrt(minDistanceSq);
      };

      const calculateRegionDistance = (
        regionName,
        centerY,
        regionBand
      ) => {
        // Keep points from the selected horizontal body region.
        const regionGarment =
          sampledGarment.filter(
            (v) =>
              Math.abs(v.y - centerY) <=
              regionBand
          );

        const regionAvatar =
          sampledAvatar.filter(
            (v) =>
              Math.abs(v.y - centerY) <=
              regionBand * 1.5
          );

        if (
          regionGarment.length === 0 ||
          regionAvatar.length === 0
        ) {
          console.log(
            `${regionName} DISTANCE: insufficient points`
          );

          return null;
        }

        const distances =
          regionGarment.map((point) =>
            nearestDistance(
              point,
              regionAvatar
            )
          );

        // Sort so a few unusual vertices do not dominate the result.
        distances.sort(
          (a, b) => a - b
        );

        // Median spatial clearance.
        const middle =
          Math.floor(
            distances.length / 2
          );

        const median =
          distances.length % 2 === 0
            ? (
                distances[middle - 1] +
                distances[middle]
              ) / 2
            : distances[middle];

        console.log(
          `${regionName} DISTANCE:`,
          median.toFixed(4),
          "samples:",
          distances.length
        );

        return median;
      };

      if (
        avatarVertices.length === 0 ||
        garmentVertices.length === 0
      ) {
        console.log("FIT: no mesh vertices found");
        return;
      }

      // Garment vertical range determines the area
      // of the avatar that the T-shirt actually covers.
      const garmentYs =
        garmentVertices.map((v) => v.y);

      const garmentMinY =
        Math.min(...garmentYs);

      const garmentMaxY =
        Math.max(...garmentYs);

      const garmentHeight =
        garmentMaxY - garmentMinY;

      /*
        Approximate anatomical levels within the shirt:
        chest = upper-middle region
        waist = lower-middle region
        hip = lower region
      */
      const regions = [
        {
          name: "Chest",
          y:
            garmentMinY +
            garmentHeight * 0.67,
        },
        {
          name: "Waist",
          y:
            garmentMinY +
            garmentHeight * 0.30,
        },
        {
          name: "Hip",
          y:
            garmentMinY +
            garmentHeight * 0.15,
        },
      ];

      // Horizontal band around each level.
      const band =
        Math.max(
          garmentHeight * 0.035,
          0.015
        );

      const chestDistance =
        calculateRegionDistance(
          "CHEST",
          regions[0].y,
          band
        );

      const waistDistance =
        calculateRegionDistance(
          "WAIST",
          regions[1].y,
          band
        );

      const hipDistance =
        calculateRegionDistance(
          "HIP",
          regions[2].y,
          band
        );

      console.log(
        "REGIONAL DISTANCES:",
        {
          chest: chestDistance,
          waist: waistDistance,
          hip: hipDistance,
        }
      );

      const measureSlice = (
        vertices,
        targetY
      ) => {
        const slice = vertices.filter(
          (v) =>
            Math.abs(v.y - targetY) <=
            band
        );

        if (slice.length < 5) {
          return null;
        }

        const xs = slice.map((v) => v.x);
        const zs = slice.map((v) => v.z);

        return {
          width:
            Math.max(...xs) -
            Math.min(...xs),

          depth:
            Math.max(...zs) -
            Math.min(...zs),

          count: slice.length,
        };
      };

      console.log(
        "========== REGIONAL FIT ANALYSIS =========="
      );

      const results = [];

      regions.forEach((region) => {
        const avatarSlice =
          measureSlice(
            avatarVertices,
            region.y
          );

        const garmentSlice =
          measureSlice(
            garmentVertices,
            region.y
          );

        if (!avatarSlice || !garmentSlice) {
          console.log(
            `${region.name}: insufficient vertices`
          );

          return;
        }

        const widthClearance =
          garmentSlice.width -
          avatarSlice.width;

        const depthClearance =
          garmentSlice.depth -
          avatarSlice.depth;

        console.log(
          `${region.name} Y:`,
          region.y.toFixed(4)
        );

        console.log(
          `${region.name} avatar W/D:`,
          avatarSlice.width.toFixed(4),
          avatarSlice.depth.toFixed(4)
        );

        console.log(
          `${region.name} garment W/D:`,
          garmentSlice.width.toFixed(4),
          garmentSlice.depth.toFixed(4)
        );

        console.log(
          `${region.name} clearance W/D:`,
          widthClearance.toFixed(4),
          depthClearance.toFixed(4)
        );

        results.push({
          region: region.name,
          widthClearance,
          depthClearance,
        });
      });

      console.log(
        "FIT RESULTS:",
        results
      );

      console.log(
        "CALLBACK EXISTS:",
        typeof onFitAnalysis
      );

      if (onFitAnalysis) {
        console.log(
          "SENDING FIT TO TRYON:",
          chestDistance,
          waistDistance,
          hipDistance
        );

        onFitAnalysis({
          chest: {
            distance: chestDistance,
          },
          waist: {
            distance: waistDistance,
          },
          hip: {
            distance: hipDistance,
          },
        });
      }

      console.log(
        "========== FIT COMPLETE =========="
      );
    } catch (error) {
      console.error(
        "FIT CALCULATION ERROR:",
        error
      );
    }
  };

  useEffect(() => {
    let attempts = 0;

    const timer = setInterval(() => {
      attempts += 1;

      console.log(
        "FIT ATTEMPT:",
        attempts,
        "avatar:",
        !!avatarRef.current,
        "garment:",
        !!garmentRef.current
      );

      if (
        avatarRef.current &&
        garmentRef.current
      ) {
        calculateFitAnalysis();
        clearInterval(timer);
      }

      if (attempts >= 10) {
        clearInterval(timer);
      }
    }, 500);

    return () => clearInterval(timer);
  }, [modelPath, garmentPath]);

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
            objectRef={avatarRef}
          />

          {garmentPath && (
            <GarmentModel
              key={garmentPath}
              garmentPath={garmentPath}
              objectRef={garmentRef}
            />
          )}
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