// ColorVerse 2.0 - Home Page Interactivity
// Powers Hero Live Studio, Palette Shuffler, and Color Psychology Matrix

const HERO_PALETTES = [
  {
    name: "Cyberpunk Neon",
    tag: "High Energy & Futuristic",
    colors: ["#06B6D4", "#3B82F6", "#8B5CF6", "#EC4899", "#F43F5E"],
    btnBg: "#8B5CF6"
  },
  {
    name: "Sunset Horizon",
    tag: "Warm, Creative & Inspiring",
    colors: ["#F59E0B", "#F97316", "#EF4444", "#EC4899", "#A855F7"],
    btnBg: "#F97316"
  },
  {
    name: "Oceanic Abyss",
    tag: "Calm, Trusted & Serene",
    colors: ["#0F172A", "#0369A1", "#0284C7", "#06B6D4", "#10B981"],
    btnBg: "#0284C7"
  },
  {
    name: "Emerald Aurora",
    tag: "Natural, Fresh & Balanced",
    colors: ["#064E3B", "#059669", "#10B981", "#34D399", "#A3E635"],
    btnBg: "#10B981"
  },
  {
    name: "Tokyo Midnight",
    tag: "Sleek, Modern & Cyber",
    colors: ["#18181B", "#27272A", "#6366F1", "#A855F7", "#F43F5E"],
    btnBg: "#6366F1"
  }
];

const PSYCHOLOGY_DATA = {
  blue: {
    name: "Sapphire Blue",
    hex: "#3B82F6",
    tone: "Cool Tone • Corporate & Tech",
    emotions: "Trust, dependability, logic, serenity and intellect. Reduces heart rate and creates a sense of professional security.",
    brands: ["Intel", "IBM", "PayPal", "Twitter", "Facebook", "Samsung"]
  },
  red: {
    name: "Crimson Red",
    hex: "#EF4444",
    tone: "Warm Tone • High Arousal",
    emotions: "Urgency, passion, energy, appetite and excitement. Immediately grabs attention and triggers impulse action.",
    brands: ["Netflix", "Coca-Cola", "YouTube", "Target", "CNN"]
  },
  green: {
    name: "Emerald Green",
    hex: "#10B981",
    tone: "Cool Tone • Nature & Health",
    emotions: "Growth, renewal, peace, prosperity, balance and vitality. Strongly associated with organic lifestyle and financial health.",
    brands: ["Spotify", "Starbucks", "Whole Foods", "Android", "Heineken"]
  },
  yellow: {
    name: "Amber Yellow",
    hex: "#F59E0B",
    tone: "Warm Tone • High Visibility",
    emotions: "Optimism, warmth, cheerfulness, mental clarity and youthfulness. Stimulates brain activity and visual perception.",
    brands: ["McDonald's", "IKEA", "Ferrari", "Snapchat", "Best Buy"]
  },
  purple: {
    name: "Royal Violet",
    hex: "#8B5CF6",
    tone: "Cool/Warm Blend • Creative Luxury",
    emotions: "Royalty, imagination, luxury, mystery, wisdom and spirituality. Used in premium cosmetics and imaginative gaming.",
    brands: ["Twitch", "Cadbury", "Hallmark", "Roku", "Yahoo"]
  }
};

let currentPaletteIdx = 0;

// Initialize Hero Studio
function initHeroStudio() {
  const shuffleBtn = document.getElementById("shuffle-studio-btn");
  if (shuffleBtn) {
    shuffleBtn.addEventListener("click", () => {
      currentPaletteIdx = (currentPaletteIdx + 1) % HERO_PALETTES.length;
      renderHeroPalette();
    });
  }
  renderHeroPalette();
}

function renderHeroPalette() {
  const p = HERO_PALETTES[currentPaletteIdx];
  const nameEl = document.getElementById("studio-theme-name");
  const container = document.getElementById("studio-swatches-strip");
  const mockupBadge = document.getElementById("mockup-badge");
  const mockupBtn = document.getElementById("mockup-btn");

  if (nameEl) nameEl.textContent = `${p.name} • ${p.tag}`;
  if (mockupBadge) mockupBadge.textContent = p.name;
  if (mockupBtn) {
    mockupBtn.style.backgroundColor = p.btnBg;
    mockupBtn.style.boxShadow = `0 4px 14px ${p.btnBg}66`;
  }

  if (container) {
    container.innerHTML = "";
    p.colors.forEach((colorHex) => {
      const swatch = document.createElement("div");
      swatch.className = "studio-swatch";
      swatch.style.backgroundColor = colorHex;
      swatch.title = `Click to copy ${colorHex}`;

      const hexLabel = document.createElement("span");
      hexLabel.className = "studio-swatch-hex";
      hexLabel.textContent = colorHex;

      swatch.appendChild(hexLabel);

      swatch.addEventListener("click", () => {
        navigator.clipboard.writeText(colorHex).then(() => {
          showFloatingToast(`Copied ${colorHex} to clipboard!`);
        });
      });

      container.appendChild(swatch);
    });
  }
}

// Initialize Color Psychology Matrix
function initPsychologyMatrix() {
  const buttons = document.querySelectorAll(".psych-pick-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const colorKey = btn.dataset.color;
      renderPsychology(colorKey);
    });
  });

  renderPsychology("blue");
}

function renderPsychology(key) {
  const data = PSYCHOLOGY_DATA[key];
  if (!data) return;

  const titleEl = document.getElementById("psych-title-name");
  const toneEl = document.getElementById("psych-badge-tone");
  const descEl = document.getElementById("psych-emotions-p");
  const brandsEl = document.getElementById("psych-brands-wrap");
  const cardEl = document.getElementById("psych-display-card");

  if (titleEl) {
    titleEl.textContent = data.name;
    titleEl.style.color = data.hex;
  }
  if (toneEl) toneEl.textContent = data.tone;
  if (descEl) descEl.textContent = data.emotions;
  if (cardEl) cardEl.style.borderColor = `${data.hex}44`;

  if (brandsEl) {
    brandsEl.innerHTML = "";
    data.brands.forEach((brand) => {
      const chip = document.createElement("span");
      chip.className = "brand-chip";
      chip.textContent = brand;
      brandsEl.appendChild(chip);
    });
  }
}

// Toast helper
function showFloatingToast(msg) {
  let toast = document.getElementById("home-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "home-toast";
    toast.style.position = "fixed";
    toast.style.bottom = "2rem";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%) translateY(100px)";
    toast.style.background = "rgba(15, 23, 42, 0.95)";
    toast.style.color = "#fff";
    toast.style.border = "1px solid #3b82f6";
    toast.style.padding = "0.75rem 1.6rem";
    toast.style.borderRadius = "999px";
    toast.style.boxShadow = "0 10px 30px rgba(0,0,0,0.6)";
    toast.style.fontSize = "0.9rem";
    toast.style.fontWeight = "600";
    toast.style.transition = "all 0.3s ease";
    toast.style.zIndex = "9999";
    document.body.appendChild(toast);
  }

  toast.textContent = msg;
  toast.style.opacity = "1";
  toast.style.transform = "translateX(-50%) translateY(0)";

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(100px)";
  }, 2200);
}

document.addEventListener("DOMContentLoaded", () => {
  initHeroStudio();
  initPsychologyMatrix();
});
