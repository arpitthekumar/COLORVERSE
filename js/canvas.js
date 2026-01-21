document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("paint-canvas");
  const colorInput = document.getElementById("brush-color");
  const opacityInput = document.getElementById("brush-opacity");
  const opacityLabel = document.getElementById("brush-opacity-label");
  const sizeInput = document.getElementById("brush-size");
  const sizeLabel = document.getElementById("brush-size-label");
  const modeDrawBtn = document.getElementById("mode-draw");
  const modeEraseBtn = document.getElementById("mode-erase");
  const blendNormalBtn = document.getElementById("blend-normal");
  const blendMultiplyBtn = document.getElementById("blend-multiply");
  const blendScreenBtn = document.getElementById("blend-screen");
  const undoBtn = document.getElementById("undo-btn");
  const clearBtn = document.getElementById("clear-btn");

  if (!(canvas instanceof HTMLCanvasElement)) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let drawing = false;
  let mode = "draw"; // "draw" | "erase"
  let blend = "source-over"; // source-over | multiply | screen
  let strokes = [];
  let currentStroke = null;

  function resizeCanvasToDisplaySize() {
    const { width } = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    const height = (canvas.height / canvas.width) * width;
    const displayWidth = Math.floor(width * ratio);
    const displayHeight = Math.floor(height * ratio);

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      const saved = ctx.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      ctx.putImageData(saved, 0, 0);
    }
    ctx.scale(ratio, ratio);
  }

  function setBrush() {
    const size = parseInt(sizeInput?.value || "8", 10);
    const opacity = parseFloat(opacityInput?.value || "0.65");
    ctx.lineWidth = size;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    if (mode === "erase") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.globalAlpha = 1;
    } else {
      ctx.globalCompositeOperation = blend;
      ctx.globalAlpha = isFinite(opacity) ? opacity : 0.65;
      ctx.strokeStyle = colorInput?.value || "#ffffff";
    }
    if (sizeLabel) sizeLabel.textContent = size + " px";
    if (opacityLabel) opacityLabel.textContent = Math.round(opacity * 100) + "%";
  }

  function getPos(evt) {
    const rect = canvas.getBoundingClientRect();
    const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
    const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  function startStroke(evt) {
    drawing = true;
    currentStroke = {
      mode,
      blend,
      color: colorInput?.value || "#ffffff",
      opacity: parseFloat(opacityInput?.value || "0.65"),
      size: parseInt(sizeInput?.value || "8", 10),
      points: [],
    };
    const pos = getPos(evt);
    currentStroke.points.push(pos);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setBrush();
  }

  function moveStroke(evt) {
    if (!drawing || !currentStroke) return;
    const pos = getPos(evt);
    currentStroke.points.push(pos);
    setBrush();
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  function endStroke() {
    if (!drawing || !currentStroke) return;
    drawing = false;
    ctx.closePath();
    strokes.push(currentStroke);
    currentStroke = null;
  }

  function redrawAll() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokes.forEach((stroke) => {
      ctx.beginPath();
      ctx.lineWidth = stroke.size;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      if (stroke.mode === "erase") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.globalAlpha = 1;
      } else {
        ctx.globalCompositeOperation = stroke.blend || "source-over";
        ctx.globalAlpha =
          typeof stroke.opacity === "number" && isFinite(stroke.opacity)
            ? stroke.opacity
            : 0.65;
        ctx.strokeStyle = stroke.color;
      }
      stroke.points.forEach((p, i) => {
        if (i === 0) {
          ctx.moveTo(p.x, p.y);
        } else {
          ctx.lineTo(p.x, p.y);
        }
      });
      ctx.stroke();
      ctx.closePath();
    });
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
  }

  canvas.addEventListener("mousedown", (e) => startStroke(e));
  canvas.addEventListener("mousemove", (e) => moveStroke(e));
  document.addEventListener("mouseup", () => endStroke());

  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    startStroke(e);
  });
  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    moveStroke(e);
  });
  canvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    endStroke();
  });

  if (sizeInput) {
    sizeInput.addEventListener("input", () => {
      setBrush();
    });
  }

  if (opacityInput) {
    opacityInput.addEventListener("input", () => {
      setBrush();
    });
  }

  if (modeDrawBtn && modeEraseBtn) {
    modeDrawBtn.addEventListener("click", () => {
      mode = "draw";
      modeDrawBtn.classList.add("active");
      modeEraseBtn.classList.remove("active");
      setBrush();
    });
    modeEraseBtn.addEventListener("click", () => {
      mode = "erase";
      modeEraseBtn.classList.add("active");
      modeDrawBtn.classList.remove("active");
      setBrush();
    });
  }

  function setBlend(newBlend, activeBtn) {
    blend = newBlend;
    [blendNormalBtn, blendMultiplyBtn, blendScreenBtn].forEach((b) => {
      if (b) b.classList.remove("active");
    });
    if (activeBtn) activeBtn.classList.add("active");
    setBrush();
  }

  if (blendNormalBtn && blendMultiplyBtn && blendScreenBtn) {
    blendNormalBtn.addEventListener("click", () =>
      setBlend("source-over", blendNormalBtn)
    );
    blendMultiplyBtn.addEventListener("click", () =>
      setBlend("multiply", blendMultiplyBtn)
    );
    blendScreenBtn.addEventListener("click", () =>
      setBlend("screen", blendScreenBtn)
    );
  }

  if (undoBtn) {
    undoBtn.addEventListener("click", () => {
      strokes.pop();
      redrawAll();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      strokes = [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
  }

  setBrush();
});


