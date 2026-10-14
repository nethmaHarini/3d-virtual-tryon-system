/**
 * Garment fitting coordinate convention
 *
 * Units: authored GLB/OBJ units; no height conversion is performed here.
 * Up axis: +Y.
 * Origin: the authored model origin after node transforms are flattened.
 * Fitting transforms are rigid only (translation and rotation). Display
 * scaling belongs to the outer viewer group and is never used by this module.
 */

import * as THREE from "three";

const makeAnchor = (position, method, confidence) => ({
  position: position.clone(),
  method,
  confidence,
});

const average = (points) => {
  if (!points.length) {
    return null;
  }

  const result = new THREE.Vector3();
  points.forEach((point) => result.add(point));
  return result.multiplyScalar(1 / points.length);
};

const collectWorldVertices = (object) => {
  const vertices = [];
  const inverse = new THREE.Matrix4();

  object.updateMatrixWorld(true);
  object.traverse((node) => {
    if (!node.isMesh || !node.geometry?.attributes?.position) {
      return;
    }

    const position = node.geometry.attributes.position;
    const matrix = node.matrixWorld;

    for (let index = 0; index < position.count; index += 1) {
      const vertex = new THREE.Vector3().fromBufferAttribute(position, index);
      vertices.push(vertex.applyMatrix4(matrix));
    }
  });

  inverse.identity();
  return vertices;
};

const slice = (vertices, minY, maxY, predicate = () => true) =>
  vertices.filter(
    (vertex) => vertex.y >= minY && vertex.y <= maxY && predicate(vertex)
  );

export function normalizeGarment(scene) {
  const normalized = scene.clone(true);
  normalized.updateMatrixWorld(true);

  normalized.traverse((node) => {
    if (!node.isMesh || !node.geometry) {
      return;
    }

    node.geometry = node.geometry.clone();
    node.geometry.applyMatrix4(node.matrixWorld);
    node.position.set(0, 0, 0);
    node.rotation.set(0, 0, 0);
    node.scale.set(1, 1, 1);
    node.updateMatrix();
  });

  normalized.position.set(0, 0, 0);
  normalized.rotation.set(0, 0, 0);
  normalized.scale.set(1, 1, 1);
  normalized.updateMatrixWorld(true);
  return normalized;
}

export function extractAvatarAnchors(avatarGeometry) {
  const vertices = collectWorldVertices(avatarGeometry);
  if (!vertices.length) {
    return {};
  }

  const bounds = new THREE.Box3().setFromPoints(vertices);
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const y = (ratio) => bounds.min.y + size.y * ratio;
  const torso = (ratio, width = 0.45) =>
    slice(vertices, y(ratio - 0.035), y(ratio + 0.035), (point) =>
      Math.abs(point.x - center.x) <= size.x * width
    );

  const shoulderBand = slice(vertices, y(0.72), y(0.86));
  const leftShoulder = average(
    shoulderBand.filter((point) => point.x < center.x)
  );
  const rightShoulder = average(
    shoulderBand.filter((point) => point.x >= center.x)
  );
  const chest = average(torso(0.69));
  const waist = average(torso(0.52, 0.32));
  const pelvis = average(torso(0.39, 0.5));
  const hips = slice(vertices, y(0.34), y(0.46), (point) =>
    Math.abs(point.x - center.x) <= size.x * 0.6
  );
  const crotch = average(torso(0.29, 0.25));
  const neck = average(torso(0.86, 0.22));
  const leftHip = average(hips.filter((point) => point.x < center.x));
  const rightHip = average(hips.filter((point) => point.x >= center.x));
  const leftKnee = average(
    slice(vertices, y(0.16), y(0.27)).filter((point) => point.x < center.x)
  );
  const rightKnee = average(
    slice(vertices, y(0.16), y(0.27)).filter((point) => point.x >= center.x)
  );
  const leftAnkle = average(
    slice(vertices, y(0.02), y(0.12)).filter((point) => point.x < center.x)
  );
  const rightAnkle = average(
    slice(vertices, y(0.02), y(0.12)).filter((point) => point.x >= center.x)
  );

  const anchors = {
    neck: neck && makeAnchor(neck, "slice", 0.75),
    leftShoulder:
      leftShoulder && makeAnchor(leftShoulder, "slice", 0.82),
    rightShoulder:
      rightShoulder && makeAnchor(rightShoulder, "slice", 0.82),
    sleeveRootLeft:
      leftShoulder && makeAnchor(leftShoulder, "estimated", 0.55),
    sleeveRootRight:
      rightShoulder && makeAnchor(rightShoulder, "estimated", 0.55),
    chest: chest && makeAnchor(chest, "slice", 0.68),
    waist: waist && makeAnchor(waist, "slice", 0.72),
    pelvis: pelvis && makeAnchor(pelvis, "slice", 0.7),
    leftHip: leftHip && makeAnchor(leftHip, "slice", 0.62),
    rightHip: rightHip && makeAnchor(rightHip, "slice", 0.62),
    crotch: crotch && makeAnchor(crotch, "estimated", 0.5),
    leftKnee: leftKnee && makeAnchor(leftKnee, "slice", 0.45),
    rightKnee: rightKnee && makeAnchor(rightKnee, "slice", 0.45),
    leftAnkle: leftAnkle && makeAnchor(leftAnkle, "slice", 0.42),
    rightAnkle: rightAnkle && makeAnchor(rightAnkle, "slice", 0.42),
  };

  return Object.fromEntries(
    Object.entries(anchors).filter(([, anchor]) => Boolean(anchor))
  );
}

const garmentBounds = (garment) => {
  garment.updateMatrixWorld(true);
  return new THREE.Box3().setFromObject(garment);
};

const rotateAndTranslate = (garment, sourceAxis, targetAxis, sourcePoint, targetPoint) => {
  const rotation = new THREE.Quaternion().setFromUnitVectors(
    sourceAxis.clone().normalize(),
    targetAxis.clone().normalize()
  );
  garment.quaternion.premultiply(rotation);
  garment.position.sub(sourcePoint);
  garment.position.applyQuaternion(rotation);
  garment.position.add(targetPoint);
  garment.updateMatrixWorld(true);
};

export function alignTShirt(garment, anchors) {
  const bounds = garmentBounds(garment);
  const center = bounds.getCenter(new THREE.Vector3());
  const top = new THREE.Vector3(center.x, bounds.max.y, center.z);
  const left = new THREE.Vector3(bounds.min.x, bounds.max.y, center.z);
  const right = new THREE.Vector3(bounds.max.x, bounds.max.y, center.z);
  const avatarLeft = anchors.leftShoulder?.position;
  const avatarRight = anchors.rightShoulder?.position;

  if (avatarLeft && avatarRight) {
    const sourceAxis = right.clone().sub(left);
    const targetAxis = avatarRight.clone().sub(avatarLeft);
    const sourcePoint = top;
    const targetPoint =
      anchors.neck?.position ||
      avatarLeft.clone().add(avatarRight).multiplyScalar(0.5);
    rotateAndTranslate(garment, sourceAxis, targetAxis, sourcePoint, targetPoint);
  } else if (anchors.chest) {
    garment.position.add(anchors.chest.position).sub(center);
  }

  return garment;
}

export function alignTrousers(garment, anchors) {
  const bounds = garmentBounds(garment);
  const center = bounds.getCenter(new THREE.Vector3());
  const waistband = new THREE.Vector3(center.x, bounds.max.y, center.z);
  const left = new THREE.Vector3(bounds.min.x, center.y, center.z);
  const right = new THREE.Vector3(bounds.max.x, center.y, center.z);
  const avatarLeft = anchors.leftHip?.position || anchors.leftShoulder?.position;
  const avatarRight = anchors.rightHip?.position || anchors.rightShoulder?.position;
  const targetWaist = anchors.waist?.position || anchors.pelvis?.position;

  if (avatarLeft && avatarRight && targetWaist) {
    rotateAndTranslate(
      garment,
      right.clone().sub(left),
      avatarRight.clone().sub(avatarLeft),
      waistband,
      targetWaist
    );
  } else if (targetWaist) {
    garment.position.add(targetWaist).sub(waistband);
  }

  return garment;
}

