/* ============================================================
   Wind Tunnel — physics core (no DOM).
   Lattice-Boltzmann D2Q9, single-relaxation-time (BGK).
   Recovers incompressible Navier-Stokes in the low-Mach limit.

   Runs in the browser (window.WindTunnelSim) and in Node
   (module.exports) so the exact shipping code can be unit-tested
   headlessly.
   ============================================================ */
"use strict";

(function (root) {
  // dirs: 0 rest, 1 E, 2 N(+y up), 3 W, 4 S, 5 NE, 6 NW, 7 SW, 8 SE
  const EX = [0, 1, 0, -1, 0, 1, -1, -1, 1];
  const EY = [0, 0, 1, 0, -1, 1, 1, -1, -1];
  const W = [4 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 36, 1 / 36, 1 / 36, 1 / 36];
  const OPP = [0, 3, 4, 1, 2, 7, 8, 5, 6];

  function nacaThickness(xc) {
    const tk = 0.14; // 14% chord — a touch thick so it rasterises cleanly
    return 5 * tk * (0.2969 * Math.sqrt(xc) - 0.1260 * xc - 0.3516 * xc * xc + 0.2843 * xc * xc * xc - 0.1015 * xc * xc * xc * xc);
  }
  function nacaCamber(xc) {
    const m = 0.02, p = 0.4;
    if (xc < p) return m / (p * p) * (2 * p * xc - xc * xc);
    return m / ((1 - p) * (1 - p)) * ((1 - 2 * p) + 2 * p * xc - xc * xc);
  }

  function createSim(nx, ny) {
    const N = nx * ny;
    const f = [], ftmp = [];
    for (let d = 0; d < 9; d++) { f[d] = new Float32Array(N); ftmp[d] = new Float32Array(N); }
    const rho = new Float32Array(N);
    const ux = new Float32Array(N);
    const uy = new Float32Array(N);
    const barrier = new Uint8Array(N);

    const S = {
      nx, ny, N, f, ftmp, rho, ux, uy, barrier,
      EX, EY, W, OPP,
      u0: 0.064, nu: 0.061, omega: 1 / (3 * 0.061 + 0.5),
      Fx: 0, Fy: 0,
      boundaryLinks: [],
      bbox: null,
      hasShape: false,
      warmup: 0,
    };

    function idx(x, y) { return x + y * nx; }

    function setEquil(i, vx, vy, r) {
      const usq = vx * vx + vy * vy;
      for (let d = 0; d < 9; d++) {
        const eu = EX[d] * vx + EY[d] * vy;
        f[d][i] = W[d] * r * (1 + 3 * eu + 4.5 * eu * eu - 1.5 * usq);
      }
    }
    S.setEquil = setEquil;

    S.setParams = function (u0, nu) {
      S.u0 = u0; S.nu = nu; S.omega = 1 / (3 * nu + 0.5);
    };

    S.resetFlow = function () {
      const u0 = S.u0;
      for (let i = 0; i < N; i++) {
        rho[i] = 1; uy[i] = 0;
        if (barrier[i]) { for (let d = 0; d < 9; d++) f[d][i] = 0; ux[i] = 0; }
        else { setEquil(i, u0, 0, 1); ux[i] = u0; }
      }
      S.Fx = 0; S.Fy = 0; S.warmup = 0;
    };

    S.setBoundaries = function () {
      const u0 = S.u0;
      for (let y = 0; y < ny; y++) {
        const iL = idx(0, y);
        setEquil(iL, u0, 0, 1); rho[iL] = 1; ux[iL] = u0; uy[iL] = 0;
      }
      for (let x = 0; x < nx; x++) {
        const iB = idx(x, 0), iT = idx(x, ny - 1);
        setEquil(iB, u0, 0, 1); rho[iB] = 1; ux[iB] = u0; uy[iB] = 0;
        setEquil(iT, u0, 0, 1); rho[iT] = 1; ux[iT] = u0; uy[iT] = 0;
      }
      for (let y = 0; y < ny; y++) {
        const iR = idx(nx - 1, y), iN = idx(nx - 2, y);
        for (let d = 0; d < 9; d++) f[d][iR] = f[d][iN];
        rho[iR] = rho[iN]; ux[iR] = ux[iN]; uy[iR] = uy[iN];
      }
    };

    S.collide = function () {
      const omega = S.omega;
      const f0 = f[0], f1 = f[1], f2 = f[2], f3 = f[3], f4 = f[4],
        f5 = f[5], f6 = f[6], f7 = f[7], f8 = f[8];
      const w0 = W[0], w1 = W[1], w2 = W[2], w3 = W[3], w4 = W[4],
        w5 = W[5], w6 = W[6], w7 = W[7], w8 = W[8];
      for (let y = 1; y < ny - 1; y++) {
        for (let x = 1; x < nx - 1; x++) {
          const i = x + y * nx;
          if (barrier[i]) continue;
          const a0 = f0[i], a1 = f1[i], a2 = f2[i], a3 = f3[i], a4 = f4[i],
            a5 = f5[i], a6 = f6[i], a7 = f7[i], a8 = f8[i];
          const r = a0 + a1 + a2 + a3 + a4 + a5 + a6 + a7 + a8;
          const vx = (a1 + a5 + a8 - a3 - a6 - a7) / r;
          const vy = (a2 + a5 + a6 - a4 - a7 - a8) / r;
          rho[i] = r; ux[i] = vx; uy[i] = vy;
          const usq = 1.5 * (vx * vx + vy * vy);
          let eu;
          f0[i] = a0 + omega * (w0 * r * (1 - usq) - a0);
          eu = vx;       f1[i] = a1 + omega * (w1 * r * (1 + 3 * eu + 4.5 * eu * eu - usq) - a1);
          eu = vy;       f2[i] = a2 + omega * (w2 * r * (1 + 3 * eu + 4.5 * eu * eu - usq) - a2);
          eu = -vx;      f3[i] = a3 + omega * (w3 * r * (1 + 3 * eu + 4.5 * eu * eu - usq) - a3);
          eu = -vy;      f4[i] = a4 + omega * (w4 * r * (1 + 3 * eu + 4.5 * eu * eu - usq) - a4);
          eu = vx + vy;  f5[i] = a5 + omega * (w5 * r * (1 + 3 * eu + 4.5 * eu * eu - usq) - a5);
          eu = -vx + vy; f6[i] = a6 + omega * (w6 * r * (1 + 3 * eu + 4.5 * eu * eu - usq) - a6);
          eu = -vx - vy; f7[i] = a7 + omega * (w7 * r * (1 + 3 * eu + 4.5 * eu * eu - usq) - a7);
          eu = vx - vy;  f8[i] = a8 + omega * (w8 * r * (1 + 3 * eu + 4.5 * eu * eu - usq) - a8);
        }
      }
    };

    S.stream = function () {
      for (let y = 1; y < ny - 1; y++) {
        for (let x = 1; x < nx - 1; x++) {
          const i = x + y * nx;
          if (barrier[i]) continue;
          for (let d = 0; d < 9; d++) {
            const si = (x - EX[d]) + (y - EY[d]) * nx;
            ftmp[d][i] = barrier[si] ? f[OPP[d]][i] : f[d][si];
          }
        }
      }
      for (let y = 1; y < ny - 1; y++) {
        for (let x = 1; x < nx - 1; x++) {
          const i = x + y * nx;
          if (barrier[i]) continue;
          for (let d = 0; d < 9; d++) f[d][i] = ftmp[d][i];
        }
      }
    };

    S.step = function () { S.setBoundaries(); S.collide(); S.stream(); };

    // Force on the shape by integrating SURFACE PRESSURE over the solid
    // boundary. In lattice units p = cs^2 * rho = rho/3; we use gauge
    // pressure (rho-1)/3. Pressure drag dominates for bluff bodies and,
    // unlike the raw momentum-exchange (which mixes in staircase shear
    // noise), it reproduces the correct ordering bluff >> streamlined and
    // the correct lift sign. Reported as an exponential moving average so
    // the number is steady even while vortices shed.
    S.computeForces = function () {
      let fx = 0, fy = 0;
      const links = S.boundaryLinks;
      for (let k = 0; k < links.length; k++) {
        const i = links[k].i, d = links[k].d;
        const p = (rho[i] - 1) / 3;
        fx += p * EX[d];
        fy += p * EY[d];
      }
      const a = 0.06;
      S.Fx += a * (fx - S.Fx);
      S.Fy += a * (fy - S.Fy);
    };

    S.rebuildBarrierMeta = function () {
      const links = [];
      let minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9, any = false;
      for (let y = 1; y < ny - 1; y++) {
        for (let x = 1; x < nx - 1; x++) {
          if (!barrier[x + y * nx]) continue;
          any = true;
          if (x < minx) minx = x; if (x > maxx) maxx = x;
          if (y < miny) miny = y; if (y > maxy) maxy = y;
        }
      }
      for (let y = 1; y < ny - 1; y++) {
        for (let x = 1; x < nx - 1; x++) {
          const i = x + y * nx;
          if (barrier[i]) continue;
          for (let d = 1; d < 9; d++) {
            const nxp = x + EX[d], nyp = y + EY[d];
            if (nxp < 0 || nxp >= nx || nyp < 0 || nyp >= ny) continue;
            if (barrier[nxp + nyp * nx]) links.push({ i, d });
          }
        }
      }
      S.boundaryLinks = links;
      S.hasShape = any;
      S.bbox = any ? { minx, maxx, miny, maxy } : null;
      if (!any) { S.Fx = 0; S.Fy = 0; }
    };

    S.charLength = function () { return S.bbox ? (S.bbox.maxy - S.bbox.miny + 1) : 0; };

    S.setCell = function (i, solid) {
      if (solid) {
        if (!barrier[i]) { barrier[i] = 1; for (let d = 0; d < 9; d++) f[d][i] = 0; rho[i] = 1; ux[i] = 0; uy[i] = 0; }
      } else {
        if (barrier[i]) { barrier[i] = 0; setEquil(i, S.u0, 0, 1); rho[i] = 1; ux[i] = S.u0; uy[i] = 0; }
      }
    };

    S.clearShape = function () {
      for (let i = 0; i < N; i++) if (barrier[i]) S.setCell(i, false);
      S.rebuildBarrierMeta();
    };

    // build a preset mask and diff it onto the grid (preserving surrounding flow)
    S.stampPreset = function (shape, aoaDeg) {
      const mask = new Uint8Array(N);
      const cx = Math.round(nx * 0.34);
      const cy = Math.round(ny * 0.5);
      const alpha = (aoaDeg) * Math.PI / 180; // +AoA -> nose up -> lift up (screen y is up)
      const ca = Math.cos(alpha), sa = Math.sin(alpha);

      if (shape === "circle") {
        const R = Math.max(6, Math.round(ny * 0.11));
        for (let y = 1; y < ny - 1; y++) for (let x = 1; x < nx - 1; x++) {
          const dx = x - cx, dy = y - cy;
          if (dx * dx + dy * dy <= R * R) mask[x + y * nx] = 1;
        }
      } else if (shape === "square") {
        const H = Math.max(10, Math.round(ny * 0.22)), Tk = Math.max(2, Math.round(ny * 0.03));
        for (let y = 1; y < ny - 1; y++) for (let x = 1; x < nx - 1; x++) {
          const dx = x - cx, dy = y - cy;
          const xr = dx * ca - dy * sa, yr = dx * sa + dy * ca;
          if (Math.abs(xr) <= Tk && Math.abs(yr) <= H / 2) mask[x + y * nx] = 1;
        }
      } else if (shape === "ellipse") {
        const A = Math.max(14, Math.round(ny * 0.26)), B = Math.max(6, Math.round(ny * 0.10));
        for (let y = 1; y < ny - 1; y++) for (let x = 1; x < nx - 1; x++) {
          const dx = x - cx, dy = y - cy;
          const xr = dx * ca - dy * sa, yr = dx * sa + dy * ca;
          if ((xr * xr) / (A * A) + (yr * yr) / (B * B) <= 1) mask[x + y * nx] = 1;
        }
      } else if (shape === "airfoil") {
        const Lc = Math.max(24, Math.round(nx * 0.22));
        const leX = cx - Lc * 0.5, leY = cy;
        for (let y = 1; y < ny - 1; y++) for (let x = 1; x < nx - 1; x++) {
          const dx = x - leX, dy = y - leY;
          const xr = dx * ca - dy * sa, yr = dx * sa + dy * ca;
          const xc2 = xr / Lc;
          if (xc2 < 0 || xc2 > 1) continue;
          const yt = nacaThickness(xc2) * Lc;
          const yc = nacaCamber(xc2) * Lc;
          if (yr >= yc - yt && yr <= yc + yt) mask[x + y * nx] = 1;
        }
      }

      for (let i = 0; i < N; i++) {
        if (mask[i] && !barrier[i]) S.setCell(i, true);
        else if (!mask[i] && barrier[i]) S.setCell(i, false);
      }
      S.rebuildBarrierMeta();
      S.kick();
    };

    // A brief, localised upward puff just behind the shape. Real wakes are
    // triggered by tiny disturbances; on a perfectly symmetric grid a
    // centred bluff body can sit in an artificial symmetric state for a
    // very long time before shedding. This one-time nudge breaks that
    // symmetry so the vortex street forms promptly when the regime allows.
    S.kick = function () {
      if (!S.bbox) return;
      const cx = Math.min(nx - 3, S.bbox.maxx + 4);
      const cy = Math.round((S.bbox.miny + S.bbox.maxy) / 2);
      for (let y = Math.max(1, cy - 2); y <= Math.min(ny - 2, cy + 2); y++) {
        for (let x = Math.max(1, cx - 2); x <= Math.min(nx - 2, cx + 2); x++) {
          const i = x + y * nx;
          if (barrier[i]) continue;
          setEquil(i, ux[i] || S.u0, 0.18 * S.u0, rho[i] || 1);
        }
      }
    };

    S.unstable = function () {
      for (let s = 0; s < 24; s++) {
        const x = 2 + ((s * 37) % (nx - 4));
        const y = 2 + ((s * 53) % (ny - 4));
        const i = x + y * nx;
        if (barrier[i]) continue;
        const r = rho[i];
        if (!(r > 0.2 && r < 3)) return true;
        const sp = ux[i] * ux[i] + uy[i] * uy[i];
        if (!(sp < 0.25) || Number.isNaN(sp)) return true;
      }
      return false;
    };

    S.resetFlow();
    return S;
  }

  const api = { createSim };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.WindTunnelSim = api;
})(typeof window !== "undefined" ? window : this);
