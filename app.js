/* ============================================================
   Wind Tunnel — tunnel.gamestheory.org  (view + UI layer)
   Physics lives in sim.js (Lattice-Boltzmann D2Q9). This file
   handles rendering (field colouring + smoke streamlines),
   drawing input, controls, i18n and the live readouts.

   Honesty note: the Reynolds number is exact for the model.
   Drag and lift are shown as RELATIVE indicators only — a small
   2D lattice with a finite tunnel cannot give trustworthy
   absolute coefficients, but the trends (streamlining lowers
   drag; angle of attack makes lift) are real. See the help panel.
   ============================================================ */
"use strict";

(function () {
  /* ---------------- i18n ---------------- */
  const STR = {
    en: {
      brand_tag: "draw it, fly it",
      hint_draw: "Draw a shape in the airflow ✏️  — or pick a preset",
      ro_speed: "wind speed",
      ro_drag: "drag",
      ro_lift: "lift",
      ro_regime: "flow regime",
      grp_draw: "Draw",
      tool_draw: "✏️ Draw",
      tool_erase: "🩹 Erase",
      brush: "Brush",
      sh_circle: "● Cylinder",
      sh_airfoil: "✈ Airfoil",
      sh_square: "■ Plate",
      sh_ellipse: "⬭ Teardrop",
      clear: "Clear shape",
      grp_flow: "Flow",
      wind: "Wind speed",
      visc: "Air “thickness” (viscosity)",
      aoa: "Angle of attack",
      grp_show: "Show",
      f_speed: "Speed",
      f_curl: "Vortices",
      f_press: "Pressure",
      f_none: "Dark",
      smoke: "Smoke streamlines",
      pause: "⏸ Pause",
      resume: "▶ Resume",
      reset: "↺ Reset flow",
      disclaimer:
        "Real fluid dynamics, simplified for your browser (2D, low speed). Great for intuition — not a certified engineering tool.",
      footer_note: "A drawing you make in air. Runs entirely on your device — nothing is uploaded.",
      footer_how: "How it works",
      help_title: "How it works",
      reg_none: "draw a shape",
      reg_creep: "creeping flow",
      reg_attached: "steady flow",
      reg_street: "vortex street",
      reg_turb: "turbulent wake",
      reg_paused: "paused",
      drag_low: "low", drag_mod: "moderate", drag_high: "high", drag_vhigh: "very high", drag_dash: "—",
      lift_up: "▲ up", lift_down: "▼ down", lift_none: "— none",
      a_reset: "Flow reset.",
      a_unstable: "Flow went unstable and was reset — try more viscosity or lower wind speed.",
      skip_link: "Skip to the tunnel",
      aria_options: "Options",
      aria_allgames: "All games",
      title_home: "gamestheory.org",
      aria_lang: "Language",
      aria_help: "How it works",
      aria_windtunnel: "Wind tunnel",
      aria_sim: "Wind tunnel simulation",
      aria_measures: "Live measurements",
      aria_controls: "Controls",
      aria_tool: "Tool",
      aria_field: "Field",
      aria_close: "Close",
      aria_gh: "Source code on GitHub",
      sr_status: "Regime {r}. Drag {d}. Lift {l}.",
    },
    pl: {
      brand_tag: "narysuj i puść w ruch",
      hint_draw: "Narysuj kształt w strumieniu ✏️  — albo wybierz gotowy",
      ro_speed: "prędkość wiatru",
      ro_drag: "opór",
      ro_lift: "siła nośna",
      ro_regime: "reżim przepływu",
      grp_draw: "Rysuj",
      tool_draw: "✏️ Rysuj",
      tool_erase: "🩹 Wymaż",
      brush: "Pędzel",
      sh_circle: "● Walec",
      sh_airfoil: "✈ Profil",
      sh_square: "■ Płyta",
      sh_ellipse: "⬭ Kropla",
      clear: "Wyczyść kształt",
      grp_flow: "Przepływ",
      wind: "Prędkość wiatru",
      visc: "„Gęstość” powietrza (lepkość)",
      aoa: "Kąt natarcia",
      grp_show: "Pokaż",
      f_speed: "Prędkość",
      f_curl: "Wiry",
      f_press: "Ciśnienie",
      f_none: "Ciemne",
      smoke: "Smugi dymu",
      pause: "⏸ Pauza",
      resume: "▶ Wznów",
      reset: "↺ Zresetuj przepływ",
      disclaimer:
        "Prawdziwa dynamika płynów, uproszczona pod przeglądarkę (2D, małe prędkości). Świetna do intuicji — to nie certyfikowane narzędzie inżynierskie.",
      footer_note: "Rysunek, który robisz w powietrzu. Działa w całości na Twoim urządzeniu — nic nie jest wysyłane.",
      footer_how: "Jak to działa",
      help_title: "Jak to działa",
      reg_none: "narysuj kształt",
      reg_creep: "przepływ pełzający",
      reg_attached: "opływ ustalony",
      reg_street: "ścieżka wirowa",
      reg_turb: "ślad turbulentny",
      reg_paused: "pauza",
      drag_low: "niski", drag_mod: "umiarkowany", drag_high: "wysoki", drag_vhigh: "bardzo duży", drag_dash: "—",
      lift_up: "▲ w górę", lift_down: "▼ w dół", lift_none: "— brak",
      a_reset: "Przepływ zresetowany.",
      a_unstable: "Przepływ się rozjechał i został zresetowany — dodaj lepkości albo zmniejsz prędkość.",
      skip_link: "Przejdź do tunelu",
      aria_options: "Opcje",
      aria_allgames: "Wszystkie gry",
      title_home: "gamestheory.org",
      aria_lang: "Język",
      aria_help: "Jak to działa",
      aria_windtunnel: "Tunel aerodynamiczny",
      aria_sim: "Symulacja tunelu aerodynamicznego",
      aria_measures: "Pomiary na żywo",
      aria_controls: "Sterowanie",
      aria_tool: "Narzędzie",
      aria_field: "Pole",
      aria_close: "Zamknij",
      aria_gh: "Kod źródłowy na GitHubie",
      sr_status: "Reżim: {r}. Opór: {d}. Siła nośna: {l}.",
    },
  };

  const HELP = {
    en: `
      <p><strong>Wind Tunnel</strong> is a little slice of air, seen from the side. Air blows from the left. Draw any 2D shape and watch the flow bend around it in real time — with a real wake, separation and swirling vortices.</p>
      <h3>Do this</h3>
      <ul>
        <li><strong>Draw</strong> with your mouse or finger — hold and drag inside the tunnel. Or tap a preset: <em>Cylinder, Airfoil, Plate, Teardrop</em>.</li>
        <li><strong>Wind speed</strong> and <strong>viscosity</strong> together set the <em>Reynolds number</em> — the single number that decides how the flow behaves.</li>
        <li><strong>Angle of attack</strong> tilts the preset shape. Try it on the airfoil: lift grows with angle, then levels off at steep angles. (A real aerodynamic stall — where lift suddenly collapses — needs a boundary-layer model this simple solver doesn't have, so it isn't reproduced.)</li>
        <li><strong>Show</strong>: colour the air by <em>Speed</em>, <em>Vortices</em> (rotation) or <em>Pressure</em>, and toggle the smoke streamlines.</li>
      </ul>
      <h3>The numbers</h3>
      <ul>
        <li><strong>Reynolds number</strong> — ratio of inertia to viscous "stickiness". Low → smooth, syrupy flow; high → a turbulent, vortex-shedding wake. Same Reynolds number = same flow pattern, whatever the real size or speed. This value is exact for the model.</li>
        <li><strong>Drag</strong> and <strong>Lift</strong> are shown as <em>relative</em> indicators, not certified coefficients. A streamlined teardrop reads far less drag than a flat plate; tilting an airfoil produces lift that grows with angle. The <em>trends</em> are physically real; the absolute magnitudes are not — a small 2D grid in a finite tunnel can't give textbook C<sub>d</sub>/C<sub>l</sub> values, so this tool honestly doesn't pretend to.</li>
        <li><strong>Flow regime</strong> — a plain-language read of what the wake is doing.</li>
      </ul>
      <h3>The physics (and its limits)</h3>
      <p>Under the hood is a <strong>Lattice-Boltzmann</strong> solver (D2Q9, BGK). It approximates the <strong>incompressible Navier-Stokes equations</strong>, so the streamlines, wake and vortex street are computed, not faked. Solid cells use no-slip <em>bounce-back</em> walls.</p>
      <p class="muted">Honest limits: it's <strong>2D</strong> (no 3D effects like wingtip vortices), <strong>low-speed</strong> (incompressible — no sound or shock waves), has <strong>no turbulence model</strong> (very small eddies aren't resolved), and the forces are <strong>relative estimates</strong> (drag comes from surface pressure only — skin friction isn't included). Read it for intuition, not for certification.</p>
    `,
    pl: `
      <p><strong>Tunel aerodynamiczny</strong> to kawałek powietrza widziany z boku. Wiatr wieje z lewej. Narysuj dowolny kształt 2D i patrz, jak strugi zakrzywiają się wokół niego w czasie rzeczywistym — z prawdziwym śladem, oderwaniem i wirami.</p>
      <h3>Zrób tak</h3>
      <ul>
        <li><strong>Rysuj</strong> myszą lub palcem — przytrzymaj i przeciągnij w tunelu. Albo wybierz gotowy kształt: <em>Walec, Profil, Płyta, Kropla</em>.</li>
        <li><strong>Prędkość wiatru</strong> i <strong>lepkość</strong> razem ustalają <em>liczbę Reynoldsa</em> — jedną liczbę, która decyduje o charakterze przepływu.</li>
        <li><strong>Kąt natarcia</strong> przechyla gotowy kształt. Wypróbuj na profilu: siła nośna rośnie z kątem, a przy dużych kątach się wypłaszcza. (Prawdziwego przeciągnięcia — nagłego załamania siły nośnej — ten prosty solver nie liczy, bo wymaga modelu warstwy przyściennej.)</li>
        <li><strong>Pokaż</strong>: pokoloruj powietrze wg <em>Prędkości</em>, <em>Wirów</em> (obrotu) lub <em>Ciśnienia</em> i włącz/wyłącz smugi dymu.</li>
      </ul>
      <h3>Liczby</h3>
      <ul>
        <li><strong>Liczba Reynoldsa</strong> — stosunek bezwładności do lepkiej „lepkości". Mała → gładki przepływ; duża → turbulentny ślad z odrywającymi się wirami. Ta sama liczba Reynoldsa = ten sam obraz przepływu, niezależnie od realnej wielkości i prędkości. Ta wartość jest dokładna dla modelu.</li>
        <li><strong>Opór</strong> i <strong>siła nośna</strong> są pokazane jako wskaźniki <em>względne</em>, nie jako certyfikowane współczynniki. Opływowa kropla ma dużo mniejszy opór niż płaska płyta; przechylony profil daje siłę nośną rosnącą z kątem. <em>Trendy</em> są fizycznie prawdziwe; wartości bezwzględne — nie. Mała siatka 2D w skończonym tunelu nie da podręcznikowych C<sub>d</sub>/C<sub>l</sub>, więc to narzędzie uczciwie tego nie udaje.</li>
        <li><strong>Reżim przepływu</strong> — opis słowny tego, co dzieje się w śladzie.</li>
      </ul>
      <h3>Fizyka (i jej granice)</h3>
      <p>Pod maską pracuje solver <strong>Lattice-Boltzmann</strong> (D2Q9, BGK). Przybliża <strong>nieściśliwe równania Naviera–Stokesa</strong>, więc strugi, ślad i ścieżka wirowa są <em>liczone</em>, a nie udawane. Ściany kształtu to warunek <em>bounce-back</em> (brak poślizgu).</p>
      <p class="muted">Uczciwie o granicach: to <strong>2D</strong> (bez efektów 3D, np. wirów końcówek skrzydła), <strong>małe prędkości</strong> (nieściśliwie — brak dźwięku i fal uderzeniowych), <strong>bez modelu turbulencji</strong> (najmniejsze wiry nie są rozwiązywane), a siły to <strong>szacunki względne</strong> (opór liczony tylko z ciśnienia na powierzchni — bez tarcia lepkiego). Czytaj dla intuicji, nie do certyfikacji.</p>
    `,
  };

  const LKEY = "gt.tunnel.lang";
  function getLang() {
    try { const s = localStorage.getItem(LKEY); if (s === "pl" || s === "en") return s; } catch { /**/ }
    return (navigator.language || "").toLowerCase().startsWith("pl") ? "pl" : "en";
  }
  let lang = getLang();
  function t(k) { return (STR[lang] && STR[lang][k]) || STR.en[k] || k; }

  function applyI18n() {
    document.documentElement.lang = lang;
    const lb = document.getElementById("btn-lang");
    if (lb) lb.textContent = lang.toUpperCase();
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const v = t(el.dataset.i18n);
      if (v == null) return;
      if (v.indexOf("<") >= 0) el.innerHTML = v; else el.textContent = v;
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      const v = t(el.dataset.i18nAria); if (v != null) el.setAttribute("aria-label", v);
    });
    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      const v = t(el.dataset.i18nTitle); if (v != null) el.setAttribute("title", v);
    });
    const hb = document.getElementById("help-body");
    if (hb) hb.innerHTML = HELP[lang];
    const pb = document.getElementById("btn-pause");
    if (pb) pb.textContent = paused ? t("resume") : t("pause");
  }

  /* ---------------- state ---------------- */
  let sim = null;
  let fieldMode = "speed";
  let smokeOn = true;
  let tool = "draw";
  let brush = 6;
  let aoaDeg = 8;
  let currentPreset = null;
  let paused = false;
  let stepsPerFrame = 12;

  /* ---------------- canvas ---------------- */
  const view = document.getElementById("view");
  const ctx = view.getContext("2d", { alpha: false });
  const fieldCanvas = document.createElement("canvas");
  const fieldCtx = fieldCanvas.getContext("2d");
  let fieldImage = null;
  let dispW = 0, dispH = 0;

  const el = (id) => document.getElementById(id);
  const roRe = el("ro-re"), roSpeed = el("ro-speed"),
    roDragWord = el("ro-drag-word"), roDragBar = el("ro-drag-bar"),
    roLiftWord = el("ro-lift-word"), roLiftBar = el("ro-lift-bar"),
    roRegime = el("ro-regime"), roFps = el("ro-fps"),
    regimeBadge = el("regime-badge"), hintDraw = el("hint-draw"), ariaLive = el("aria-live"), srStatus = el("sr-status");
  let lastSr = "";

  /* ---------------- colour maps ---------------- */
  function lerp(a, b, tt) { return a + (b - a) * tt; }
  const SPD = [
    [0.00, 8, 14, 22], [0.22, 30, 64, 110], [0.42, 40, 120, 200],
    [0.60, 22, 199, 132], [0.80, 240, 168, 67], [1.00, 234, 57, 67],
  ];
  function speedColor(v, out, o) {
    let tt = v < 0 ? 0 : v > 1 ? 1 : v, s = 1;
    for (let k = 1; k < SPD.length; k++) { s = k; if (tt <= SPD[k][0]) break; }
    const a = SPD[s - 1], b = SPD[s], fr = (tt - a[0]) / (b[0] - a[0] || 1);
    out[o] = lerp(a[1], b[1], fr); out[o + 1] = lerp(a[2], b[2], fr); out[o + 2] = lerp(a[3], b[3], fr);
  }
  const DARK = [10, 15, 26];
  function divColor(v, out, o, negC, posC) {
    let tt = v < -1 ? -1 : v > 1 ? 1 : v;
    const c = tt >= 0 ? posC : negC, a = Math.abs(tt);
    out[o] = lerp(DARK[0], c[0], a); out[o + 1] = lerp(DARK[1], c[1], a); out[o + 2] = lerp(DARK[2], c[2], a);
  }
  const BLUE = [79, 140, 255], RED = [234, 57, 67], CYAN = [53, 208, 224], AMBER = [240, 168, 67];
  const SOLID = [42, 53, 72];

  function renderField() {
    const nx = sim.nx, ny = sim.ny, ux = sim.ux, uy = sim.uy, rho = sim.rho, barrier = sim.barrier;
    const data = fieldImage.data;
    const smax = sim.u0 * 1.75 + 1e-6;
    const curlScale = 22 / (sim.u0 + 0.02);
    for (let y = 0; y < ny; y++) {
      const py = ny - 1 - y;
      const rowOut = py * nx;
      for (let x = 0; x < nx; x++) {
        const i = x + y * nx;
        const o = (rowOut + x) * 4;
        if (barrier[i]) {
          data[o] = SOLID[0]; data[o + 1] = SOLID[1]; data[o + 2] = SOLID[2]; data[o + 3] = 255; continue;
        }
        if (fieldMode === "none") {
          data[o] = 6; data[o + 1] = 9; data[o + 2] = 16;
        } else if (fieldMode === "speed") {
          speedColor(Math.sqrt(ux[i] * ux[i] + uy[i] * uy[i]) / smax, data, o);
        } else if (fieldMode === "curl") {
          const xm = x > 0 ? x - 1 : x, xp = x < nx - 1 ? x + 1 : x;
          const ym = y > 0 ? y - 1 : y, yp = y < ny - 1 ? y + 1 : y;
          const curl = ((uy[xp + y * nx] - uy[xm + y * nx]) - (ux[x + yp * nx] - ux[x + ym * nx])) * 0.5 * curlScale;
          divColor(curl, data, o, BLUE, RED);
        } else {
          divColor((rho[i] - 1) * 9.0, data, o, CYAN, AMBER);
        }
        data[o + 3] = 255;
      }
    }
    fieldCtx.putImageData(fieldImage, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(fieldCanvas, 0, 0, nx, ny, 0, 0, dispW, dispH);
  }

  /* ---------------- smoke particles ---------------- */
  let P = null, pLane = null, nParticles = 0, nLanes = 0;
  function laneY(lane) { return ((lane + 0.5) / nLanes) * (sim.ny - 2) + 1; }
  function initParticles() {
    const ny = sim.ny, nx = sim.nx;
    nLanes = Math.min(44, Math.max(16, Math.round(ny * 0.40)));
    nParticles = nLanes * 90;
    P = new Float32Array(nParticles * 2);
    pLane = new Float32Array(nParticles);
    for (let k = 0; k < nParticles; k++) {
      const lane = k % nLanes; pLane[k] = lane;
      P[k * 2] = Math.random() * (nx - 2) + 1;
      P[k * 2 + 1] = laneY(lane) + (Math.random() - 0.5) * 1.2;
    }
  }
  function respawn(k) { P[k * 2] = 1 + Math.random() * 1.5; P[k * 2 + 1] = laneY(pLane[k]) + (Math.random() - 0.5) * 1.2; }
  const tmpv = [0, 0];
  function sampleU(x, y) {
    const nx = sim.nx, ny = sim.ny, ux = sim.ux, uy = sim.uy;
    let xi = Math.floor(x), yi = Math.floor(y);
    if (xi < 0) xi = 0; if (xi > nx - 2) xi = nx - 2;
    if (yi < 0) yi = 0; if (yi > ny - 2) yi = ny - 2;
    const fx = x - xi, fy = y - yi, i00 = xi + yi * nx, i10 = i00 + 1, i01 = i00 + nx, i11 = i01 + 1;
    const w00 = (1 - fx) * (1 - fy), w10 = fx * (1 - fy), w01 = (1 - fx) * fy, w11 = fx * fy;
    tmpv[0] = ux[i00] * w00 + ux[i10] * w10 + ux[i01] * w01 + ux[i11] * w11;
    tmpv[1] = uy[i00] * w00 + uy[i10] * w10 + uy[i01] * w01 + uy[i11] * w11;
  }
  function advectAndDraw(dt) {
    const nx = sim.nx, ny = sim.ny, N = nx * ny, barrier = sim.barrier;
    const sxk = dispW / nx, syk = dispH / ny;
    const dot = Math.max(1, dispW / nx * 0.9);
    // batch every particle into one path and a single fill() — far cheaper
    // than thousands of individual fillRect calls per frame
    ctx.fillStyle = "rgba(236, 243, 250, 0.88)";
    ctx.beginPath();
    for (let k = 0; k < nParticles; k++) {
      let x = P[k * 2], y = P[k * 2 + 1];
      sampleU(x, y); x += tmpv[0] * dt; y += tmpv[1] * dt;
      const gi = Math.floor(x) + Math.floor(y) * nx;
      if (x >= nx - 1 || x < 1 || y < 1 || y >= ny - 1 || (gi >= 0 && gi < N && barrier[gi])) {
        respawn(k); x = P[k * 2]; y = P[k * 2 + 1];
      } else { P[k * 2] = x; P[k * 2 + 1] = y; }
      ctx.rect(x * sxk, (ny - y) * syk, dot, dot);
    }
    ctx.fill();
  }

  /* ---------------- params ---------------- */
  function u0FromSlider(s) { return 0.03 + (s - 20) / 80 * 0.06; }
  function nuFromSlider(v) { return 0.012 + (v / 100) * 0.14; }

  /* ---------------- readouts ---------------- */
  function regimeKey(Re) {
    if (!sim.hasShape) return "reg_none";
    if (paused) return "reg_paused";
    if (Re < 5) return "reg_creep";
    if (Re < 55) return "reg_attached";
    if (Re < 220) return "reg_street";
    return "reg_turb";
  }
  let lastRoT = 0;
  function updateReadouts(now, fps) {
    if (now - lastRoT < 200) return;
    lastRoT = now;
    const L = sim.charLength();
    const Re = (L > 0 && sim.nu > 0) ? (sim.u0 * L / sim.nu) : 0;
    roRe.textContent = sim.hasShape ? Math.round(Re) : "—";
    roSpeed.textContent = Math.round((sim.u0 - 0.03) / 0.06 * 100) + "%";

    const q = 0.5 * sim.u0 * sim.u0 * (L || 1);
    const ready = sim.hasShape && sim.warmup > 700 && q > 0;
    const cd = ready ? sim.Fx / q : 0;   // relative drag index (per frontal height)
    const cl = ready ? sim.Fy / q : 0;   // relative lift index

    let dragWord, liftWord;
    if (ready) {
      roDragBar.style.width = Math.min(100, Math.max(2, cd / 9 * 100)) + "%";
      dragWord = cd < 2 ? t("drag_low") : cd < 4 ? t("drag_mod") : cd < 6.5 ? t("drag_high") : t("drag_vhigh");
      roDragWord.textContent = dragWord;
      const mag = Math.min(1, Math.abs(cl) / 10);
      if (cl > 0.4) { roLiftBar.style.left = "50%"; roLiftBar.style.width = (mag * 50) + "%"; roLiftBar.style.background = "var(--cyan)"; liftWord = t("lift_up"); }
      else if (cl < -0.4) { roLiftBar.style.left = (50 - mag * 50) + "%"; roLiftBar.style.width = (mag * 50) + "%"; roLiftBar.style.background = "var(--amber)"; liftWord = t("lift_down"); }
      else { roLiftBar.style.width = "0%"; roLiftBar.style.left = "50%"; liftWord = t("lift_none"); }
      roLiftWord.textContent = liftWord;
    } else {
      roDragBar.style.width = "0%"; roDragWord.textContent = dragWord = t("drag_dash");
      roLiftBar.style.width = "0%"; roLiftBar.style.left = "50%"; roLiftWord.textContent = liftWord = t("drag_dash");
    }

    const rk = regimeKey(Re);
    const regWord = t(rk);
    roRegime.textContent = regWord;
    regimeBadge.textContent = sim.hasShape ? (paused ? t("reg_paused") : "Re ≈ " + Math.round(Re) + " · " + regWord) : t("reg_none");
    roFps.textContent = Math.round(fps);

    // screen-reader status: only announce when the words change, not every tick
    if (sim.hasShape && !paused) {
      const s = t("sr_status").replace("{r}", regWord).replace("{d}", dragWord).replace("{l}", liftWord);
      if (s !== lastSr) { lastSr = s; if (srStatus) srStatus.textContent = s; }
    }
  }

  /* ---------------- pointer drawing ---------------- */
  let drawing = false, lastPt = null;
  function toGrid(ev) {
    const rect = view.getBoundingClientRect();
    return { gx: (ev.clientX - rect.left) / rect.width * sim.nx, gy: (1 - (ev.clientY - rect.top) / rect.height) * sim.ny };
  }
  function paintDisc(gx, gy, r, solid) {
    const nx = sim.nx, ny = sim.ny, r2 = r * r;
    const x0 = Math.max(1, Math.floor(gx - r)), x1 = Math.min(nx - 2, Math.ceil(gx + r));
    const y0 = Math.max(1, Math.floor(gy - r)), y1 = Math.min(ny - 2, Math.ceil(gy + r));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const dx = x - gx, dy = y - gy; if (dx * dx + dy * dy <= r2) sim.setCell(x + y * nx, solid);
    }
  }
  function onDown(ev) {
    ev.preventDefault(); drawing = true; currentPreset = null;
    if (view.setPointerCapture) try { view.setPointerCapture(ev.pointerId); } catch { /**/ }
    const { gx, gy } = toGrid(ev); paintDisc(gx, gy, brush, tool === "draw"); lastPt = { gx, gy }; hideHint();
  }
  function onMove(ev) {
    if (!drawing) return;
    const { gx, gy } = toGrid(ev);
    if (lastPt) {
      const dx = gx - lastPt.gx, dy = gy - lastPt.gy, dist = Math.hypot(dx, dy), steps = Math.max(1, Math.ceil(dist / (brush * 0.5)));
      for (let s = 1; s <= steps; s++) paintDisc(lastPt.gx + dx * s / steps, lastPt.gy + dy * s / steps, brush, tool === "draw");
    } else paintDisc(gx, gy, brush, tool === "draw");
    lastPt = { gx, gy };
  }
  function onUp() { if (!drawing) return; drawing = false; lastPt = null; sim.rebuildBarrierMeta(); }

  function hideHint() { if (hintDraw) hintDraw.classList.add("is-hidden"); }
  function showHint() { if (hintDraw) hintDraw.classList.remove("is-hidden"); }
  function announce(msg) { if (ariaLive) { ariaLive.textContent = ""; setTimeout(() => (ariaLive.textContent = msg), 30); } }

  /* ---------------- UI wiring ---------------- */
  function setActive(list, active) {
    list.forEach((n) => { const on = n === active; n.classList.toggle("is-active", on); n.setAttribute("aria-pressed", on ? "true" : "false"); });
  }
  function wire() {
    const td = el("tool-draw"), te = el("tool-erase");
    td.addEventListener("click", () => { tool = "draw"; setActive([td, te], td); });
    te.addEventListener("click", () => { tool = "erase"; setActive([td, te], te); });

    const inBrush = el("in-brush"), outBrush = el("out-brush");
    inBrush.addEventListener("input", () => { brush = +inBrush.value; outBrush.textContent = brush; });
    brush = +inBrush.value; outBrush.textContent = brush;

    document.querySelectorAll(".preset").forEach((b) => b.addEventListener("click", () => { currentPreset = b.dataset.shape; sim.stampPreset(currentPreset, aoaDeg); hideHint(); }));
    el("btn-clear").addEventListener("click", () => { sim.clearShape(); currentPreset = null; showHint(); });

    const inSpeed = el("in-speed"), outSpeed = el("out-speed");
    const applySpeed = () => { sim.setParams(u0FromSlider(+inSpeed.value), sim.nu); outSpeed.textContent = Math.round((+inSpeed.value - 20) / 80 * 100) + "%"; };
    inSpeed.addEventListener("input", applySpeed);

    const inVisc = el("in-visc"), outVisc = el("out-visc");
    const applyVisc = () => { sim.setParams(sim.u0, nuFromSlider(+inVisc.value)); outVisc.textContent = (+inVisc.value) + "%"; };
    inVisc.addEventListener("input", applyVisc);

    const inAoa = el("in-aoa"), outAoa = el("out-aoa");
    inAoa.addEventListener("input", () => { aoaDeg = +inAoa.value; outAoa.textContent = aoaDeg + "°"; if (currentPreset) sim.stampPreset(currentPreset, aoaDeg); });
    aoaDeg = +inAoa.value; outAoa.textContent = aoaDeg + "°";

    const fieldBtns = Array.from(document.querySelectorAll(".field-btn"));
    fieldBtns.forEach((b) => b.addEventListener("click", () => { fieldMode = b.dataset.field; setActive(fieldBtns, b); }));

    el("in-smoke").addEventListener("change", (e) => { smokeOn = e.target.checked; });

    const pb = el("btn-pause");
    pb.addEventListener("click", () => { paused = !paused; pb.textContent = paused ? t("resume") : t("pause"); });
    el("btn-reset").addEventListener("click", () => { sim.resetFlow(); sim.kick(); announce(t("a_reset")); });

    view.addEventListener("pointerdown", onDown);
    view.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    view.addEventListener("pointercancel", onUp);

    el("btn-lang").addEventListener("click", () => { lang = lang === "pl" ? "en" : "pl"; try { localStorage.setItem(LKEY, lang); } catch { /**/ } applyI18n(); });
    const modal = el("modal-help");
    const openHelp = () => { if (modal && typeof modal.showModal === "function") modal.showModal(); };
    el("btn-help").addEventListener("click", openHelp);
    el("btn-how-footer").addEventListener("click", openHelp);

    // sync slider outputs with current params
    inSpeed.value = 65; applySpeed();
    inVisc.value = 35; applyVisc();
  }

  /* ---------------- sizing / grid ---------------- */
  function sizeCanvas() {
    const rect = document.getElementById("canvas-wrap").getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    dispW = Math.max(1, Math.round(rect.width * dpr));
    dispH = Math.max(1, Math.round(rect.height * dpr));
    view.width = dispW; view.height = dispH;
  }
  function buildSim() {
    const rect = document.getElementById("canvas-wrap").getBoundingClientRect();
    const mobile = Math.min(window.innerWidth, window.innerHeight) < 680;
    const ny = mobile ? 82 : 116;
    const aspect = rect.width > 0 ? rect.width / rect.height : 2;
    const nx = Math.max(120, Math.min(320, Math.round(ny * aspect)));
    stepsPerFrame = mobile ? 7 : 10;
    sim = window.WindTunnelSim.createSim(nx, ny);
    sim.setParams(u0FromSlider(65), nuFromSlider(35));
    sim.resetFlow();
    fieldCanvas.width = nx; fieldCanvas.height = ny;
    fieldImage = fieldCtx.createImageData(nx, ny);
    initParticles();
  }

  /* ---------------- main loop ---------------- */
  let fps = 60, lastFrame = 0;
  function step() {
    if (!paused) {
      for (let s = 0; s < stepsPerFrame; s++) sim.step();
      sim.warmup += stepsPerFrame;
      if (sim.hasShape) sim.computeForces();
      if (sim.unstable()) { sim.resetFlow(); announce(t("a_unstable")); }
    }
    renderField();
    if (smokeOn) advectAndDraw(stepsPerFrame);
  }
  function frame(now) {
    if (!lastFrame) lastFrame = now;
    const dtms = now - lastFrame; lastFrame = now;
    if (dtms > 0) fps = fps * 0.9 + (1000 / dtms) * 0.1;
    step();
    updateReadouts(now, fps);
    requestAnimationFrame(frame);
  }

  /* ---------------- boot ---------------- */
  function boot() {
    applyI18n();
    sizeCanvas();
    buildSim();
    wire();
    sim.stampPreset("airfoil", aoaDeg);
    currentPreset = "airfoil";
    hideHint();

    // The tunnel container is locked to a 2:1 aspect ratio, and the field is
    // drawn scaled to the display, so a resize only needs to resize the
    // canvas backing store — the sim grid (and any hand-drawn shape) is kept.
    let rt = null;
    const ro = new ResizeObserver(() => {
      clearTimeout(rt);
      rt = setTimeout(sizeCanvas, 150);
    });
    ro.observe(document.getElementById("canvas-wrap"));

    // debug hook (harmless): lets a hidden tab be driven manually for testing
    window.__wt = {
      get sim() { return sim; },
      tick(n) { for (let i = 0; i < (n || 1); i++) step(); updateReadouts(performance.now(), fps); },
      readouts() {
        return { re: roRe.textContent, speed: roSpeed.textContent, drag: roDragWord.textContent, dragBar: roDragBar.style.width, lift: roLiftWord.textContent, liftBar: roLiftBar.style.width, regime: roRegime.textContent };
      },
    };

    requestAnimationFrame(frame);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
