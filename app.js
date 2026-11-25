const menuButton = document.querySelector(".menu-button");
const siteNav = document.querySelector(".site-nav");

function closeMenu() {
  if (!menuButton || !siteNav) return;
  document.body.classList.remove("menu-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "打开导航");
}

if (menuButton && siteNav) {
  menuButton.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("menu-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "关闭导航" : "打开导航");
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
}

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const value = button.dataset.copy;
    const label = button.dataset.label || "";
    const original = button.textContent;

    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const input = document.createElement("input");
      input.value = value;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.append(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }

    button.textContent = label ? `已复制${label}` : "已复制";
    window.setTimeout(() => {
      button.textContent = original;
    }, 1800);
  });
});

/* ---------- HOMEPAGE EXTENSIONS (SILENTLY SKIPPED ON SUBPAGES) ---------- */
(function () {
  const DATA = window.ARCHIVE_DATA;
  if (!DATA) return;

  /* 1. XIAOBING ECPM BLUEPRINT */
  const blueprintHost = document.getElementById("xiaobing-blueprint");
  if (blueprintHost && Array.isArray(DATA.xiaobingSeries)) {
    const series = DATA.xiaobingSeries;
    const w = 440;
    const h = 110;
    const padX = 24;
    const minE = 160;
    const maxE = 340;
    const pts = series.map((d, i) => {
      const x = padX + (i * (w - padX * 2)) / (series.length - 1);
      const y = h - 22 - ((d.ecpm - minE) / (maxE - minE)) * (h - 42);
      return { x: x.toFixed(1), y: y.toFixed(1), ecpm: d.ecpm, stage: d.stage };
    });
    const poly = pts.map((p) => `${p.x},${p.y}`).join(" ");
    const dots = pts
      .map(
        (p) =>
          `<circle cx="${p.x}" cy="${p.y}" r="4.5" fill="#ffdf46" stroke="#0b0f18" stroke-width="2"/>`
      )
      .join("");
    const labels = pts
      .map(
        (p) =>
          `<text x="${p.x}" y="${Number(p.y) - 9}" fill="#0b0f18" font-size="10.5" font-weight="900" text-anchor="middle">${Math.round(p.ecpm)}</text>`
      )
      .join("");

    const rowsHtml = series
      .map(
        (r) => `
        <tr>
          <td>${r.stage}</td>
          <td>${r.d1.toFixed(1)}%</td>
          <td>${r.d7.toFixed(1)}%</td>
          <td>¥${r.arpu.toFixed(2)}</td>
          <td class="${r.ecpm >= 300 ? "is-peak" : ""}">${r.ecpm.toFixed(1)}</td>
        </tr>`
      )
      .join("");

    blueprintHost.innerHTML = `
      <div class="blueprint-top">
        <strong>多阶段留存与 ECPM 演进</strong>
        <span>ECPM 196 → 318</span>
      </div>
      <svg class="blueprint-chart" viewBox="0 0 ${w} ${h}" aria-label="小兵别嚣张各阶段 ECPM 演进曲线">
        <line x1="${padX}" y1="${h - 22}" x2="${w - padX}" y2="${h - 22}" stroke="rgba(11,15,24,0.22)" stroke-width="1.5"/>
        <polyline fill="none" stroke="#1846ff" stroke-width="3" stroke-linecap="square" stroke-linejoin="miter" points="${poly}"/>
        ${dots}
        ${labels}
      </svg>
      <div class="blueprint-table-wrap">
        <table class="blueprint-table">
          <thead>
            <tr><th>阶段</th><th>次留</th><th>周留</th><th>ARPU</th><th>ECPM</th></tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>`;
  }

  /* 2. LIGHTBOX */
  const lightboxEl = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCap = document.getElementById("lightbox-caption");
  const lightboxCloseBtn = document.getElementById("lightbox-close");

  function openLightbox(src, caption) {
    if (!lightboxEl || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = caption || "";
    if (lightboxCap) lightboxCap.textContent = caption || "";
    lightboxEl.hidden = false;
    lightboxEl.setAttribute("aria-hidden", "false");
    if (lightboxCloseBtn) lightboxCloseBtn.focus();
  }

  function closeLightbox() {
    if (!lightboxEl || !lightboxImg) return;
    lightboxEl.hidden = true;
    lightboxEl.setAttribute("aria-hidden", "true");
    lightboxImg.removeAttribute("src");
  }

  if (lightboxCloseBtn && lightboxEl) {
    lightboxCloseBtn.addEventListener("click", closeLightbox);
    lightboxEl.addEventListener("click", (e) => {
      if (e.target === lightboxEl) closeLightbox();
    });
  }

  /* 3. MR.BONE GALLERY */
  const mrboneHost = document.getElementById("mrbone-gallery");
  if (mrboneHost && Array.isArray(DATA.mrboneGallery)) {
    mrboneHost.innerHTML = DATA.mrboneGallery
      .map(
        (g) => `
        <button class="track-thumb" type="button" data-zoom-src="${g.src}" data-zoom-cap="六号特工 — ${g.caption}">
          <img src="${g.src}" alt="${g.caption}" loading="lazy" />
        </button>`
      )
      .join("");

    mrboneHost.querySelectorAll(".track-thumb").forEach((btn) => {
      btn.addEventListener("click", () => {
        openLightbox(btn.dataset.zoomSrc, btn.dataset.zoomCap);
      });
    });
  }

  /* 4. 19-PROJECT ARCHIVE & MODAL */
  const archiveGrid = document.getElementById("archive-grid");
  const archiveCount = document.getElementById("archive-count");
  const companyFilter = document.getElementById("company-filter");
  const catChips = Array.from(document.querySelectorAll(".archive-chip[data-cat]"));
  const modalEl = document.getElementById("project-modal");
  const modalBody = document.getElementById("modal-body");
  const modalCloseBtn = document.getElementById("modal-close");

  const filterState = {
    cat: "all",
    company: "all",
    modalIdx: 0
  };

  function openProjectModal(projectId) {
    if (!modalEl || !modalBody) return;
    const p = DATA.projects.find((x) => x.id === projectId);
    if (!p) return;
    filterState.modalIdx = 0;

    const images = p.gallery && p.gallery.length ? p.gallery : p.image ? [p.image] : [];

    let visualHtml = "";
    if (p.isBlueprint) {
      visualHtml = `
        <div class="dossier-visual">
          <div class="dossier-blueprint">
            <span>商业代表作</span>
            <strong>2 亿+</strong>
            <p>累计新增 500 万+ · 次留 60.29% · 周留 21.21% · ECPM 最高 318</p>
          </div>
        </div>`;
    } else {
      const thumbs =
        images.length > 1
          ? `<div class="dossier-thumbs">
              ${images
                .map(
                  (src, idx) => `
                  <button class="dossier-thumb ${idx === 0 ? "is-active" : ""}" type="button" data-modal-idx="${idx}">
                    <img src="${src}" alt="${p.name} 截图 ${idx + 1}" />
                  </button>`
                )
                .join("")}
            </div>`
          : "";

      visualHtml = `
        <div class="dossier-visual">
          <div class="dossier-shot ${p.isLandscape ? "is-landscape" : ""}">
            <img id="dossier-main-img" src="${images[0]}" alt="${p.name} 游戏截图" />
          </div>
          ${thumbs}
        </div>`;
    }

    const caseLinkHtml = p.caseUrl
      ? `<a class="button button-yellow dossier-case-link" href="${p.caseUrl}">阅读完整深度案例页 ›</a>`
      : "";

    modalBody.innerHTML = `
      <div class="dossier-grid">
        ${visualHtml}
        <div class="dossier-info">
          <div class="dossier-tags">
            <span class="tag-role">${p.role}</span>
            <span>${p.company} · ${p.period}</span>
            <span>${p.team}</span>
            <span>${p.platform}</span>
            <span>${p.status}</span>
          </div>
          <h3 id="modal-title">${p.name}</h3>
          <div class="dossier-rows">
            <div class="dossier-row"><strong>负责范围</strong><p>${p.scope}</p></div>
            <div class="dossier-row"><strong>核心难点</strong><p>${p.challenge}</p></div>
            <div class="dossier-row"><strong>关键决策</strong><p>${p.decision}</p></div>
            <div class="dossier-row"><strong>验证结果</strong><p>${p.result}</p></div>
          </div>
          ${caseLinkHtml}
        </div>
      </div>`;

    modalBody.querySelectorAll(".dossier-thumb").forEach((btn) => {
      btn.addEventListener("click", () => {
        filterState.modalIdx = Number(btn.dataset.modalIdx);
        const mainImg = document.getElementById("dossier-main-img");
        if (mainImg) mainImg.src = images[filterState.modalIdx];
        modalBody.querySelectorAll(".dossier-thumb").forEach((b) => {
          b.classList.toggle("is-active", Number(b.dataset.modalIdx) === filterState.modalIdx);
        });
      });
    });

    modalEl.hidden = false;
    modalEl.setAttribute("aria-hidden", "false");
    document.body.classList.add("menu-open");
    if (modalCloseBtn) modalCloseBtn.focus();
  }

  function closeProjectModal() {
    if (!modalEl) return;
    modalEl.hidden = true;
    modalEl.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");
  }

  if (modalCloseBtn && modalEl) {
    modalCloseBtn.addEventListener("click", closeProjectModal);
    modalEl.addEventListener("click", (e) => {
      if (e.target === modalEl) closeProjectModal();
    });
  }

  function renderArchive() {
    if (!archiveGrid || !archiveCount) return;
    const list = DATA.projects.filter((p) => {
      const catOk = filterState.cat === "all" || p.category === filterState.cat;
      const compOk = filterState.company === "all" || p.company === filterState.company;
      return catOk && compOk;
    });

    archiveCount.textContent = `显示 ${list.length} / ${DATA.projects.length} 项`;

    if (!list.length) {
      archiveGrid.innerHTML = `<div class="archive-empty">当前筛选组合下暂无项目，请切换公司或分类条件。</div>`;
      return;
    }

    archiveGrid.innerHTML = list
      .map((p) => {
        const cover = p.isBlueprint
          ? `<div class="archive-cover is-blueprint">
              <span class="archive-cat">${p.categoryLabel}</span>
              <div class="archive-blueprint-body">
                <strong>2 亿+</strong>
                <small>次留 60.29% · ECPM 318</small>
              </div>
            </div>`
          : `<div class="archive-cover ${p.isLandscape ? "is-landscape" : ""}">
              <img src="${p.image}" alt="${p.name} 游戏截图" loading="lazy" />
              <span class="archive-cat">${p.categoryLabel}</span>
            </div>`;

        return `
          <button class="archive-card" type="button" data-project-id="${p.id}">
            ${cover}
            <div class="archive-card-body">
              <div class="archive-meta"><span>${p.company}</span><span>${p.period}</span></div>
              <h3>${p.name}</h3>
              <p class="archive-highlight">${p.highlight}</p>
              <div class="archive-foot">
                <span>${p.role} · ${p.team}</span>
                <span>详情 ›</span>
              </div>
            </div>
          </button>`;
      })
      .join("");

    archiveGrid.querySelectorAll(".archive-card").forEach((card) => {
      card.addEventListener("click", () => openProjectModal(card.dataset.projectId));
    });
  }

  catChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      filterState.cat = chip.dataset.cat;
      catChips.forEach((c) => c.classList.toggle("is-active", c === chip));
      renderArchive();
    });
  });

  if (companyFilter) {
    companyFilter.addEventListener("change", () => {
      filterState.company = companyFilter.value;
      renderArchive();
    });
  }

  renderArchive();

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (lightboxEl && !lightboxEl.hidden) closeLightbox();
      else if (modalEl && !modalEl.hidden) closeProjectModal();
      else closeMenu();
    }
  });
})();
