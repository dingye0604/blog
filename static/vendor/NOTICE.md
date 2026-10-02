# Upstream theme sources

These are intentional, unmodified source snapshots used by the interactive demo.
They are tracked assets, not build caches. SHA-256 hashes are in sources.json.
Copied from the user's local repositories on 2026-10-02.

- absolutely-baseline.css: AbsolutelyBaseline/theme.css, https://github.com/dingye0604/AbsolutelyBaseline
- absolutely-glass.css: AbsolutelyGlass/glass.css, https://github.com/dingye0604/AbsolutelyGlass
- MIT notices: AbsolutelyBaseline.LICENSE and AbsolutelyGlass.LICENSE.
- Baseline (upstream layout/component theme): https://github.com/aaaaalexis/obsidian-baseline, copyright 2025 aaaa​alexis, MIT.
- Instrument Serif: copyright 2022 The Instrument Serif Project Authors (Rodrigo Fuenzalida and Jordan Egstad), SIL Open Font License 1.1. The font remains embedded in the unmodified CSS; its full upstream license is in InstrumentSerif.OFL.txt (https://github.com/google/fonts/blob/main/ofl/instrumentserif/OFL.txt).
- Inter is referenced by name by the theme; it is not separately distributed here. Browser fallbacks are supplied when unavailable.

The demo provides an original minimal HTML / base-style adapter. It does not
redistribute Obsidian's app.css, app code, user notes, or any desktop plugin.
Its layout and available functions are a browser approximation. Theme CSS
controls the material, colors and font tokens. Windows Acrylic is not emulated.

To update: copy the two explicit source CSS files and associated licenses, update
sources.json hashes, and recheck both themes in both light and dark modes.
The website build never depends on D:/obsidianPlugin or on GitHub availability.
