"""Regenerate browser/PWA icons: python scripts/generate-brand-icons.py (requires Pillow)."""

from pathlib import Path
import re

from PIL import Image, ImageChops, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
source = Image.open(ROOT / 'public/logos/sorteia-ai-logo-min.png').convert('RGBA')
# Ignore detached remnants at the edge of the supplied cutout in small icons.
alpha = source.getchannel('A')
connected = alpha.point(lambda value: 255 if value > 8 else 0)
ImageDraw.floodfill(connected, (source.width // 2, source.height // 2), 128)
connected = connected.point(lambda value: 255 if value == 128 else 0)
source.putalpha(ImageChops.multiply(alpha, connected))
icons = ROOT / 'public/icons'


def render(size, opaque=False):
    # Leave room around the wheel, including its pointer, on home screens.
    artwork = source.copy()
    artwork.thumbnail((round(size * 0.84), round(size * 0.84)), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', (size, size), 'white' if opaque else (0, 0, 0, 0))
    canvas.alpha_composite(artwork, ((size - artwork.width) // 2, (size - artwork.height) // 2))
    return canvas


for target in sorted(icons.glob('*.png')):
    size = int(re.search(r'(\d+)x\d+\.png$', target.name).group(1))
    render(size, opaque=target.name.startswith(('apple-', 'ms-'))).save(target, optimize=True)

render(256).save(ROOT / 'public/favicon.ico', sizes=[(16, 16), (32, 32), (48, 48), (256, 256)])

# Safari pinned tabs use a single-color vector silhouette of the same artwork.
alpha = render(64).getchannel('A')
segments = []
for y in range(64):
    x = 0
    while x < 64:
        if alpha.getpixel((x, y)) < 128:
            x += 1
            continue
        start = x
        while x < 64 and alpha.getpixel((x, y)) >= 128:
            x += 1
        segments.append(f'M{start} {y}h{x - start}v1H{start}z')

(icons / 'safari-pinned-tab.svg').write_text(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
    f'<path d="{"".join(segments)}"/></svg>\n', encoding='utf-8'
)
