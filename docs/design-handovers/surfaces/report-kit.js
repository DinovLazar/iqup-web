/* ============================================================================
   IqUp · v2 · Phase 3.08 — report-kit.js
   Shared source of truth for the THREE payoff surfaces
   (results screen · PDF report · Bibi certificate).

   Builds on assessment/brand-kit.js (same five domains, same angles, same hues)
   but adds the ONE new motif Phase 3.08 needs:

     identityPentagon(opts)  – the WHOLE, assembled, five-coloured pentagon.
                               It is an IDENTITY GRAPHIC, not a gauge: the same
                               shape and size for every child. Only the labels
                               and the five fixed index hues convey the profile.
                               It NEVER encodes magnitude (no spokes growing,
                               no partial fills, no rings, no axis). This is the
                               deliberate replacement for brand-kit's pentagon()
                               radar chart, which is forbidden on these surfaces.

   Everything here is filter-free, flat-fill, simple-vector — so the exact same
   pentagon expresses cleanly in @react-pdf/renderer (Svg + Polygon + Line).

   Exports on window.IqReport:
     INDEXES                 – the five domains (code, MK/EN label, short, angle)
     icon(code, opts)        – geometric line glyph (re-declared so the file is
                               standalone for the PDF + certificate surfaces)
     identityPentagon(opts)  – the assembled five-wedge pentagon
     SAMPLE                  – a full ReportContent object (MK + EN) for mockups
   ============================================================================ */
(function () {
  // Pentagon order (top, then clockwise) — identical to brand-kit.js.
  const INDEXES = [
    { code: 'logic',    short: { mk: 'Логика',   en: 'Logic'    }, angle: -90,
      label: { mk: 'Логичко мислење',          en: 'Logical thinking' } },
    { code: 'spatial',  short: { mk: 'Простор',  en: 'Spatial'  }, angle: -18,
      label: { mk: 'Просторно мислење',        en: 'Spatial thinking' } },
    { code: 'memory',   short: { mk: 'Меморија', en: 'Memory'   }, angle: 54,
      label: { mk: 'Меморија и фокус',         en: 'Memory & focus' } },
    { code: 'planning', short: { mk: 'План',     en: 'Planning' }, angle: 126,
      label: { mk: 'Планирање и брзина',       en: 'Planning & speed' } },
    { code: 'learning', short: { mk: 'СТЕМ',     en: 'STEM'     }, angle: 198,
      label: { mk: 'Учење и СТЕМ мислење',     en: 'Learning & STEM thinking' } },
  ];
  const byCode = Object.fromEntries(INDEXES.map(i => [i.code, i]));
  const hue = c => `var(--ix-${c})`;

  /* ---- index glyphs (same geometric set as brand-kit; standalone copy) ---- */
  const GLYPHS = {
    logic:    '<circle cx="12" cy="5" r="2.4"/><circle cx="5.5" cy="18.5" r="2.4"/><circle cx="18.5" cy="18.5" r="2.4"/><path d="M12 7.4v3.2M12 10.6 6.4 16.6M12 10.6l5.6 6"/>',
    spatial:  '<path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Z"/><path d="M4 7.5 12 12l8-4.5M12 12v9"/>',
    memory:   '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v4h-4"/><circle cx="12" cy="12" r="1.9"/>',
    planning: '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 13.5 15 10M9.5 2.5h5M12 2.5V6M18.5 6l1.6-1.6"/>',
    learning: '<path d="M9 3h6M10 3v6.2L5.4 17a2 2 0 0 0 1.7 3h9.8a2 2 0 0 0 1.7-3L14 9.2V3"/><path d="M7.7 14h8.6"/>',
  };
  function icon(code, opts) {
    opts = opts || {};
    const s = opts.size || 24, sw = opts.stroke || 2, color = opts.color || 'currentColor';
    return `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="${color}"
      stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${GLYPHS[code] || ''}</svg>`;
  }

  /* --------------------------------------------------- the identity pentagon
     Geometry: a regular pentagon with one vertex per index at the index angle.
     The shape is split into five KITES, one per index, each centred on its own
     vertex (centroid → mid(prev edge) → vertex → mid(next edge)). Each kite is
     filled with that index's fixed hue; white seams separate them; an ink
     outline closes the whole shape. Same for every child — identity, not data.
       opts.size        : px (square viewBox 320×320)
       opts.labels      : true → draw index short-name at each vertex (default true)
       opts.lang        : 'mk' | 'en' (label language; default 'mk')
       opts.dim         : array of codes to render at low saturation (the gentle
                          not_representative state only — still whole, still same
                          size; it just reads as "quietened", never as "less")    */
  function identityPentagon(opts) {
    opts = opts || {};
    const size = opts.size || 320;
    const lang = opts.lang || 'mk';
    const showLabels = opts.labels !== false;
    const dim = new Set(opts.dim || []);
    const VBW = 410, VBH = 360, cx = 205, cy = 176, R = 110;
    const pt = (ang, r) => [cx + r * Math.cos(ang * Math.PI / 180), cy + r * Math.sin(ang * Math.PI / 180)];

    const V = INDEXES.map(ix => pt(ix.angle, R));          // five vertices
    const M = INDEXES.map((ix, i) => {                     // five edge midpoints
      const n = V[(i + 1) % 5];
      return [(V[i][0] + n[0]) / 2, (V[i][1] + n[1]) / 2];
    });
    const f = n => n.toFixed(1);

    // five kites — each owns one index hue
    let kites = '';
    INDEXES.forEach((ix, i) => {
      const prevMid = M[(i + 4) % 5];   // midpoint of the edge before vertex i
      const nextMid = M[i];             // midpoint of the edge after vertex i
      const pts = [[cx, cy], prevMid, V[i], nextMid].map(p => f(p[0]) + ',' + f(p[1])).join(' ');
      kites += `<polygon points="${pts}" fill="${hue(ix.code)}"
        opacity="${dim.has(ix.code) ? .32 : 1}" />`;
    });

    // white seams from centre to each vertex (the assembled-from-facets read)
    let seams = '';
    V.forEach(v => { seams += `<line x1="${cx}" y1="${cy}" x2="${f(v[0])}" y2="${f(v[1])}" />`; });

    // outer outline
    const outline = V.map(v => f(v[0]) + ',' + f(v[1])).join(' ');

    // vertex labels (name only — never a number, never a band here)
    let labels = '';
    if (showLabels) {
      INDEXES.forEach((ix, i) => {
        const [x, y] = pt(ix.angle, R + 22);
        const anchor = Math.abs(x - cx) < 14 ? 'middle' : (x < cx ? 'end' : 'start');
        const dyTop = ix.angle === -90 ? -2 : 4;
        labels += `<text x="${f(x)}" y="${f(y + dyTop)}" text-anchor="${anchor}"
          font-family="Montserrat, system-ui, sans-serif" font-size="15" font-weight="700"
          fill="var(--ink-head)">${ix.short[lang]}</text>`;
      });
    }

    return `<svg class="iq-identity-pentagon" viewBox="0 0 ${VBW} ${VBH}" width="${size}" height="${(size*VBH/VBW).toFixed(0)}"
        fill="none" role="img"
        aria-label="${lang === 'en'
          ? 'The five-area thinking profile, shown as one whole five-coloured shape'
          : 'Профил на петте области, прикажан како една целосна петобојна форма'}">
      <g>
        ${kites}
        <g stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">${seams}</g>
        <polygon points="${outline}" fill="none" stroke="var(--ink-head)" stroke-width="3.5" stroke-linejoin="round"/>
      </g>
      ${labels}
    </svg>`;
  }

  /* ----------------------------------------------------------- SAMPLE -------
     A full ReportContent object as produced by the 3.07 engine, in MK + EN.
     Bands are WORDS. Confidence is a neutral meta-word + one sentence.
     No numbers, no %, no scores anywhere. Used only to populate the mockups. */
  const BAND = {  // the display words the band maps to (for reference in mockups)
    strong:   { mk: 'Силно развиено',   en: 'Strongly developed' },
    capable:  { mk: 'Добро развиено',   en: 'Well developed' },
    emerging: { mk: 'Во развој',        en: 'Developing nicely' },
  };
  const CONF = {
    high:   { mk: 'висока',  en: 'high'   },
    medium: { mk: 'средна',  en: 'medium' },
    low:    { mk: 'пониска', en: 'lower'  },
  };

  const SAMPLE = {
    meta: { age: 8, locale: 'mk', generatedOn: { mk: '23 јуни 2026', en: '23 June 2026' }, validity: 'valid' },
    indices: [
      { code: 'logic',    band: 'strong',   conf: 'high',
        desc: { mk: 'Гради заклучоци чекор по чекор и забележува зошто нешто се совпаѓа.',
                en: 'Builds conclusions step by step and notices why things fit together.' },
        confNote: { mk: 'Ова читање е сигурно — одговорите беа постојани низ задачите.',
                    en: 'This reading is firm — answers were consistent across the tasks.' } },
      { code: 'spatial',  band: 'capable',  conf: 'medium',
        desc: { mk: 'Замислува форми и како се вклопуваат и вртат во простор.',
                en: 'Pictures shapes and how they fit and turn in space.' },
        confNote: { mk: 'Средна сигурност — неколку задачи беа брзо завршени.',
                    en: 'Medium confidence — a few tasks were finished quickly.' } },
      { code: 'memory',   band: 'strong',   conf: 'high',
        desc: { mk: 'Држи детали во умот и се враќа на нив кога му требаат.',
                en: 'Holds details in mind and brings them back when needed.' },
        confNote: { mk: 'Сигурно читање — постојано низ повеќе задачи.',
                    en: 'A firm reading — steady across several tasks.' } },
      { code: 'planning', band: 'capable',  conf: 'medium',
        desc: { mk: 'Размислува неколку чекори однапред пред да започне.',
                en: 'Thinks a few steps ahead before starting.' },
        confNote: { mk: 'Средна сигурност — вреди да се погледне повторно подоцна.',
                    en: 'Medium confidence — worth a second look later on.' } },
      { code: 'learning', band: 'emerging', conf: 'low',
        desc: { mk: 'Со љубопитност пристапува кон нови, СТЕМ-слични предизвици.',
                en: 'Approaches new, STEM-like challenges with curiosity.' },
        confNote: { mk: 'Пониска сигурност — оваа област допрва се загрева.',
                    en: 'Lower confidence — this area was just warming up.' } },
    ],
    overview: {
      mk: 'Профилот е заоблен и цврст, со природен пар силни страни во логиката и меморијата што работат заедно.',
      en: 'A rounded, confident profile, with a natural pair of strengths in logic and memory working together.' },
    topStrength: {
      code: 'logic',
      mk: 'Логичкото мислење води — детето гради јасни чекори до одговорот и ужива кога работите се вклопуваат.',
      en: 'Logical thinking leads — your child builds clear steps to an answer and enjoys it when things click into place.' },
    growthArea: {
      code: 'learning',
      mk: 'Учењето и СТЕМ мислењето допрва процветуваат. Тоа е простор за раст, не слабост — секоја нова игра помага.',
      en: 'Learning & STEM thinking is just blossoming. That is room to grow, not a weakness — every new game helps.',
      activity: { mk: 'Пробајте едноставна загатка „што е следно?" со коцки или модели еднаш неделно.',
                  en: 'Try a simple “what comes next?” puzzle with blocks or models once a week.' } },
    homeActivities: [
      { mk: 'Играјте игри со редослед и обрасци — карти, домино, нижење монистра.',
        en: 'Play sequence-and-pattern games — cards, dominoes, threading beads.' },
      { mk: 'Прашувајте „зошто мислиш така?" — гласното образложение ја јакне логиката.',
        en: 'Ask “why do you think that?” — reasoning out loud strengthens logic.' },
      { mk: 'Градете нешто заедно од упатство: модел, рецепт или мала конструкција.',
        en: 'Build something together from instructions: a model, a recipe, a small construction.' },
    ],
    solvingStyle: {
      mk: 'Пристапува смирено и темелно — повеќе внимание на точност отколку на брзина, и не се откажува кога задачата е нова.',
      en: 'Approaches tasks calmly and thoroughly — leaning to accuracy over speed, and not giving up when a task is new.',
      trajectory: { mk: 'Ваквата упорност е одличен темел за следните чекори во учењето.',
                    en: 'This kind of persistence is a great foundation for the next steps in learning.' } },
    stemReadiness: {
      mk: 'Комбинацијата од логика што гради чекори и меморија што држи детали е токму мислењето на кое се потпира раното кодирање и роботика.',
      en: 'The mix of logic that builds steps and memory that holds detail is exactly the thinking early coding and robotics lean on.',
      bridge: { mk: 'Во кодирањето тие чекори стануваат команди, а во роботиката детали стануваат сензори — мост што IqUp го гради постепено.',
                en: 'In coding those steps become commands, and in robotics details become sensors — a bridge IqUp builds step by step.' } },
    extremes: {
      mk: 'Во една област детето стигна до највисоките задачи — убав знак на длабока љубопитност.',
      en: 'In one area your child reached the hardest tasks — a lovely sign of deep curiosity.' },
    iqup: {
      mk: 'IqUp е програма за СТЕМ и размислување за деца, водена од најдобрите едукатори — учење преку игра, во живо.',
      en: 'IqUp is a STEM-and-thinking program for children, led by the best educators — learning through play, in person.',
      program: { mk: 'Млади истражувачи (7–9 години)', en: 'Young Explorers (ages 7–9)' },
      city: { mk: 'Скопје', en: 'Skopje' },
      cta: { mk: 'Резервирајте бесплатен пробен час', en: 'Book a free trial class' } },
    disclaimer: {
      mk: 'Овој профил е информативен, не дијагноза. Не е клиничко или психолошко мерење. Опишува како детето пристапи кон играта денес и може да се менува од ден на ден.',
      en: 'This profile is informative, not a diagnosis. It is not a clinical or psychological measurement. It describes how your child approached the games today and can change from day to day.',
      honesty: { mk: 'Нашите ориентири се сè уште прелиминарни и постојано ги подобруваме.',
                 en: 'Our norms are still provisional and we keep improving them.' } },
  };

  window.IqReport = { INDEXES, byCode, icon, identityPentagon, BAND, CONF, SAMPLE };
})();
