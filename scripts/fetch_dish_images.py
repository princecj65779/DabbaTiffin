"""Fetch real dish photos from Wikimedia Commons (freely licensed) into
frontend/public/dishes/. Falls back to a generated placeholder only when a
dish has no existing image, so custom app photos are not overwritten if a
network call fails.

Run this locally, or as part of the Render build command (see render.yaml) —
Render's build servers have normal internet access even in environments where
the coding session that authored this script did not.

    python scripts/fetch_dish_images.py
"""

from __future__ import annotations

import io
import sys
from pathlib import Path

import requests
from PIL import Image, ImageDraw, ImageFont

OUT_DIR = Path(__file__).resolve().parent.parent / "frontend" / "public" / "dishes"

USER_AGENT = "DabbaTiffin/1.0 (educational project; contact: repo-owner)"
COMMONS_API = "https://commons.wikimedia.org/w/api.php"

# slug -> (search query on Commons, dish display name, placeholder base color)
DISHES: dict[str, tuple[str, str, str]] = {
    "upma": ("Rava upma South Indian breakfast", "Upma", "#EDE7DA"),
    "jain-poha": ("Poha Indian breakfast", "Jain poha", "#EFE8D4"),
    "idli-sambhar": ("Idli sambar chutney", "Idli with sambhar", "#E7EDE3"),
    "masala-dosa-tiffin": ("Masala dosa sambar chutney", "Masala dosa tiffin", "#E9E0D2"),
    "thepla-curd": ("Gujarati thepla curd", "Thepla with curd", "#ECE4D4"),
    "paneer-paratha": ("Paneer paratha curd", "Paneer paratha", "#EFE2D4"),
    "sprouts-bowl": ("Moong sprouts salad Indian", "Sprouts bowl", "#E7EFEA"),
    "sabudana-khichdi": ("Sabudana khichdi", "Sabudana khichdi", "#E9E4DA"),
    "misal-pav": ("Misal pav Maharashtrian dish", "Misal pav", "#F0E3D6"),
    "rajma-chawal": ("Rajma chawal kidney beans rice", "Rajma chawal", "#E7EFEA"),
    "chole-chawal": ("Chole chawal chickpea curry rice", "Chole chawal", "#EFE4D8"),
    "jain-thali": ("Jain thali Indian food", "Jain mini thali", "#EDE6D8"),
    "gujarati-thali": ("Gujarati thali Indian meal", "Gujarati mini thali", "#EFE5D8"),
    "khichdi-kadhi": ("Khichdi kadhi Gujarati", "Khichdi kadhi", "#EFE9D9"),
    "dal-dhokli": ("Dal dhokli Gujarati dish", "Dal dhokli", "#E8DFD0"),
    "dal-makhani-rice": ("Dal makhani rice", "Dal makhani rice", "#E5D8CD"),
    "curd-rice": ("Curd rice South Indian", "Curd rice", "#ECEBE2"),
    "lemon-rice": ("Lemon rice South Indian", "Lemon rice", "#EFE8C8"),
    "millet-khichdi": ("Millet khichdi Indian", "Millet khichdi", "#E8E4D7"),
    "varan-bhaat": ("Varan bhaat Maharashtrian dal rice", "Varan bhaat", "#EFE7D3"),
}

TARGET_WIDTH = 640


def commons_image_url(query: str) -> str | None:
    params = {
        "action": "query",
        "generator": "search",
        "gsrsearch": f"{query} filetype:bitmap",
        "gsrnamespace": 6,
        "gsrlimit": 1,
        "prop": "imageinfo",
        "iiprop": "url",
        "iiurlwidth": TARGET_WIDTH,
        "format": "json",
    }
    resp = requests.get(
        COMMONS_API, params=params, headers={"User-Agent": USER_AGENT}, timeout=10
    )
    resp.raise_for_status()
    pages = resp.json().get("query", {}).get("pages", {})
    for page in pages.values():
        infos = page.get("imageinfo") or []
        if infos:
            return infos[0].get("thumburl") or infos[0].get("url")
    return None


def download_real_photo(slug: str, query: str, dest: Path) -> bool:
    try:
        url = commons_image_url(query)
        if not url:
            return False
        img_resp = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=15)
        img_resp.raise_for_status()
        img = Image.open(io.BytesIO(img_resp.content)).convert("RGB")
        if img.width > TARGET_WIDTH:
            ratio = TARGET_WIDTH / img.width
            img = img.resize((TARGET_WIDTH, int(img.height * ratio)))
        dest.parent.mkdir(parents=True, exist_ok=True)
        img.save(dest, "JPEG", quality=85)
        print(f"  [ok] downloaded real photo for {slug}")
        return True
    except Exception as exc:  # noqa: BLE001 - best-effort fetch, always fall back
        print(f"  [skip] could not fetch {slug} from Commons: {exc}")
        return False


def draw_placeholder(slug: str, label: str, base_color: str, dest: Path) -> None:
    width, height = TARGET_WIDTH, 480
    img = Image.new("RGB", (width, height), base_color)
    draw = ImageDraw.Draw(img)

    # Soft diagonal stripes, echoing the mockup's placeholder swatches.
    stripe = 26
    stripe_color = tuple(max(0, c - 12) for c in img.getpixel((0, 0)))
    for x in range(-height, width, stripe * 2):
        draw.line([(x, height), (x + height, 0)], fill=stripe_color, width=stripe)

    try:
        font = ImageFont.truetype(
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 34
        )
    except Exception:  # noqa: BLE001
        font = ImageFont.load_default()

    text = label
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    pad = 16
    box = [
        (width - tw) / 2 - pad,
        (height - th) / 2 - pad,
        (width + tw) / 2 + pad,
        (height + th) / 2 + pad,
    ]
    draw.rectangle(box, fill="#ffffffcc" if img.mode == "RGBA" else (255, 255, 255))
    draw.text(((width - tw) / 2, (height - th) / 2 - bbox[1]), text, fill="#212121", font=font)

    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, "JPEG", quality=85)
    print(f"  [placeholder] generated for {slug}")


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for slug, (query, label, color) in DISHES.items():
        dest = OUT_DIR / f"{slug}.jpg"
        print(f"Fetching {slug} ...")
        if not download_real_photo(slug, query, dest):
            if dest.exists():
                print(f"  [keep] preserving existing image for {slug}")
                continue
            draw_placeholder(slug, label, color, dest)
    print(f"\nDone. Images written to {OUT_DIR}")


if __name__ == "__main__":
    sys.exit(main())
