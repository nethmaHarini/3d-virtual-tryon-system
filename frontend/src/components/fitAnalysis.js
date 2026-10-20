/**
 * fitAnalysis.js - circumference-based garment fit analysis (no dependencies)
 *
 * Replaces the "nearest vertex distance" method. For each body level
 * (shoulder, chest, waist, hip) it
 *   1. slices the avatar mesh and the garment mesh with a horizontal plane,
 *   2. keeps only the torso part of the slice (arms / sleeves removed),
 *   3. measures the circumference (convex hull perimeter of the slice),
 *   4. computes ease = (garment - body) / body and classifies it.
 *
 * All inputs must be in the SAME world space (call updateMatrixWorld first).
 */

/* ---------- 1. get world-space triangles out of a THREE.Object3D ---------- */
export function extractWorldMesh(object3D) {
  const pos = [];
  const idx = [];
  let offset = 0;
  object3D.updateMatrixWorld(true);
  object3D.traverse((child) => {
    if (!child.isMesh || !child.geometry?.attributes?.position) return;
    const p = child.geometry.attributes.position;
    const e = child.matrixWorld.elements;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      pos.push(
        e[0] * x + e[4] * y + e[8] * z + e[12],
        e[1] * x + e[5] * y + e[9] * z + e[13],
        e[2] * x + e[6] * y + e[10] * z + e[14]
      );
    }
    const index = child.geometry.index;
    if (index) {
      for (let i = 0; i < index.count; i++) idx.push(index.getX(i) + offset);
    } else {
      for (let i = 0; i < p.count; i++) idx.push(i + offset);
    }
    offset += p.count;
  });
  return { positions: Float32Array.from(pos), indices: Uint32Array.from(idx) };
}

/* ---------- 2. geometry helpers ---------- */
export function meshYRange(mesh) {
  let min = Infinity, max = -Infinity;
  for (let i = 1; i < mesh.positions.length; i += 3) {
    const y = mesh.positions[i];
    if (y < min) min = y;
    if (y > max) max = y;
  }
  return { min, max, height: max - min };
}

/** Points where the mesh surface crosses the plane y = level, as [x, z] pairs. */
export function slicePoints(mesh, level) {
  const P = mesh.positions, I = mesh.indices, out = [];
  const edge = (a, b) => {
    const ya = P[a * 3 + 1] - level, yb = P[b * 3 + 1] - level;
    if ((ya > 0 && yb > 0) || (ya < 0 && yb < 0) || ya === yb) return;
    const t = ya / (ya - yb);
    out.push([
      P[a * 3] + t * (P[b * 3] - P[a * 3]),
      P[a * 3 + 2] + t * (P[b * 3 + 2] - P[a * 3 + 2]),
    ]);
  };
  for (let i = 0; i < I.length; i += 3) {
    const a = I[i], b = I[i + 1], c = I[i + 2];
    const ya = P[a * 3 + 1], yb = P[b * 3 + 1], yc = P[c * 3 + 1];
    if (Math.max(ya, yb, yc) < level || Math.min(ya, yb, yc) > level) continue;
    edge(a, b); edge(b, c); edge(c, a);
  }
  return out;
}

/** Split points into clusters separated by gaps in x (separates arms from torso). */
function clusterByX(points, gap) {
  const s = [...points].sort((p, q) => p[0] - q[0]);
  const clusters = [];
  let cur = [];
  for (let i = 0; i < s.length; i++) {
    if (cur.length && s[i][0] - s[i - 1][0] > gap) { clusters.push(cur); cur = []; }
    cur.push(s[i]);
  }
  if (cur.length) clusters.push(cur);
  return clusters;
}

function hullPerimeter(pts) {
  if (pts.length < 3) return 0;
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  const h = lo.slice(0, -1).concat(up.slice(0, -1));
  let per = 0;
  for (let i = 0; i < h.length; i++) { const a = h[i], b = h[(i + 1) % h.length]; per += Math.hypot(a[0] - b[0], a[1] - b[1]); }
  return per;
}

/* ---------- 3. torso slice measurement ---------- */
/** Avatar torso at a level: central cluster(s) only (arms excluded). */
function avatarTorso(avatar, level, H, cx) {
  const pts = slicePoints(avatar, level);
  if (pts.length < 6) return null;
  const clusters = clusterByX(pts, 0.02 * H).filter((c) => {
    const mx = c.reduce((s, p) => s + p[0], 0) / c.length;
    return Math.abs(mx - cx) < 0.2 * H;
  });
  const keep = clusters.flat();
  if (keep.length < 6) return null;
  const xs = keep.map((p) => p[0]);
  return { circ: hullPerimeter(keep), minX: Math.min(...xs), maxX: Math.max(...xs), pts: keep };
}

/** Garment at the same level, clipped to the avatar torso width (sleeves removed). */
function garmentTorso(garment, level, torso, margin) {
  const pts = slicePoints(garment, level);
  if (!pts.length) return null;
  const cx = (torso.minX + torso.maxX) / 2;
  const half = ((torso.maxX - torso.minX) / 2) * margin;
  const keep = pts.filter((p) => Math.abs(p[0] - cx) <= half);
  if (keep.length < 6) return null;
  const xs = keep.map((p) => p[0]);
  return {
    circ: hullPerimeter(keep),
    width: Math.max(...xs) - Math.min(...xs),
    slicePointCount: pts.length,
    keptPointCount: keep.length,
  };
}

/* ---------- 4. classification (ease = (garment-body)/body) ---------- */
export const EASE_LIMITS = {
  shoulder: [0.0, 0.06],
  chest: [0.01, 0.12],
  waist_upper: [0.01, 0.14],
  hip_upper: [0.01, 0.14],
  waist_lower: [0.0, 0.08],
  hip_lower: [0.0, 0.10],
};

export function classifyEase(ease, key) {
  if (ease == null || Number.isNaN(ease)) return { status: "Analyzing", color: "#a7b0c0" };
  const [tight, loose] = EASE_LIMITS[key];
  if (ease < tight) return { status: "Tight", color: "#ff6b7a" };
  if (ease <= loose) return { status: "Well-fitted", color: "#5ad989" };
  return { status: "Loose", color: "#67b7ff" };
}

/* ---------- 5. main entry ---------- */
export function analyzeFit(avatar, garment, category, options = {}) {
  const lower = String(category || "").toLowerCase() === "trousers";
  const { min: y0, height: H } = meshYRange(avatar);
  let cx = 0;
  {
    let s = 0, n = 0;
    for (let i = 0; i < avatar.positions.length; i += 3)
      if (avatar.positions[i + 1] < y0 + 0.15 * H) { s += avatar.positions[i]; n++; }
    cx = s / Math.max(n, 1);
  }

  const scan = (lo, hi, pick) => {
    let best = null;
    for (let f = lo; f <= hi; f += 0.01) {
      const level = y0 + f * H, t = avatarTorso(avatar, level, H, cx);
      if (!t) continue;
      if (!best || pick(t.circ, best.t.circ)) best = { level, t };
    }
    return best;
  };
  const waistScanDiagnostics = {
    attempts: 0,
    avatarCandidates: 0,
    garmentIntersections: 0,
    selected: null,
    lastTested: null,
  };
  const scanSharedWaist = (lo, hi) => {
    let best = null;
    for (let f = lo; f <= hi; f += 0.01) {
      const level = y0 + f * H;
      const t = avatarTorso(avatar, level, H, cx);
      waistScanDiagnostics.attempts++;
      if (!t) continue;
      waistScanDiagnostics.avatarCandidates++;
      const garmentPoints = slicePoints(garment, level);
      const garmentCenterX = (t.minX + t.maxX) / 2;
      const garmentHalfWidth = ((t.maxX - t.minX) / 2) * 1.8;
      const keptGarmentPoints = garmentPoints.filter(
        (point) =>
          Math.abs(point[0] - garmentCenterX) <=
          garmentHalfWidth
      );
      waistScanDiagnostics.lastTested = {
        level,
        avatarCircumference: t.circ,
        garmentSlicePointCount: garmentPoints.length,
        garmentKeptPointCount: keptGarmentPoints.length,
      };
      const g = garmentTorso(garment, level, t, 1.8);
      if (!g) continue;
      waistScanDiagnostics.garmentIntersections++;
      if (!best || t.circ < best.t.circ) {
        best = { level, t, g };
      }
    }
    if (best) {
      waistScanDiagnostics.selected = {
        level: best.level,
        avatarCircumference: best.t.circ,
        garmentCircumference: best.g.circ,
        garmentSlicePointCount: best.g.slicePointCount,
        garmentKeptPointCount: best.g.keptPointCount,
      };
    }
    return best;
  };
  const levels = {
    chest: scan(0.68, 0.77, (a, b) => a > b),
    waist: lower
      ? scanSharedWaist(0.58, 0.68)
      : scan(0.58, 0.68, (a, b) => a < b),
    hip: scan(0.48, 0.57, (a, b) => a > b),
  };

  const regions = {};
  const debug = {
    H,
    cx,
    garmentYRange: meshYRange(garment),
    levels: {},
    worldLevels: {},
    measurements: {},
    unavailable: {},
    waistScan: lower ? waistScanDiagnostics : null,
  };
  const wanted = lower ? ["waist", "hip"] : ["chest", "waist", "hip"];

  for (const name of wanted) {
    const lv = levels[name];
    if (!lv) {
      const reason = name === "waist" && lower
        ? "No shared avatar/trouser waist slice in the configured scan range"
        : `No valid avatar ${name} slice in the configured scan range`;
      debug.unavailable[name] = reason;
      debug.measurements[name] = {
        worldY: null,
        avatarCircumference: null,
        garmentCircumference: null,
        avatarIntersectionPoints: 0,
        garmentIntersectionPoints: 0,
        garmentKeptPoints: 0,
        contourClosed: false,
        contourValid: false,
        reason,
      };
      console.warn(`FIT ${name.toUpperCase()} UNAVAILABLE:`, {
        reason,
        scanRange: name === "waist" ? [0.58, 0.68] : [0.48, 0.57],
        avatarYRange: { min: y0, max: y0 + H, height: H },
        waistScan: name === "waist" ? waistScanDiagnostics : undefined,
      });
      regions[name] = {
        ease: null,
        status: name === "waist" ? "Unavailable" : "Analyzing",
        color: "#a7b0c0",
      };
      continue;
    }
    const g = lv.g || garmentTorso(garment, lv.level, lv.t, 1.8);
    if (!g) {
      const reason = `No valid garment slice at avatar-selected ${name} level`;
      debug.unavailable[name] = reason;
      const avatarIntersectionPoints = lv.t.pts.length;
      const garmentIntersectionPoints =
        slicePoints(garment, lv.level).length;
      debug.measurements[name] = {
        worldY: lv.level,
        avatarCircumference: lv.t.circ,
        garmentCircumference: null,
        avatarIntersectionPoints,
        garmentIntersectionPoints,
        garmentKeptPoints: 0,
        contourClosed: false,
        contourValid: false,
        reason,
      };
      console.warn(`FIT ${name.toUpperCase()} UNAVAILABLE:`, {
        reason,
        level: lv.level,
        avatarCircumference: lv.t.circ,
        garmentPointCount: slicePoints(garment, lv.level).length,
        waistScan: name === "waist" ? waistScanDiagnostics : undefined,
      });
      regions[name] = {
        ease: null,
        status: name === "waist" ? "Unavailable" : "Analyzing",
        color: "#a7b0c0",
      };
      continue;
    }
    if (
      !Number.isFinite(lv.t.circ) ||
      lv.t.circ <= 0 ||
      !Number.isFinite(g.circ) ||
      g.circ <= 0
    ) {
      const reason = "Invalid avatar or garment circumference";
      debug.unavailable[name] = reason;
      debug.measurements[name] = {
        worldY: lv.level,
        avatarCircumference: lv.t.circ,
        garmentCircumference: g.circ,
        avatarIntersectionPoints: lv.t.pts.length,
        garmentIntersectionPoints: g.slicePointCount,
        garmentKeptPoints: g.keptPointCount,
        contourClosed: false,
        contourValid: false,
        reason,
      };
      console.warn(`FIT ${name.toUpperCase()} UNAVAILABLE:`, {
        reason,
        level: lv.level,
        avatarCircumference: lv.t.circ,
        garmentCircumference: g.circ,
      });
      regions[name] = {
        ease: null,
        status: name === "waist" ? "Unavailable" : "Analyzing",
        color: "#a7b0c0",
      };
      continue;
    }
    const ease = (g.circ - lv.t.circ) / lv.t.circ;
    const key = lower ? `${name}_lower` : name === "chest" ? "chest" : `${name}_upper`;
    regions[name] = { ease, bodyCirc: lv.t.circ, garmentCirc: g.circ, ...classifyEase(ease, key) };
    debug.levels[name] = (lv.level - y0) / H;
    debug.worldLevels[name] = lv.level;
    debug.measurements[name] = {
      worldY: lv.level,
      avatarCircumference: lv.t.circ,
      garmentCircumference: g.circ,
      avatarIntersectionPoints: lv.t.pts.length,
      garmentIntersectionPoints: g.slicePointCount,
      garmentKeptPoints: g.keptPointCount,
      contourClosed: false,
      contourValid:
        Number.isFinite(lv.t.circ) &&
        lv.t.circ > 0 &&
        Number.isFinite(g.circ) &&
        g.circ > 0,
      reason:
        "Slice intersections are unordered segments; convex-hull circumference is closed and valid.",
    };
  }

  if (!lower) {
    const sh = options.shoulder;
    if (sh && sh.avatarWidth > 0 && sh.garmentWidth > 0) {
      const ease = (sh.garmentWidth - sh.avatarWidth) / sh.avatarWidth;
      regions.shoulder = { ease, bodyCirc: sh.avatarWidth, garmentCirc: sh.garmentWidth, ...classifyEase(ease, "shoulder") };
    } else regions.shoulder = { ease: null, ...classifyEase(null) };
  }
  return { regions, debug };
}
