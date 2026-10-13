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
          vertex.y > 1.35 &&
          vertex.y < 1.75 &&
          Math.abs(vertex.x) < 0.55
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
          vertex.y > 0.95 &&
          vertex.y < 1.20 &&
          Math.abs(vertex.x) < 0.55
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
          vertex.y > 1.70 &&
          vertex.y < 1.90 &&
          Math.abs(vertex.x) < 0.45
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

        // Shoulder-height band
        if (
          vertex.y > 1.68 &&
          vertex.y < 1.88
        ) {
          // LEFT shoulder region
          if (
            vertex.x < -0.16 &&
            vertex.x > -0.42
          ) {
            avatarLeftShoulderPoints.push(
              vertex.clone()
            );
          }

          // RIGHT shoulder region
          if (
            vertex.x > 0.16 &&
            vertex.x < 0.42
          ) {
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

    const avatarLeftShoulder =
      averageAvatarPoints(
        avatarLeftShoulderPoints
      );

    const avatarRightShoulder =
      averageAvatarPoints(
        avatarRightShoulderPoints
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
  objectRef,
  avatarShoulders,
  avatarTorsoData,
  avatarWaistData,
  garmentCategory,
  onShoulderMeasurements,
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

  const garmentObject = useMemo(() => {
    const clonedObject =
      gltf.scene.clone(true);

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
    // Automatic garment scale from shoulder landmarks
    // -----------------------------------------

    let baseGarmentScale = 1;

    // Lower-body garment scale from waistband width
    if (
      isLowerBodyGarment &&
      avatarWaistData &&
      avatarWaistData.width > 0 &&
      trouserWaistData &&
      trouserWaistData.width > 0
    ) {
      const referenceAvatarHeight = 1.53;
      const displayedAvatarHeight = 2.35;

      baseGarmentScale =
        displayedAvatarHeight /
        referenceAvatarHeight;

      console.log(
        "AUTOMATIC TROUSER SCALE:",
        baseGarmentScale
      );
    }

    if (isUpperBodyGarment) {
      // Keep the original authored garment size.
      // S, M, L, XL and XXL must remain physically different.
      const referenceAvatarHeight = 1.53;
      const displayedAvatarHeight = 2.35;

      baseGarmentScale =
        displayedAvatarHeight /
        referenceAvatarHeight;

      console.log(
        "UPPER BODY AUTHORED SIZE SCALE:",
        baseGarmentScale
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

    if (isLowerBodyGarment) {
      // Preserve Blender proportions, with slight width clearance
      clonedObject.scale.set(
        baseGarmentScale * 1.05, // X: 5% wider
        baseGarmentScale,        // Y: unchanged
        baseGarmentScale * 1.12  // Z: 12% deeper
      );
    } else {
      clonedObject.scale.setScalar(baseGarmentScale);
    }

    if (isLowerBodyGarment) {
      clonedObject.position.y += 0.40;
      clonedObject.position.z -= 0.025;
    }

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
          .multiplyScalar(baseGarmentScale);

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
          .multiplyScalar(baseGarmentScale);

      // PRE-ALIGNED BLENDER GARMENT:
      // preserve the position stored in the GLB

      /*
      clonedObject.position.set(
        avatarWaistData.center.x -
          scaledTrouserWaistCenter.x,

        avatarWaistData.center.y -
          scaledTrouserWaistCenter.y +
          0.16,

        avatarWaistData.center.z -
          scaledTrouserWaistCenter.z
      );
      */

      console.log(
        "AUTOMATIC TROUSER POSITION:",
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

    return clonedObject;
  }, [
    gltf,
    avatarShoulders,
    avatarTorsoData,
    avatarWaistData,
    garmentCategory,
  ]);

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

  garmentCategory = null,

  backgroundMode,

  onFitAnalysis,
}) {
  const avatarRef = useRef(null);
  const garmentRef = useRef(null);

  const [avatarShoulders, setAvatarShoulders] =
    useState(null);

  const [avatarTorsoData, setAvatarTorsoData] =
    useState(null);

  const [avatarWaistData, setAvatarWaistData] =
    useState(null);

  const shoulderMeasurementsRef = useRef(null);

  const calculateFitAnalysis = () => {
    if (!avatarRef.current || !garmentRef.current) {
      console.log("FIT: models not ready");
      return;
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

    const avatarMesh =
      extractWorldMesh(avatarRef.current);
    const garmentMesh =
      extractWorldMesh(garmentRef.current);
    const { regions, debug } = analyzeFit(
      avatarMesh,
      garmentMesh,
      garmentCategory,
      options
    );

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
            onShoulderLandmarks={setAvatarShoulders}
            onTorsoData={setAvatarTorsoData}
            onWaistData={setAvatarWaistData}
            hideLowerBody={
              garmentCategory === "Trousers"
            }
          />

          {garmentPath && (
            <GarmentModel
              key={garmentPath}
              garmentPath={garmentPath}
              objectRef={garmentRef}
              avatarShoulders={avatarShoulders}
              avatarTorsoData={avatarTorsoData}
              avatarWaistData={avatarWaistData}
              garmentCategory={garmentCategory}
              onShoulderMeasurements={(measurements) => {
                shoulderMeasurementsRef.current = measurements;
              }}
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