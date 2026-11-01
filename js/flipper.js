// Color Flipper Logic for ColorVerse
// Demonstrates Hex Code Generation, Math.random(), and Dynamic DOM Styling

// 1. Hex character array
const hex = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "A", "B", "C", "D", "E", "F"];

// 2. Curated named colors for "Simple" mode
const simpleColors = [
  { name: "Crimson Red", hex: "#EF4444" },
  { name: "Electric Blue", hex: "#3B82F6" },
  { name: "Emerald Green", hex: "#10B981" },
  { name: "Amber Sun", hex: "#F59E0B" },
  { name: "Deep Violet", hex: "#8B5CF6" },
  { name: "Neon Pink", hex: "#EC4899" },
  { name: "Cyan Spark", hex: "#06B6D4" },
  { name: "Sunset Orange", hex: "#F97316" },
  { name: "Lime Glow", hex: "#84CC16" },
  { name: "Royal Indigo", hex: "#6366F1" },
  { name: "Teal Breeze", hex: "#14B8A6" },
  { name: "Rose Coral", hex: "#F43F5E" }
];

// State
let currentMode = "hex"; // "hex" | "simple" | "rgb"
let autoFlipInterval = null;
let colorHistory = [];
let targetFullBody = false;

// DOM Elements
const stageCard = document.getElementById("flipper-stage");
const colorDisplay = document.getElementById("color-code-display");
const modeBadge = document.getElementById("mode-badge");
const rgbChip = document.getElementById("rgb-chip");
const contrastChip = document.getElementById("contrast-chip");
const flipBtn = document.getElementById("flip-btn");
const copyBtn = document.getElementById("copy-btn");
const autoFlipBtn = document.getElementById("auto-flip-btn");
const modeTabs = document.querySelectorAll(".mode-tab-btn");
const historyStrip = document.getElementById("history-strip");
const clearHistoryBtn = document.getElementById("clear-history-btn");
const targetBodyCheckbox = document.getElementById("target-body-toggle");
const toast = document.getElementById("toast-notice");
const toastMsg = document.getElementById("toast-msg");

/**
 * Generate a random 6-character Hex color using Math.random()
 */
function getRandomHex() {
  let hexColor = "#";
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * hex.length);
    hexColor += hex[randomIndex];
  }
  return hexColor;
}

/**
 * Generate a random RGB color using Math.random()
 */
function getRandomRGB() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return {
    hex: rgbToHex(r, g, b),
    rgbString: `rgb(${r}, ${g}, ${b})`
  };
}

/**
 * Helper to convert RGB to Hex
 */
function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((x) => x.toString(16).padStart(2, "0").toUpperCase())
      .join("")
  );
}

/**
 * Helper to convert Hex to RGB
 */
function hexToRGB(hexStr) {
  let c = hexStr.replace("#", "");
  if (c.length === 3) {
    c = c.split("").map((ch) => ch + ch).join("");
  }
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return { r, g, b, string: `rgb(${r}, ${g}, ${b})` };
}

/**
 * Calculate luminance to dynamically adjust text contrast (DOM styling)
 */
function getContrastColor(hexStr) {
  const { r, g, b } = hexToRGB(hexStr);
  // Perceived brightness formula (YIQ)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#090d16" : "#ffffff";
}

/**
 * Apply the generated color to the DOM
 */
function applyColor(colorHex, customLabel = null) {
  const contrastColor = getContrastColor(colorHex);
  const rgbInfo = hexToRGB(colorHex);

  // 1. DOM Styling: update stage background
  if (stageCard) {
    stageCard.style.backgroundColor = colorHex;
    stageCard.style.boxShadow = `0 20px 50px ${colorHex}55`;
    stageCard.style.borderColor = `${contrastColor}33`;
  }

  // 2. Optional: Full page background styling
  if (targetFullBody) {
    document.body.style.backgroundColor = colorHex;
  }

  // 3. Update Text and contrast
  if (colorDisplay) {
    colorDisplay.textContent = colorHex;
    colorDisplay.style.color = contrastColor;
  }

  // 4. Update Meta details
  if (rgbChip) {
    rgbChip.textContent = rgbInfo.string;
    rgbChip.style.color = contrastColor;
  }

  if (contrastChip) {
    contrastChip.textContent = contrastColor === "#ffffff" ? "Dark Theme Tone" : "Light Theme Tone";
    contrastChip.style.color = contrastColor;
  }

  if (modeBadge) {
    if (customLabel) {
      modeBadge.textContent = `${customLabel} • ${currentMode.toUpperCase()}`;
    } else {
      modeBadge.textContent = `${currentMode.toUpperCase()} COLOR`;
    }
    modeBadge.style.color = contrastColor;
    modeBadge.style.borderColor = `${contrastColor}44`;
  }

  // 5. Save to History
  addToHistory(colorHex, contrastColor);
}

/**
 * Flip the color based on active mode
 */
function flipColor() {
  let selectedColor = "";
  let label = null;

  if (currentMode === "hex") {
    selectedColor = getRandomHex();
  } else if (currentMode === "simple") {
    const randomIndex = Math.floor(Math.random() * simpleColors.length);
    const item = simpleColors[randomIndex];
    selectedColor = item.hex;
    label = item.name;
  } else if (currentMode === "rgb") {
    const gen = getRandomRGB();
    selectedColor = gen.hex;
  }

  applyColor(selectedColor, label);
}

/**
 * Add flipped color to the history palette strip
 */
function addToHistory(hexCode, contrastColor) {
  if (colorHistory.length > 0 && colorHistory[0] === hexCode) return;

  colorHistory.unshift(hexCode);
  if (colorHistory.length > 12) colorHistory.pop();

  renderHistory();
}

/**
 * Render history swatches
 */
function renderHistory() {
  if (!historyStrip) return;

  if (colorHistory.length === 0) {
    historyStrip.innerHTML = `<p class="history-empty-msg">No colors flipped yet. Click "Flip Color" to start collecting!</p>`;
    return;
  }

  historyStrip.innerHTML = "";
  colorHistory.forEach((itemHex) => {
    const swatch = document.createElement("button");
    swatch.className = "history-swatch";
    swatch.style.backgroundColor = itemHex;
    const txtColor = getContrastColor(itemHex);
    swatch.style.color = txtColor;
    swatch.textContent = itemHex.slice(1);
    swatch.title = `Click to re-apply ${itemHex}`;

    swatch.addEventListener("click", () => {
      applyColor(itemHex);
      showToast(`Restored ${itemHex}`);
    });

    historyStrip.appendChild(swatch);
  });
}

/**
 * Copy Hex code to clipboard with Toast
 */
function copyHexToClipboard() {
  const code = colorDisplay ? colorDisplay.textContent.trim() : "";
  if (!code) return;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code).then(() => {
      showToast(`Copied ${code} to clipboard!`);
    });
  } else {
    // Fallback
    const input = document.createElement("input");
    input.value = code;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
    showToast(`Copied ${code} to clipboard!`);
  }
}

/**
 * Display toast notification
 */
function showToast(message) {
  if (!toast || !toastMsg) return;
  toastMsg.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

/**
 * Toggle auto-flip loop
 */
function toggleAutoFlip() {
  if (autoFlipInterval) {
    clearInterval(autoFlipInterval);
    autoFlipInterval = null;
    autoFlipBtn.classList.remove("active-toggle");
    autoFlipBtn.innerHTML = `<span>▶</span> Auto Flip`;
    showToast("Auto-flip paused");
  } else {
    flipColor();
    autoFlipInterval = setInterval(flipColor, 1500);
    autoFlipBtn.classList.add("active-toggle");
    autoFlipBtn.innerHTML = `<span>⏸</span> Pause Auto`;
    showToast("Auto-flip started (every 1.5s)");
  }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  // Mode tabs
  modeTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      modeTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentMode = tab.dataset.mode;
      flipColor();
    });
  });

  // Flip button
  if (flipBtn) {
    flipBtn.addEventListener("click", flipColor);
  }

  // Copy click on text and copy button
  if (copyBtn) {
    copyBtn.addEventListener("click", copyHexToClipboard);
  }
  if (colorDisplay) {
    colorDisplay.addEventListener("click", copyHexToClipboard);
  }

  // Auto flip button
  if (autoFlipBtn) {
    autoFlipBtn.addEventListener("click", toggleAutoFlip);
  }

  // Target toggle (Stage vs Full Page Body)
  if (targetBodyCheckbox) {
    targetBodyCheckbox.addEventListener("change", (e) => {
      targetFullBody = e.target.checked;
      if (!targetFullBody) {
        document.body.style.backgroundColor = "";
      } else {
        const currentHex = colorDisplay.textContent.trim();
        if (currentHex) document.body.style.backgroundColor = currentHex;
      }
    });
  }

  // Clear history
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", () => {
      colorHistory = [];
      renderHistory();
      showToast("Color history cleared");
    });
  }

  // Spacebar shortcut to flip
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
      e.preventDefault();
      flipColor();
    }
  });

  // Initial flip
  flipColor();
});
