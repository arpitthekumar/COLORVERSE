document.addEventListener("DOMContentLoaded", () => {
  const gridEl = document.getElementById("palettes-grid");
  const previewEl = document.getElementById("palette-preview");
  const filterRow = document.getElementById("palette-filters");

  let palettes = [];
  let activeType = "all";
  let activeId = null;

  function typeLabel(types) {
    return (types || []).join(" • ");
  }

  function renderGrid() {
    if (!gridEl) return;
    gridEl.innerHTML = "";
    const toShow = palettes.filter((p) =>
      activeType === "all" ? true : (p.type || []).includes(activeType)
    );
    toShow.forEach((p) => {
      const card = document.createElement("article");
      card.className = "palette-card" + (p.id === activeId ? " active" : "");
      card.innerHTML = `
        <div class="palette-card-header">
          <h2 class="palette-card-name">${p.name}</h2>
          <span class="palette-card-type">${typeLabel(p.type)}</span>
        </div>
        <div class="palette-swatches">
          ${p.colors
            .map(
              (c) =>
                `<div class="palette-swatch" style="background:${c.hex};"></div>`
            )
            .join("")}
        </div>
        <div class="palette-hex-row">
          ${p.colors
            .map((c) => `<span class="palette-hex">${c.hex}</span>`)
            .join("")}
        </div>
        <p class="palette-use">${p.useCase || ""}</p>
        <div class="palette-actions">
          <span class="palette-copy" data-id="${p.id}">Copy HEX</span>
          <span style="font-size:0.7rem;color:#6b7280;">${
            (p.recommendedFor || []).join(", ") || ""
          }</span>
        </div>
      `;

      card.addEventListener("click", (e) => {
        const target = e.target;
        if (target instanceof HTMLElement && target.classList.contains("palette-copy")) {
          copyPalette(p);
          e.stopPropagation();
          return;
        }
        activeId = p.id;
        renderGrid();
        updatePreview(p);
        applySiteThemeFromPalette(p);
      });

      gridEl.appendChild(card);
    });
  }

  function copyPalette(palette) {
    const text = palette.colors.map((c) => c.hex).join(", ");
    navigator.clipboard?.writeText(text).catch(() => {});
  }

  function updatePreview(palette) {
    if (!previewEl || !palette) return;
    const heroBg = palette.colors[0]?.hex || "#020617";
    const cardBg = palette.colors[1]?.hex || "#020617";
    const accent = palette.colors[2]?.hex || "#3b82f6";
    const text = palette.colors[3]?.hex || "#f9fafb";

    const inner = previewEl.querySelector(".palette-preview-inner");
    if (!inner) return;

    inner.querySelector(".preview-title").textContent = palette.name;
    const placeholder =
      inner.querySelector(".preview-placeholder") ||
      document.createElement("p");
    if (placeholder) {
      placeholder.textContent = palette.notes || "";
    }

    const previewUI = inner.querySelector(".preview-ui");
    if (previewUI) {
      previewUI.style.background = cardBg;
      const hero = previewUI.querySelector(".preview-hero");
      const cards = previewUI.querySelectorAll(".preview-card");
      const btn = previewUI.querySelector(".btn-primary");

      if (hero) {
        hero.style.background = heroBg;
        hero.style.color = text;
      }

      cards.forEach((c) => {
        c.style.background = cardBg;
        c.style.color = text;
      });

      if (btn) {
        btn.style.background = accent;
        btn.style.borderColor = "transparent";
        btn.style.color = text;
        btn.style.boxShadow = "0 8px 20px rgba(0,0,0,0.45)";
      }
    }
  }

  function applySiteThemeFromPalette(palette) {
    if (!palette || !palette.colors || !palette.colors.length) return;
    // Pick a simple mapping:
    // 0 bg2, 1 bg1/surface, 2 accent1, 3 accent2/textStrong
    const c0 = palette.colors[0]?.hex || "#02030a";
    const c1 = palette.colors[1]?.hex || "#050810";
    const c2 = palette.colors[2]?.hex || "#3b82f6";
    const c3 = palette.colors[3]?.hex || "#a855f7";

    const theme = {
      bg0: "#02030a",
      bg1: c1,
      bg2: c0,
      surface: "rgba(15, 23, 42, 0.85)",
      text: "#f5f7ff",
      textStrong: "#e5e7eb",
      muted: "#9ca3af",
      accent1: c2,
      accent2: c3,
    };

    // If palette contains a "text" role, prefer it.
    const textRole = palette.colors.find((c) => c.role === "text")?.hex;
    if (textRole) {
      theme.text = textRole;
      theme.textStrong = textRole;
    }

    applyTheme(theme);
    saveTheme(theme);
  }

  if (filterRow) {
    filterRow.addEventListener("click", (e) => {
      if (!(e.target instanceof HTMLElement)) return;
      const btn = e.target.closest(".chip");
      if (!btn) return;
      filterRow.querySelectorAll(".chip").forEach((chip) => {
        chip.classList.remove("active");
      });
      btn.classList.add("active");
      activeType = btn.dataset.type || "all";
      renderGrid();
    });

    // mark "all" as default active
    const allBtn = filterRow.querySelector('.chip[data-type="all"]');
    if (allBtn instanceof HTMLElement) {
      allBtn.classList.add("active");
    }
  }

  if (gridEl) {
    loadJSON("data/palettes.json")
      .then((data) => {
        palettes = data;
        if (palettes.length > 0) {
          activeId = palettes[0].id;
          renderGrid();
          updatePreview(palettes[0]);
          applySiteThemeFromPalette(palettes[0]);
        }
      })
      .catch((err) => {
        console.error(err);
        gridEl.innerHTML =
          '<p style="font-size:0.9rem;color:#9ca3af;">Failed to load palettes data.</p>';
      });
  }
});


