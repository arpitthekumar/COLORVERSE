document.addEventListener("DOMContentLoaded", () => {
  const gridEl = document.getElementById("colors-grid");
  const detailEl = document.getElementById("color-detail");
  const searchInput = document.getElementById("color-search");
  const filterGroups = document.querySelectorAll(".chip-row[data-filter-group]");

  let colors = [];
  let filtered = [];
  let activeFilters = {
    temperature: "all",
    vibe: "all",
  };

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function hslToHex(h, s, l) {
    // h: 0..360, s/l: 0..100
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0,
      g = 0,
      b = 0;
    if (0 <= h && h < 60) [r, g, b] = [c, x, 0];
    else if (60 <= h && h < 120) [r, g, b] = [x, c, 0];
    else if (120 <= h && h < 180) [r, g, b] = [0, c, x];
    else if (180 <= h && h < 240) [r, g, b] = [0, x, c];
    else if (240 <= h && h < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];

    const toHex = (v) => {
      const n = Math.round((v + m) * 255);
      return n.toString(16).padStart(2, "0");
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }

  function hexToRgb(hex) {
    const v = hex.replace("#", "");
    if (v.length !== 6) return "";
    const r = parseInt(v.slice(0, 2), 16);
    const g = parseInt(v.slice(2, 4), 16);
    const b = parseInt(v.slice(4, 6), 16);
    return `${r},${g},${b}`;
  }

  function generateShadesFromSeeds(seeds) {
    // 24 seeds * 14 shades = 336 generated colors (300+ requirement)
    const shadeSteps = [
      92, 88, 84, 80, 76, 72, 66, 58, 50, 42, 34, 28, 22, 16,
    ];
    const out = [];
    seeds.forEach((seed) => {
      const baseHue = clamp(Number(seed.hue) || 0, 0, 360);
      const temp = seed.temperature || "neutral";
      const baseName = seed.name || "Color";

      // Adjust saturation for neutrals/earth tones
      const isNeutral = temp === "neutral" || (seed.category || []).includes("neutral");
      const sat = isNeutral ? 18 : 78;
      const satDeep = isNeutral ? 12 : 84;

      shadeSteps.forEach((lightness, i) => {
        const l = lightness;
        const s = l < 35 ? satDeep : sat;
        const hex = hslToHex(baseHue, s, l);
        const shade = (i + 1) * 50; // 50..700-ish label
        out.push({
          id: `${baseName.toLowerCase().replace(/\s+/g, "-")}-${shade}`,
          name: `${baseName} ${shade}`,
          hex,
          rgb: hexToRgb(hex),
          hsl: `${Math.round(baseHue)},${Math.round(s)}%,${Math.round(l)}%`,
          emotionTags: [],
          shortEmotion: "",
          psychology: "",
          usage: { branding: [], ui: [], other: [] },
          temperature: temp,
          vibe: isNeutral ? ["minimal"] : [],
          category: Array.isArray(seed.category) ? seed.category : [],
          avoid: [],
          recommended: [],
          generated: true,
        });
      });
    });
    return out;
  }

  function renderGrid(list) {
    if (!gridEl) return;
    gridEl.innerHTML = "";
    list.forEach((c) => {
      const tile = document.createElement("button");
      tile.className = "color-tile";
      tile.type = "button";
      tile.innerHTML = `
        <div class="color-tile-swatch" style="background:${c.hex};"></div>
        <div class="color-tile-body">
          <p class="color-tile-name">${c.name}</p>
          <p class="color-tile-hex">${c.hex}</p>
          <div class="color-tile-tags">
            ${(c.emotionTags || [])
              .slice(0, 2)
              .map((tag) => `<span class="color-tag">${tag}</span>`)
              .join("")}
          </div>
        </div>
      `;
      tile.addEventListener("click", () => showDetail(c));
      gridEl.appendChild(tile);
    });
  }

  function showDetail(color) {
    if (!detailEl) return;
    const inner = document.createElement("div");
    inner.className = "color-detail-inner";
    const astro = color.astrology || null;
    const hasKnowledge =
      Boolean(color.shortEmotion) ||
      Boolean(color.psychology) ||
      (color.emotionTags && color.emotionTags.length);
    inner.innerHTML = `
      <div class="color-detail-header">
        <div class="color-detail-swatch" style="background:${color.hex};"></div>
        <div>
          <h2 class="color-detail-title">${color.name}</h2>
          <p class="color-detail-meta">
            HEX ${color.hex} • RGB ${color.rgb || ""} ${
      color.hsl ? "• HSL " + color.hsl : ""
    }
          </p>
        </div>
      </div>
      ${
        hasKnowledge
          ? `<div class="color-detail-section">
        <h3>Emotion &amp; Psychology</h3>
        <p>${color.shortEmotion || ""}</p>
        <p>${color.psychology || ""}</p>
      </div>`
          : `<div class="color-detail-section">
        <h3>About this shade</h3>
        <p>This is an auto-generated shade to give you a 300+ color library. Click other colors for full psychology + astrology details.</p>
      </div>`
      }
      <div class="color-detail-section">
        <h3>Common Usage</h3>
        <ul>
          ${(color.usage?.branding || [])
            .map((u) => `<li>Branding: ${u}</li>`)
            .join("")}
          ${(color.usage?.ui || [])
            .map((u) => `<li>UI: ${u}</li>`)
            .join("")}
          ${(color.usage?.other || [])
            .map((u) => `<li>Other: ${u}</li>`)
            .join("")}
        </ul>
      </div>
      ${
        astro
          ? `<div class="color-detail-section">
        <h3>Astrology</h3>
        <p><strong>Zodiac:</strong> ${(astro.zodiac || []).join(", ")}</p>
        <p><strong>Planet:</strong> ${astro.planet || ""}</p>
        <p><strong>Keywords:</strong> ${(astro.keywords || []).join(", ")}</p>
      </div>`
          : ""
      }
      <div class="color-detail-section">
        <h3>Knowledge Mode</h3>
        <p><strong>Recommended for:</strong></p>
        <ul>
          ${(color.recommended || [])
            .map((r) => `<li>${r}</li>`)
            .join("")}
        </ul>
        <p><strong>Avoid when:</strong></p>
        <ul>
          ${(color.avoid || [])
            .map((a) => `<li>${a}</li>`)
            .join("")}
        </ul>
      </div>
    `;
    detailEl.innerHTML = "";
    detailEl.appendChild(inner);
  }

  function applyFilters() {
    const term = (searchInput?.value || "").trim().toLowerCase();
    filtered = colors.filter((c) => {
      const matchesSearch =
        !term ||
        c.name.toLowerCase().includes(term) ||
        c.hex.toLowerCase().includes(term);

      const matchesTemp =
        activeFilters.temperature === "all" ||
        c.temperature === activeFilters.temperature;

      const matchesVibe =
        activeFilters.vibe === "all" ||
        (Array.isArray(c.vibe) && c.vibe.includes(activeFilters.vibe));

      return matchesSearch && matchesTemp && matchesVibe;
    });

    renderGrid(filtered);
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      applyFilters();
    });
  }

  filterGroups.forEach((group) => {
    const groupName = group.getAttribute("data-filter-group");
    group.addEventListener("click", (e) => {
      if (!(e.target instanceof HTMLElement)) return;
      const btn = e.target.closest(".chip");
      if (!btn || !groupName) return;
      group.querySelectorAll(".chip").forEach((chip) => {
        chip.classList.remove("active");
      });
      btn.classList.add("active");
      const val = btn.dataset.value || "all";
      activeFilters[groupName] = val;
      applyFilters();
    });
  });

  if (gridEl) {
    Promise.all([loadJSON("data/colors.json"), loadJSON("data/color-seeds.json")])
      .then(([detailed, seeds]) => {
        const generated = generateShadesFromSeeds(seeds || []);
        // Put detailed (rich info) first, then generated shades
        colors = [...(detailed || []), ...generated];
        filtered = colors.slice();
        renderGrid(filtered);
      })
      .catch((err) => {
        console.error(err);
        gridEl.innerHTML =
          '<p style="font-size:0.9rem;color:#9ca3af;">Failed to load colors data.</p>';
      });
  }
});


