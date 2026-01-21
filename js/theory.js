document.addEventListener("DOMContentLoaded", () => {
  const wheelEl = document.getElementById("theory-wheel");
  const relationsEl = document.getElementById("theory-relations");
  const cardsEl = document.getElementById("theory-cards");

  let segments = [];
  let relationships = [];
  let theoryCards = [];
  let activeSegmentId = null;
  let tooltipEl = null;

  function renderWheel() {
    if (!wheelEl) return;
    wheelEl.innerHTML = "";
    tooltipEl = document.createElement("div");
    tooltipEl.className = "wheel-tooltip";
    tooltipEl.innerHTML = `<p class="name"></p><p class="keywords"></p>`;
    wheelEl.appendChild(tooltipEl);

    const total = segments.length || 1;
    const angleStep = 360 / total;
    segments.forEach((seg, index) => {
      const slice = document.createElement("div");
      const angle = index * angleStep;
      slice.className =
        "wheel-slice" + (seg.id === activeSegmentId ? " active" : "");
      slice.style.setProperty("--angle", angle + "deg");
      slice.style.transform = `rotate(${angle}deg) skewY(-30deg)`;
      // Make slices feel like layered/overlapping color (subtle depth)
      slice.style.background = `linear-gradient(180deg, rgba(255,255,255,0.16), rgba(0,0,0,0.18)),
        ${seg.hex}`;
      slice.style.mixBlendMode = "screen";

      const label = document.createElement("span");
      label.className = "wheel-slice-label";
      label.textContent = seg.name;
      label.style.transform = `rotate(${-angle}deg) translate(10px, -4px)`;

      slice.appendChild(label);
      slice.addEventListener("click", () => {
        activeSegmentId = seg.id;
        renderWheel();
        renderRelations(seg.id);
      });
      slice.addEventListener("mouseenter", () => showTooltip(seg));
      slice.addEventListener("mousemove", () => showTooltip(seg));
      slice.addEventListener("mouseleave", () => hideTooltip());
      wheelEl.appendChild(slice);
    });
  }

  function showTooltip(seg) {
    if (!tooltipEl) return;
    const nameEl = tooltipEl.querySelector(".name");
    const keywordsEl = tooltipEl.querySelector(".keywords");
    if (nameEl) nameEl.textContent = seg.name;
    if (keywordsEl) {
      const words = (seg.keywords || []).slice(0, 4).join(" • ");
      keywordsEl.textContent = words || "";
    }
    tooltipEl.classList.add("visible");
  }

  function hideTooltip() {
    if (!tooltipEl) return;
    tooltipEl.classList.remove("visible");
  }

  function colorById(id) {
    return segments.find((s) => s.id === id);
  }

  function renderRelations(baseId) {
    if (!relationsEl) return;
    const inner = relationsEl.querySelector(".relations-inner");
    if (!inner) return;
    inner.innerHTML = "";

    const base = colorById(baseId);
    const heading = document.createElement("h2");
    heading.textContent = base ? `Relationships for ${base.name}` : "Relationships";
    inner.appendChild(heading);

    relationships.forEach((rel) => {
      const group = document.createElement("div");
      group.className = "relation-group";
      const h3 = document.createElement("h3");
      h3.textContent = rel.name;
      const desc = document.createElement("p");
      desc.textContent = rel.description;
      group.appendChild(h3);
      group.appendChild(desc);

      const colorsWrap = document.createElement("div");
      colorsWrap.className = "relation-colors";

      rel.examples.forEach((ex) => {
        let involved = [];
        if (ex.base && ex.match && (ex.base === baseId || ex.match === baseId)) {
          involved = [ex.base, ex.match];
        } else if (
          Array.isArray(ex.neighbors) &&
          (ex.base === baseId || ex.neighbors.includes(baseId))
        ) {
          involved = [ex.base, ...ex.neighbors];
        } else if (Array.isArray(ex.set) && ex.set.includes(baseId)) {
          involved = ex.set;
        } else if (
          Array.isArray(ex.matches) &&
          (ex.base === baseId || ex.matches.includes(baseId))
        ) {
          involved = [ex.base, ...ex.matches];
        }

        involved = Array.from(new Set(involved));
        if (!involved.length) return;

        involved.forEach((id) => {
          const seg = colorById(id);
          if (!seg) return;
          const item = document.createElement("span");
          item.className = "relation-color";
          const sw = document.createElement("span");
          sw.className = "relation-color-swatch";
          sw.style.background = seg.hex;
          const label = document.createElement("span");
          label.textContent = seg.name;
          item.appendChild(sw);
          item.appendChild(label);
          colorsWrap.appendChild(item);
        });
      });

      if (colorsWrap.children.length) {
        group.appendChild(colorsWrap);
        inner.appendChild(group);
      }
    });
  }

  function renderTheoryCards() {
    if (!cardsEl) return;
    cardsEl.innerHTML = "";
    theoryCards.forEach((card) => {
      const el = document.createElement("article");
      el.className = "theory-card";
      el.innerHTML = `
        <h3>${card.title}</h3>
        <p class="card-summary">${card.summary}</p>
        <p class="card-details">${card.details}</p>
        <div class="card-colors">
          ${(card.highlightColors || [])
            .map((id) => {
              const seg = colorById(id) || {};
              return `<span class="theory-card-color">
                <span class="theory-card-color-dot" style="background:${seg.hex ||
                  "#020617"}"></span>
                <span>${seg.name || id}</span>
              </span>`;
            })
            .join("")}
        </div>
      `;
      cardsEl.appendChild(el);
    });
  }

  if (wheelEl || cardsEl) {
    loadJSON("data/theory.json")
      .then((data) => {
        segments = data.wheel.segments || [];
        relationships = data.wheel.relationships || [];
        theoryCards = data.theoryCards || [];
        if (segments.length) {
          activeSegmentId = segments[0].id;
        }
        renderWheel();
        if (activeSegmentId) {
          renderRelations(activeSegmentId);
        }
        renderTheoryCards();
      })
      .catch((err) => {
        console.error(err);
        if (cardsEl) {
          cardsEl.innerHTML =
            '<p style="font-size:0.9rem;color:#9ca3af;">Failed to load theory data.</p>';
        }
      });
  }
});


