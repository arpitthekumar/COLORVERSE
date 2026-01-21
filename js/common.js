// Shared helpers for ColorVerse

function setActiveNav() {
  const body = document.body;
  const page = body.getAttribute("data-page");
  const links = document.querySelectorAll(".nav-links a[data-nav]");
  links.forEach((link) => {
    if (link.dataset.nav === page) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

function loadJSON(path) {
  return fetch(path).then((res) => {
    if (!res.ok) {
      throw new Error("Failed to load " + path);
    }
    return res.json();
  });
}

function applyThemeFromStorage() {
  try {
    const raw = localStorage.getItem("colorverseTheme");
    if (!raw) return;
    const theme = JSON.parse(raw);
    applyTheme(theme);
  } catch {
    // ignore
  }
}

function applyTheme(theme) {
  if (!theme || typeof theme !== "object") return;
  const root = document.documentElement;
  const map = {
    "--bg-0": theme.bg0,
    "--bg-1": theme.bg1,
    "--bg-2": theme.bg2,
    "--surface": theme.surface,
    "--text": theme.text,
    "--text-strong": theme.textStrong,
    "--muted": theme.muted,
    "--accent-1": theme.accent1,
    "--accent-2": theme.accent2,
  };
  Object.entries(map).forEach(([k, v]) => {
    if (typeof v === "string" && v.trim()) {
      root.style.setProperty(k, v);
    }
  });
  root.style.setProperty(
    "--accent-grad",
    `linear-gradient(135deg, var(--accent-1), var(--accent-2))`
  );
}

function saveTheme(theme) {
  try {
    localStorage.setItem("colorverseTheme", JSON.stringify(theme));
  } catch {
    // ignore
  }
}

function clearTheme() {
  try {
    localStorage.removeItem("colorverseTheme");
  } catch {
    // ignore
  }
  document.documentElement.removeAttribute("style");
}

document.addEventListener("DOMContentLoaded", () => {
  setActiveNav();
  applyThemeFromStorage();
});


