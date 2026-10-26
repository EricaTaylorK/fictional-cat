"""Extract icons from the designer sheets into public/icons/mw as PNGs.

Usage:
    python3 -m venv /tmp/iconvenv && /tmp/iconvenv/bin/pip install pymupdf
    /tmp/iconvenv/bin/python suit-quiz/scripts/extract-icons.py ~/Desktop/icons.pdf ~/Desktop/"Frame 50128167.pdf"
"""

import sys
from pathlib import Path

import fitz

OUT = Path(__file__).resolve().parent.parent / "public" / "icons" / "mw"
SCALE = 4

TILE_ROWS = [
    "hemming",
    "creaset",
    "shop",
    "wedding",
    "special-event",
    "school-event",
    "measurement",
    "suits-bundle",
    "shipping",
    "in-store-pickup",
]
ROW_STEP = 293
LARGE = {"x": 672, "y": 603, "size": 116}

LINE_ROW_LABELS = {
    3535: [
        "inauguration", "quinceanera", "travel",
        "bold-expressive", "warm-earthy", "light-fresh",
        "collar", "vest", "waist", "hem", "sleeve",
        "ai-quiz", "wedding-party", "invitation", "add-member-icon",
    ],
    3696: [
        "skinny", "straight", "athletic", "full", "sharp", "balanced", "relaxed",
        "tight-shoulders", "tight-button", "tight-sleeves", "boxy", "tight-waist", "baggy-pants",
    ],
}

# Section title origins on the tailoring menu frame; each icon sits just left of its title.
MENU_HEADERS = {
    "tailor-shirt-fit": (88, 99),
    "tailor-shirt-sleeves": (88, 412),
    "tailor-leg-hem": (815, 99),
    "tailor-waist-seat": (815, 520),
    "tailor-pants-other": (815, 1067),
    "tailor-vest-fit": (1542, 99),
    "tailor-vest-other": (1542, 370),
    "tailor-coat-sleeves": (2269, 99),
    "tailor-collar-shoulders": (2269, 622),
    "tailor-coat-other": (2269, 935),
    "tailor-leather": (2996, 99),
    "tailor-other-clothing": (2996, 328),
}


def save_png(page, clip, name):
    pix = page.get_pixmap(matrix=fitz.Matrix(SCALE, SCALE), clip=clip, alpha=True)
    pix.save(OUT / f"{name}.png")


def line_icon_rect(drawing_rects, label_rect):
    search = fitz.Rect(label_rect.x0 - 6, label_rect.y1 + 2, label_rect.x0 + 70, label_rect.y1 + 64)
    box = None
    for r in drawing_rects:
        if r.is_empty or not search.contains(r):
            continue
        box = r if box is None else box | r
    if box is None:
        return search
    pad = 2
    side = max(box.width, box.height) + pad * 2
    cx, cy = (box.x0 + box.x1) / 2, (box.y0 + box.y1) / 2
    return fitz.Rect(cx - side / 2, cy - side / 2, cx + side / 2, cy + side / 2)


def extract_sheet(page):
    for index, name in enumerate(TILE_ROWS):
        y = LARGE["y"] + ROW_STEP * index
        save_png(page, fitz.Rect(LARGE["x"], y, LARGE["x"] + LARGE["size"], y + LARGE["size"]), name)

    drawing_rects = [d["rect"] for d in page.get_drawings()]
    words = page.get_text("words")
    for label_y, names in LINE_ROW_LABELS.items():
        for name in names:
            match = next((w for w in words if w[4] == name and abs(w[1] - label_y) < 3), None)
            if not match:
                print(f"missing label {name}")
                continue
            save_png(page, line_icon_rect(drawing_rects, fitz.Rect(match[:4])), name)


def extract_menu(page):
    for name, (x, y) in MENU_HEADERS.items():
        save_png(page, fitz.Rect(x - 58, y - 12, x - 4, y + 42), name)


def main(sheet_path, menu_path):
    OUT.mkdir(parents=True, exist_ok=True)
    extract_sheet(fitz.open(sheet_path)[0])
    if menu_path:
        extract_menu(fitz.open(menu_path)[0])
    print(f"wrote {len(list(OUT.glob('*.png')))} icons to {OUT}")


if __name__ == "__main__":
    args = sys.argv[1:]
    main(
        args[0] if args else str(Path.home() / "Desktop" / "icons.pdf"),
        args[1] if len(args) > 1 else None,
    )
