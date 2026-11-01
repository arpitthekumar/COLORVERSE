// Color Flipper Logic for ColorVerse
// Demonstrates Hex Code Generation, Math.random(), Dynamic DOM Styling, and Python QR Code Generation

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
let activeHex = "#3B82F6";
let activeLabel = null;
let autoFlipInterval = null;
let colorHistory = [];
let targetFullBody = false;
let isPythonConnected = false;

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

// QR Elements
const qrImg = document.getElementById("qr-img");
const qrCaption = document.getElementById("qr-caption");
const pythonStatusBadge = document.getElementById("python-status-badge");
const pythonStatusText = document.getElementById("python-status-text");
const qrEncodeSelect = document.getElementById("qr-encode-select");
const qrColorToggle = document.getElementById("qr-color-toggle");
const downloadQrBtn = document.getElementById("download-qr-btn");
const copyQrInfoBtn = document.getElementById("copy-qr-info-btn");

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
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#090d16" : "#ffffff";
}

/**
 * Apply or reset the full-page background color
 */
function updatePageBackground(colorHex) {
  const root = document.documentElement;
  const body = document.body;
  if (targetFullBody && colorHex) {
    root.classList.add("full-page-bg-active");
    body.classList.add("full-page-bg-active");
    root.style.setProperty("background-color", colorHex, "important");
    body.style.setProperty("background-color", colorHex, "important");
    root.style.setProperty("background-image", "none", "important");
    body.style.setProperty("background-image", "none", "important");
  } else {
    root.classList.remove("full-page-bg-active");
    body.classList.remove("full-page-bg-active");
    root.style.removeProperty("background-color");
    body.style.removeProperty("background-color");
    root.style.removeProperty("background-image");
    body.style.removeProperty("background-image");
  }
}

/**
 * Apply the generated color to the DOM and trigger QR generation
 */
function applyColor(colorHex, customLabel = null) {
  activeHex = colorHex;
  activeLabel = customLabel;
  const contrastColor = getContrastColor(colorHex);
  const rgbInfo = hexToRGB(colorHex);

  // 1. DOM Styling: update stage background
  if (stageCard) {
    stageCard.style.backgroundColor = colorHex;
    stageCard.style.boxShadow = `0 20px 50px ${colorHex}55`;
    stageCard.style.borderColor = `${contrastColor}33`;
  }

  // 2. Full page background styling (if enabled)
  updatePageBackground(colorHex);

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

  // 5. Update QR Code in real time
  updateQRCode();

  // 6. Save to History
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
 * Update the QR Code for the active color using Python API or client fallback
 */
function updateQRCode() {
  if (!qrImg) return;

  const hexCode = activeHex;
  const rgbInfo = hexToRGB(hexCode);
  const encodeMode = qrEncodeSelect ? qrEncodeSelect.value : "hex";
  const colorChoice = qrColorToggle ? qrColorToggle.value : "colored";

  // Determine text to encode
  let textToEncode = hexCode;
  if (encodeMode === "url") {
    const base = window.location.origin || "http://localhost:5000";
    textToEncode = `${base}/colors.html?color=${hexCode.replace("#", "")}`;
  } else if (encodeMode === "spec") {
    textToEncode = `ColorVerse\nHex: ${hexCode}\nRGB: ${rgbInfo.string}\nName: ${activeLabel || "Custom"}`;
  }

  // Foreground fill color
  const fillColor = colorChoice === "black" ? "#000000" : hexCode;

  if (qrCaption) {
    qrCaption.textContent = `${hexCode} • ${encodeMode.toUpperCase()}`;
  }

  // 1. Try Python Flask API: /api/qr
  const apiUrl = `/api/qr?color=${encodeURIComponent(hexCode)}&text=${encodeURIComponent(textToEncode)}&fill_color=${encodeURIComponent(fillColor)}&back_color=%23FFFFFF&box_size=8`;

  fetch(apiUrl)
    .then((res) => {
      if (!res.ok) throw new Error("Python API not responding");
      return res.json();
    })
    .then((data) => {
      if (data && data.data_url) {
        qrImg.src = data.data_url;
        isPythonConnected = true;
        if (pythonStatusText) pythonStatusText.textContent = "Python Backend (qrcode + PIL)";
        if (pythonStatusBadge) pythonStatusBadge.style.borderColor = "#10b981";
      }
    })
    .catch(() => {
      // 2. Client fallback if Python API is not running on this port
      const cleanColor = fillColor.replace("#", "");
      const fallbackUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(textToEncode)}&color=${cleanColor}&bgcolor=ffffff`;
      qrImg.src = fallbackUrl;
      if (pythonStatusText) pythonStatusText.textContent = "Python Ready (Run py app.py)";
    });
}

/**
 * Download QR Code as a PNG image
 */
function downloadQRCode() {
  if (!qrImg || !qrImg.src) return;

  const link = document.createElement("a");
  link.download = `colorverse_${activeHex.replace("#", "")}_qr.png`;

  // If data URI, download directly
  if (qrImg.src.startsWith("data:")) {
    link.href = qrImg.src;
    link.click();
    showToast(`Downloaded QR Code for ${activeHex}`);
  } else {
    // If remote or canvas, fetch as blob
    fetch(qrImg.src)
      .then((res) => res.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        link.href = blobUrl;
        link.click();
        URL.revokeObjectURL(blobUrl);
        showToast(`Downloaded QR Code for ${activeHex}`);
      })
      .catch(() => {
        window.open(qrImg.src, "_blank");
      });
  }
}

/**
 * Copy full color summary & QR info
 */
function copyQRColorSummary() {
  const rgbInfo = hexToRGB(activeHex);
  const summary = `ColorVerse Color Information\n` +
    `--------------------------\n` +
    `HEX  : ${activeHex}\n` +
    `RGB  : ${rgbInfo.string}\n` +
    `Tone : ${getContrastColor(activeHex) === "#ffffff" ? "Dark Theme Tone" : "Light Theme Tone"}\n` +
    `Label: ${activeLabel || "Random Hex"}\n` +
    `Web  : ${window.location.origin}/colors.html?color=${activeHex.replace("#", "")}`;

  navigator.clipboard.writeText(summary).then(() => {
    showToast(`Copied full color specification for ${activeHex}`);
  });
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

/**
 * Check Python Backend connection on startup
 */
function checkPythonBackend() {
  fetch("/api/info")
    .then((r) => r.json())
    .then((data) => {
      if (data && data.status === "online") {
        isPythonConnected = true;
        if (pythonStatusText) {
          pythonStatusText.textContent = `Python ${data.python_version} API Connected`;
        }
        if (pythonStatusBadge) {
          pythonStatusBadge.style.borderColor = "#10b981";
        }
      }
    })
    .catch(() => {
      if (pythonStatusText) {
        pythonStatusText.textContent = "Run: py app.py (Python API)";
      }
    });
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  // Check Python API status
  checkPythonBackend();

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
      updatePageBackground(activeHex);
      showToast(targetFullBody ? "Whole page background enabled" : "Restored card-only mode");
    });
  }

  // QR Settings change handlers
  if (qrEncodeSelect) {
    qrEncodeSelect.addEventListener("change", updateQRCode);
  }
  if (qrColorToggle) {
    qrColorToggle.addEventListener("change", updateQRCode);
  }
  if (downloadQrBtn) {
    downloadQrBtn.addEventListener("click", downloadQRCode);
  }
  if (copyQrInfoBtn) {
    copyQrInfoBtn.addEventListener("click", copyQRColorSummary);
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
    if (e.code === "Space" && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA" && e.target.tagName !== "SELECT") {
      e.preventDefault();
      flipColor();
    }
  });

  // Initial flip
  flipColor();
});
