"""
ColorVerse - Python Flask Backend & API Server
Serves static web pages and provides Python-powered color manipulation & QR Code generation.
"""

import io
import base64
import os
import random
import sys
from flask import Flask, send_from_directory, request, jsonify, send_file
import qrcode
from PIL import Image

# Ensure UTF-8 output on Windows consoles
if sys.stdout.encoding != "utf-8" and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Initialize Flask app
# Static folder is the current directory so that HTML, CSS, JS, and data files are served
app = Flask(__name__, static_folder=".", static_url_path="")

# Color knowledge base in Python
COLOR_MOODS = {
    "red": ("Passion, Energy & Urgency", "Warm"),
    "orange": ("Enthusiasm, Creativity & Warmth", "Warm"),
    "yellow": ("Optimism, Clarity & Joy", "Warm"),
    "green": ("Growth, Balance, Nature & Health", "Cool"),
    "blue": ("Trust, Serenity, Wisdom & Logic", "Cool"),
    "purple": ("Royalty, Luxury, Mystery & Spirit", "Cool"),
    "pink": ("Compassion, Romance, Softness", "Warm"),
    "teal": ("Rejuvenation, Clarity & Calm", "Cool"),
    "gray": ("Neutrality, Balance & Formal", "Neutral"),
    "dark": ("Sophistication, Power & Elegance", "Neutral"),
    "light": ("Purity, Minimalism & Freshness", "Neutral")
}

def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip("#")
    if len(hex_str) == 3:
        hex_str = "".join([c * 2 for c in hex_str])
    if len(hex_str) != 6:
        return (59, 130, 246)
    return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))

def rgb_to_hex(r, g, b):
    return f"#{r:02X}{g:02X}{b:02X}"

def get_luminance(r, g, b):
    # Standard perceived luminance (YIQ)
    return (r * 299 + g * 587 + b * 114) / 1000

def get_contrast_color(hex_str):
    r, g, b = hex_to_rgb(hex_str)
    lum = get_luminance(r, g, b)
    return "#090D16" if lum >= 128 else "#FFFFFF"

def classify_color(hex_str):
    r, g, b = hex_to_rgb(hex_str)
    # Simple color psychology heuristic
    if max(r, g, b) - min(r, g, b) < 25:
        if (r + g + b) / 3 < 60:
            return "dark"
        elif (r + g + b) / 3 > 200:
            return "light"
        return "gray"
    if r > g and r > b:
        if g > 150 and b < 100:
            return "orange"
        if b > 140:
            return "pink"
        return "red"
    elif g > r and g > b:
        if b > 140:
            return "teal"
        if r > 180:
            return "yellow"
        return "green"
    else:
        if r > 120:
            return "purple"
        return "blue"


# ----------------- Static Page Routes -----------------

@app.route("/")
def index():
    return send_from_directory(".", "index.html")

@app.route("/<path:path>")
def serve_file(path):
    if os.path.exists(path):
        return send_from_directory(".", path)
    return send_from_directory(".", "index.html")


# ----------------- Python API Endpoints -----------------

@app.route("/api/info", methods=["GET"])
def api_info():
    """Return backend status and Python environment details."""
    return jsonify({
        "status": "online",
        "engine": "ColorVerse Python Backend",
        "python_version": sys.version.split()[0],
        "framework": "Flask",
        "libraries": ["qrcode", "Pillow (PIL)", "json"],
        "endpoints": [
            "/api/info",
            "/api/color-flip",
            "/api/qr",
            "/api/analyze"
        ]
    })

@app.route("/api/color-flip", methods=["GET"])
def api_color_flip():
    """Generate a random color using Python's random library and classify it."""
    hex_chars = "0123456789ABCDEF"
    random_hex = "#" + "".join(random.choice(hex_chars) for _ in range(6))
    r, g, b = hex_to_rgb(random_hex)
    contrast = get_contrast_color(random_hex)
    family = classify_color(random_hex)
    mood, temp = COLOR_MOODS.get(family, ("Modern & Dynamic", "Neutral"))

    return jsonify({
        "hex": random_hex,
        "rgb": f"rgb({r}, {g}, {b})",
        "r": r,
        "g": g,
        "b": b,
        "contrast_text": contrast,
        "color_family": family.capitalize(),
        "temperature": temp,
        "mood_association": mood,
        "engine": "Python random.choice"
    })

@app.route("/api/qr", methods=["GET", "POST"])
def api_generate_qr():
    """
    Generate a QR Code for a color code using Python qrcode & PIL.
    Returns either a JSON response with base64 Data URL or direct image/png.
    """
    if request.method == "POST":
        data = request.get_json(silent=True) or {}
        color = data.get("color", "#3B82F6")
        text = data.get("text", color)
        fill_color = data.get("fill_color", color)
        back_color = data.get("back_color", "#FFFFFF")
        box_size = int(data.get("box_size", 8))
        return_binary = bool(data.get("binary", False))
    else:
        color = request.args.get("color", "#3B82F6")
        text = request.args.get("text", color)
        fill_color = request.args.get("fill_color", color)
        back_color = request.args.get("back_color", "#FFFFFF")
        box_size = int(request.args.get("box_size", 8))
        return_binary = request.args.get("binary", "0") in ["1", "true", "True"]

    # Generate QR Code using python-qrcode
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=max(4, min(box_size, 20)),
        border=3,
    )
    qr.add_data(text)
    qr.make(fit=True)

    try:
        img = qr.make_image(fill_color=fill_color, back_color=back_color)
    except Exception:
        # Fallback to standard black & white if color format fails
        img = qr.make_image(fill_color="#000000", back_color="#FFFFFF")

    # Save to memory buffer
    buffer = io.BytesIO()
    try:
        img.save(buffer, format="PNG")
    except TypeError:
        img.save(buffer)
    buffer.seek(0)

    if return_binary:
        return send_file(
            buffer,
            mimetype="image/png",
            as_attachment=False,
            download_name=f"color_{color.lstrip('#')}_qr.png"
        )

    # Convert to base64 Data URL for easy embedding in frontend
    encoded_img = base64.b64encode(buffer.getvalue()).decode("utf-8")
    data_url = f"data:image/png;base64,{encoded_img}"

    return jsonify({
        "success": True,
        "color": color,
        "encoded_text": text,
        "fill_color": fill_color,
        "back_color": back_color,
        "data_url": data_url,
        "engine": "Python qrcode + PIL/Pillow"
    })

@app.route("/api/analyze", methods=["GET"])
def api_analyze_color():
    """Analyze any color passed in query parameter `hex`."""
    color_hex = request.args.get("hex", "#3B82F6")
    if not color_hex.startswith("#"):
        color_hex = "#" + color_hex
    r, g, b = hex_to_rgb(color_hex)
    family = classify_color(color_hex)
    mood, temp = COLOR_MOODS.get(family, ("Custom Hue", "Dynamic"))

    return jsonify({
        "hex": color_hex.upper(),
        "rgb": f"rgb({r}, {g}, {b})",
        "luminance": round(get_luminance(r, g, b), 2),
        "contrast_text": get_contrast_color(color_hex),
        "family": family.capitalize(),
        "temperature": temp,
        "psychology": mood
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"[*] ColorVerse Python Server starting on http://localhost:{port}")
    print(f"[*] Serving web application + Python QR Code API")
    print(f"[*] Press Ctrl+C to stop.")
    app.run(host="0.0.0.0", port=port, debug=True)
