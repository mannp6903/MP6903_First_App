# App icon sources

The PNGs in `assets/` are rendered from these SVGs. Edit the SVG, then re-export at the same size:

| SVG | PNG | Size | Notes |
| --- | --- | --- | --- |
| `icon.svg` | `icon.png`, `splash-icon.png`, `favicon.png` | 1024, 1024, 48 | Must have **no transparency** (App Store requirement) |
| `android-foreground.svg` | `android-icon-foreground.png` | 512 | Transparent; keep the artwork inside the centre 61% circle |
| `android-background.svg` | `android-icon-background.png` | 512 | |
| `android-monochrome.svg` | `android-icon-monochrome.png` | 432 | White on transparent; used for Android 13+ themed icons |

`preview.png` shows the icon on iOS, Android (circle and squircle masks) and as a themed icon.
