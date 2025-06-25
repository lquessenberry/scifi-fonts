# Sci-Fi Fonts Collection

A collection of sci-fi themed fonts organized by theme and hosted on GitHub Pages for easy embedding in web projects.

## Overview

This repository contains a collection of science fiction themed font files (TTF format) that can be used in web projects via GitHub raw URLs. The collection is designed to be used with the lovable.dev app but can be used in any web project.

## How to Use

### Direct Font URLs

You can use the fonts directly in your CSS by linking to the raw GitHub URLs. We provide multiple formats (WOFF, EOT, and TTF) for better cross-browser compatibility. Example:

```css
@font-face {
  font-family: 'Star Trek';
  src: url('https://raw.githubusercontent.com/lquessenberry/scifi-fonts/master/webfonts/trekerprise/Star_Trek_BT.eot');
  src: url('https://raw.githubusercontent.com/lquessenberry/scifi-fonts/master/webfonts/trekerprise/Star_Trek_BT.eot?#iefix') format('embedded-opentype'),
       url('https://raw.githubusercontent.com/lquessenberry/scifi-fonts/master/webfonts/trekerprise/Star_Trek_BT.woff') format('woff'),
       url('https://raw.githubusercontent.com/lquessenberry/scifi-fonts/master/fonts/trekerprise/Star Trek BT.TTF') format('truetype');
}

.startrek-text {
  font-family: 'Star Trek', sans-serif;
}
```

### Font Formats

This repository includes the following font formats for optimal cross-browser compatibility:

- **TTF** (TrueType Font): Standard font format, works in most browsers
- **WOFF** (Web Open Font Format): Compressed font format with better performance
- **EOT** (Embedded OpenType): Required for older versions of Internet Explorer

### Available Font Collections

### Trekerprise

Star Trek inspired fonts:

- Star Trek BT: A classic Star Trek inspired font
- Star Trek Film BT: Bold Star Trek movie-style typeface
- Starfleet Bold Extended BT: Clean, futuristic Starfleet-inspired font
- Star Trek Pi BT: Star Trek symbols and icons
- Square 721 Condensed BT: Clean, condensed technical font commonly used in Star Trek displays
- Venetian 301 BT: Elegant serif font used in some Star Trek publications

## Adding More Fonts

To add more fonts to this collection:

1. Place the TTF font file in the `fonts/` directory
2. Update the `index.html` file to include a new font card with usage examples
3. Add the new font face declaration to `styles.css`

## License Information

The fonts in this repository are for demonstration purposes. If you're using these fonts in a production environment, please ensure you have the appropriate licenses for the fonts you're using.

## GitHub Pages

This repository is configured to use GitHub Pages, making the font collection accessible via a web interface at: [https://lquessenberry.github.io/scifi-fonts/](https://lquessenberry.github.io/scifi-fonts/)

---

Created as a prototype for external font hosting for the lovable.dev app.
