# GitHub Pages Webring

This package is a fully static webring that can live in a GitHub Pages repo.

## What it does

- central ring stored in `docs/sites.json`
- member sites embed one script into a `div`
- three widget types: `noimages`, `88x31`, and `scalable`
- each member sees 2 previous and 2 next sites
- no backend required
- example assets are stored in the repo under `docs/images/`

## Repo layout

```text
docs/
  index.html
  sites.json
  webring.js
  webring.css
  images/
    88x31/
      example-button.png
    scalable/
      ice-cube.svg
```

## Deploy

1. Upload these files to a GitHub repo.
2. In GitHub, enable Pages and publish from the `docs/` folder.
3. Replace `YOURNAME` and `YOURREPO` in the embed snippets with your real Pages URL.

## Add or reorder members

Edit `docs/sites.json`.

Each item can use separate assets for fixed and scalable widgets:

```json
{
  "id": "charlie",
  "name": "Charlie Site",
  "url": "https://charlie.example.com/",
  "image88x31": "./images/88x31/example-button.png",
  "imageScalable": "./images/scalable/ice-cube.svg"
}
```

Fallback behavior:

- `88x31` uses `image88x31`, then `image`
- `scalable` uses `imageScalable`, then `image`, then `image88x31`

The order in `sites.json` is the ring order.

## Widget types

### `noimages`

Text-only links, useful for minimal layouts or sites that do not want image buttons.

```html
<link rel="stylesheet" href="https://YOURNAME.github.io/YOURREPO/webring.css">
<div id="webring-noimages" data-webring-site="charlie" data-webring-widget="noimages"></div>
<script src="https://YOURNAME.github.io/YOURREPO/webring.js" data-target="webring-noimages" defer></script>
```

### `88x31`

Classic fixed-size 88x31 image button grid.

```html
<link rel="stylesheet" href="https://YOURNAME.github.io/YOURREPO/webring.css">
<div id="webring-88x31" data-webring-site="charlie" data-webring-widget="88x31"></div>
<script src="https://YOURNAME.github.io/YOURREPO/webring.js" data-target="webring-88x31" defer></script>
```

### `scalable`

Image-button version that expands to the available width and preserves the asset's own aspect ratio.

```html
<link rel="stylesheet" href="https://YOURNAME.github.io/YOURREPO/webring.css">
<div id="webring-scalable" data-webring-site="charlie" data-webring-widget="scalable" style="--webring-max-width: 720px;"></div>
<script src="https://YOURNAME.github.io/YOURREPO/webring.js" data-target="webring-scalable" defer></script>
```

You can adjust the scalable widget width with the CSS custom property `--webring-max-width`.

## Notes

- The widget expects at least 5 sites.
- Image widgets can use repo-relative image paths.
- If an image fails to load, the widget falls back to the site name.
