import React, {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Canvas,
  useLoader,
} from "@react-three/fiber";

import {
  Html,
  OrbitControls,
} from "@react-three/drei";

import {
  OBJLoader,
} from "three/examples/jsm/loaders/OBJLoader";

import {
  GLTFLoader,
} from "three/examples/jsm/loaders/GLTFLoader";

import * as THREE from "three";
import {
  extractWorldMesh,
  analyzeFit,
} from "./fitAnalysis";
import {
  conformGarmentObject3D,
  measureGarmentCollision,
} from "./conformGarment";

function getDiagnosticMode() {
  if (!import.meta.env.DEV || typeof window === "undefined") return "C";
  const mode = new URLSearchParams(window.location.search)
    .get("virtufitMode")
    ?.toUpperCase();
  return ["A", "B", "C"].includes(mode) ? mode : "C";
}

class GarmentErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    this.props.onError?.(error);
    console.error("[VirtuFit3D] Garment render/load failure", error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <Html center>
        <div style={{ color: "#ffb4a8", minWidth: 240, textAlign: "center" }}>
          3D garment could not be loaded.
        </div>
      </Html>
    );
  }
}

function describeObject(object) {
  object.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const mesh = extractWorldMesh(object);
  let invalid = 0;
  let min = [Infinity, Infinity, Infinity];
  let max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < mesh.positions.length; i += 3) {
    const p = [mesh.positions[i], mesh.positions[i + 1], mesh.positions[i + 2]];
    if (!p.every(Number.isFinite)) {
      invalid++;
      continue;
    }

    for (let axis = 0; axis < 3; axis++) {
      min[axis] = Math.min(min[axis], p[axis]);
      max[axis] = Math.max(max[axis], p[axis]);
    }
  }
  return {
    boundingBox: { min: box.min.toArray(), max: box.max.toArray() },
    size: size.toArray(),
    height: size.y,
    worldScale: object.getWorldScale(new THREE.Vector3()).toArray(),
    worldRotation: object.getWorldQuaternion(new THREE.Quaternion()).toArray(),
    worldPosition: object.getWorldPosition(new THREE.Vector3()).toArray(),
    vertices: mesh.positions.length / 3,
    triangles: mesh.indices.length / 3,
    min,
    max,
    invalidCoordinates: invalid,
  };
}

function AvatarModel({
  modelPath,
  objectRef,
  onShoulderLandmarks,
  onTorsoData,
  onWaistData,
  hideLowerBody = false,
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

    const finalAvatarSize = new THREE.Vector3();
    const finalAvatarCenter = new THREE.Vector3();

    boundingBox.getSize(finalAvatarSize);
    boundingBox.getCenter(finalAvatarCenter);
    const landmarkMinY = boundingBox.min.y;
    const landmarkHeight = Math.max(finalAvatarSize.y, 1e-6);
    const landmarkCenterX = finalAvatarCenter.x;
    const landmarkWidth = Math.max(finalAvatarSize.x, 1e-6);

    // =========================================
    // AVATAR LANDMARK DIAGNOSTICS
    // =========================================

    const avatarLandmarks = {
      center: new THREE.Vector3(
        finalAvatarCenter.x,
        finalAvatarCenter.y,
        finalAvatarCenter.z
      ),

      topCenter: new THREE.Vector3(
        finalAvatarCenter.x,
        boundingBox.max.y,
        finalAvatarCenter.z
      ),

      bottomCenter: new THREE.Vector3(
        finalAvatarCenter.x,
        boundingBox.min.y,
        finalAvatarCenter.z
      ),
    };

    console.log("AVATAR LANDMARKS:", {
      center: avatarLandmarks.center.toArray(),
      topCenter: avatarLandmarks.topCenter.toArray(),
      bottomCenter: avatarLandmarks.bottomCenter.toArray(),

      min: [
        boundingBox.min.x,
        boundingBox.min.y,
        boundingBox.min.z,
      ],

      max: [
        boundingBox.max.x,
        boundingBox.max.y,
        boundingBox.max.z,
      ],

      size: [
        finalAvatarSize.x,
        finalAvatarSize.y,
        finalAvatarSize.z,
      ],
    });

    // =========================================
    // AVATAR UPPER-TORSO DETECTION
    // =========================================

    const torsoPoints = [];

    clonedObject.traverse((child) => {
      if (!child.isMesh || !child.geometry) {
        return;
      }

      const position =
        child.geometry.attributes.position;

      if (!position) {
        return;
      }

      const vertex =
        new THREE.Vector3();

      for (let i = 0; i < position.count; i++) {
        vertex.fromBufferAttribute(
          position,
          i
        );

        // Convert vertex into displayed avatar coordinates
        vertex.applyMatrix4(
          child.matrixWorld
        );

        // Upper torso/chest area.
        // Exclude arms by limiting X.
        if (
          vertex.y > landmarkMinY + landmarkHeight * 0.55 &&
          vertex.y < landmarkMinY + landmarkHeight * 0.75 &&
          Math.abs(vertex.x - landmarkCenterX) < landmarkWidth * 0.22
        ) {
          torsoPoints.push(
            vertex.clone()
          );
        }
      }
    });

    if (torsoPoints.length > 0) {
      const torsoBox =
        new THREE.Box3().setFromPoints(
          torsoPoints
        );

      const torsoSize =
        new THREE.Vector3();

      const torsoCenter =
        new THREE.Vector3();

      torsoBox.getSize(torsoSize);
      torsoBox.getCenter(torsoCenter);

      console.log(
        "AVATAR TORSO DATA:",
        {
          vertexCount:
            torsoPoints.length,

          center:
            torsoCenter.toArray(),

          size:
            torsoSize.toArray(),

          min:
            torsoBox.min.toArray(),

          max:
            torsoBox.max.toArray(),
        }
      );

      if (onTorsoData) {
        onTorsoData({
          center: torsoCenter.clone(),
          size: torsoSize.clone(),
          depth: torsoSize.z,
        });
      }
    } else {
      console.warn(
        "AVATAR TORSO: NO VERTICES FOUND"
      );
    }

    // =========================================
    // AVATAR WAIST / UPPER-HIP DETECTION
    // =========================================

    const avatarWaistPoints = [];

    clonedObject.traverse((child) => {
      if (!child.isMesh || !child.geometry) {
        return;
      }

      const position =
        child.geometry.attributes.position;

      for (let i = 0; i < position.count; i++) {
        const vertex = new THREE.Vector3(
          position.getX(i),
          position.getY(i),
          position.getZ(i)
        );

        // Convert to displayed avatar coordinates
        vertex.applyMatrix4(child.matrixWorld);

        // Waist / upper-hip band
        if (
          vertex.y > landmarkMinY + landmarkHeight * 0.40 &&
          vertex.y < landmarkMinY + landmarkHeight * 0.55 &&
          Math.abs(vertex.x - landmarkCenterX) < landmarkWidth * 0.22
        ) {
          avatarWaistPoints.push(vertex.clone());
        }
      }
    });

    if (avatarWaistPoints.length > 0) {
      const avatarWaistBox =
        new THREE.Box3().setFromPoints(
          avatarWaistPoints
        );

      const avatarWaistSize =
        new THREE.Vector3();

      const avatarWaistCenter =
        new THREE.Vector3();

      avatarWaistBox.getSize(avatarWaistSize);
      avatarWaistBox.getCenter(avatarWaistCenter);

      console.log("AVATAR WAIST DATA:", {
        vertexCount: avatarWaistPoints.length,
        center: avatarWaistCenter.toArray(),
        width: avatarWaistSize.x,
        depth: avatarWaistSize.z,
        min: avatarWaistBox.min.toArray(),
        max: avatarWaistBox.max.toArray(),
      });

    }

    // =========================================
    // AVATAR SHOULDER REGION DETECTION
    // =========================================

    const shoulderPoints = [];

    clonedObject.traverse((child) => {
      if (!child.isMesh || !child.geometry) {
        return;
      }

      const position =
        child.geometry.attributes.position;

      if (!position) {
        return;
      }

      const vertex =
        new THREE.Vector3();

      for (let i = 0; i < position.count; i++) {
        vertex.fromBufferAttribute(
          position,
          i
        );

        vertex.applyMatrix4(
          child.matrixWorld
        );

        // Upper torso / shoulder band.
        // X restriction removes most of the T-pose arms.
        if (
          vertex.y > landmarkMinY + landmarkHeight * 0.72 &&
          vertex.y < landmarkMinY + landmarkHeight * 0.86 &&
          Math.abs(vertex.x - landmarkCenterX) < landmarkWidth * 0.18
        ) {
          shoulderPoints.push(
            vertex.clone()
          );
        }
      }
    });

    if (shoulderPoints.length > 0) {
      const shoulderBox =
        new THREE.Box3().setFromPoints(
          shoulderPoints
        );

      const shoulderCenter =
        new THREE.Vector3();

      const shoulderSize =
        new THREE.Vector3();

      shoulderBox.getCenter(
        shoulderCenter
      );

      shoulderBox.getSize(
        shoulderSize
      );

      console.log(
        "AVATAR SHOULDER DATA:",
        {
          vertexCount:
            shoulderPoints.length,

          center:
            shoulderCenter.toArray(),

          size:
            shoulderSize.toArray(),

          min:
            shoulderBox.min.toArray(),

          max:
            shoulderBox.max.toArray(),
        }
      );
    }

    // =========================================
    // AVATAR LEFT / RIGHT SHOULDER LANDMARKS
    // =========================================

    const avatarLeftShoulderPoints = [];
    const avatarRightShoulderPoints = [];

    clonedObject.traverse((child) => {
      if (!child.isMesh || !child.geometry) {
        return;
      }

      const position =
        child.geometry.attributes.position;

      if (!position) {
        return;
      }

      const vertex =
        new THREE.Vector3();

      for (let i = 0; i < position.count; i++) {
        vertex.fromBufferAttribute(
          position,
          i
        );

        vertex.applyMatrix4(
          child.matrixWorld
        );

        // Keep the complete shoulder-height band. The landmark is selected
        // from its outer distribution below; fixed inner x windows measure
        // the neck rather than the shoulders on slim or scaled avatars.
        if (
          vertex.y > landmarkMinY + landmarkHeight * 0.70 &&
          vertex.y < landmarkMinY + landmarkHeight * 0.86
        ) {
          if (vertex.x < landmarkCenterX) {
            avatarLeftShoulderPoints.push(
              vertex.clone()
            );
          }

          if (vertex.x > landmarkCenterX) {
            avatarRightShoulderPoints.push(
              vertex.clone()
            );
          }
        }
      }
    });

    function averageAvatarPoints(points) {
      if (points.length === 0) {
        return null;
      }

      const average =
        new THREE.Vector3();

      points.forEach((point) => {
        average.add(point);
      });

      average.divideScalar(
        points.length
      );

      return average;
    }

    function averageOuterShoulder(points, side) {
      if (points.length === 0) return null;
      const sorted = [...points].sort((a, b) =>
        side === "left" ? a.x - b.x : b.x - a.x
      );
      const outerCount = Math.max(3, Math.ceil(sorted.length * 0.15));
      return averageAvatarPoints(sorted.slice(0, outerCount));
    }

    const avatarLeftShoulder = averageOuterShoulder(
      avatarLeftShoulderPoints,
      "left"
    );

    const avatarRightShoulder = averageOuterShoulder(
      avatarRightShoulderPoints,
      "right"
    );

    if (
      avatarLeftShoulder &&
      avatarRightShoulder
    ) {
      const avatarShoulderDistance =
        avatarLeftShoulder.distanceTo(
          avatarRightShoulder
        );

      console.log(
        "AVATAR SHOULDER LANDMARKS:",
        {
          left:
            avatarLeftShoulder.toArray(),

          right:
            avatarRightShoulder.toArray(),

          distance:
            avatarShoulderDistance,

          leftVertexCount:
            avatarLeftShoulderPoints.length,

          rightVertexCount:
            avatarRightShoulderPoints.length,
        }
      );

    } else {
      console.warn(
        "AVATAR SHOULDER LANDMARKS NOT FOUND"
      );
    }

    console.log("FINAL AVATAR BOX:", {
      min: {
        x: boundingBox.min.x,
        y: boundingBox.min.y,
        z: boundingBox.min.z,
      },
      max: {
        x: boundingBox.max.x,
        y: boundingBox.max.y,
        z: boundingBox.max.z,
      },
      center: {
        x: finalAvatarCenter.x,
        y: finalAvatarCenter.y,
        z: finalAvatarCenter.z,
      },
      size: {
        x: finalAvatarSize.x,
        y: finalAvatarSize.y,
        z: finalAvatarSize.z,
      },
    });

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

    if (onWaistData && avatarWaistPoints.length > 0) {
      const finalWaistPoints = avatarWaistPoints.map(
        (point) =>
          new THREE.Vector3(
            point.x - center.x,
            point.y - center.y,
            point.z - center.z
          )
      );

      const finalWaistBox =
        new THREE.Box3().setFromPoints(
          finalWaistPoints
        );

      const finalWaistSize =
        new THREE.Vector3();

      const finalWaistCenter =
        new THREE.Vector3();

      finalWaistBox.getSize(finalWaistSize);
      finalWaistBox.getCenter(finalWaistCenter);

      onWaistData({
        center: finalWaistCenter.clone(),
        width: finalWaistSize.x,
        depth: finalWaistSize.z,
        size: finalWaistSize.clone(),
      });

      console.log(
        "FINAL DISPLAY AVATAR WAIST:",
        {
          center: finalWaistCenter.toArray(),
          width: finalWaistSize.x,
          depth: finalWaistSize.z,
        }
      );
    }

    if (
      onShoulderLandmarks &&
      avatarLeftShoulder &&
      avatarRightShoulder
    ) {
      const finalLeftShoulder =
        avatarLeftShoulder.clone().sub(center);

      const finalRightShoulder =
        avatarRightShoulder.clone().sub(center);

      onShoulderLandmarks({
        left: finalLeftShoulder,
        right: finalRightShoulder,
        distance:
          finalLeftShoulder.distanceTo(
            finalRightShoulder
          ),
      });

      console.log(
        "FINAL DISPLAY AVATAR SHOULDERS:",
        {
          left: finalLeftShoulder.toArray(),
          right: finalRightShoulder.toArray(),
          distance:
            finalLeftShoulder.distanceTo(
              finalRightShoulder
            ),
        }
      );
    }

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
  selectedSize,
  diagnosticMode,
  objectRef,
  avatarShoulders,
  avatarTorsoData,
  avatarWaistData,
  garmentCategory,
  onShoulderMeasurements,
  onGarmentLoaded,
}) {
  const isUpperBodyGarment =
    garmentCategory === "T-Shirts";

  const isLowerBodyGarment =
    garmentCategory === "Trousers";

  console.log("GARMENT ALIGNMENT TYPE:", {
    garmentCategory,
    isUpperBodyGarment,
    isLowerBodyGarment,
  });

  console.log(
    "AVATAR SHOULDERS RECEIVED BY GARMENT:",
    avatarShoulders
  );

  const gltf = useLoader(
    GLTFLoader,
    garmentPath
  );

  console.info("[VirtuFit3D] GLB load success", {
    url: garmentPath,
    mode: diagnosticMode,
  });

  const garmentObject = useMemo(() => {
    const clonedObject =
      gltf.scene.clone(true);

    clonedObject.traverse((child) => {
      if (!child.isMesh) return;
      child.visible = true;
      child.geometry = child.geometry.clone();
      child.material = Array.isArray(child.material)
        ? child.material.map((material) => material.clone())
        : child.material?.clone();
      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];
      materials.forEach((material) => {
        if (!material) return;
        material.transparent = false;
        material.opacity = 1;
        material.depthWrite = true;
        material.side = THREE.DoubleSide;
      });
    });

    const meshCount = [];
    clonedObject.traverse((child) => {
      if (child.isMesh) meshCount.push(child);
    });
    console.info("[VirtuFit3D] Garment mesh loaded", {
      url: garmentPath,
      meshCount: meshCount.length,
      visibleMeshes: meshCount.filter((mesh) => mesh.visible).length,
      diagnosticMode,
    });

    console.log("GARMENT ROOT TRANSFORM:", {
      position: clonedObject.position.toArray(),
      rotation: [
        clonedObject.rotation.x,
        clonedObject.rotation.y,
        clonedObject.rotation.z,
      ],
      scale: clonedObject.scale.toArray(),
    });

    clonedObject.traverse((child) => {
      if (child.isMesh) {
        console.log("GARMENT MESH TRANSFORM:", child.name, {
          position: child.position.toArray(),
          rotation: [
            child.rotation.x,
            child.rotation.y,
            child.rotation.z,
          ],
          scale: child.scale.toArray(),
        });
      }
    });

    clonedObject.updateMatrixWorld(true);

    const garmentBox =
      new THREE.Box3().setFromObject(clonedObject);

    const garmentSize =
      new THREE.Vector3();

    const garmentCenter =
      new THREE.Vector3();

    garmentBox.getSize(garmentSize);
    garmentBox.getCenter(garmentCenter);

    if (import.meta.env.DEV) {
      console.groupCollapsed(
        `[VirtuFit3D] Mode ${diagnosticMode} - original garment`
      );
      console.log(describeObject(clonedObject));
      console.groupEnd();
    }

    if (diagnosticMode === "A") {
      // Keep the authored GLB untouched by fitting, but place its original
      // bounds beside the avatar within the camera frustum.
      clonedObject.position.x += -0.9 - garmentCenter.x;
      clonedObject.position.y -= garmentCenter.y;
      clonedObject.position.z -= garmentCenter.z;
      clonedObject.userData.diagnosticStage = "original";
      return clonedObject;
    }

    // =========================================
    // TROUSER WAISTBAND LANDMARK DETECTION
    // =========================================

    let trouserWaistData = null;

    if (isLowerBodyGarment) {
      const waistbandPoints = [];

      // Top section of the trouser
      const waistbandMinY =
        garmentBox.max.y - garmentSize.y * 0.12;

      clonedObject.traverse((child) => {
        if (!child.isMesh || !child.geometry) {
          return;
        }

        const position =
          child.geometry.attributes.position;

        for (let i = 0; i < position.count; i++) {
          const vertex = new THREE.Vector3(
            position.getX(i),
            position.getY(i),
            position.getZ(i)
          );

          vertex.applyMatrix4(child.matrixWorld);

          if (vertex.y >= waistbandMinY) {
            waistbandPoints.push(vertex.clone());
          }
        }
      });

      if (waistbandPoints.length > 0) {
        const waistbandBox =
          new THREE.Box3().setFromPoints(
            waistbandPoints
          );

        const waistbandSize =
          new THREE.Vector3();

        const waistbandCenter =
          new THREE.Vector3();

        waistbandBox.getSize(waistbandSize);
        waistbandBox.getCenter(waistbandCenter);

        trouserWaistData = {
          center: waistbandCenter,
          width: waistbandSize.x,
          depth: waistbandSize.z,
          min: waistbandBox.min.clone(),
          max: waistbandBox.max.clone(),
        };

        console.log(
          "TROUSER WAISTBAND DATA:",
          {
            vertexCount: waistbandPoints.length,
            center: waistbandCenter.toArray(),
            width: waistbandSize.x,
            depth: waistbandSize.z,
            min: waistbandBox.min.toArray(),
            max: waistbandBox.max.toArray(),
          }
        );
      }
    }

    // =========================================
    // GARMENT LANDMARK DETECTION
    // =========================================

    // Bounding-box based garment landmarks.
    // These will later be matched with avatar body landmarks.
    const garmentLandmarks = {
      center: new THREE.Vector3(
        garmentCenter.x,
        garmentCenter.y,
        garmentCenter.z
      ),

      topCenter: new THREE.Vector3(
        garmentCenter.x,
        garmentBox.max.y,
        garmentCenter.z
      ),

      bottomCenter: new THREE.Vector3(
        garmentCenter.x,
        garmentBox.min.y,
        garmentCenter.z
      ),

      leftExtreme: new THREE.Vector3(
        garmentBox.min.x,
        garmentCenter.y,
        garmentCenter.z
      ),

      rightExtreme: new THREE.Vector3(
        garmentBox.max.x,
        garmentCenter.y,
        garmentCenter.z
      ),
    };

    console.log("GARMENT LANDMARKS:", {
      center: garmentLandmarks.center.toArray(),
      topCenter: garmentLandmarks.topCenter.toArray(),
      bottomCenter: garmentLandmarks.bottomCenter.toArray(),
      leftExtreme: garmentLandmarks.leftExtreme.toArray(),
      rightExtreme: garmentLandmarks.rightExtreme.toArray(),
    });

    // =========================================
    // GARMENT TORSO REGION DETECTION
    // =========================================

    const garmentTorsoPoints = [];

    clonedObject.traverse((child) => {
      if (!child.isMesh || !child.geometry) {
        return;
      }

      const position =
        child.geometry.attributes.position;

      if (!position) {
        return;
      }

      const vertex =
        new THREE.Vector3();

      for (
        let i = 0;
        i < position.count;
        i++
      ) {
        vertex.fromBufferAttribute(
          position,
          i
        );

        vertex.applyMatrix4(
          child.matrixWorld
        );

        // Central part of shirt.
        // Avoid sleeve ends.
        if (
          vertex.y >
            garmentBox.min.y +
              garmentSize.y * 0.25 &&
          vertex.y <
            garmentBox.min.y +
              garmentSize.y * 0.75 &&
          Math.abs(
            vertex.x -
              garmentCenter.x
          ) <
            garmentSize.x * 0.32
        ) {
          garmentTorsoPoints.push(
            vertex.clone()
          );
        }
      }
    });

    let garmentDepthScale = 1;

    if (garmentTorsoPoints.length > 0) {
      const garmentTorsoBox =
        new THREE.Box3().setFromPoints(
          garmentTorsoPoints
        );

      const garmentTorsoSize =
        new THREE.Vector3();

      const garmentTorsoCenter =
        new THREE.Vector3();

      garmentTorsoBox.getSize(
        garmentTorsoSize
      );

      if (
        avatarTorsoData &&
        avatarTorsoData.depth > 0 &&
        garmentTorsoSize.z > 0
      ) {
        // Give the garment 8% extra depth
        // so it stays slightly outside the body.
        const targetGarmentDepth =
          avatarTorsoData.depth * 1.08;

        garmentDepthScale =
          targetGarmentDepth /
          garmentTorsoSize.z;

        console.log(
          "AUTOMATIC DEPTH CALCULATION:",
          {
            avatarDepth: avatarTorsoData.depth,
            originalGarmentDepth:
              garmentTorsoSize.z,
            targetGarmentDepth,
            automaticDepthScale:
              garmentDepthScale,
          }
        );
      }

      garmentTorsoBox.getCenter(
        garmentTorsoCenter
      );

      console.log(
        "GARMENT TORSO DATA:",
        {
          vertexCount:
            garmentTorsoPoints.length,

          center:
            garmentTorsoCenter.toArray(),

          size:
            garmentTorsoSize.toArray(),

          min:
            garmentTorsoBox.min.toArray(),

          max:
            garmentTorsoBox.max.toArray(),
        }
      );
    } else {
      console.warn(
        "GARMENT TORSO: NO VERTICES FOUND"
      );
    }

    // =========================================
    // GARMENT SHOULDER REGION DETECTION
    // =========================================

    const garmentShoulderPoints = [];

    // Use the upper portion of the garment.
    // Keep enough horizontal range to include
    // the shoulder/sleeve-root geometry.
    const garmentShoulderMinY =
      garmentBox.min.y +
      garmentSize.y * 0.68;

    const garmentShoulderMaxY =
      garmentBox.min.y +
      garmentSize.y * 0.95;

    clonedObject.traverse((child) => {
      if (!child.isMesh || !child.geometry) {
        return;
      }

      const position =
        child.geometry.attributes.position;

      if (!position) {
        return;
      }

      const vertex =
        new THREE.Vector3();

      for (let i = 0; i < position.count; i++) {
        vertex.fromBufferAttribute(
          position,
          i
        );

        vertex.applyMatrix4(
          child.matrixWorld
        );

        if (
          vertex.y >= garmentShoulderMinY &&
          vertex.y <= garmentShoulderMaxY
        ) {
          garmentShoulderPoints.push(
            vertex.clone()
          );
        }
      }
    });

    if (garmentShoulderPoints.length > 0) {
      const garmentShoulderBox =
        new THREE.Box3().setFromPoints(
          garmentShoulderPoints
        );

      const garmentShoulderCenter =
        new THREE.Vector3();

      const garmentShoulderSize =
        new THREE.Vector3();

      garmentShoulderBox.getCenter(
        garmentShoulderCenter
      );

      garmentShoulderBox.getSize(
        garmentShoulderSize
      );

      console.log(
        "GARMENT SHOULDER DATA:",
        {
          vertexCount:
            garmentShoulderPoints.length,

          center:
            garmentShoulderCenter.toArray(),

          size:
            garmentShoulderSize.toArray(),

          min:
            garmentShoulderBox.min.toArray(),

          max:
            garmentShoulderBox.max.toArray(),
        }
      );
    } else {
      console.warn(
        "GARMENT SHOULDER: NO VERTICES FOUND"
      );
    }

    // =========================================
    // GARMENT SLEEVE-ROOT / SHOULDER LANDMARKS
    // =========================================

    // Use the upper-middle part of the garment.
    // This avoids using the outer sleeve ends as
    // the actual shoulder landmarks.

    const sleeveRootPoints = [];

    const sleeveRootMinY =
      garmentBox.min.y +
      garmentSize.y * 0.58;

    const sleeveRootMaxY =
      garmentBox.min.y +
      garmentSize.y * 0.88;

    clonedObject.traverse((child) => {
      if (!child.isMesh || !child.geometry) {
        return;
      }

      const position =
        child.geometry.attributes.position;

      if (!position) {
        return;
      }

      const vertex =
        new THREE.Vector3();

      for (let i = 0; i < position.count; i++) {
        vertex.fromBufferAttribute(
          position,
          i
        );

        vertex.applyMatrix4(
          child.matrixWorld
        );

        const relativeX =
          vertex.x - garmentCenter.x;

        if (
          vertex.y >= sleeveRootMinY &&
          vertex.y <= sleeveRootMaxY &&
          Math.abs(relativeX) >
            garmentSize.x * 0.22 &&
          Math.abs(relativeX) <
            garmentSize.x * 0.42
        ) {
          sleeveRootPoints.push(
            vertex.clone()
          );
        }
      }
    });

    const leftSleeveRoot =
      sleeveRootPoints.filter(
        (point) =>
          point.x < garmentCenter.x
      );

    const rightSleeveRoot =
      sleeveRootPoints.filter(
        (point) =>
          point.x > garmentCenter.x
      );

    function getAveragePoint(points) {
      if (points.length === 0) {
        return null;
      }

      const average =
        new THREE.Vector3();

      points.forEach((point) => {
        average.add(point);
      });

      average.divideScalar(
        points.length
      );

      return average;
    }

    const leftShoulderLandmark =
      getAveragePoint(
        leftSleeveRoot
      );

    const rightShoulderLandmark =
      getAveragePoint(
        rightSleeveRoot
      );

    let shoulderLandmarkDistance = null;

    if (
      leftShoulderLandmark &&
      rightShoulderLandmark
    ) {
      shoulderLandmarkDistance =
        leftShoulderLandmark.distanceTo(
          rightShoulderLandmark
        );

      let automaticShoulderScale = null;

      if (
        avatarShoulders &&
        avatarShoulders.distance > 0 &&
        shoulderLandmarkDistance > 0
      ) {
        automaticShoulderScale =
          avatarShoulders.distance /
          shoulderLandmarkDistance;

        console.log(
          "AUTOMATIC SHOULDER SCALE:",
          automaticShoulderScale
        );
      }

      console.log(
        "GARMENT SHOULDER LANDMARKS:",
        {
          left:
            leftShoulderLandmark.toArray(),

          right:
            rightShoulderLandmark.toArray(),

          distance:
            shoulderLandmarkDistance,

          leftVertexCount:
            leftSleeveRoot.length,

          rightVertexCount:
            rightSleeveRoot.length,
        }
      );
    } else {
      console.warn(
        "GARMENT SHOULDER LANDMARKS NOT FOUND"
      );
    }

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

    const debugColors = [
      0xff0000,
      0x00ff00,
      0x0000ff,
      0xffff00,
      0xff00ff,
      0x00ffff,
      0xff8800,
      0x8800ff,
      0x00ff88,
    ];

    let meshIndex = 0;

    clonedObject.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        // Independent geometry for safe local deformation
        child.geometry = child.geometry.clone();

        child.material = child.material.clone();

        console.log(
          "GARMENT PART",
          meshIndex,
          child.name
        );

        meshIndex++;
      }
    });

    // -----------------------------------------
    // Align garment with displayed avatar
    // -----------------------------------------

    // -----------------------------------------
    // Automatic garment scale from measured garment/avatar landmarks. The
    // avatar is normalized only for camera presentation; garment fitting must
    // use the geometry that is actually displayed.
    // -----------------------------------------

    let baseGarmentScale = 1;
    const sizeEase = {
      S: 0.01,
      M: 0.018,
      L: 0.028,
      XL: 0.04,
      XXL: 0.055,
      30: 0.01,
      32: 0.018,
      34: 0.028,
      36: 0.04,
      38: 0.055,
    };
    const ease = sizeEase[selectedSize] ?? sizeEase.M;

    if (
      isLowerBodyGarment &&
      avatarWaistData &&
      avatarWaistData.width > 0 &&
      trouserWaistData &&
      trouserWaistData.width > 0
    ) {
      baseGarmentScale =
        (avatarWaistData.width / trouserWaistData.width) *
        (1 + ease);

      console.log(
        "AUTOMATIC TROUSER SCALE FROM WAIST:",
        { baseGarmentScale, avatarWaist: avatarWaistData.width, garmentWaist: trouserWaistData.width }
      );
    }

    if (
      isUpperBodyGarment &&
      avatarShoulders?.distance > 0 &&
      shoulderLandmarkDistance > 0
    ) {
      baseGarmentScale =
        (avatarShoulders.distance / shoulderLandmarkDistance) *
        (1 + ease);

      console.log(
        "UPPER BODY SCALE FROM SHOULDERS:",
        { baseGarmentScale, avatarShoulders: avatarShoulders.distance, garmentShoulders: shoulderLandmarkDistance }
      );
    }

    console.log(
      "APPLIED AUTOMATIC GARMENT SCALE:",
      baseGarmentScale
    );

    if (
      avatarShoulders &&
      leftShoulderLandmark &&
      rightShoulderLandmark
    ) {
      const avatarShoulderCenter =
        avatarShoulders.left
          .clone()
          .add(avatarShoulders.right)
          .multiplyScalar(0.5);

      const garmentShoulderCenter =
        leftShoulderLandmark
          .clone()
          .add(rightShoulderLandmark)
          .multiplyScalar(0.5);

      console.log(
        "AUTO ALIGN AVATAR CENTER:",
        avatarShoulderCenter.toArray()
      );

      console.log(
        "AUTO ALIGN GARMENT CENTER:",
        garmentShoulderCenter.toArray()
      );

      console.log(
        "AUTO ALIGN SCALE:",
        baseGarmentScale
      );
    }

    const garmentBaseMatrix = clonedObject.matrixWorld.clone();
    clonedObject.scale.setScalar(baseGarmentScale);

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

    // -----------------------------------------
    // Automatic shoulder-to-shoulder positioning
    // -----------------------------------------

    if (
      isUpperBodyGarment &&
      avatarShoulders &&
      leftShoulderLandmark &&
      rightShoulderLandmark
    ) {
      // Avatar shoulder center is already in
      // final displayed avatar coordinates
      const avatarShoulderCenter =
        avatarShoulders.left
          .clone()
          .add(avatarShoulders.right)
          .multiplyScalar(0.5);

      // Original garment shoulder center
      const garmentShoulderCenter =
        leftShoulderLandmark
          .clone()
          .add(rightShoulderLandmark)
          .multiplyScalar(0.5);

      // Convert garment shoulder center after scaling
      const scaledGarmentShoulderCenter =
        garmentShoulderCenter
          .clone()
          .applyMatrix4(garmentBaseMatrix.clone().invert())
          .applyMatrix4(clonedObject.matrixWorld);

      // Move garment shoulders onto avatar shoulders
      clonedObject.position.set(
        avatarShoulderCenter.x -
          scaledGarmentShoulderCenter.x,

        avatarShoulderCenter.y -
          scaledGarmentShoulderCenter.y,

        avatarShoulderCenter.z -
          scaledGarmentShoulderCenter.z
      );

      console.log(
        "AUTOMATIC GARMENT POSITION:",
        clonedObject.position.toArray()
      );
    }

    // =========================================
    // AUTOMATIC TROUSER WAIST ALIGNMENT
    // =========================================

    if (
      isLowerBodyGarment &&
      avatarWaistData &&
      trouserWaistData
    ) {
      const scaledTrouserWaistCenter =
        trouserWaistData.center
          .clone()
          .applyMatrix4(garmentBaseMatrix.clone().invert())
          .applyMatrix4(clonedObject.matrixWorld);

      clonedObject.position.set(
        avatarWaistData.center.x -
          scaledTrouserWaistCenter.x,

        avatarWaistData.center.y -
          scaledTrouserWaistCenter.y,

        avatarWaistData.center.z -
          scaledTrouserWaistCenter.z
      );

      console.log(
        "AUTOMATIC TROUSER WAIST POSITION:",
        clonedObject.position.toArray()
      );
    }

    clonedObject.updateMatrixWorld(true);

    if (
      isUpperBodyGarment &&
      avatarShoulders?.distance > 0 &&
      leftShoulderLandmark &&
      rightShoulderLandmark
    ) {
      onShoulderMeasurements?.({
        avatarWidth: avatarShoulders.distance,
        garmentWidth:
          shoulderLandmarkDistance *
          clonedObject.scale.x,
      });
    }

    const finalGarmentBox =
      new THREE.Box3().setFromObject(
        clonedObject
      );

    const finalGarmentSize =
      new THREE.Vector3();

    const finalGarmentCenter =
      new THREE.Vector3();

    finalGarmentBox.getSize(
      finalGarmentSize
    );

    finalGarmentBox.getCenter(
      finalGarmentCenter
    );

    console.log("FINAL GARMENT BOX:", {
      min: {
        x: finalGarmentBox.min.x,
        y: finalGarmentBox.min.y,
        z: finalGarmentBox.min.z,
      },

      max: {
        x: finalGarmentBox.max.x,
        y: finalGarmentBox.max.y,
        z: finalGarmentBox.max.z,
      },

      center: {
        x: finalGarmentCenter.x,
        y: finalGarmentCenter.y,
        z: finalGarmentCenter.z,
      },

      size: {
        x: finalGarmentSize.x,
        y: finalGarmentSize.y,
        z: finalGarmentSize.z,
      },
    });

    if (import.meta.env.DEV) {
      console.groupCollapsed(
        `[VirtuFit3D] Mode ${diagnosticMode} - after initial alignment`
      );
      console.log(describeObject(clonedObject));
      console.groupEnd();
    }
    clonedObject.userData.diagnosticStage = "initial-alignment";

    return clonedObject;
  }, [
    gltf,
    selectedSize,
    avatarShoulders,
    avatarTorsoData,
    avatarWaistData,
    garmentCategory,
    diagnosticMode,
  ]);

  useEffect(() => {
    if (!garmentObject) return;
    console.info("[VirtuFit3D] Garment scene mounted", {
      url: garmentPath,
      mode: diagnosticMode,
      visible: garmentObject.visible,
      bounds: describeObject(garmentObject).boundingBox,
    });
    onGarmentLoaded?.(garmentObject);
  }, [garmentObject, garmentPath, diagnosticMode, onGarmentLoaded]);

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

  selectedSize = null,

  garmentCategory = null,

  backgroundMode,

  onFitAnalysis,
  onGarmentError,
}) {
  const avatarRef = useRef(null);
  const garmentRef = useRef(null);
  const diagnosticMode = getDiagnosticMode();

  const [avatarShoulders, setAvatarShoulders] =
    useState(null);

  const [avatarTorsoData, setAvatarTorsoData] =
    useState(null);

  const [avatarWaistData, setAvatarWaistData] =
    useState(null);

  const shoulderMeasurementsRef = useRef(null);
  const garmentLoadedRef = useRef(false);

  const calculateFitAnalysis = () => {
    if (!avatarRef.current || !garmentRef.current) {
      console.log("[VirtuFit3D] Analysis waiting for mounted objects", {
        avatarMounted: !!avatarRef.current,
        garmentMounted: !!garmentRef.current,
        diagnosticMode,
      });
      return;
    }

    const garmentObj = garmentRef.current;
    const key = `${garmentPath}|${selectedSize}`;
    const shouldConform = diagnosticMode === "C";

    if (shouldConform && garmentObj.userData.conformedKey !== key) {
      const stats = conformGarmentObject3D(
        garmentObj,
        avatarRef.current,
        selectedSize,
        THREE
      );
      garmentObj.userData.conformedKey = key;
      garmentObj.userData.conformStats = stats;
      console.log("CONFORM STATS:", stats);
    }

    avatarRef.current.updateMatrixWorld(true);
    garmentRef.current.updateMatrixWorld(true);

    const shoulder = shoulderMeasurementsRef.current;
    const options =
      garmentCategory === "T-Shirts" &&
      shoulder?.avatarWidth > 0 &&
      shoulder?.garmentWidth > 0
        ? { shoulder }
        : {};
    const collisionStats = (garmentObj.userData.conformStats || []).reduce(
      (total, stats) => ({
        intersectingVertices:
          total.intersectingVertices + (stats.intersectingVertices || 0),
        maxPenetration: Math.max(
          total.maxPenetration,
          stats.maxPenetration || 0
        ),
        averageSurfaceGap: stats.averageSurfaceGap,
        maxSurfaceGap: Math.max(total.maxSurfaceGap, stats.maxSurfaceGap || 0),
      }),
      {
        intersectingVertices: 0,
        maxPenetration: 0,
        averageSurfaceGap: null,
        maxSurfaceGap: 0,
      }
    );

    const avatarMesh =
      extractWorldMesh(avatarRef.current);
    const garmentMesh =
      extractWorldMesh(garmentRef.current);
    const avatarHeight = new THREE.Box3()
      .setFromObject(avatarRef.current)
      .getSize(new THREE.Vector3()).y;
    const collisionMeasurement = measureGarmentCollision(
      garmentMesh,
      avatarMesh,
      avatarHeight
    );
    console.groupCollapsed(
      `[VirtuFit3D] Mode ${diagnosticMode} - final garment diagnostics`
    );
    console.log({
      avatar: describeObject(avatarRef.current),
      garment: describeObject(garmentRef.current),
      collision: collisionMeasurement,
      transforms: {
        scale: garmentObj.scale.toArray(),
        rotation: garmentObj.rotation.toArray(),
        position: garmentObj.position.toArray(),
      },
    });
    console.groupEnd();
    if (diagnosticMode === "A") {
      console.warn("Fit analysis skipped in Mode A: original garment is offset for inspection.");
      return;
    }
    let result;
    try {
      result = analyzeFit(
        avatarMesh,
        garmentMesh,
        garmentCategory,
        {
          ...options,
          collision: {
            ...collisionStats,
            intersectingVertices: collisionMeasurement.insideBody,
            maxPenetration: collisionMeasurement.maxPenetration,
          },
        }
      );
    } catch (error) {
      onGarmentError?.("Fit analysis failed. Check the garment geometry and browser console.");
      console.error("[VirtuFit3D] Fit analysis failure", error);
      return;
    }
    const { regions, debug } = result;

    if (import.meta.env.DEV) {
      const avatarBox = new THREE.Box3().setFromObject(avatarRef.current);
      const garmentBox = new THREE.Box3().setFromObject(garmentRef.current);
      console.debug("VIRTUFIT GEOMETRY DIAGNOSTICS", {
        avatarSize: avatarBox.getSize(new THREE.Vector3()).toArray(),
        garmentSize: garmentBox.getSize(new THREE.Vector3()).toArray(),
        garmentScale: garmentObj.scale.toArray(),
        garmentPosition: garmentObj.position.toArray(),
        garmentRotation: garmentObj.rotation.toArray(),
        collision: collisionStats,
        mode: diagnosticMode,
      });
    }
    console.log("FIT REGIONS:", regions, debug);
    onFitAnalysis(regions);
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
        try {
          calculateFitAnalysis();
        } catch (error) {
          onGarmentError?.(
            "3D garment processing failed. Check the browser console for details."
          );
          console.error("[VirtuFit3D] Garment pipeline failure", error);
        }
        clearInterval(timer);
      }

      if (attempts >= 10) {
        if (!garmentRef.current && !garmentLoadedRef.current) {
          onGarmentError?.(
            "The 3D garment did not finish loading. Check the garment URL and network request."
          );
        }
        clearInterval(timer);
      }
    }, 500);

    return () => clearInterval(timer);
  }, [modelPath, garmentPath, selectedSize]);

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
        onCreated={({ camera }) => {
          console.info("[VirtuFit3D] Camera", {
            position: camera.position.toArray(),
            near: camera.near,
            far: camera.far,
            diagnosticMode,
          });
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
            onShoulderLandmarks={setAvatarShoulders}
            onTorsoData={setAvatarTorsoData}
            onWaistData={setAvatarWaistData}
            hideLowerBody={
              garmentCategory === "Trousers"
            }
          />

          {garmentPath && (
            <GarmentErrorBoundary onError={onGarmentError}>
              <GarmentModel
              key={garmentPath}
              garmentPath={garmentPath}
              selectedSize={selectedSize}
              diagnosticMode={diagnosticMode}
              objectRef={garmentRef}
              avatarShoulders={avatarShoulders}
              avatarTorsoData={avatarTorsoData}
              avatarWaistData={avatarWaistData}
              garmentCategory={garmentCategory}
              onShoulderMeasurements={(measurements) => {
                shoulderMeasurementsRef.current = measurements;
              }}
              onGarmentLoaded={(object) => {
                garmentLoadedRef.current = true;
                console.info("[VirtuFit3D] onGarmentLoaded callback", {
                  mounted: !!object,
                  visible: object.visible,
                  mode: diagnosticMode,
                });
              }}
              />
            </GarmentErrorBoundary>
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