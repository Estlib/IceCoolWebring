(function () {
  const script = document.currentScript;
  const targetId = script && script.dataset && script.dataset.target ? script.dataset.target : "webring";
  const target = document.getElementById(targetId);

  if (!target) return;

  const siteId = target.dataset.webringSite;
  const widgetType = (
    (target.dataset.webringWidget || (script && script.dataset && script.dataset.widget) || "88x31")
      .toLowerCase()
      .trim()
  );
  const jsonUrl = (script && script.dataset && script.dataset.src)
    ? script.dataset.src
    : new URL("./sites.json", script.src).href;
  const webringBaseUrl = new URL("./", script.src).href;

  if (!siteId) {
    target.textContent = "Webring error: missing data-webring-site.";
    return;
  }


  function normalizeUrl(url) {
    try {
      const parsed = new URL(url, window.location.href);
      let pathname = parsed.pathname.replace(/index\.html$/i, "");
      pathname = pathname.replace(/\/+$/, "");
      return (parsed.origin + pathname).toLowerCase();
    } catch (error) {
      return String(url || "").trim().replace(/\/+$/, "").toLowerCase();
    }
  }

  function isWebringAddress(url) {
    const normalized = normalizeUrl(url);
    const base = normalizeUrl(webringBaseUrl);
    const baseIndex = normalizeUrl(new URL("index.html", webringBaseUrl).href);
    return normalized === base || normalized === baseIndex;
  }

  function isCurrentPageWebring() {
    return isWebringAddress(window.location.href);
  }
  function wrapIndex(index, length) {
    return ((index % length) + length) % length;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function relationText(offset) {
    if (offset === -2) return "Previous 2";
    if (offset === -1) return "Previous 1";
    if (offset === 1) return "Next 1";
    if (offset === 2) return "Next 2";
    return "Webring";
  }

  function resolveAssetUrl(site, fieldNames) {
    for (let i = 0; i < fieldNames.length; i += 1) {
      const value = site[fieldNames[i]];
      if (value) {
        try {
          return new URL(value, jsonUrl).href;
        } catch (error) {
          return value;
        }
      }
    }
    return "";
  }

  function textLink(site, offset) {
    const href = escapeHtml(site.url);
    const name = escapeHtml(site.name);
    const rel = offset < 0 ? ' rel="prev"' : ' rel="next"';
    const arrow = offset < 0 ? "←" : "→";

    return `
      <a class="webring-text-link" href="${href}"${rel} title="${relationText(offset)}: ${name}" aria-label="${relationText(offset)}: ${name}">
        <span class="webring-text-label">${relationText(offset)}</span>
        <span class="webring-text-name">${arrow} ${name}</span>
      </a>
    `;
  }

  function textCurrent(site) {
    const name = escapeHtml(site.name);
    return `
      <span class="webring-text-link webring-text-current" aria-current="true" title="Current site: ${name}">
        <span class="webring-text-label">Current site</span>
        <span class="webring-text-name">${name}</span>
      </span>
    `;
  }

  function imageLink(site, offset, scalable) {
    const href = escapeHtml(site.url);
    const image = scalable
      ? resolveAssetUrl(site, ["imageScalable", "image", "image88x31"])
      : resolveAssetUrl(site, ["image88x31", "image"]);
    const name = escapeHtml(site.name);
    const rel = offset < 0 ? ' rel="prev"' : ' rel="next"';
    const classes = scalable ? "webring-button webring-button--scalable" : "webring-button webring-button--88x31";

    return `
      <a class="${classes}" href="${href}"${rel} title="${relationText(offset)}: ${name}" aria-label="${relationText(offset)}: ${name}">
        <img
          src="${escapeHtml(image)}"
          alt="${name}"
          loading="lazy"
          width="88"
          height="31"
          onerror="this.closest('${scalable ? 'a' : 'a'}').classList.add('webring-broken-image'); this.remove();"
        >
        <span class="webring-fallback">${name}</span>
      </a>
    `;
  }

  function imageCurrent(site, scalable) {
    const image = scalable
      ? resolveAssetUrl(site, ["imageScalable", "image", "image88x31"])
      : resolveAssetUrl(site, ["image88x31", "image"]);
    const name = escapeHtml(site.name);
    const classes = scalable
      ? "webring-button webring-button--scalable webring-button--current"
      : "webring-button webring-button--88x31 webring-button--current";

    return `
      <span class="${classes}" aria-current="true" title="Current site: ${name}">
        <img
          src="${escapeHtml(image)}"
          alt="${name}"
          loading="lazy"
          width="88"
          height="31"
          onerror="this.closest('span').classList.add('webring-broken-image'); this.remove();"
        >
        <span class="webring-fallback">${name}</span>
      </span>
    `;
  }

  function renderInactive(message) {
    target.innerHTML = '<div class="webring-message">' + escapeHtml(message) + '</div>';
  }

  function renderAllSites(sites, currentIndex) {
    let widgetClass = "webring-widget webring-widget--88x31";
    let innerHtml = "";

    if (widgetType === "noimages") {
      widgetClass = "webring-widget webring-widget--noimages";
      innerHtml = sites.map(function (site, index) {
        return index === currentIndex ? textCurrent(site) : textLink(site, index < currentIndex ? -1 : 1);
      }).join("");
    } else if (widgetType === "scalable") {
      widgetClass = "webring-widget webring-widget--scalable";
      innerHtml = sites.map(function (site, index) {
        return index === currentIndex ? imageCurrent(site, true) : imageLink(site, index < currentIndex ? -1 : 1, true);
      }).join("");
    } else {
      widgetClass = "webring-widget webring-widget--88x31";
      innerHtml = sites.map(function (site, index) {
        return index === currentIndex ? imageCurrent(site, false) : imageLink(site, index < currentIndex ? -1 : 1, false);
      }).join("");
    }

    target.innerHTML = `
      <nav class="${widgetClass}" aria-label="Webring">
        ${innerHtml}
      </nav>
    `;
  }

  function renderNeighbors(sites, currentIndex) {
    const neighbors = [
      { offset: -2, site: sites[wrapIndex(currentIndex - 2, sites.length)] },
      { offset: -1, site: sites[wrapIndex(currentIndex - 1, sites.length)] },
      { offset: 1, site: sites[wrapIndex(currentIndex + 1, sites.length)] },
      { offset: 2, site: sites[wrapIndex(currentIndex + 2, sites.length)] }
    ];

    let widgetClass = "webring-widget webring-widget--88x31";
    let innerHtml = "";

    if (widgetType === "noimages") {
      widgetClass = "webring-widget webring-widget--noimages";
      innerHtml = neighbors.map(function (item) {
        return textLink(item.site, item.offset);
      }).join("");
    } else if (widgetType === "scalable") {
      widgetClass = "webring-widget webring-widget--scalable";
      innerHtml = neighbors.map(function (item) {
        return imageLink(item.site, item.offset, true);
      }).join("");
    } else {
      widgetClass = "webring-widget webring-widget--88x31";
      innerHtml = neighbors.map(function (item) {
        return imageLink(item.site, item.offset, false);
      }).join("");
    }

    target.innerHTML = `
      <nav class="${widgetClass}" aria-label="Webring">
        ${innerHtml}
      </nav>
    `;
  }

  fetch(jsonUrl, { cache: "no-store" })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }
      return response.json();
    })
    .then(function (sites) {
      if (!Array.isArray(sites)) {
        renderInactive("webring inactive");
        return;
      }

      sites = sites.filter(function (site) {
        return site && site.url && !isWebringAddress(site.url);
      });

      if (sites.length === 0) {
        if (isCurrentPageWebring()) {
          target.innerHTML = "";
          return;
        }
        renderInactive("webring inactive");
        return;
      }

      const currentIndex = sites.findIndex(function (site) {
        return site.id === siteId;
      });

      if (currentIndex === -1) {
        if (isCurrentPageWebring()) {
          target.innerHTML = "";
          return;
        }
        renderInactive("this site is not part of this webring");
        return;
      }

      if (sites.length < 5) {
        renderAllSites(sites, currentIndex);
        return;
      }

      renderNeighbors(sites, currentIndex);
    })
    .catch(function (error) {
      target.textContent = "Webring error: " + error.message;
    });
})();
