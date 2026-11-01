#!/usr/bin/env python3
"""
ColorVerse Python CLI Tools
Generate random colors, create custom QR codes, and analyze color schemes.

Usage:
  python color_tools.py --flip
  python color_tools.py --qr "#3B82F6"
  python color_tools.py --analyze "#FF5733"
"""

import argparse
import random
import sys
import qrcode
from PIL import Image

# Ensure UTF-8 output on Windows consoles
if sys.stdout.encoding != "utf-8" and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

HEX_CHARS = "0123456789ABCDEF"

def generate_random_hex():
    """Generate 6-digit hex code using Python random."""
    return "#" + "".join(random.choice(HEX_CHARS) for _ in range(6))

def hex_to_rgb(hex_code):
    h = hex_code.lstrip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def generate_color_qr(color_hex, output_file=None, custom_data=None):
    """Generate a high-quality QR code styled with the given color using Python."""
    data = custom_data if custom_data else f"ColorVerse Color: {color_hex}"
    filename = output_file if output_file else f"qr_{color_hex.lstrip('#')}.png"

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=3,
    )
    qr.add_data(data)
    qr.make(fit=True)

    try:
        img = qr.make_image(fill_color=color_hex, back_color="white")
    except Exception:
        img = qr.make_image(fill_color="black", back_color="white")

    img.save(filename)
    print(f"[OK] Generated Python QR code for {color_hex} saved to: {filename}")
    return filename

def main():
    parser = argparse.ArgumentParser(description="ColorVerse Python Color & QR CLI")
    parser.add_argument("--flip", action="store_true", help="Generate a random color using Python")
    parser.add_argument("--qr", type=str, help="Generate a QR code image for the given hex color (e.g. '#3B82F6')")
    parser.add_argument("--out", type=str, help="Output filename for QR code (default: qr_<hex>.png)")
    parser.add_argument("--analyze", type=str, help="Analyze color RGB and luminance")

    args = parser.parse_args()

    if args.flip:
        color = generate_random_hex()
        rgb = hex_to_rgb(color)
        print("=" * 45)
        print(f"[*] ColorVerse Python Random Flip")
        print(f"   Hex Code : {color}")
        print(f"   RGB      : rgb({rgb[0]}, {rgb[1]}, {rgb[2]})")
        print("=" * 45)

    if args.qr:
        color = args.qr if args.qr.startswith("#") else "#" + args.qr
        generate_color_qr(color, output_file=args.out)

    if args.analyze:
        color = args.analyze if args.analyze.startswith("#") else "#" + args.analyze
        rgb = hex_to_rgb(color)
        lum = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000
        print(f"Color: {color}")
        print(f"RGB: {rgb}")
        print(f"Perceived Luminance: {lum:.1f}/255 ({'Light' if lum >= 128 else 'Dark'})")

    if not args.flip and not args.qr and not args.analyze:
        color = generate_random_hex()
        print(f"[*] Generated Color: {color}")
        generate_color_qr(color)

if __name__ == "__main__":
    main()
