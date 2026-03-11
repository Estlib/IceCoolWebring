# GitHub Pages Webring

This package is a fully static webring that can live in a GitHub Pages repo.

## What it does

- central ring stored in `docs/sites.json`
- member sites embed one script into a `div`
- three widget types: `noimages`, `88x31`, and `scalable`
- each member sees 2 previous and 2 next sites
- no backend required

## Repo layout

```text
docs/
  index.html
  sites.json
  webring.js
  webring.css
```

## Deploy

1. Upload these files to a GitHub repo.
2. In GitHub, enable Pages and publish from the `docs/` folder.
3. Replace `YOURNAME` and `YOURREPO` in the embed snippets with your real Pages URL.

## Add or reorder members

Edit `docs/sites.json`.

Each item needs:

```json
{
  "id": "charlie",
  "name": "Charlie Site",
  "url": "https://charlie.example.com/",
  "image": "https://charlie.example.com/button.png"
}
```

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

Image-button version that expands to the available width while keeping the 88:31 ratio.

```html
<link rel="stylesheet" href="https://YOURNAME.github.io/YOURREPO/webring.css">
<div id="webring-scalable" data-webring-site="charlie" data-webring-widget="scalable" style="--webring-max-width: 520px;"></div>
<script src="https://YOURNAME.github.io/YOURREPO/webring.js" data-target="webring-scalable" defer></script>
```

You can adjust the scalable widget width with the CSS custom property `--webring-max-width`.

## Notes

- The widget expects at least 5 sites.
- Image widgets use the site's `image` field.
- If an image fails to load, the widget falls back to the site name.
