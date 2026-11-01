// ChromaTyper - Color Typing Speed Tester
// Features: Precise Time Deltas, Accuracy Algorithms, WPM/CPM, and Color Modes

// 1. Color Dictionaries by Mode
const COLOR_WORDS_EASY = [
  { word: "red", hex: "#EF4444" },
  { word: "blue", hex: "#3B82F6" },
  { word: "green", hex: "#10B981" },
  { word: "gold", hex: "#F59E0B" },
  { word: "pink", hex: "#EC4899" },
  { word: "teal", hex: "#14B8A6" },
  { word: "lime", hex: "#84CC16" },
  { word: "navy", hex: "#1E3A8A" },
  { word: "rose", hex: "#F43F5E" },
  { word: "cyan", hex: "#06B6D4" },
  { word: "ruby", hex: "#E11D48" },
  { word: "mint", hex: "#6EE7B7" },
  { word: "amber", hex: "#D97706" },
  { word: "gray", hex: "#6B7280" },
  { word: "aqua", hex: "#38BDF8" }
];

const COLOR_WORDS_MEDIUM = [
  { word: "turquoise", hex: "#2DD4BF" },
  { word: "vermilion", hex: "#E63946" },
  { word: "periwinkle", hex: "#818CF8" },
  { word: "chartreuse", hex: "#A3E635" },
  { word: "cerulean", hex: "#0284C7" },
  { word: "magenta", hex: "#D946EF" },
  { word: "lavender", hex: "#C084FC" },
  { word: "burgundy", hex: "#831843" },
  { word: "aquamarine", hex: "#5EEAD4" },
  { word: "indigo", hex: "#6366F1" },
  { word: "coral", hex: "#FB7185" },
  { word: "crimson", hex: "#DC2626" },
  { word: "emerald", hex: "#059669" },
  { word: "saffron", hex: "#FBBF24" },
  { word: "amethyst", hex: "#9333EA" }
];

const COLOR_WORDS_HEX = [
  { word: "#3B82F6", hex: "#3B82F6" },
  { word: "#EF4444", hex: "#EF4444" },
  { word: "complementary", hex: "#6366F1" },
  { word: "#10B981", hex: "#10B981" },
  { word: "monochromatic", hex: "#06B6D4" },
  { word: "#8B5CF6", hex: "#8B5CF6" },
  { word: "analogous", hex: "#F59E0B" },
  { word: "#EC4899", hex: "#EC4899" },
  { word: "triadic", hex: "#F43F5E" },
  { word: "#0284C7", hex: "#0284C7" },
  { word: "saturation", hex: "#14B8A6" },
  { word: "luminance", hex: "#FACC15" },
  { word: "#84CC16", hex: "#84CC16" },
  { word: "warm-cool", hex: "#FB923C" }
];

const STROOP_PAIRS = [
  { word: "blue", displayColor: "#EF4444", hex: "#3B82F6" },
  { word: "green", displayColor: "#F59E0B", hex: "#10B981" },
  { word: "red", displayColor: "#3B82F6", hex: "#EF4444" },
  { word: "yellow", displayColor: "#8B5CF6", hex: "#FACC15" },
  { word: "purple", displayColor: "#10B981", hex: "#8B5CF6" },
  { word: "pink", displayColor: "#06B6D4", hex: "#EC4899" },
  { word: "orange", displayColor: "#3B82F6", hex: "#F97316" }
];

// State variables
let currentMode = "easy";
let testDuration = 30; // seconds
let activeWordList = [];
let currentWordIndex = 0;
let isRunning = false;
let startTime = null;
let timerInterval = null;

// Algorithm Tracking Metrics
let totalCharactersTyped = 0;
let correctCharactersTyped = 0;
let errorCount = 0;
let completedWordResults = [];

// DOM Elements
const wordsDisplay = document.getElementById("words-display");
const typingInput = document.getElementById("typing-input");
const restartBtn = document.getElementById("restart-btn");
const timerVal = document.getElementById("timer-val");
const wpmVal = document.getElementById("wpm-val");
const accuracyVal = document.getElementById("accuracy-val");
const cpmVal = document.getElementById("cpm-val");
const colorPreviewDot = document.getElementById("current-color-dot");
const colorPreviewName = document.getElementById("current-color-name");
const stageCard = document.getElementById("typing-stage");
const modeButtons = document.querySelectorAll(".mode-pill-btn");
const durationChips = document.querySelectorAll(".duration-chip");

// Results Elements
const resultCard = document.getElementById("typing-result-card");
const resultWpm = document.getElementById("result-wpm");
const resultAccuracy = document.getElementById("result-accuracy");
const resultCpm = document.getElementById("result-cpm");
const resultTime = document.getElementById("result-time");
const resultErrors = document.getElementById("result-errors");
const resultRank = document.getElementById("result-rank");
const playAgainBtn = document.getElementById("play-again-btn");
const copyResultBtn = document.getElementById("copy-result-btn");

/**
 * Generate a randomized word queue based on selected mode
 */
function generateWordQueue() {
  let source = COLOR_WORDS_EASY;
  if (currentMode === "medium") source = COLOR_WORDS_MEDIUM;
  else if (currentMode === "hex") source = COLOR_WORDS_HEX;
  else if (currentMode === "stroop") source = STROOP_PAIRS;

  const queue = [];
  for (let i = 0; i < 70; i++) {
    const item = source[Math.floor(Math.random() * source.length)];
    queue.push(item);
  }
  return queue;
}

/**
 * Render word chips into the display box
 */
function renderWords() {
  if (!wordsDisplay) return;
  wordsDisplay.innerHTML = "";

  activeWordList.forEach((item, idx) => {
    const chip = document.createElement("span");
    chip.className = "word-chip";
    chip.id = `word-${idx}`;

    if (idx === currentWordIndex) {
      chip.classList.add("current");
    }

    // Stroop mode: font color differs from word
    if (currentMode === "stroop" && item.displayColor) {
      chip.style.color = item.displayColor;
      chip.style.fontWeight = "700";
    }

    chip.textContent = item.word;
    wordsDisplay.appendChild(chip);
  });

  updateColorSpotlight();
}

/**
 * Update the color preview badge and glow based on the current word
 */
function updateColorSpotlight() {
  const currentItem = activeWordList[currentWordIndex];
  if (!currentItem) return;

  const activeHex = currentItem.hex || "#3B82F6";
  if (colorPreviewDot) colorPreviewDot.style.backgroundColor = activeHex;
  if (colorPreviewName) colorPreviewName.textContent = currentItem.word.toUpperCase();
  if (stageCard) stageCard.style.borderColor = `${activeHex}66`;
}

/**
 * Reset and initialize test
 */
function resetTest() {
  clearInterval(timerInterval);
  timerInterval = null;
  isRunning = false;
  startTime = null;

  totalCharactersTyped = 0;
  correctCharactersTyped = 0;
  errorCount = 0;
  currentWordIndex = 0;
  completedWordResults = [];

  // Reset UI
  if (typingInput) {
    typingInput.value = "";
    typingInput.disabled = false;
    typingInput.placeholder = "Start typing here to begin timer...";
  }

  if (timerVal) timerVal.textContent = testDuration;
  if (wpmVal) wpmVal.textContent = "0";
  if (accuracyVal) accuracyVal.textContent = "100%";
  if (cpmVal) cpmVal.textContent = "0";

  if (resultCard) resultCard.style.display = "none";
  if (stageCard) stageCard.style.display = "flex";

  activeWordList = generateWordQueue();
  renderWords();

  if (typingInput) typingInput.focus();
}

/**
 * Start live timer on first keystroke (Time Deltas Algorithm)
 */
function startTimer() {
  isRunning = true;
  startTime = performance.now();

  timerInterval = setInterval(() => {
    // 1. Time Delta Calculation
    const now = performance.now();
    const elapsedSeconds = (now - startTime) / 1000;
    const remainingSeconds = Math.max(0, testDuration - Math.floor(elapsedSeconds));

    if (timerVal) timerVal.textContent = remainingSeconds;

    // 2. Real-time WPM & Accuracy calculation
    calculateLiveMetrics(elapsedSeconds);

    if (remainingSeconds <= 0) {
      finishTest(elapsedSeconds);
    }
  }, 100);
}

/**
 * Calculate live WPM, CPM, and Accuracy metrics
 */
function calculateLiveMetrics(elapsedSeconds) {
  if (elapsedSeconds <= 0) return;
  const elapsedMinutes = elapsedSeconds / 60;

  // International standard: 5 characters = 1 word
  const grossWPM = Math.round((totalCharactersTyped / 5) / elapsedMinutes);
  const netWPM = Math.max(0, Math.round(((correctCharactersTyped / 5) - errorCount) / elapsedMinutes));
  const cpm = Math.round(correctCharactersTyped / elapsedMinutes);

  // Accuracy calculation algorithm
  const accuracy = totalCharactersTyped === 0 ? 100 : Math.max(0, Math.round((correctCharactersTyped / totalCharactersTyped) * 100));

  if (wpmVal) wpmVal.textContent = netWPM;
  if (accuracyVal) accuracyVal.textContent = `${accuracy}%`;
  if (cpmVal) cpmVal.textContent = cpm;
}

/**
 * Handle input typing events
 */
function handleInput(e) {
  const currentItem = activeWordList[currentWordIndex];
  if (!currentItem) return;

  const targetWord = currentItem.word;
  const typedValue = typingInput.value;

  // Start timer on first keystroke
  if (!isRunning && typedValue.length > 0) {
    startTimer();
  }

  // Handle Spacebar (Word Submission)
  if (typedValue.endsWith(" ")) {
    const trimmedInput = typedValue.trim();
    if (trimmedInput.length === 0) {
      typingInput.value = "";
      return;
    }

    submitWord(trimmedInput, targetWord);
    typingInput.value = "";
    return;
  }

  // Character-by-character live validation
  renderCharacterFeedback(typedValue, targetWord);
}

/**
 * Provide character-by-character visual feedback on current word
 */
function renderCharacterFeedback(typed, target) {
  const currentChip = document.getElementById(`word-${currentWordIndex}`);
  if (!currentChip) return;

  let hasError = false;
  let html = "";

  for (let i = 0; i < target.length; i++) {
    const targetChar = target[i];
    const typedChar = typed[i];

    if (typedChar === undefined) {
      html += `<span class="char-span ${i === typed.length ? "cursor" : ""}">${targetChar}</span>`;
    } else if (typedChar === targetChar) {
      html += `<span class="char-span correct">${targetChar}</span>`;
    } else {
      hasError = true;
      html += `<span class="char-span incorrect">${targetChar}</span>`;
    }
  }

  currentChip.innerHTML = html;

  if (hasError) {
    typingInput.classList.add("input-error");
  } else {
    typingInput.classList.remove("input-error");
  }
}

/**
 * Submit word and update algorithm totals
 */
function submitWord(typed, target) {
  const isMatch = typed === target;
  const currentChip = document.getElementById(`word-${currentWordIndex}`);

  // Track keystrokes
  totalCharactersTyped += typed.length + 1; // +1 for space
  if (isMatch) {
    correctCharactersTyped += target.length + 1;
    if (currentChip) {
      currentChip.className = "word-chip completed correct";
    }
  } else {
    errorCount++;
    // Partial accuracy
    let matching = 0;
    for (let i = 0; i < Math.min(typed.length, target.length); i++) {
      if (typed[i] === target[i]) matching++;
    }
    correctCharactersTyped += matching;
    if (currentChip) {
      currentChip.className = "word-chip completed incorrect";
    }
  }

  completedWordResults.push({ typed, target, isMatch });
  currentWordIndex++;

  // Advance word chip styling
  const nextChip = document.getElementById(`word-${currentWordIndex}`);
  if (nextChip) {
    nextChip.classList.add("current");
    // Scroll view if needed
    if (nextChip.offsetTop > wordsDisplay.scrollTop + 120) {
      wordsDisplay.scrollTop = nextChip.offsetTop - 40;
    }
  }

  updateColorSpotlight();
}

/**
 * Evaluate rank and badge based on WPM
 */
function getRankBadge(wpm, accuracy) {
  if (wpm >= 70 && accuracy >= 95) return { title: "⚡ Prism Speed Demon", color: "#ec4899" };
  if (wpm >= 50 && accuracy >= 90) return { title: "🎨 Chromatic Virtuoso", color: "#8b5cf6" };
  if (wpm >= 35 && accuracy >= 80) return { title: "🖌️ Palette Master", color: "#3b82f6" };
  if (wpm >= 20) return { title: "🌈 Color Apprentice", color: "#10b981" };
  return { title: "🌱 Color Explorer", color: "#f59e0b" };
}

/**
 * Finish test and display results
 */
function finishTest(elapsedSeconds) {
  clearInterval(timerInterval);
  timerInterval = null;
  isRunning = false;

  if (typingInput) typingInput.disabled = true;

  const elapsedMinutes = Math.max(0.1, elapsedSeconds / 60);
  const netWPM = Math.max(0, Math.round(((correctCharactersTyped / 5) - errorCount) / elapsedMinutes));
  const cpm = Math.round(correctCharactersTyped / elapsedMinutes);
  const accuracy = totalCharactersTyped === 0 ? 100 : Math.max(0, Math.round((correctCharactersTyped / totalCharactersTyped) * 100));
  const rank = getRankBadge(netWPM, accuracy);

  // Update Result Card
  if (resultWpm) resultWpm.textContent = netWPM;
  if (resultAccuracy) resultAccuracy.textContent = `${accuracy}%`;
  if (resultCpm) resultCpm.textContent = cpm;
  if (resultTime) resultTime.textContent = `${elapsedSeconds.toFixed(1)}s`;
  if (resultErrors) resultErrors.textContent = errorCount;

  if (resultRank) {
    resultRank.textContent = rank.title;
    resultRank.style.color = rank.color;
    resultRank.style.borderColor = rank.color;
  }

  if (stageCard) stageCard.style.display = "none";
  if (resultCard) resultCard.style.display = "block";

  // Optionally verify with Python API
  verifyWithPythonBackend(netWPM, accuracy, elapsedSeconds);
}

/**
 * Send results to Python Backend for verified evaluation
 */
function verifyWithPythonBackend(wpm, accuracy, timeSeconds) {
  fetch("/api/typing-eval", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      wpm,
      accuracy,
      time_seconds: timeSeconds,
      mode: currentMode,
      total_chars: totalCharactersTyped
    })
  })
    .then((r) => r.json())
    .then((data) => {
      if (data && data.status === "verified") {
        console.log("Verified by ColorVerse Python Backend:", data);
      }
    })
    .catch(() => {
      // Backend optional
    });
}

/**
 * Copy test results to clipboard
 */
function copyTestResults() {
  const wpm = resultWpm ? resultWpm.textContent : "0";
  const acc = resultAccuracy ? resultAccuracy.textContent : "100%";
  const rank = resultRank ? resultRank.textContent : "Color Typist";

  const shareText = `ColorVerse ChromaTyper Results\n` +
    `-----------------------------------\n` +
    `Speed   : ${wpm} WPM\n` +
    `Accuracy: ${acc}\n` +
    `Rank    : ${rank}\n` +
    `Mode    : ${currentMode.toUpperCase()}\n` +
    `Tested on ColorVerse (http://localhost:5000/typing.html)`;

  navigator.clipboard.writeText(shareText).then(() => {
    alert("Results copied to clipboard!");
  });
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  // Input event
  if (typingInput) {
    typingInput.addEventListener("input", handleInput);
  }

  // Restart buttons
  if (restartBtn) restartBtn.addEventListener("click", resetTest);
  if (playAgainBtn) playAgainBtn.addEventListener("click", resetTest);
  if (copyResultBtn) copyResultBtn.addEventListener("click", copyTestResults);

  // Mode Selection
  modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      modeButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentMode = btn.dataset.mode;
      resetTest();
    });
  });

  // Duration Selection
  durationChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      durationChips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      testDuration = parseInt(chip.dataset.time, 10);
      resetTest();
    });
  });

  // Initial setup
  resetTest();
});
