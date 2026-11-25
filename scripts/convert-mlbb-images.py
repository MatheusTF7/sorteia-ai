"""Convert local MLBB PNGs to WebP (requires Pillow: python -m pip install Pillow)."""

import argparse
from io import BytesIO
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1] / 'src/data/mlbb'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--quality', type=int, default=85, choices=range(1, 101), metavar='1-100')
    parser.add_argument('--remove-originals', action='store_true', help='Remove PNGs after validation.')
    args = parser.parse_args()
    converted = []
    total_before = total_after = 0

    for folder in ('heroes', 'heroes-mini'):
        sources = sorted((ROOT / folder).glob('*.png'))
        before = after = 0
        for source in sources:
            target = source.with_suffix('.webp')
            # Do not follow links outside the intended asset directory.
            if source.resolve().parent != ROOT / folder or target.resolve().parent != ROOT / folder:
                raise ValueError(f'Asset outside {ROOT / folder}: {source}')
            with Image.open(source) as original:
                encoded = BytesIO()
                original.save(encoded, format='WEBP', quality=args.quality, method=6)
                data = encoded.getvalue()
                with Image.open(BytesIO(data)) as result:
                    result.load()
                    if result.size != original.size:
                        raise ValueError(f'Dimensions changed: {source}')
                    original_alpha = original.convert('RGBA').getchannel('A').tobytes()
                    result_alpha = result.convert('RGBA').getchannel('A').tobytes()
                    if result_alpha != original_alpha:
                        raise ValueError(f'Transparency changed: {source}')
            target.write_bytes(data)
            before += source.stat().st_size
            after += len(data)
            converted.append(source)
        total_before += before
        total_after += after
        print(f'{folder}: {len(sources)} images, {before:,} -> {after:,} bytes')

    # Keep every original if any conversion or validation fails.
    if args.remove_originals:
        for source in converted:
            source.unlink()
    if total_before:
        reduction = 1 - total_after / total_before
        print(f'Total: {total_before:,} -> {total_after:,} bytes ({reduction:.1%} smaller)')
    else:
        print('No PNGs to convert.')


if __name__ == '__main__':
    main()
