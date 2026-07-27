# Wind Tunnel — tunnel.gamestheory.org

A tiny in-browser **wind tunnel**. Draw any 2D shape (or drop in a
cylinder, airfoil, plate or teardrop) and watch real airflow bend around
it in real time — streamlines, wake, flow separation and vortex shedding.
Live readouts for the Reynolds number, relative drag/lift indicators
and the flow regime.

Pure static HTML/CSS/JS. No dependencies, no build step, no accounts, no
tracking, strict Content-Security-Policy. Part of
[gamestheory.org](https://gamestheory.org).

## The physics

The flow is computed with a **Lattice-Boltzmann** solver (D2Q9, single
relaxation time / BGK). In the low-Mach limit this recovers the
**incompressible Navier–Stokes equations**, so the streamlines, wake and
vortex street are genuine emergent behaviour rather than a scripted
animation:

- Solid cells use half-way **bounce-back** (no-slip walls).
- The inlet, top and bottom are driven at the free-stream velocity; the
  outlet is a zero-gradient (open) boundary.
- Forces on the shape are estimated by integrating the **surface
  pressure** ((rho − 1)/3) over the solid boundary, smoothed with an
  exponential moving average, and shown as *relative* indicators — not
  certified coefficients (a small 2D grid in a finite tunnel can't give
  textbook C_d/C_l values).

Everything is in lattice units; the number that actually governs the flow
— the **Reynolds number** — is shown on screen.

### Honest simplifications

It is **2D**, **low-speed** (incompressible — no shocks), uses **no
turbulence model** (the smallest eddies are not resolved), and the forces
are **estimates**. Read it for intuition, not certification.

## Run locally

Any static server works, e.g.:

```
npx serve .
```

## License

[PolyForm Noncommercial License 1.0.0](LICENSE) — Copyright Kacper (2026).
