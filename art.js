/* SVG illustration library. Every illustration is a function returning an SVG string.
   Shared, language-independent pictures (spec §9.4). Text inside scenes is injected. */
(function () {
  const C = {
    skin1: "#E8B48F", skin2: "#B9825C", skin3: "#F1C7A5",
    hairDark: "#2B211C", hairBrown: "#6B4426", hairGrey: "#B9B6B0",
    ink: "#1F2633", wall: "#E9E4DC", wall2: "#D9D2C6", floor: "#C9BFAF",
    door: "#7A5C45", doorDark: "#5E4534", glass: "#BFD8E6",
    roof: "#9C4A3A", stone: "#CFC6B8", green: "#7DA66B", greenDark: "#5C8650"
  };

  function svg(vb, body, label) {
    return `<svg viewBox="${vb}" role="img" aria-label="${label || ""}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
  }

  /* A person bust drawn in a 100x140 box. */
  function person(o) {
    const s = o.scale || 1, x = o.x || 0, y = o.y || 0;
    const skin = o.skin || C.skin1, hair = o.hairColor || C.hairDark, shirt = o.shirt || "#3A7CA5";
    let back = "", front = "";
    if (o.hair === "long") back = `<path d="M24 46 C22 18 78 18 76 46 L80 100 L20 100 Z" fill="${hair}"/>`;
    if (o.hair === "bun") back = `<circle cx="50" cy="14" r="11" fill="${hair}"/>`;
    if (o.hair === "long") front = `<path d="M26 42 C28 20 72 20 74 42 C66 32 46 30 34 36 C31 38 28 40 26 42 Z" fill="${hair}"/>`;
    if (o.hair === "short") front = `<path d="M26 44 C24 18 76 18 74 44 C70 32 60 28 50 28 C40 28 30 32 26 44 Z" fill="${hair}"/>`;
    if (o.hair === "bun") front = `<path d="M26 44 C24 20 76 20 74 44 C68 30 32 30 26 44 Z" fill="${hair}"/>`;
    const eyes = o.mood === "confused"
      ? `<path d="M36 38 L45 41 M55 41 L64 37" stroke="${C.ink}" stroke-width="2" stroke-linecap="round"/><circle cx="41" cy="46" r="2.6" fill="${C.ink}"/><circle cx="59" cy="46" r="2.6" fill="${C.ink}"/>`
      : `<circle cx="41" cy="46" r="2.6" fill="${C.ink}"/><circle cx="59" cy="46" r="2.6" fill="${C.ink}"/>`;
    const mouth = o.mood === "confused"
      ? `<path d="M42 58 Q46 55 50 58 T58 58" stroke="${C.ink}" stroke-width="2" fill="none" stroke-linecap="round"/>`
      : o.mood === "talk"
        ? `<ellipse cx="50" cy="58" rx="5" ry="3.6" fill="${C.ink}"/>`
        : `<path d="M42 56 Q50 63 58 56" stroke="${C.ink}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    const glasses = o.glasses ? `<g stroke="${C.ink}" stroke-width="1.8" fill="none"><circle cx="41" cy="46" r="7"/><circle cx="59" cy="46" r="7"/><path d="M48 46 L52 46"/></g>` : "";
    const beard = o.beard ? `<path d="M28 50 C30 74 70 74 72 50 C66 62 34 62 28 50 Z" fill="${hair}" opacity=".9"/>` : "";
    const tie = o.tie ? `<path d="M47 92 L53 92 L55 120 L50 126 L45 120 Z" fill="${o.tie}"/>` : "";
    const collar = `<path d="M40 88 L50 98 L60 88" stroke="#fff" stroke-opacity=".55" stroke-width="3" fill="none"/>`;
    return `<g transform="translate(${x} ${y}) scale(${s})">${back}
      <path d="M10 140 C10 104 26 90 50 90 C74 90 90 104 90 140 Z" fill="${shirt}"/>${collar}${tie}
      <rect x="43" y="66" width="14" height="22" rx="6" fill="${skin}"/>
      <circle cx="50" cy="46" r="24" fill="${skin}"/>${beard}${front}${eyes}${mouth}${glasses}</g>`;
  }

  const PEOPLE = {
    ana: o => person(Object.assign({ hair: "long", hairColor: C.hairDark, skin: C.skin2, shirt: "#2F8F83" }, o)),
    paul: o => person(Object.assign({ hair: "short", hairColor: C.hairBrown, skin: C.skin3, shirt: "#3D5A99", beard: true }, o)),
    weber: o => person(Object.assign({ hair: "bun", hairColor: C.hairGrey, skin: C.skin3, shirt: "#8C5A7A", glasses: true }, o)),
    clerk: o => person(Object.assign({ hair: "short", hairColor: C.hairDark, skin: C.skin1, shirt: "#5B6472", tie: "#B23A3A" }, o))
  };

  function bubble(x, y, w, h, content, tailLeft) {
    const tx = tailLeft ? x + 18 : x + w - 18;
    return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="#fff" stroke="${C.ink}" stroke-width="1.6"/>
      <path d="M${tx - 7} ${y + h - 1} L${tx} ${y + h + 12} L${tx + 7} ${y + h - 1}" fill="#fff" stroke="${C.ink}" stroke-width="1.6" stroke-linejoin="round"/>
      <rect x="${tx - 6}" y="${y + h - 3}" width="12" height="4" fill="#fff"/>${content}</g>`;
  }

  function skyline(y, fill) {
    return `<g fill="${fill}"><rect x="20" y="${y - 40}" width="34" height="40"/><rect x="58" y="${y - 70}" width="26" height="70"/>
      <rect x="88" y="${y - 52}" width="40" height="52"/><rect x="132" y="${y - 92}" width="22" height="92"/><path d="M128 ${y - 92} L143 ${y - 118} L158 ${y - 92} Z"/>
      <rect x="160" y="${y - 60}" width="38" height="60"/><rect x="202" y="${y - 78}" width="30" height="78"/><rect x="236" y="${y - 46}" width="44" height="46"/><rect x="284" y="${y - 64}" width="20" height="64"/></g>`;
  }

  function smallHouse(x, y, lit) {
    return `<g transform="translate(${x} ${y})"><path d="M0 40 L40 8 L80 40 Z" fill="${C.roof}"/><rect x="8" y="38" width="64" height="48" fill="${C.wall}"/>
      <rect x="18" y="50" width="16" height="14" fill="${lit ? "#F6D365" : C.glass}"/><rect x="46" y="54" width="16" height="32" fill="${C.door}"/></g>`;
  }

  /* Time of day scenes for der Morgen / der Tag / der Abend / die Nacht */
  function sky(kind) {
    const P = {
      morning: { a: "#FDE2C4", b: "#BFDDF0", sun: "#F7B955", sy: 128, sx: 62, ground: "#9DBF8A", lit: false },
      day: { a: "#8EC9EE", b: "#CFEAF8", sun: "#FFD54A", sy: 46, sx: 160, ground: "#86B472", lit: false },
      evening: { a: "#F08A5D", b: "#6B5B95", sun: "#F9D36B", sy: 132, sx: 262, ground: "#6E8F62", lit: true },
      night: { a: "#1E2A4A", b: "#2E3D66", sun: null, sy: 0, sx: 0, ground: "#34503F", lit: true }
    }[kind];
    const id = "g" + kind;
    let extra = "";
    if (kind === "night") {
      extra = `<circle cx="250" cy="48" r="20" fill="#F4F1DE"/><circle cx="259" cy="42" r="18" fill="#1E2A4A"/>` +
        [[40, 30], [90, 52], [140, 24], [190, 60], [300, 30], [60, 80], [220, 20]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="#fff"/>`).join("");
    } else {
      extra = `<circle cx="${P.sx}" cy="${P.sy}" r="22" fill="${P.sun}"/>`;
    }
    return svg("0 0 320 200", `<defs><linearGradient id="${id}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${P.a}"/><stop offset="1" stop-color="${P.b}"/></linearGradient></defs>
      <rect width="320" height="200" fill="url(#${id})"/>${extra}
      <path d="M0 150 C80 136 220 136 320 150 L320 200 L0 200 Z" fill="${P.ground}"/>${smallHouse(118, 92, P.lit)}`, kind);
  }

  function hallway(people, opts) {
    opts = opts || {};
    const doorX = opts.doorX == null ? 214 : opts.doorX;
    return svg("0 0 320 200", `<rect width="320" height="200" fill="${C.wall}"/><rect y="168" width="320" height="32" fill="${C.floor}"/>
      <rect x="${doorX}" y="44" width="70" height="124" rx="3" fill="${C.door}"/><circle cx="${doorX + 58}" cy="110" r="3.6" fill="#E8C66A"/>
      <rect x="${doorX + 22}" y="58" width="26" height="12" rx="2" fill="#F3EEE6"/><text x="${doorX + 35}" y="68" font-size="9" text-anchor="middle" fill="${C.ink}" font-family="sans-serif">${opts.doorLabel || "3"}</text>
      ${people || ""}`, opts.label || "hallway");
  }

  function counter(clerkMood, anaMood, speech) {
    return svg("0 0 320 200", `<rect width="320" height="200" fill="#E3E7EC"/><rect x="0" y="40" width="320" height="6" fill="#C9D1DA"/>
      ${PEOPLE.clerk({ x: 30, y: 40, scale: 0.95, mood: clerkMood })}
      <rect x="0" y="140" width="190" height="60" fill="#8A97A8"/><rect x="0" y="134" width="190" height="10" fill="#6E7C8F"/>
      ${PEOPLE.ana({ x: 200, y: 62, scale: 1.0, mood: anaMood })}
      ${speech || ""}`, "counter");
  }

  const fastBubble = bubble(104, 14, 96, 40, `<path d="M114 34 q6 -10 12 0 t12 0 t12 0 t12 0 t12 0 t12 0" stroke="${"#1F2633"}" stroke-width="2" fill="none"/>`, true);
  const qBubble = bubble(236, 14, 52, 36, `<text x="262" y="40" font-size="24" font-weight="700" text-anchor="middle" fill="${"#1F2633"}" font-family="sans-serif">?</text>`, false);

  const flags = {
    br: `<rect width="150" height="100" rx="6" fill="#229E45"/><path d="M75 12 L138 50 L75 88 L12 50 Z" fill="#F8D12E"/><circle cx="75" cy="50" r="22" fill="#2B49A3"/><path d="M54 46 Q75 40 96 54" stroke="#fff" stroke-width="3" fill="none"/>`,
    de: `<rect width="150" height="100" rx="6" fill="#1A1A1A"/><rect y="33" width="150" height="34" fill="#DD0000"/><path d="M0 67 H150 V94 a6 6 0 0 1 -6 6 H6 a6 6 0 0 1 -6 -6 Z" fill="#FFCE00"/>`,
    ch: `<rect x="25" width="100" height="100" rx="6" fill="#D52B1E"/><rect x="66" y="20" width="18" height="60" fill="#fff"/><rect x="45" y="41" width="60" height="18" fill="#fff"/>`,
    pt: `<rect width="150" height="100" rx="6" fill="#DA291C"/><path d="M6 0 H60 V100 H6 a6 6 0 0 1 -6 -6 V6 a6 6 0 0 1 6 -6 Z" fill="#046A38"/><circle cx="60" cy="50" r="18" fill="#FFE900" stroke="#1F2633" stroke-width="1"/>`
  };
  function flag(code) { return svg("-10 -10 170 120", flags[code], code); }

  const ART = {
    sky_morning: () => sky("morning"), sky_day: () => sky("day"), sky_evening: () => sky("evening"), sky_night: () => sky("night"),

    meet: () => hallway(PEOPLE.ana({ x: 30, y: 60, mood: "talk" }) + PEOPLE.paul({ x: 120, y: 60 }), { label: "Ana and Paul" }),
    formal: () => hallway(PEOPLE.ana({ x: 30, y: 60 }) + PEOPLE.weber({ x: 120, y: 60, mood: "talk" }), { label: "Ana and Frau Weber" }),
    ana: () => svg("0 0 140 160", `<rect width="140" height="160" rx="12" fill="#DDEBE8"/>${PEOPLE.ana({ x: 20, y: 20 })}`, "woman"),
    paul: () => svg("0 0 140 160", `<rect width="140" height="160" rx="12" fill="#DFE4F0"/>${PEOPLE.paul({ x: 20, y: 20 })}`, "man"),
    weber: () => svg("0 0 140 160", `<rect width="140" height="160" rx="12" fill="#EEE2EA"/>${PEOPLE.weber({ x: 20, y: 20 })}`, "woman, neighbour"),

    nametag: () => svg("0 0 200 140", `<rect x="10" y="20" width="180" height="104" rx="12" fill="#2F6FB3"/><rect x="10" y="20" width="180" height="34" rx="12" fill="#2F6FB3"/>
      <text x="100" y="46" font-size="18" font-weight="700" fill="#fff" text-anchor="middle" font-family="sans-serif">NAME</text>
      <rect x="22" y="58" width="156" height="54" rx="6" fill="#fff"/><text x="100" y="95" font-size="26" fill="#1F2633" text-anchor="middle" font-family="cursive, sans-serif">Ana</text>`, "name tag"),

    land: () => svg("0 0 200 140", `<rect width="200" height="140" rx="12" fill="#CFE6F2"/>
      <path d="M52 30 C78 18 112 24 132 36 C152 48 160 70 150 92 C140 114 110 122 86 116 C60 110 40 96 38 74 C36 54 40 38 52 30 Z" fill="#9CC48A" stroke="#5C8650" stroke-width="2.5" stroke-dasharray="6 4"/>
      <circle cx="98" cy="72" r="6" fill="#B23A3A"/><circle cx="98" cy="72" r="2.4" fill="#fff"/>`, "country"),
    stadt: () => svg("0 0 200 140", `<rect width="200" height="140" rx="12" fill="#E7E2F0"/><g transform="translate(-6 0) scale(0.66)">${skyline(200, "#5D5A7A")}</g>
      <rect x="0" y="128" width="200" height="12" fill="#9A97B0"/>`, "city"),
    haus: () => svg("0 0 200 140", `<rect width="200" height="140" rx="12" fill="#DCEBF5"/><path d="M40 128 V70 L100 26 L160 70 V128 Z" fill="${C.wall}"/>
      <path d="M30 74 L100 20 L170 74" stroke="${C.roof}" stroke-width="12" fill="none" stroke-linejoin="round"/>
      <rect x="56" y="80" width="24" height="20" fill="${C.glass}"/><rect x="120" y="80" width="24" height="20" fill="${C.glass}"/><rect x="88" y="92" width="24" height="36" fill="${C.door}"/>
      <rect x="0" y="126" width="200" height="14" fill="${C.green}"/>`, "house"),
    tuer: () => svg("0 0 200 140", `<rect width="200" height="140" rx="12" fill="${C.wall}"/><rect x="66" y="14" width="68" height="126" rx="4" fill="${C.door}"/>
      <rect x="76" y="26" width="48" height="44" rx="3" fill="${C.doorDark}"/><rect x="76" y="80" width="48" height="44" rx="3" fill="${C.doorDark}"/><circle cx="122" cy="76" r="4" fill="#E8C66A"/>`, "door"),
    wohnung: () => svg("0 0 200 140", `<rect width="200" height="140" rx="12" fill="#EFE9E1"/>
      <rect x="44" y="14" width="112" height="126" fill="${C.stone}"/>
      ${[0, 1, 2, 3].map(r => [0, 1, 2].map(c => `<rect x="${56 + c * 34}" y="${24 + r * 28}" width="20" height="16" fill="${r === 1 && c === 2 ? "#F6D365" : C.glass}" ${r === 1 && c === 2 ? 'stroke="#B23A3A" stroke-width="3"' : ""}/>`).join("")).join("")}
      <path d="M150 54 L182 30" stroke="#B23A3A" stroke-width="3"/><circle cx="184" cy="28" r="5" fill="#B23A3A"/>`, "apartment"),
    building: () => svg("0 0 320 200", `<rect width="320" height="200" fill="#CFE3F0"/><rect x="90" y="20" width="140" height="160" fill="${C.stone}"/>
      ${[0, 1, 2, 3].map(r => [0, 1, 2].map(c => `<rect x="${104 + c * 44}" y="${32 + r * 30}" width="24" height="18" fill="${r === 1 && c === 2 ? "#F6D365" : C.glass}"/>`).join("")).join("")}
      <rect x="146" y="148" width="28" height="32" fill="${C.door}"/><rect y="178" width="320" height="22" fill="${C.green}"/>`, "building"),
    nachbar: () => hallway(PEOPLE.paul({ x: 40, y: 60 }), { doorX: 170, doorLabel: "4", label: "neighbour" }),
    nachbarin: () => hallway(PEOPLE.weber({ x: 40, y: 60 }), { doorX: 170, doorLabel: "2", label: "female neighbour" }),
    knock: () => hallway(PEOPLE.ana({ x: 120, y: 60, mood: "talk" }) + PEOPLE.weber({ x: 216, y: 62 }), { doorX: 206, doorLabel: "2", label: "Ana at Frau Weber's door" }),

    sprache: () => svg("0 0 200 140", `<rect width="200" height="140" rx="12" fill="#F1E9DA"/>
      ${bubble(18, 18, 92, 54, `<text x="64" y="54" font-size="28" font-weight="700" text-anchor="middle" fill="#1F2633" font-family="sans-serif">Aa</text>`, true)}
      ${bubble(92, 60, 92, 54, `<text x="138" y="96" font-size="28" font-weight="700" text-anchor="middle" fill="#1F2633" font-family="sans-serif">Ää</text>`, false)}`, "language"),
    talk_lang: () => hallway(PEOPLE.ana({ x: 30, y: 60, mood: "talk" }) + PEOPLE.paul({ x: 120, y: 60 }) +
      bubble(18, 12, 70, 34, `<text x="53" y="35" font-size="15" font-weight="700" text-anchor="middle" fill="#1F2633" font-family="sans-serif">PT EN</text>`, true), { label: "Ana talks about languages" }),
    counter_fast: () => counter("talk", null, fastBubble),
    counter_confused: () => counter("talk", "confused", fastBubble + qBubble),
    counter_ok: () => counter(null, null, ""),

    flag_br: () => flag("br"), flag_de: () => flag("de"), flag_ch: () => flag("ch"), flag_pt: () => flag("pt"),

    kaffee: () => svg("0 0 140 120", `<rect width="140" height="120" rx="12" fill="#F2E8DC"/><path d="M38 44 H94 V78 C94 92 82 100 66 100 C50 100 38 92 38 78 Z" fill="#FFFFFF" stroke="#1F2633" stroke-width="2"/>
      <path d="M94 54 C110 54 110 76 94 76" stroke="#1F2633" stroke-width="3" fill="none"/><ellipse cx="66" cy="46" rx="26" ry="5" fill="#6B4426"/>
      <path d="M56 34 q-6 -8 0 -16 M70 34 q-6 -8 0 -16" stroke="#9C8F84" stroke-width="2.5" fill="none" stroke-linecap="round"/><ellipse cx="66" cy="104" rx="40" ry="5" fill="#D8C8B6"/>`, "coffee"),
    wasser: () => svg("0 0 140 120", `<rect width="140" height="120" rx="12" fill="#E2EEF5"/><path d="M48 18 H92 L86 104 H54 Z" fill="#FFFFFF" fill-opacity=".6" stroke="#1F2633" stroke-width="2"/>
      <path d="M51 48 H89 L86 104 H54 Z" fill="#7FBCE0"/>`, "water"),
    brot: () => svg("0 0 140 120", `<rect width="140" height="120" rx="12" fill="#F5EBDD"/><path d="M22 76 C22 40 118 40 118 76 C118 92 22 92 22 76 Z" fill="#C88A4A"/>
      <path d="M46 56 L54 70 M66 52 L74 68 M86 56 L94 70" stroke="#8C5A2B" stroke-width="4" stroke-linecap="round"/>`, "bread"),
    tee: () => svg("0 0 140 120", `<rect width="140" height="120" rx="12" fill="#EAF0E2"/><path d="M34 50 H98 V74 C98 92 84 100 66 100 C48 100 34 92 34 74 Z" fill="#FFFFFF" stroke="#1F2633" stroke-width="2"/>
      <ellipse cx="66" cy="52" rx="32" ry="5" fill="#C9A24A"/><path d="M80 52 L94 18" stroke="#8C8C8C" stroke-width="1.5"/><rect x="88" y="10" width="14" height="12" fill="#5C8650"/>`, "tea")
  };

  /* line-art city for the hero board: strokes use currentColor so the board decides the tone */
  ART.city = () => svg("0 0 520 220", `<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M0 120 L60 70 L95 98 L140 52 L190 100 L240 66 L300 112" opacity=".35"/>
      <path d="M8 200 H512"/>
      <rect x="20" y="110" width="58" height="90"/>${[0, 1, 2].map(r => [0, 1].map(c => `<rect x="${30 + c * 24}" y="${122 + r * 24}" width="12" height="14"/>`).join("")).join("")}
      <path d="M92 200 V96 h28 v104"/><path d="M106 96 V58 l-10 -10 h20 l-10 10"/><circle cx="106" cy="76" r="7"/>
      <rect x="134" y="124" width="70" height="76"/>${[0, 1].map(r => [0, 1, 2].map(c => `<rect x="${144 + c * 20}" y="${134 + r * 26}" width="10" height="14"/>`).join("")).join("")}
      <path d="M134 124 l35 -26 l35 26"/>
      <rect x="218" y="88" width="48" height="112"/>${[0, 1, 2, 3].map(r => `<path d="M228 ${100 + r * 24} h28"/>`).join("")}
      <path d="M280 200 v-52 h96 v52"/><path d="M280 148 h96"/>${[0, 1, 2, 3].map(c => `<rect x="${290 + c * 22}" y="158" width="14" height="16"/>`).join("")}
      <path d="M300 148 l12 -18 h32 l12 18"/><path d="M328 130 v-14 l-10 -8 M328 116 l10 -8"/>
      <path d="M384 200 V132 h52 v68"/>${[0, 1].map(r => [0, 1].map(c => `<rect x="${394 + c * 22}" y="${142 + r * 26}" width="12" height="14"/>`).join("")).join("")}
      <circle cx="462" cy="168" r="18"/><path d="M462 186 v14"/><circle cx="494" cy="176" r="12"/><path d="M494 188 v12"/>
      <path d="M12 186 h4"/></g>`, "city");
  /* round face crop of a character, for dialogue lines */
  ART.face = name => (PEOPLE[name] ? svg("16 12 68 68", `<rect x="16" y="12" width="68" height="68" fill="${{ ana: "#CFE6E1", paul: "#D6DDF0", weber: "#EADBE5", clerk: "#DDE1E6" }[name]}"/>${PEOPLE[name]({})}`, name) : "");
  /* ---------- wide street scene for the dashboard hero; changes with the time of day ---------- */
  function rng(seed) { let x = seed; return () => { x = (x * 9301 + 49297) % 233280; return x / 233280; }; }
  ART.street = kind => {
    const T = {
      morning: { s1: "#F6CFA4", s2: "#B9D9EE", far: "#AFC3CF", lit: false, sun: ["#F7B955", 170, 150] },
      day: { s1: "#BFE1F4", s2: "#7DBDE6", far: "#9DB7C6", lit: false, sun: ["#FFD54A", 980, 70] },
      evening: { s1: "#F2A46B", s2: "#5E4C8A", far: "#7E6E95", lit: true, sun: ["#F9D36B", 1060, 205] },
      night: { s1: "#2C3D66", s2: "#121C33", far: "#33456B", lit: true, sun: null }
    }[kind] || {};
    const r = rng(7), facade = ["#E7D6C1", "#D8C0A4", "#C8D2C0", "#E2CCC4", "#BAC6D2", "#E9E1CF", "#CDBBA7"];
    let houses = "", x = -10;
    while (x < 1210) {
      const w = 90 + Math.floor(r() * 70), h = 150 + Math.floor(r() * 120), y = 330 - h, col = facade[Math.floor(r() * facade.length)];
      const roof = r() > .5 ? `<path d="M${x - 4} ${y} L${x + w / 2} ${y - 34} L${x + w + 4} ${y} Z" fill="#8E5448"/>` : `<rect x="${x - 3}" y="${y - 8}" width="${w + 6}" height="10" fill="#6F6A66"/>`;
      let win = "";
      const cols = Math.max(2, Math.floor((w - 20) / 28)), rows = Math.floor((h - 50) / 40);
      for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
        const on = T.lit && r() > .45;
        win += `<rect x="${x + 14 + j * ((w - 28) / cols) + 2}" y="${y + 18 + i * 40}" width="${(w - 28) / cols - 8}" height="22" rx="2" fill="${on ? "#FFD97A" : (kind === "night" ? "#2A3550" : "#9FBCD0")}"/>`;
      }
      houses += `<g>${roof}<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${col}"/>${win}<rect x="${x + w / 2 - 12}" y="${330 - 40}" width="24" height="40" fill="#6B4E3A"/></g>`;
      x += w + 4;
    }
    const stars = kind === "night" ? Array.from({ length: 40 }, () => `<circle cx="${(r() * 1200).toFixed(0)}" cy="${(r() * 150).toFixed(0)}" r="${(1 + r() * 1.4).toFixed(1)}" fill="#fff" opacity="${(.5 + r() * .5).toFixed(2)}"/>`).join("") : "";
    const sky = T.sun ? `<circle cx="${T.sun[1]}" cy="${T.sun[2]}" r="44" fill="${T.sun[0]}"/>` : `<circle cx="1010" cy="80" r="34" fill="#F4F1DE"/><circle cx="1024" cy="70" r="31" fill="#1B2744"/>`;
    const lamps = [150, 520, 890].map(lx => `<g><rect x="${lx}" y="250" width="5" height="110" fill="#3A3F45"/><path d="M${lx - 14} 252 h33" stroke="#3A3F45" stroke-width="5"/>${T.lit ? `<circle cx="${lx - 12}" cy="258" r="22" fill="#FFE7A0" opacity=".35"/>` : ""}<circle cx="${lx - 12}" cy="258" r="7" fill="${T.lit ? "#FFE7A0" : "#C9CED4"}"/></g>`).join("");
    const tram = `<g transform="translate(560 262)"><path d="M0 -22 L-30 -40 M120 -22 L150 -40" stroke="#3A3F45" stroke-width="3"/>
      <rect x="-10" y="0" width="390" height="78" rx="18" fill="#F2C230"/><rect x="-10" y="44" width="390" height="14" fill="#FFFFFF"/>
      ${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${12 + i * 60}" y="12" width="46" height="28" rx="5" fill="${T.lit ? "#FFE7A0" : "#2E4A5C"}"/>`).join("")}
      <rect x="340" y="12" width="26" height="28" rx="5" fill="#2E4A5C"/><text x="353" y="31" font-family="Barlow Semi Condensed, sans-serif" font-weight="700" font-size="16" text-anchor="middle" fill="#F2C230">A1</text>
      ${[40, 110, 260, 330].map(wx => `<circle cx="${wx}" cy="80" r="11" fill="#2B2F33"/>`).join("")}</g>`;
    return svg("0 0 1200 420", `<defs><linearGradient id="sk${kind}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${T.s1}"/><stop offset="1" stop-color="${T.s2}"/></linearGradient></defs>
      <rect width="1200" height="420" fill="url(#sk${kind})"/>${stars}${sky}
      <path d="M0 230 L120 150 L210 196 L330 110 L450 190 L560 140 L690 205 L820 120 L960 200 L1080 150 L1200 210 V330 H0 Z" fill="${T.far}" opacity=".55"/>
      ${houses}<rect y="330" width="1200" height="90" fill="${kind === "night" ? "#23272C" : "#5A6168"}"/><rect y="338" width="1200" height="4" fill="#9AA1A8" opacity=".6"/>
      <path d="M0 238 H1200" stroke="#2F3438" stroke-width="2"/>${lamps}${tram}
      <rect y="342" width="1200" height="78" fill="${kind === "night" ? "#2E3338" : "#6E767E"}"/><path d="M0 382 H1200" stroke="#C9CDD1" stroke-width="3" stroke-dasharray="40 30"/>`, "street, " + kind);
  };
  window.ART = ART;
})();
