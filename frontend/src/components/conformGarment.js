/**
 * conformGarment.js  -  make a garment hug the avatar (no dependencies except optional THREE wrapper)
 *
 * Idea (same principle as SNUG / TailorNet collision handling, simplified):
 *   for every garment vertex p, find the nearest point on the avatar surface and the
 *   signed distance d along the surface normal (d > 0 = outside the body).
 *     d < minGap  -> push the vertex outside the body        (removes skin showing through)
 *     d > maxGap  -> pull the vertex towards the body        (removes floating / baggy parts)
 *   maxGap depends on the size, so S hugs and XXL hangs loose.
 *   The displacement is then smoothed over the garment mesh so there are no spikes.
 *
 * All meshes: { positions: Float32Array (world xyz), indices: Uint32Array }.
 */

/* ---------- small vector helpers ---------- */
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const norm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

/** closest point on triangle abc to p (Ericson, Real-Time Collision Detection) */
function closestOnTriangle(p, a, b, c) {
  const ab = sub(b, a), ac = sub(c, a), ap = sub(p, a);
  const d1 = dot(ab, ap), d2 = dot(ac, ap);
  if (d1 <= 0 && d2 <= 0) return a;
  const bp = sub(p, b), d3 = dot(ab, bp), d4 = dot(ac, bp);
  if (d3 >= 0 && d4 <= d3) return b;
  const vc = d1 * d4 - d3 * d2;
  if (vc <= 0 && d1 >= 0 && d3 <= 0) { const v = d1 / (d1 - d3); return [a[0] + v * ab[0], a[1] + v * ab[1], a[2] + v * ab[2]]; }
  const cp = sub(p, c), d5 = dot(ab, cp), d6 = dot(ac, cp);
  if (d6 >= 0 && d5 <= d6) return c;
  const vb = d5 * d2 - d1 * d6;
  if (vb <= 0 && d2 >= 0 && d6 <= 0) { const w = d2 / (d2 - d6); return [a[0] + w * ac[0], a[1] + w * ac[1], a[2] + w * ac[2]]; }
  const va = d3 * d6 - d5 * d4;
  if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) {
    const w = (d4 - d3) / ((d4 - d3) + (d5 - d6));
    return [b[0] + w * (c[0] - b[0]), b[1] + w * (c[1] - b[1]), b[2] + w * (c[2] - b[2])];
  }
  const denom = 1 / (va + vb + vc), v = vb * denom, w = vc * denom;
  return [a[0] + ab[0] * v + ac[0] * w, a[1] + ab[1] * v + ac[1] * w, a[2] + ab[2] * v + ac[2] * w];
}

/* ---------- avatar spatial index ---------- */
export function buildAvatarIndex(avatar, cell) {
  const P = avatar.positions, I = avatar.indices, nv = P.length / 3, nt = I.length / 3;
  const faceN = new Float32Array(nt * 3);
  const vt = Array.from({ length: nv }, () => []);
  let cx = 0, cz = 0;
  for (let i = 0; i < nv; i++) { cx += P[i * 3]; cz += P[i * 3 + 2]; }
  cx /= nv; cz /= nv;
  let orient = 0;
  for (let t = 0; t < nt; t++) {
    const a = I[t * 3], b = I[t * 3 + 1], c = I[t * 3 + 2];
    const A = [P[a * 3], P[a * 3 + 1], P[a * 3 + 2]], B = [P[b * 3], P[b * 3 + 1], P[b * 3 + 2]], C = [P[c * 3], P[c * 3 + 1], P[c * 3 + 2]];
    const n = norm(cross(sub(B, A), sub(C, A)));
    faceN[t * 3] = n[0]; faceN[t * 3 + 1] = n[1]; faceN[t * 3 + 2] = n[2];
    vt[a].push(t); vt[b].push(t); vt[c].push(t);
    orient += n[0] * (A[0] - cx) + n[2] * (A[2] - cz);
  }
  if (orient < 0) for (let i = 0; i < faceN.length; i++) faceN[i] = -faceN[i];
  const grid = new Map();
  const key = (x, y, z) => `${Math.floor(x / cell)},${Math.floor(y / cell)},${Math.floor(z / cell)}`;
  for (let i = 0; i < nv; i++) {
    const k = key(P[i * 3], P[i * 3 + 1], P[i * 3 + 2]);
    if (!grid.has(k)) grid.set(k, []);
    grid.get(k).push(i);
  }
  return { P, I, faceN, vt, grid, cell, key };
}

function queryAvatar(ix, p, maxSearch) {
  const { P, I, faceN, vt, grid, cell } = ix;
  const cxI = Math.floor(p[0] / cell), cyI = Math.floor(p[1] / cell), czI = Math.floor(p[2] / cell);
  const R = Math.max(1, Math.ceil(maxSearch / cell));
  let best = -1, bestD = Infinity;
  for (let r = 0; r <= R; r++) {
    for (let x = cxI - r; x <= cxI + r; x++) for (let y = cyI - r; y <= cyI + r; y++) for (let z = czI - r; z <= czI + r; z++) {
      if (r > 0 && Math.abs(x - cxI) < r && Math.abs(y - cyI) < r && Math.abs(z - czI) < r) continue;
      const list = grid.get(`${x},${y},${z}`);
      if (!list) continue;
      for (const v of list) {
        const dx = P[v * 3] - p[0], dy = P[v * 3 + 1] - p[1], dz = P[v * 3 + 2] - p[2], dd = dx * dx + dy * dy + dz * dz;
        if (dd < bestD) { bestD = dd; best = v; }
      }
    }
    if (best >= 0 && Math.sqrt(bestD) <= r * cell) break;
  }
  if (best < 0 || Math.sqrt(bestD) > maxSearch) return null;
  let bd = Infinity, bq = null, bn = null;
  const tris = new Set(vt[best]);
  for (const t of vt[best]) for (let k = 0; k < 3; k++) for (const t2 of vt[I[t * 3 + k]]) tris.add(t2);
  for (const t of tris) {
    const a = I[t * 3], b = I[t * 3 + 1], c = I[t * 3 + 2];
    const q = closestOnTriangle(p, [P[a * 3], P[a * 3 + 1], P[a * 3 + 2]], [P[b * 3], P[b * 3 + 1], P[b * 3 + 2]], [P[c * 3], P[c * 3 + 1], P[c * 3 + 2]]);
    const dd = (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2 + (q[2] - p[2]) ** 2;
    if (dd < bd) { bd = dd; bq = q; bn = [faceN[t * 3], faceN[t * 3 + 1], faceN[t * 3 + 2]]; }
  }
  const sd = dot(sub(p, bq), bn);
  return { d: sd, n: bn, q: bq };
}

function buildAdjacency(garment) {
  const P = garment.positions, I = garment.indices, nv = P.length / 3;
  const weld = new Map(), rep = new Int32Array(nv);
  for (let i = 0; i < nv; i++) {
    const k = `${Math.round(P[i * 3] * 1e4)},${Math.round(P[i * 3 + 1] * 1e4)},${Math.round(P[i * 3 + 2] * 1e4)}`;
    if (!weld.has(k)) weld.set(k, i);
    rep[i] = weld.get(k);
  }
  const nbr = Array.from({ length: nv }, () => new Set());
  for (let t = 0; t < I.length; t += 3) {
    const a = rep[I[t]], b = rep[I[t + 1]], c = rep[I[t + 2]];
    nbr[a].add(b); nbr[a].add(c); nbr[b].add(a); nbr[b].add(c); nbr[c].add(a); nbr[c].add(b);
  }
  return { rep, nbr };
}

export const SIZE_GAP = {
  S: 0.010, M: 0.018, L: 0.028, XL: 0.040, XXL: 0.055,
  30: 0.010, 32: 0.018, 34: 0.028, 36: 0.040, 38: 0.055,
};

export function conformGarment(garment, avatar, opts) {
  const H = opts.avatarHeight;
  const minGap = opts.minGap ?? 0.004 * H;
  const maxGap = opts.maxGap ?? (SIZE_GAP[opts.size] ?? SIZE_GAP.M) * H;
  const pull = opts.pull ?? 0.85;
  const iters = opts.smoothIters ?? 4;
  const maxSearch = 0.12 * H;
  const ix = buildAvatarIndex(avatar, 0.02 * H);
  const P = garment.positions, nv = P.length / 3;
  let waistbandVertices = 0;
  let waistbandCorrected = 0;
  const applyGenericConformation = !opts.waistbandOnly;

  const disp = new Float32Array(nv * 3), pushD = new Float32Array(nv * 3);
  let pushed = 0, pulled = 0;
  if (applyGenericConformation) {
    for (let i = 0; i < nv; i++) {
      const p = [P[i * 3], P[i * 3 + 1], P[i * 3 + 2]];
      const r = queryAvatar(ix, p, maxSearch);
      if (!r) continue;
      let move = 0;
      if (r.d < minGap) { move = minGap - r.d; pushed++; }
      else if (r.d > maxGap) { move = -(r.d - maxGap) * pull; pulled++; }
      disp[i * 3] = r.n[0] * move; disp[i * 3 + 1] = r.n[1] * move; disp[i * 3 + 2] = r.n[2] * move;
      if (move > 0) { for (let k = 0; k < 3; k++) pushD[i * 3 + k] = disp[i * 3 + k]; disp[i * 3] = disp[i * 3 + 1] = disp[i * 3 + 2] = 0; }
    }
  }

  const { rep, nbr } = buildAdjacency(garment);
  let cur = disp;
  for (let it = 0; applyGenericConformation && it < iters; it++) {
    const nxt = new Float32Array(cur);
    for (let i = 0; i < nv; i++) {
      const r = rep[i], ns = nbr[r];
      if (!ns.size) continue;
      let sx = 0, sy = 0, sz = 0;
      for (const j of ns) { sx += cur[j * 3]; sy += cur[j * 3 + 1]; sz += cur[j * 3 + 2]; }
      const k = ns.size;
      nxt[i * 3] = 0.5 * cur[i * 3] + 0.5 * sx / k; nxt[i * 3 + 1] = 0.5 * cur[i * 3 + 1] + 0.5 * sy / k; nxt[i * 3 + 2] = 0.5 * cur[i * 3 + 2] + 0.5 * sz / k;
    }
    cur = nxt;
  }
  const out = new Float32Array(P.length);
  for (let i = 0; i < P.length; i++) out[i] = P[i] + cur[i] + pushD[i];

  if (opts.isTrousers) {
    let garmentMinY = Infinity;
    let garmentMaxY = -Infinity;
    for (let i = 1; i < P.length; i += 3) {
      garmentMinY = Math.min(garmentMinY, P[i]);
      garmentMaxY = Math.max(garmentMaxY, P[i]);
    }
    const garmentHeight = garmentMaxY - garmentMinY;
    const waistbandStart = garmentMaxY - garmentHeight * 0.12;
    const waistbandSearch = Math.max(maxSearch, 0.25 * H);
    const waistbandDisplacements = [];

    for (let i = 0; i < nv; i++) {
      const y = P[i * 3 + 1];
      if (!Number.isFinite(garmentHeight) || garmentHeight <= 0 || y < waistbandStart) {
        continue;
      }

      waistbandVertices++;
      const p = [out[i * 3], out[i * 3 + 1], out[i * 3 + 2]];
      const r = queryAvatar(ix, p, waistbandSearch);
      if (!r) continue;

      const targetGap = Math.max(minGap, maxGap);
      waistbandDisplacements.push([
        r.q[0] + r.n[0] * targetGap - p[0],
        r.q[1] + r.n[1] * targetGap - p[1],
        r.q[2] + r.n[2] * targetGap - p[2],
      ]);
    }

    if (waistbandDisplacements.length > 0) {
      const waistbandShift =
        waistbandDisplacements.reduce(
          (sum, displacement) => [
            sum[0] + displacement[0],
            sum[1] + displacement[1],
            sum[2] + displacement[2],
          ],
          [0, 0, 0]
        ).map(
          (value) =>
            value / waistbandDisplacements.length
        );

      for (let i = 0; i < nv; i++) {
        const y = P[i * 3 + 1];
        if (
          !Number.isFinite(garmentHeight) ||
          garmentHeight <= 0 ||
          y < waistbandStart
        ) {
          continue;
        }

      const heightWeight = Math.max(
        0,
        Math.min(1, (y - waistbandStart) / (garmentMaxY - waistbandStart))
      );
      const smoothWeight = heightWeight * heightWeight * (3 - 2 * heightWeight);
        out[i * 3] += waistbandShift[0] * smoothWeight;
        out[i * 3 + 1] += waistbandShift[1] * smoothWeight;
        out[i * 3 + 2] += waistbandShift[2] * smoothWeight;
        waistbandCorrected++;
      }
    }
  }

  let stillInside = 0;
  if (applyGenericConformation) {
    for (let i = 0; i < nv; i++) {
      const p = [out[i * 3], out[i * 3 + 1], out[i * 3 + 2]];
      const r = queryAvatar(ix, p, maxSearch);
      if (r && r.d < minGap) { const m = minGap - r.d; out[i * 3] += r.n[0] * m; out[i * 3 + 1] += r.n[1] * m; out[i * 3 + 2] += r.n[2] * m; stillInside++; }
    }
  }
  return {
    positions: out,
    stats: {
      vertices: nv,
      pushed,
      pulled,
      waistbandVertices,
      waistbandCorrected,
      stillInsideAfterSmoothing: stillInside,
      minGap,
      maxGap,
    },
  };
}

export function conformGarmentObject3D(
  garmentObject,
  avatarObject,
  size,
  THREE,
  options = {}
) {
  garmentObject.updateMatrixWorld(true);
  avatarObject.updateMatrixWorld(true);
  const avatar = extractWorld(avatarObject);
  let ymin = Infinity, ymax = -Infinity;
  for (let i = 1; i < avatar.positions.length; i += 3) { ymin = Math.min(ymin, avatar.positions[i]); ymax = Math.max(ymax, avatar.positions[i]); }
  const stats = [];
  garmentObject.traverse((child) => {
    if (!child.isMesh || !child.geometry?.attributes?.position) return;
    child.geometry = child.geometry.clone();
    const pos = child.geometry.attributes.position, e = child.matrixWorld.elements;
    const world = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      world[i * 3] = e[0] * x + e[4] * y + e[8] * z + e[12];
      world[i * 3 + 1] = e[1] * x + e[5] * y + e[9] * z + e[13];
      world[i * 3 + 2] = e[2] * x + e[6] * y + e[10] * z + e[14];
    }
    const idx = child.geometry.index ? Uint32Array.from(child.geometry.index.array) : Uint32Array.from({ length: pos.count }, (_, i) => i);
    const res = conformGarment(
      { positions: world, indices: idx },
      avatar,
      {
        avatarHeight: ymax - ymin,
        size,
        isTrousers: options.isTrousers === true,
        waistbandOnly: options.waistbandOnly === true,
      }
    );
    const inv = child.matrixWorld.clone().invert(), v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.set(res.positions[i * 3], res.positions[i * 3 + 1], res.positions[i * 3 + 2]).applyMatrix4(inv);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    pos.needsUpdate = true;
    child.geometry.computeVertexNormals();
    child.geometry.computeBoundingBox(); child.geometry.computeBoundingSphere();
    stats.push(res.stats);
  });
  return stats;
}

function extractWorld(object3D) {
  const pos = [], idx = []; let off = 0;
  object3D.traverse((child) => {
    if (!child.isMesh || !child.geometry?.attributes?.position) return;
    const p = child.geometry.attributes.position, e = child.matrixWorld.elements;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      pos.push(e[0] * x + e[4] * y + e[8] * z + e[12], e[1] * x + e[5] * y + e[9] * z + e[13], e[2] * x + e[6] * y + e[10] * z + e[14]);
    }
    const ind = child.geometry.index;
    if (ind) for (let i = 0; i < ind.count; i++) idx.push(ind.getX(i) + off); else for (let i = 0; i < p.count; i++) idx.push(i + off);
    off += p.count;
  });
  return { positions: Float32Array.from(pos), indices: Uint32Array.from(idx) };
}
