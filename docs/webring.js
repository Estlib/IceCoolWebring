(function () {
  const script = document.currentScript;
  const targetId = script && script.dataset && script.dataset.target ? script.dataset.target : "webring";
  const target = document.getElementById(targetId);

  if (!target) return;

  const siteId = target.dataset.webringSite;
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
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function siteButton(site, relation, positionLabel) {
    const href = escapeHtml(site.url);
    const image = escapeHtml(site.image);
    const name = escapeHtml(site.name);
    const rel = relation ? ` rel="${relation}"` : "";

    return `
      <a class="webring-button" href="${href}"${rel} title="${positionLabel}: ${name}" aria-label="${positionLabel}: ${name}">
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

      const prev2 = sites[wrapIndex(currentIndex - 2, sites.length)];
      const prev1 = sites[wrapIndex(currentIndex - 1, sites.length)];
      const next1 = sites[wrapIndex(currentIndex + 1, sites.length)];
      const next2 = sites[wrapIndex(currentIndex + 2, sites.length)];

      target.innerHTML = `
        <nav class="webring-widget" aria-label="Webring">
          <div class="webring-grid">
            ${siteButton(prev2, "prev", "Previous 2")}
            ${siteButton(prev1, "prev", "Previous 1")}
            ${siteButton(next1, "next", "Next 1")}
            ${siteButton(next2, "next", "Next 2")}
          </div>
        </nav>
      `;
    })
    .catch(function (error) {
      target.textContent = "Webring error: " + error.message;
    });
})();
