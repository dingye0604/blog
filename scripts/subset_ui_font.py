"""Create the site's WOFF2 UI font from an existing LXGW WenKai TTF.

Optional asset maintenance tool, not a build dependency. Requires fontTools and
Brotli in an existing environment. Run again when new site text adds glyphs.
"""
import argparse
import hashlib
import json
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    characters = set(chr(code) for code in range(32, 127))
    for directory in ("content", "templates", "static/demo", "static/js"):
        for path in (root / directory).rglob("*"):
            if path.suffix in (".md", ".html", ".js"):
                characters.update(path.read_text(encoding="utf-8-sig"))
    font = TTFont(args.source)
    available = set(font.getBestCmap())
    unicodes = sorted(set(map(ord, characters)) & available)
    options = subset.Options()
    options.name_IDs = [0, 1, 2, 3, 4, 5, 6, 13, 14, 16, 17]
    options.name_languages = [0x409]
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=unicodes)
    subsetter.subset(font)
    # Distinct internal family for this web-only subset; keep original copyright
    # and OFL metadata, and never overwrite/install the user's desktop font.
    names = {1: "Site WenKai", 2: "Regular", 3: "SiteWenKai-Regular-Web",
             4: "Site WenKai Regular", 6: "SiteWenKai-Regular",
             16: "Site WenKai", 17: "Regular"}
    for record in font["name"].names:
        if record.nameID in names:
            record.string = names[record.nameID].encode(record.getEncoding())
    font.flavor = "woff2"
    target = root / "static/fonts"
    target.mkdir(parents=True, exist_ok=True)
    destination = target / "site-wenkai.woff2"
    font.save(destination)
    manifest = {
        "source": "LXGW WenKai Regular (locally installed TTF)",
        "upstream": "https://github.com/lxgw/LxgwWenKai",
        "source_sha256": hashlib.sha256(args.source.read_bytes()).hexdigest(),
        "woff2_sha256": hashlib.sha256(destination.read_bytes()).hexdigest(),
        "characters": len(unicodes),
        "bytes": destination.stat().st_size,
        "scope": "Site UI subset; Songti and monospace stacks unchanged.",
    }
    (target / "source.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(manifest, indent=2))


if __name__ == "__main__":
    main()
