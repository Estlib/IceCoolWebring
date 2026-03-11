# GitHub Pages Webring

This package is a fully static webring that can live in a GitHub Pages repo.

## What it does

- central ring stored in `docs/sites.json`
- member sites embed one script into a `div`
- widget shows image links only
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
3. Replace `YOURNAME` and `YOURREPO` in the embed snippet with your real Pages URL.

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

## Member embed

```html
<link rel="stylesheet" href="https://YOURNAME.github.io/YOURREPO/webring.css">

<div id="webring" data-webring-site="charlie"></div>

<script
  src="https://YOURNAME.github.io/YOURREPO/webring.js"
  data-target="webring"
  defer
></script>
```

Change `data-webring-site` to that member's site ID.

## Notes

- The widget expects at least 5 sites.
- Button images are assumed to be 88x31.
- If an image fails to load, the widget falls back to the site name.
