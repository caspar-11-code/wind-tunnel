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
      aria_mode: "Mode",
      aria_quiz: "Guess the flow",
      aria_sim: "Wind tunnel simulation",
      aria_measures: "Live measurements",
      aria_controls: "Controls",
      aria_tool: "Tool",
      aria_field: "Field",
      aria_close: "Close",
      aria_gh: "Source code on GitHub",
      sr_status: "Regime {r}. Drag {d}. Lift {l}.",
      mode_sandbox: "🌀 Sandbox",
      mode_quiz: "🎯 Guess the flow",
      q_wake: "What will form in the wake behind this shape?",
      q_lift: "Which way will the air push this shape (lift)?",
      q_info_re: "Reynolds number ≈ {re}",
      q_info_lift: "Read the shape and how it is tilted.",
      opt_smooth: "Smooth, steady wake",
      opt_street: "A vortex street (shedding)",
      opt_up: "▲ Upward",
      opt_down: "▼ Downward",
      opt_zero: "≈ Almost none",
      q_correct: "Correct!",
      q_wrong: "Not quite",
      q_next: "Next →",
      q_last: "See result →",
      q_again: "Play again",
      q_share: "Share",
      q_round: "Round {n} / {t}",
      q_scoreline: "{s} pts · streak {k}",
      q_result_sub: "{s} / {t} right. Best {b}/{t} · longest streak {m}.",
      q_share_text: "Wind Tunnel — Guess the flow: {s}/{t} 🎯 tunnel.gamestheory.org",
      q_shared: "Result copied to clipboard.",
      ex_smooth: "Low Reynolds number: viscosity keeps the flow attached, so no vortices shed.",
      ex_street: "High Reynolds number: the flow separates and sheds alternating vortices — a Kármán street.",
      ex_up: "The shape deflects air downward, so by reaction it is pushed up — that is lift.",
      ex_down: "The tilt deflects air upward, so the shape is pushed down.",
      ex_zero: "A symmetric shape head-on: the forces above and below cancel out.",
      q_drag: "Which shape has the LOWER drag?",
      q_info_drag: "On reveal, watch both wakes — a narrower wake means less drag.",
      ex_drag: "The more streamlined shape leaves a narrower wake and has lower drag.",
      n_circle: "Cylinder", n_square: "Plate", n_ellipse: "Teardrop", n_airfoil: "Airfoil",
      mode_academy: "🎓 Academy",
      ac_level: "Chapter {c} · Level {n}/{t}",
      ac_now: "now",
      ac_next: "Next level →",
      ac_finish: "Finish chapter →",
      ac_done_title: "Chapter {n} complete 🎓",
      ac_next_chapter: "Chapter {n} →",
      ac_ch1_sub: "You've met the Reynolds number, streamlining and lift. Next: pressure, area and downforce.",
      ac_ch2_sub: "Pressure, frontal area and downforce — done. Next: efficiency and design.",
      ac_ch3_sub: "Lift-to-drag efficiency, the cost of over-angling, and designing your own shape — done.",
      ac_ch4_sub: "The cruise-wing balance, the downforce trade-off, and a lifting wing of your own — done.",
      ac_final_title: "Academy complete 🎓",
      ac_final_sub: "Four chapters down: flow, pressure, efficiency and design. You can read a wake, a pressure field and a lift curve — that's real aerodynamic intuition.",
      ac_again: "Replay academy",
      l1_title: "The Reynolds number",
      l1_brief: "Same Reynolds number = same flow pattern. Raise the wind speed and lower the viscosity until a vortex street forms behind the cylinder.",
      l1_goal: "Trigger a vortex street: Reynolds ≥ 70",
      l1_lesson: "<strong>Reynolds = inertia ÷ viscosity.</strong> Below ~55 the flow stays smooth; above it the wake sheds alternating vortices — a Kármán street. The same Reynolds number means the same pattern, at any real size or speed.",
      l2_title: "Streamlining",
      l2_brief: "A flat plate has huge drag. Change the shape — pick a preset or draw your own — to narrow the wake and bring the drag down.",
      l2_goal: "Bring the drag down (a streamlined shape)",
      l2_lesson: "<strong>A blunt body drags mostly through pressure</strong> — it leaves a wide, low-pressure wake. A streamlined shape guides the air gently and narrows the wake, so the drag drops sharply.",
      l3_title: "Angle of attack & lift",
      l3_brief: "An airfoil head-on doesn't lift. Increase the angle of attack until a clear upward lift appears.",
      l3_goal: "Make lift point clearly upward",
      l3_lesson: "<strong>An airfoil at an angle deflects air downward, so it gets pushed up</strong> — that's lift. Careful: a real wing stalls (lift suddenly collapses) past a critical angle — this simple model doesn't reproduce that.",
      l4_title: "Pressure & the stagnation point",
      l4_brief: "Switch the Show view to Pressure. Where the air stops at the nose, pressure is highest (the stagnation point); where it speeds up, pressure drops.",
      l4_goal: "Switch the view to Pressure",
      l4_lesson: "<strong>At the nose the air is brought to rest — the stagnation point, the highest pressure.</strong> Over the top and sides the air speeds up and the pressure falls. That pressure difference is exactly what pushes on a shape.",
      l5_title: "Frontal area & drag",
      l5_brief: "Drag grows with the area a body shows to the wind. Make the drag as HIGH as you can — what catches the most air?",
      l5_goal: "Make the drag very high",
      l5_lesson: "<strong>A tall, blunt shape facing the flow catches the most air and drags the most.</strong> The same shape turned edge-on drags far less — frontal area matters as much as form.",
      l6_title: "Downforce (an upside-down wing)",
      l6_brief: "Flip the idea of lift: tilt the airfoil so the air pushes it DOWN — that's how a race car's wing sticks it to the track.",
      l6_goal: "Make lift point clearly downward",
      l6_lesson: "<strong>Lift direction just follows the tilt.</strong> Angle the airfoil the other way and it deflects air upward, so it's pushed down — downforce. An F1 wing is basically an airfoil mounted upside-down.",
      l7_title: "Efficiency (L/D)",
      l7_brief: "Every degree of angle buys lift but also drag. Tune the angle of attack to the sweet spot with the best lift-to-drag ratio (L/D).",
      l7_goal: "Reach a high L/D (efficiency)",
      l7_lesson: "<strong>L/D — lift divided by drag — is how efficiently a wing flies.</strong> Too little angle: barely any lift. Too much: drag climbs and L/D falls. Real wings cruise near their best-L/D angle.",
      l8_title: "Too much angle",
      l8_brief: "Push the angle of attack well past the sweet spot. Watch the drag climb — and the efficiency collapse.",
      l8_goal: "Drive the drag very high (over-angle it)",
      l8_lesson: "<strong>Past the best angle, drag rises fast and L/D drops.</strong> On a real wing the flow would separate and it would stall (lift collapses) — which is why aircraft limit their angle of attack. This simple model shows the drag penalty, not the sudden stall.",
      l9_title: "Design your own shape",
      l9_brief: "Now you're the designer: draw your own shape from scratch and make it slippery — long and smooth — to get the drag low.",
      l9_goal: "Draw a low-drag shape of your own",
      l9_lesson: "<strong>You did it — you streamlined a shape by hand.</strong> Long, smooth, tapered bodies guide the air with a narrow wake and low drag. That's the whole game of aerodynamic design.",
      l9_now_preset: "your own drawing only — a preset doesn't count",
      l9_now_draw: "draw a shape in the tunnel",
      l9_now_small: "too small — draw it bigger",
      l10_title: "The cruise wing",
      l10_brief: "A real wing has to lift a lot AND fly efficiently. Tune the angle of attack until you get strong upward lift and a high lift-to-drag ratio at the same time.",
      l10_goal: "Strong lift AND high L/D at once",
      l10_lesson: "<strong>A cruise wing balances two things at once: enough lift to stay airborne, and a good L/D to stay efficient.</strong> Too little angle is efficient but barely lifts; too much lifts at a worse ratio. Real aircraft cruise at the sweet spot in between.",
      l11_title: "F1 downforce",
      l11_brief: "Tilt the wing the other way for downforce — but drag is the price. Angle it to get strong downforce while keeping the drag under control.",
      l11_goal: "Strong downforce, drag under control",
      l11_lesson: "<strong>Downforce glues a race car to the track — but every extra degree also piles on drag.</strong> Push too far and the drag runs away for little extra grip, so engineers take the most downforce they can before drag becomes the limit. (No sudden stall here — it's the honest drag trade-off, not a lift collapse.)",
      l12_title: "Design a lifting wing",
      l12_brief: "The finale — draw your own wing that lifts itself. A symmetric shape makes zero lift: arch the TOP and flatten the bottom (like a wing) until the lift arrow points up ▲. Draw a solid body, not a thin line — and if the lift points down, flip the curve.",
      l12_goal: "Draw a shape that lifts up",
      l12_lesson: "<strong>You built a wing.</strong> Lift comes from asymmetry: a symmetric shape balances top and bottom and makes none, but arch the top and the air is deflected downward — so the shape is pushed up. That top-vs-bottom difference (camber) is the heart of every wing. (A 2D pressure model — it shows the principle, not certified numbers.)",
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
      aria_mode: "Tryb",
      aria_quiz: "Zgadnij",
      aria_sim: "Symulacja tunelu aerodynamicznego",
      aria_measures: "Pomiary na żywo",
      aria_controls: "Sterowanie",
      aria_tool: "Narzędzie",
      aria_field: "Pole",
      aria_close: "Zamknij",
      aria_gh: "Kod źródłowy na GitHubie",
      sr_status: "Reżim: {r}. Opór: {d}. Siła nośna: {l}.",
      mode_sandbox: "🌀 Piaskownica",
      mode_quiz: "🎯 Zgadnij",
      q_wake: "Co powstanie w śladzie za tym kształtem?",
      q_lift: "W którą stronę powietrze zepchnie ten kształt (siła nośna)?",
      q_info_re: "Liczba Reynoldsa ≈ {re}",
      q_info_lift: "Popatrz na kształt i jego przechylenie.",
      opt_smooth: "Gładki, ustalony ślad",
      opt_street: "Ścieżka wirów (oderwanie)",
      opt_up: "▲ W górę",
      opt_down: "▼ W dół",
      opt_zero: "≈ Prawie zero",
      q_correct: "Dobrze!",
      q_wrong: "Nie tym razem",
      q_next: "Dalej →",
      q_last: "Zobacz wynik →",
      q_again: "Zagraj ponownie",
      q_share: "Udostępnij",
      q_round: "Runda {n} / {t}",
      q_scoreline: "{s} pkt · seria {k}",
      q_result_sub: "{s} / {t} trafień. Rekord {b}/{t} · najdłuższa seria {m}.",
      q_share_text: "Wind Tunnel — Zgadnij: {s}/{t} 🎯 tunnel.gamestheory.org",
      q_shared: "Wynik skopiowany do schowka.",
      ex_smooth: "Mała liczba Reynoldsa: lepkość utrzymuje przepływ przy powierzchni, wiry się nie odrywają.",
      ex_street: "Duża liczba Reynoldsa: przepływ się odrywa i tworzy naprzemienne wiry — ścieżka Kármána.",
      ex_up: "Kształt odchyla powietrze w dół, więc w reakcji jest pchany w górę — to siła nośna.",
      ex_down: "Przechylenie odchyla powietrze w górę, więc kształt jest spychany w dół.",
      ex_zero: "Kształt symetryczny na wprost: siły z góry i z dołu się znoszą.",
      q_drag: "Który kształt stawia MNIEJSZY opór?",
      q_info_drag: "Po odsłonie patrz na oba ślady — węższy ślad to mniejszy opór.",
      ex_drag: "Bardziej opływowy kształt zostawia węższy ślad i ma mniejszy opór.",
      n_circle: "Walec", n_square: "Płyta", n_ellipse: "Kropla", n_airfoil: "Profil",
      mode_academy: "🎓 Akademia",
      ac_level: "Rozdział {c} · Poziom {n}/{t}",
      ac_now: "teraz",
      ac_next: "Następny poziom →",
      ac_finish: "Zakończ rozdział →",
      ac_done_title: "Rozdział {n} ukończony 🎓",
      ac_next_chapter: "Rozdział {n} →",
      ac_ch1_sub: "Poznałeś liczbę Reynoldsa, opływowość i siłę nośną. Dalej: ciśnienie, pole czołowe i docisk.",
      ac_ch2_sub: "Ciśnienie, pole czołowe i docisk — zaliczone. Dalej: sprawność i projektowanie.",
      ac_ch3_sub: "Sprawność L/D, kara za zbyt duży kąt i projekt własnego kształtu — zaliczone.",
      ac_ch4_sub: "Równowaga skrzydła krążowniczego, kompromis docisku i własne skrzydło nośne — zaliczone.",
      ac_final_title: "Akademia ukończona 🎓",
      ac_final_sub: "Cztery rozdziały za Tobą: przepływ, ciśnienie, sprawność i projekt. Umiesz odczytać ślad, pole ciśnienia i krzywą nośnej — to prawdziwa intuicja aerodynamiczna.",
      ac_again: "Powtórz akademię",
      l1_title: "Liczba Reynoldsa",
      l1_brief: "Ta sama liczba Reynoldsa = ten sam obraz przepływu. Podnoś prędkość wiatru i zmniejszaj lepkość, aż za walcem powstanie ścieżka wirów.",
      l1_goal: "Wywołaj ścieżkę wirów: Reynolds ≥ 70",
      l1_lesson: "<strong>Reynolds = bezwładność ÷ lepkość.</strong> Poniżej ~55 przepływ jest gładki; powyżej — w śladzie odrywają się naprzemienne wiry (ścieżka Kármána). Ta sama liczba Reynoldsa to ten sam obraz, przy dowolnej realnej wielkości i prędkości.",
      l2_title: "Opływowość",
      l2_brief: "Płaska płyta stawia ogromny opór. Zmień kształt — wybierz gotowy albo narysuj własny — żeby zwęzić ślad i zbić opór.",
      l2_goal: "Zbij opór (opływowy kształt)",
      l2_lesson: "<strong>Ciało tępe stawia opór głównie ciśnieniem</strong> — zostawia szeroki ślad o niskim ciśnieniu. Opływowy kształt prowadzi powietrze łagodnie i zwęża ślad, więc opór gwałtownie spada.",
      l3_title: "Kąt natarcia i siła nośna",
      l3_brief: "Profil na wprost nie unosi. Zwiększaj kąt natarcia, aż pojawi się wyraźna siła nośna w górę.",
      l3_goal: "Wytwórz wyraźną siłę nośną w górę",
      l3_lesson: "<strong>Profil pod kątem odchyla powietrze w dół, więc jest pchany w górę</strong> — to siła nośna. Uwaga: prawdziwe skrzydło przy zbyt dużym kącie przeciąga (nagły spadek nośnej) — tego ten prosty model nie liczy.",
      l4_title: "Ciśnienie i punkt stagnacji",
      l4_brief: "Przełącz widok pola na Ciśnienie (sekcja Pokaż po prawej). Tam gdzie powietrze zatrzymuje się z przodu, ciśnienie jest najwyższe (punkt stagnacji); tam gdzie przyspiesza — spada.",
      l4_goal: "Przełącz widok na Ciśnienie",
      l4_lesson: "<strong>Z przodu powietrze jest wyhamowane — punkt stagnacji, najwyższe ciśnienie.</strong> Nad kształtem i po bokach powietrze przyspiesza, a ciśnienie spada. Ta różnica ciśnień właśnie napiera na kształt.",
      l5_title: "Pole czołowe a opór",
      l5_brief: "Opór rośnie z powierzchnią, jaką ciało pokazuje wiatrowi. Ustaw opór jak NAJWIĘKSZY — co łapie najwięcej powietrza?",
      l5_goal: "Ustaw bardzo duży opór",
      l5_lesson: "<strong>Wysoki, tępy kształt na wprost łapie najwięcej powietrza i stawia największy opór.</strong> Ten sam kształt obrócony bokiem stawia dużo mniejszy — pole czołowe liczy się tak samo jak forma.",
      l6_title: "Docisk (odwrócone skrzydło)",
      l6_brief: "Odwróć ideę nośnej: przechyl profil tak, by powietrze spychało go w DÓŁ — tak skrzydło bolidu dociska go do toru.",
      l6_goal: "Wytwórz wyraźną siłę w dół",
      l6_lesson: "<strong>Kierunek nośnej idzie za przechyleniem.</strong> Profil przechylony w drugą stronę odchyla powietrze w górę, więc jest spychany w dół — to docisk. Skrzydło F1 to w zasadzie profil zamontowany do góry nogami.",
      l7_title: "Sprawność (L/D)",
      l7_brief: "Każdy stopień kąta daje nośną, ale i opór. Dobierz kąt natarcia do sweet-spotu o najlepszym stosunku nośnej do oporu (L/D).",
      l7_goal: "Osiągnij wysokie L/D (sprawność)",
      l7_lesson: "<strong>L/D — nośna podzielona przez opór — mówi, jak sprawnie leci skrzydło.</strong> Za mały kąt: prawie brak nośnej. Za duży: opór rośnie i L/D spada. Prawdziwe skrzydła lecą blisko kąta najlepszego L/D.",
      l8_title: "Za duży kąt",
      l8_brief: "Przekrocz sweet-spot i przechyl profil dużo mocniej. Zobacz, jak opór rośnie — a sprawność się załamuje.",
      l8_goal: "Wywołaj bardzo duży opór (przesadź z kątem)",
      l8_lesson: "<strong>Za najlepszym kątem opór szybko rośnie, a L/D spada.</strong> Na prawdziwym skrzydle przepływ by się oderwał i skrzydło by przeciągnęło (nagły spadek nośnej) — dlatego samoloty ograniczają kąt natarcia. Ten prosty model pokazuje karę oporu, ale nie nagłe przeciągnięcie.",
      l9_title: "Zaprojektuj własny kształt",
      l9_brief: "Teraz Ty jesteś konstruktorem: narysuj własny kształt od zera i zrób go opływowym — długim i gładkim — żeby zbić opór.",
      l9_goal: "Narysuj własny kształt o małym oporze",
      l9_lesson: "<strong>Udało się — zaprojektowałeś opływowy kształt ręcznie.</strong> Długie, gładkie, zwężające się ciała prowadzą powietrze wąskim śladem i z małym oporem. To cała istota projektowania aerodynamicznego.",
      l9_now_preset: "tylko własny rysunek — preset się nie liczy",
      l9_now_draw: "narysuj kształt w tunelu",
      l9_now_small: "za mały — narysuj większy",
      l10_title: "Skrzydło krążownicze",
      l10_brief: "Prawdziwe skrzydło musi dawać dużą nośną I lecieć sprawnie. Dobierz kąt natarcia tak, by naraz mieć silną nośną w górę i wysoki stosunek nośnej do oporu.",
      l10_goal: "Silna nośna i wysokie L/D naraz",
      l10_lesson: "<strong>Skrzydło krążownicze godzi naraz dwie rzeczy: dość nośnej, by się utrzymać, i dobre L/D, by lecieć sprawnie.</strong> Za mały kąt jest sprawny, ale ledwo unosi; za duży unosi przy gorszym stosunku. Prawdziwe samoloty lecą w sweet-spocie pomiędzy.",
      l11_title: "Docisk bolidu",
      l11_brief: "Przechyl skrzydło w drugą stronę, by dociskać — ale opór to cena. Ustaw kąt tak, by mieć silny docisk, trzymając opór w ryzach.",
      l11_goal: "Silny docisk, opór pod kontrolą",
      l11_lesson: "<strong>Docisk przykleja bolid do toru — ale każdy dodatkowy stopień dokłada też oporu.</strong> Przesadzisz i opór ucieka przy znikomym zysku przyczepności, więc inżynierowie biorą maksimum docisku, zanim opór stanie się granicą. (Bez nagłego przeciągnięcia — to uczciwy kompromis oporu, nie załamanie nośnej.)",
      l12_title: "Zaprojektuj skrzydło nośne",
      l12_brief: "Finał — narysuj własne skrzydło, które samo się unosi. Kształt symetryczny nie daje nośnej: wygnij GÓRĘ i spłaszcz spód (jak skrzydło), aż strzałka nośnej wskaże w górę ▲. Rysuj pełną bryłę, nie cienką kreskę — a jeśli nośna jest w dół, odwróć wygięcie.",
      l12_goal: "Narysuj kształt, który unosi w górę",
      l12_lesson: "<strong>Zbudowałeś skrzydło.</strong> Nośna bierze się z asymetrii: kształt symetryczny równoważy górę i dół i nie daje nic, ale wygnij górę, a powietrze zostaje odchylone w dół — więc kształt jest pchany w górę. Ta różnica góra–dół (wygięcie, camber) to sedno każdego skrzydła. (Model 2D, ciśnieniowy — pokazuje zasadę, nie certyfikowane liczby.)",
    },
  };

  const HELP = {
    en: `
      <p><strong>Wind Tunnel</strong> is a little slice of air, seen from the side. Air blows from the left. Draw any 2D shape and watch the flow bend around it in real time — with a real wake, separation and swirling vortices. Play freely in <strong>🌀 Sandbox</strong>, or switch to <strong>🎯 Guess the flow</strong> to predict the physics and score points.</p>
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
      <p>Under the hood is a <strong>Lattice-Boltzmann</strong> solver (D2Q9, BGK). It approximates the <strong>incompressible Navier–Stokes equations</strong>, so the streamlines, wake and vortex street are computed, not faked. Solid cells use no-slip <em>bounce-back</em> walls.</p>
      <p class="muted">Honest limits: it's <strong>2D</strong> (no 3D effects like wingtip vortices), <strong>low-speed</strong> (incompressible — no sound or shock waves), has <strong>no turbulence model</strong> (very small eddies aren't resolved), and the forces are <strong>relative estimates</strong> (drag comes from surface pressure only — skin friction isn't included). Read it for intuition, not for certification.</p>
    `,
    pl: `
      <p><strong>Tunel aerodynamiczny</strong> to kawałek powietrza widziany z boku. Wiatr wieje z lewej. Narysuj dowolny kształt 2D i patrz, jak strugi zakrzywiają się wokół niego w czasie rzeczywistym — z prawdziwym śladem, oderwaniem i wirami. Baw się w trybie <strong>🌀 Piaskownica</strong> albo przełącz na <strong>🎯 Zgadnij</strong>, żeby przewidywać fizykę i zdobywać punkty.</p>
      <h3>Zrób tak</h3>
      <ul>
        <li><strong>Rysuj</strong> myszą lub palcem — przytrzymaj i przeciągnij w tunelu. Albo wybierz gotowy kształt: <em>Walec, Profil, Płyta, Kropla</em>.</li>
        <li><strong>Prędkość wiatru</strong> i <strong>lepkość</strong> razem ustalają <em>liczbę Reynoldsa</em> — jedną liczbę, która decyduje o charakterze przepływu.</li>
        <li><strong>Kąt natarcia</strong> przechyla gotowy kształt. Wypróbuj na profilu: siła nośna rośnie z kątem, a przy dużych kątach się wypłaszcza. (Prawdziwego przeciągnięcia — nagłego załamania siły nośnej — ten prosty solver nie liczy, bo wymaga modelu warstwy przyściennej.)</li>
        <li><strong>Pokaż</strong>: pokoloruj powietrze wg <em>Prędkości</em>, <em>Wirów</em> (obrotu) lub <em>Ciśnienia</em> i włącz/wyłącz smugi dymu.</li>
      </ul>
      <h3>Liczby</h3>
      <ul>
        <li><strong>Liczba Reynoldsa</strong> — stosunek bezwładności do lepkiej „kleistości”. Mała → gładki przepływ; duża → turbulentny ślad z odrywającymi się wirami. Ta sama liczba Reynoldsa = ten sam obraz przepływu, niezależnie od realnej wielkości i prędkości. Ta wartość jest dokładna dla modelu.</li>
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
  let sim = null;           // active solver (points at sandboxSim / quizSim / academySim)
  let sandboxSim = null, quizSim = null, academySim = null;
  let fieldMode = "speed";
  let smokeOn = true;
  let tool = "draw";
  let brush = 6;
  let aoaDeg = 8;
  let currentPreset = null;
  let paused = false;
  let stepsPerFrame = 12;
  let inSpeedEl = null, inViscEl = null, inAoaEl = null;

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
    const curlScale = 30 / (sim.u0 + 0.02);
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
    if (quiz.active) return; // readouts would leak the answer during a question
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
    if (quiz.active) return;
    ev.preventDefault(); drawing = true; currentPreset = null;
    if (view.setPointerCapture) try { view.setPointerCapture(ev.pointerId); } catch { /**/ }
    const { gx, gy } = toGrid(ev); paintDisc(gx, gy, brush, tool === "draw"); lastPt = { gx, gy }; hideHint();
  }
  function onMove(ev) {
    if (quiz.active || !drawing) return;
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
  function applyFieldMode(m) {
    fieldMode = m;
    document.querySelectorAll(".field-btn").forEach((b) => {
      const on = b.dataset.field === m;
      b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }
  function announce(msg) { if (ariaLive) { ariaLive.textContent = ""; setTimeout(() => (ariaLive.textContent = msg), 30); } }

  /* ---------------- quiz: guess the flow ---------------- */
  // Answers are ground-truth from the SAME deterministic sim (precomputed in
  // Node); the reveal re-runs it live so the player watches it confirm.
  const QUIZ_BANK = [
    { type: "wake", shape: "circle", speed: 40, visc: 95, aoa: 0, answer: "smooth" },
    { type: "wake", shape: "circle", speed: 55, visc: 55, aoa: 0, answer: "smooth" },
    { type: "wake", shape: "square", speed: 60, visc: 80, aoa: 0, answer: "smooth" },
    { type: "wake", shape: "circle", speed: 70, visc: 30, aoa: 0, answer: "smooth" },
    { type: "wake", shape: "circle", speed: 85, visc: 12, aoa: 0, answer: "street" },
    { type: "wake", shape: "circle", speed: 100, visc: 2, aoa: 0, answer: "street" },
    { type: "wake", shape: "ellipse", speed: 75, visc: 8, aoa: 0, answer: "street" },
    { type: "wake", shape: "circle", speed: 95, visc: 6, aoa: 0, answer: "street" },
    { type: "lift", shape: "airfoil", speed: 70, visc: 30, aoa: 14, answer: "up" },
    { type: "lift", shape: "airfoil", speed: 70, visc: 30, aoa: 8, answer: "up" },
    { type: "lift", shape: "ellipse", speed: 70, visc: 30, aoa: 20, answer: "up" },
    { type: "lift", shape: "airfoil", speed: 70, visc: 30, aoa: -14, answer: "down" },
    { type: "lift", shape: "airfoil", speed: 70, visc: 25, aoa: -8, answer: "down" },
    { type: "lift", shape: "circle", speed: 70, visc: 30, aoa: 0, answer: "zero" },
    { type: "lift", shape: "square", speed: 70, visc: 30, aoa: 0, answer: "zero" },
    // drag comparison: two shapes stacked; `low` has the lower drag (verified in Node)
    { type: "drag2", low: "ellipse", high: "square", speed: 70, visc: 25 },
    { type: "drag2", low: "airfoil", high: "circle", speed: 70, visc: 25 },
    { type: "drag2", low: "airfoil", high: "square", speed: 70, visc: 25 },
    { type: "drag2", low: "circle", high: "square", speed: 70, visc: 25 },
    { type: "drag2", low: "airfoil", high: "ellipse", speed: 70, visc: 25 },
  ];
  const QKEY = "gt.tunnel.quiz";
  const quiz = { active: false, phase: "idle", order: [], round: 0, total: 6, score: 0, streak: 0, maxStreak: 0, scenario: null, picked: null, answer: null, explainKey: null, revealAt: 0 };
  let quizBest = { best: 0, streak: 0, played: 0 };
  try { const s = JSON.parse(localStorage.getItem(QKEY) || "{}"); if (s && typeof s === "object") quizBest = Object.assign(quizBest, s); } catch { /**/ }

  function qEl(id) { return document.getElementById(id); }
  function qShuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }

  function setModeUI(mode) {
    [["mode-sandbox", "sandbox"], ["mode-quiz", "quiz"], ["mode-academy", "academy"]].forEach(([id, m]) => {
      const b = el(id); const on = (m === mode);
      b.classList.toggle("is-active", on); b.setAttribute("aria-selected", on ? "true" : "false");
    });
    document.querySelector(".controls").hidden = (mode === "quiz");   // controls used in sandbox + academy
    qEl("quiz").hidden = (mode !== "quiz");
    qEl("academy-hud").hidden = (mode !== "academy");
    const showReadouts = (mode !== "quiz");                          // quiz hides them (would leak the answer)
    document.querySelector(".readouts").style.display = showReadouts ? "" : "none";
    regimeBadge.style.display = showReadouts ? "" : "none";
  }
  function restoreFieldFromButtons() {
    const af = document.querySelector(".field-btn.is-active");
    fieldMode = af ? af.dataset.field : "speed";
  }
  function enterSandbox() {
    quiz.active = false; academy.active = false;
    setModeUI("sandbox");
    hideHint();
    sim = sandboxSim; initParticles();  // resume the sandbox exactly where the user left it
    restoreFieldFromButtons();
    paused = false;
  }
  function enterQuiz() {
    quiz.active = true; academy.active = false;
    setModeUI("quiz");
    hideHint();
    sim = quizSim; initParticles();     // quiz drives its own solver; sandbox stays intact
    startQuiz();
  }
  function enterAcademy() {
    quiz.active = false; academy.active = true;
    setModeUI("academy");
    hideHint();
    sim = academySim; initParticles();
    restoreFieldFromButtons();
    startAcademy();
  }

  function startQuiz() {
    quiz.order = qShuffle(QUIZ_BANK.slice()).slice(0, quiz.total);
    quiz.round = 0; quiz.score = 0; quiz.streak = 0; quiz.maxStreak = 0;
    qEl("q-result").hidden = true;
    qEl("q-opts").hidden = false;
    nextQuestion();
  }

  function setupScenario(sc) {
    sim.setParams(u0FromSlider(sc.speed), nuFromSlider(sc.visc));
    sim.resetFlow();
    if (sc.type === "drag2") {
      const flip = Math.random() < 0.5;
      sc._top = flip ? sc.high : sc.low;
      sc._bot = flip ? sc.low : sc.high;
      sim.stampTwo({ shape: sc._top, cy: 0.70 }, { shape: sc._bot, cy: 0.30 });
      fieldMode = "speed"; // wake width tells the drag story
    } else {
      sim.stampPreset(sc.shape, sc.aoa);
      fieldMode = sc.type === "wake" ? "curl" : "speed"; // vorticity makes the street pop
    }
    sim.resetFlow();     // wipe the kick so the frozen question shows clean, uniform flow
    currentPreset = null;
    paused = true;       // frozen until the player answers
  }

  function nextQuestion() {
    quiz.round++;
    const sc = quiz.order[quiz.round - 1];
    quiz.scenario = sc; quiz.picked = null; quiz.phase = "question";
    setupScenario(sc);
    // resolve the correct answer + explanation for this scenario
    if (sc.type === "drag2") { quiz.answer = (sc._top === sc.low) ? "top" : "bot"; quiz.explainKey = "ex_drag"; }
    else { quiz.answer = sc.answer; quiz.explainKey = "ex_" + sc.answer; }

    qEl("q-round").textContent = t("q_round").replace("{n}", quiz.round).replace("{t}", quiz.total);
    qEl("q-score").textContent = t("q_scoreline").replace("{s}", quiz.score).replace("{k}", quiz.streak);
    qEl("q-question").textContent = t(sc.type === "wake" ? "q_wake" : sc.type === "lift" ? "q_lift" : "q_drag");

    if (sc.type === "wake") {
      const L = sim.charLength(); const Re = Math.round(sim.u0 * L / sim.nu);
      qEl("q-info").textContent = t("q_info_re").replace("{re}", Re);
    } else if (sc.type === "lift") {
      qEl("q-info").textContent = t("q_info_lift");
    } else {
      qEl("q-info").textContent = t("q_info_drag");
    }

    let opts;
    if (sc.type === "wake") opts = [["smooth", t("opt_smooth")], ["street", t("opt_street")]];
    else if (sc.type === "lift") opts = [["up", t("opt_up")], ["down", t("opt_down")], ["zero", t("opt_zero")]];
    else opts = [["top", "▲ " + t("n_" + sc._top)], ["bot", "▼ " + t("n_" + sc._bot)]];

    const box = qEl("q-opts"); box.innerHTML = "";
    opts.forEach(([val, label]) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "q-opt"; b.dataset.val = val; b.textContent = label;
      b.addEventListener("click", () => onQuizAnswer(val));
      box.appendChild(b);
    });
    qEl("q-feedback").hidden = true;
  }

  function onQuizAnswer(val) {
    if (quiz.phase !== "question") return;
    quiz.picked = val; quiz.phase = "revealing"; quiz.revealAt = performance.now();
    document.querySelectorAll("#q-opts .q-opt").forEach((b) => {
      b.disabled = true;
      if (b.dataset.val === val) b.classList.add("is-picked");
    });
    sim.kick();     // break symmetry now, at reveal — no artifact left in the frozen question
    quiz.revealMs = quiz.scenario.type === "wake" ? 4200 : 2600; // give the vortex street time to grow
    paused = false; // release the flow so it develops and confirms
  }

  function showVerdict() {
    quiz.phase = "verdict"; paused = true;
    const correct = quiz.picked === quiz.answer;
    if (correct) { quiz.score++; quiz.streak++; if (quiz.streak > quiz.maxStreak) quiz.maxStreak = quiz.streak; }
    else { quiz.streak = 0; }
    document.querySelectorAll("#q-opts .q-opt").forEach((b) => {
      if (b.dataset.val === quiz.answer) b.classList.add("is-correct");
      else if (b.dataset.val === quiz.picked) b.classList.add("is-wrong");
    });
    qEl("q-score").textContent = t("q_scoreline").replace("{s}", quiz.score).replace("{k}", quiz.streak);
    const v = qEl("q-verdict");
    v.textContent = correct ? t("q_correct") : t("q_wrong");
    v.className = "quiz__verdict " + (correct ? "ok" : "no");
    qEl("q-explain").textContent = t(quiz.explainKey);
    qEl("q-next").textContent = quiz.round < quiz.total ? t("q_next") : t("q_last");
    qEl("q-feedback").hidden = false;
  }

  function onQuizNext() {
    if (quiz.round < quiz.total) nextQuestion();
    else showResult();
  }

  function showResult() {
    quiz.phase = "result";
    quizBest.played = (quizBest.played || 0) + 1;
    if (quiz.score > (quizBest.best || 0)) quizBest.best = quiz.score;
    if (quiz.maxStreak > (quizBest.streak || 0)) quizBest.streak = quiz.maxStreak;
    try { localStorage.setItem(QKEY, JSON.stringify(quizBest)); } catch { /**/ }
    qEl("q-opts").hidden = true; qEl("q-feedback").hidden = true;
    qEl("q-result").hidden = false;
    qEl("q-result-score").textContent = quiz.score + " / " + quiz.total;
    qEl("q-result-sub").textContent = t("q_result_sub")
      .replace("{s}", quiz.score).replace(/\{t\}/g, quiz.total)
      .replace("{b}", quizBest.best).replace("{m}", quizBest.streak || 0);
  }

  function quizShare() {
    const txt = t("q_share_text").replace("{s}", quiz.score).replace("{t}", quiz.total);
    if (navigator.share) { navigator.share({ text: txt }).catch(() => { }); }
    else if (navigator.clipboard) { navigator.clipboard.writeText(txt).then(() => announce(t("q_shared"))).catch(() => { }); }
    else announce(txt);
  }

  /* ---------------- academy: guided campaign (Chapter 1) ---------------- */
  function dragWordFor(cd) {
    if (!(cd > 0) || cd > 90) return "—";
    return cd < 2 ? t("drag_low") : cd < 4 ? t("drag_mod") : cd < 6.5 ? t("drag_high") : t("drag_vhigh");
  }
  function relCd() { const L = sim.charLength(); const q = 0.5 * sim.u0 * sim.u0 * (L || 1); return (sim.hasShape && sim.warmup > 800 && q > 0) ? sim.Fx / q : NaN; }
  function relCl() { const L = sim.charLength(); const q = 0.5 * sim.u0 * sim.u0 * (L || 1); return (sim.hasShape && sim.warmup > 800 && q > 0) ? sim.Fy / q : 0; }
  function reNow() { const L = sim.charLength(); const Re = (L > 0 && sim.nu > 0) ? sim.u0 * L / sim.nu : 0; return Re; }
  function relLD() { return (sim.hasShape && sim.warmup > 800 && sim.Fx > 0.001) ? sim.Fy / sim.Fx : 0; }
  const ACADEMY = [
    // ---- Chapter 1: the basics ----
    {
      ch: 1, title: "l1_title", brief: "l1_brief", goalText: "l1_goal", lesson: "l1_lesson",
      setup: { shape: "circle", speed: 45, visc: 70, aoa: 0 },
      check() { const Re = reNow(); return { met: Re >= 70, now: "Re ≈ " + Math.round(Re) }; },
    },
    {
      ch: 1, title: "l2_title", brief: "l2_brief", goalText: "l2_goal", lesson: "l2_lesson",
      setup: { shape: "square", speed: 70, visc: 25, aoa: 0 },
      check() { const cd = relCd(); return { met: cd > 0 && cd <= 4.5, now: dragWordFor(cd) }; },
    },
    {
      ch: 1, title: "l3_title", brief: "l3_brief", goalText: "l3_goal", lesson: "l3_lesson",
      setup: { shape: "airfoil", speed: 70, visc: 30, aoa: 0 },
      check() { const cl = relCl(); return { met: cl >= 4, now: (cl > 0.5 ? "▲" : cl < -0.5 ? "▼" : "≈") + " " + cl.toFixed(1) }; },
    },
    // ---- Chapter 2: pressure, area, downforce ----
    {
      ch: 2, title: "l4_title", brief: "l4_brief", goalText: "l4_goal", lesson: "l4_lesson",
      setup: { shape: "circle", speed: 62, visc: 45, aoa: 0, field: "speed" },
      check() { return { met: fieldMode === "pressure", now: "" }; },
    },
    {
      ch: 2, title: "l5_title", brief: "l5_brief", goalText: "l5_goal", lesson: "l5_lesson",
      setup: { shape: "airfoil", speed: 70, visc: 25, aoa: 0 },
      check() { const cd = relCd(); return { met: cd >= 6, now: dragWordFor(cd) }; },
    },
    {
      ch: 2, title: "l6_title", brief: "l6_brief", goalText: "l6_goal", lesson: "l6_lesson",
      setup: { shape: "airfoil", speed: 70, visc: 30, aoa: 0 },
      check() { const cl = relCl(); return { met: cl <= -4, now: (cl > 0.5 ? "▲" : cl < -0.5 ? "▼" : "≈") + " " + cl.toFixed(1) }; },
    },
    // ---- Chapter 3: efficiency & design ----
    {
      ch: 3, title: "l7_title", brief: "l7_brief", goalText: "l7_goal", lesson: "l7_lesson",
      setup: { shape: "airfoil", speed: 70, visc: 30, aoa: 0 },
      check() { const ld = relLD(); return { met: ld >= 2.7, now: "L/D " + ld.toFixed(1) }; },
    },
    {
      ch: 3, title: "l8_title", brief: "l8_brief", goalText: "l8_goal", lesson: "l8_lesson",
      setup: { shape: "airfoil", speed: 70, visc: 30, aoa: 10 },
      check() { const cd = relCd(); return { met: cd >= 4.7, now: dragWordFor(cd) }; },
    },
    {
      ch: 3, title: "l9_title", brief: "l9_brief", goalText: "l9_goal", lesson: "l9_lesson",
      setup: { draw: true, speed: 70, visc: 25 },
      check() {
        if (currentPreset) return { met: false, now: t("l9_now_preset") };  // a preset doesn't count
        if (!sim.hasShape) return { met: false, now: t("l9_now_draw") };
        if (sim.charLength() < 10) return { met: false, now: t("l9_now_small") };
        const cd = relCd();
        return { met: cd > 0 && cd <= 4.2, now: dragWordFor(cd) };
      },
    },
    // ---- Chapter 4: aerodynamics in practice (validated on both grids) ----
    {
      ch: 4, title: "l10_title", brief: "l10_brief", goalText: "l10_goal", lesson: "l10_lesson",
      setup: { shape: "airfoil", speed: 70, visc: 30, aoa: 6 },
      // dual goal: real upward lift AND good efficiency at once (band aoa 10..18, both grids)
      check() {
        const cl = relCl(), ld = relLD();
        const met = cl >= 9 && ld >= 2.4;
        return { met, now: (cl > 0.3 ? "▲ " + cl.toFixed(1) : cl < -0.3 ? "▼ " + (-cl).toFixed(1) : "≈ 0") + " · L/D " + ld.toFixed(1) };
      },
    },
    {
      ch: 4, title: "l11_title", brief: "l11_brief", goalText: "l11_goal", lesson: "l11_lesson",
      setup: { shape: "airfoil", speed: 70, visc: 30, aoa: 0 },
      // strong downforce AND drag kept under a cap (band aoa -13..-16, both grids)
      check() {
        const cl = relCl(), cd = relCd();
        const met = cl <= -9.6 && cd <= 4.9;
        return { met, now: (cl < -0.3 ? "▼ " + (-cl).toFixed(1) : cl > 0.3 ? "▲ " + cl.toFixed(1) : "≈ 0") + " · →" + (cd > 0 ? cd.toFixed(1) : "—") };
      },
    },
    {
      ch: 4, title: "l12_title", brief: "l12_brief", goalText: "l12_goal", lesson: "l12_lesson",
      setup: { draw: true, speed: 70, visc: 25 },
      // draw an asymmetric (cambered-up) shape that lifts itself; symmetric blob ~0 fails
      check() {
        if (currentPreset) return { met: false, now: t("l9_now_preset") };
        if (!sim.hasShape) return { met: false, now: t("l9_now_draw") };
        if (sim.charLength() < 10) return { met: false, now: t("l9_now_small") };
        const cl = relCl();
        return { met: cl >= 0.8, now: (cl > 0.3 ? "▲ " + cl.toFixed(1) : cl < -0.3 ? "▼ " + (-cl).toFixed(1) : "≈ 0") };
      },
    },
  ];
  function levelsInChapter(ch) { return ACADEMY.filter((l) => l.ch === ch).length; }
  function indexInChapter(i) { const ch = ACADEMY[i].ch; let k = 0; for (let j = 0; j <= i; j++) if (ACADEMY[j].ch === ch) k++; return k; }
  const AKEY = "gt.tunnel.academy";
  const academy = { active: false, level: 0, passed: false, holdMs: 0 };
  let academyProgress = 0;
  try { const s = JSON.parse(localStorage.getItem(AKEY) || "{}"); if (s && typeof s.progress === "number") academyProgress = s.progress; } catch { /**/ }

  function setLevelParams(s) {
    if (inSpeedEl) { inSpeedEl.value = s.speed; inSpeedEl.dispatchEvent(new Event("input")); }
    if (inViscEl) { inViscEl.value = s.visc; inViscEl.dispatchEvent(new Event("input")); }
    if (inAoaEl) { inAoaEl.value = s.aoa || 0; inAoaEl.dispatchEvent(new Event("input")); }
  }
  function startAcademy() {
    // resume where the player left off; if they already finished, replay from the start
    const i = (academyProgress >= ACADEMY.length) ? 0 : academyProgress;
    startLevel(i);
  }
  function startLevel(i) {
    academy.level = i; academy.passed = false; academy.holdMs = 0;
    const lv = ACADEMY[i];
    currentPreset = null;              // avoid the AoA listener re-stamping mid-setup
    setLevelParams(lv.setup);
    aoaDeg = lv.setup.aoa || 0;
    sim.resetFlow();
    if (lv.setup.draw) {
      sim.clearShape();                // this level asks the player to draw their own shape
      currentPreset = null;
      showHint();
    } else {
      currentPreset = lv.setup.shape;
      sim.stampPreset(lv.setup.shape, lv.setup.aoa);
      hideHint();
    }
    if (lv.setup.field) applyFieldMode(lv.setup.field);
    paused = false;
    qEl("ah-level").textContent = t("ac_level").replace("{c}", lv.ch).replace("{n}", indexInChapter(i)).replace("{t}", levelsInChapter(lv.ch));
    qEl("ah-title").textContent = t(lv.title);
    qEl("ah-brief").textContent = t(lv.brief);
    qEl("ah-goal").hidden = false; qEl("ah-goal").classList.remove("met");
    qEl("ah-goal-icon").textContent = "◌";
    qEl("ah-goal-text").textContent = t(lv.goalText);
    qEl("ah-done").hidden = true; qEl("ah-cert").hidden = true;
  }
  function academyUpdate(dt) {
    if (!academy.active || academy.passed) return;
    const lv = ACADEMY[academy.level];
    const r = lv.check();
    qEl("ah-goal-text").textContent = t(lv.goalText) + (r.now ? " — " + t("ac_now") + " " + r.now : "");
    const g = qEl("ah-goal");
    if (r.met) {
      g.classList.add("met"); qEl("ah-goal-icon").textContent = "✓";
      academy.holdMs += dt;
      if (academy.holdMs >= 1100) passLevel();
    } else {
      g.classList.remove("met"); qEl("ah-goal-icon").textContent = "◌";
      academy.holdMs = 0;
    }
  }
  function passLevel() {
    academy.passed = true;
    const lv = ACADEMY[academy.level];
    academyProgress = Math.max(academyProgress, academy.level + 1);
    try { localStorage.setItem(AKEY, JSON.stringify({ progress: academyProgress })); } catch { /**/ }
    qEl("ah-goal").classList.add("met"); qEl("ah-goal-icon").textContent = "✓";
    qEl("ah-lesson").innerHTML = t(lv.lesson);
    qEl("ah-next").textContent = (academy.level >= ACADEMY.length - 1) ? t("ac_finish") : t("ac_next");
    qEl("ah-done").hidden = false;
  }
  let pendingCertAction = null;
  function onAcademyNext() {
    const cur = academy.level, next = cur + 1;
    if (next >= ACADEMY.length) { showCert(ACADEMY[cur].ch, -1); return; }        // final
    if (ACADEMY[next].ch !== ACADEMY[cur].ch) { showCert(ACADEMY[cur].ch, next); return; } // chapter break
    startLevel(next);
  }
  function showCert(ch, next) {
    academy.passed = true; paused = true;
    qEl("ah-goal").hidden = true; qEl("ah-done").hidden = true;
    const final = next < 0;
    qEl("ah-cert-title").textContent = final ? t("ac_final_title") : t("ac_done_title").replace("{n}", ch);
    qEl("ah-cert-sub").textContent = final ? t("ac_final_sub") : t("ac_ch" + ch + "_sub");
    qEl("ah-again").textContent = final ? t("ac_again") : t("ac_next_chapter").replace("{n}", ch + 1);
    pendingCertAction = () => { qEl("ah-cert").hidden = true; qEl("ah-goal").hidden = false; startLevel(final ? 0 : next); };
    qEl("ah-cert").hidden = false;
  }
  function academyAgain() { if (pendingCertAction) { const f = pendingCertAction; pendingCertAction = null; f(); } else startLevel(0); }

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

    document.querySelectorAll(".field-btn").forEach((b) => b.addEventListener("click", () => applyFieldMode(b.dataset.field)));

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

    // expose slider refs for the sandbox<->quiz switch
    inSpeedEl = inSpeed; inViscEl = inVisc; inAoaEl = inAoa;

    // mode switch + quiz controls
    el("mode-sandbox").addEventListener("click", () => { if (quiz.active || academy.active) enterSandbox(); });
    el("mode-quiz").addEventListener("click", () => { if (!quiz.active) enterQuiz(); });
    el("mode-academy").addEventListener("click", () => { if (!academy.active) enterAcademy(); });
    qEl("q-next").addEventListener("click", onQuizNext);
    qEl("q-again").addEventListener("click", startQuiz);
    qEl("q-share").addEventListener("click", quizShare);
    qEl("ah-next").addEventListener("click", onAcademyNext);
    qEl("ah-again").addEventListener("click", academyAgain);

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
    // two independent solvers so the sandbox keeps its own state, untouched
    // by the quiz (and vice versa)
    sandboxSim = window.WindTunnelSim.createSim(nx, ny);
    quizSim = window.WindTunnelSim.createSim(nx, ny);
    academySim = window.WindTunnelSim.createSim(nx, ny);
    sim = sandboxSim;
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
    if (quiz.active && quiz.phase === "revealing" && now - quiz.revealAt > (quiz.revealMs || 2600)) showVerdict();
    // only progress the goal while the flow is actually running; clamp dt so a
    // throttled/backgrounded frame can't jump the hold timer (or a pause auto-pass)
    if (academy.active && !paused) academyUpdate(Math.min(dtms, 50));
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
      quiz, academy,
      enterQuiz, enterSandbox, enterAcademy,
      academyTick: academyUpdate, acState() { return { active: academy.active, level: academy.level, passed: academy.passed }; },
      qAnswer: onQuizAnswer, qReveal: showVerdict, qNext: onQuizNext,
      qState() { return { phase: quiz.phase, round: quiz.round, score: quiz.score, streak: quiz.streak, answer: quiz.answer, type: quiz.scenario && quiz.scenario.type }; },
    };

    // first-time visitors get the instructions automatically (once)
    try {
      if (!localStorage.getItem("gt.tunnel.seen")) {
        localStorage.setItem("gt.tunnel.seen", "1");
        const m = el("modal-help");
        if (m && typeof m.showModal === "function") setTimeout(() => { try { m.showModal(); } catch { /**/ } }, 400);
      }
    } catch { /**/ }

    requestAnimationFrame(frame);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
