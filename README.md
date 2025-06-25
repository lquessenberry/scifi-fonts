# Sci-Fi Fonts Collection

A collection of sci-fi themed fonts (primarily Star Trek inspired) hosted on GitHub Pages for easy embedding in web projects.

## Overview

This repository contains a collection of science fiction themed font files (TTF format) that can be used in web projects via GitHub raw URLs. The collection is designed to be used with the lovable.dev app but can be used in any web project.

## How to Use

### Direct Font URLs

You can use the fonts directly in your CSS by linking to the raw GitHub URLs. For example:

```css
@font-face {
  font-family: 'Federation';
  src: url('https://raw.githubusercontent.com/yourusername/scifi-fonts/main/fonts/federation.ttf') format('truetype');
}

.federation-text {
  font-family: 'Federation', sans-serif;
}
```

Replace `yourusername` with your actual GitHub username once the repository is created.

### Available Fonts

- Federation: A classic Star Trek inspired font
- Klingon: Bold and aggressive Klingon-inspired typeface
- Vulcan: Elegant and logical Vulcan script

## Adding More Fonts

To add more fonts to this collection:

1. Place the TTF font file in the `fonts/` directory
2. Update the `index.html` file to include a new font card with usage examples
3. Add the new font face declaration to `styles.css`

## License Information

The fonts in this repository are for demonstration purposes. If you're using these fonts in a production environment, please ensure you have the appropriate licenses for the fonts you're using.

## GitHub Pages

This repository is configured to use GitHub Pages, making the font collection accessible via a web interface at: https://yourusername.github.io/scifi-fonts/

---

Created as a prototype for external font hosting for the lovable.dev app.
