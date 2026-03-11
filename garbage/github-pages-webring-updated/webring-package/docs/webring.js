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

  if (!siteId) {
    target.textContent = "Webring error: missing data-webring-site.";
    return;
  }

  function wrapIndex(index, length) {
    return ((index % length) + length) % length;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function relationText(offset) {
    if (offset === -2) return "Previous 2";
    if (offset === -1) return "Previous 1";
    if (offset === 1) return "Next 1";
    if (offset === 2) return "Next 2";
    return "Webring";
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

  function imageLink(site, offset, scalable) {
    const href = escapeHtml(site.url);
    const image = escapeHtml(site.image || "");
    const name = escapeHtml(site.name);
    const rel = offset < 0 ? ' rel="prev"' : ' rel="next"';
    const classes = scalable ? "webring-button webring-button--scalable" : "webring-button webring-button--88x31";

    return `
      <a class="${classes}" href="${href}"${rel} title="${relationText(offset)}: ${name}" aria-label="${relationText(offset)}: ${name}">
        <img
          src="${image}"
          alt="${name}"
          loading="lazy"
          width="88"
          height="31"
          onerror="this.closest('a').classList.add('webring-broken-image'); this.remove();"
        >
        <span class="webring-fallback">${name}</span>
      </a>
    `;
  }

  function renderWidget(sites, currentIndex) {
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
      if (!Array.isArray(sites) || sites.length < 5) {
        throw new Error("sites.json must contain at least 5 sites.");
      }

      const currentIndex = sites.findIndex(function (site) {
        return site.id === siteId;
      });

      if (currentIndex === -1) {
        throw new Error('Site "' + siteId + '" not found in ring.');
      }

      renderWidget(sites, currentIndex);
    })
    .catch(function (error) {
      target.textContent = "Webring error: " + error.message;
    });
})();
