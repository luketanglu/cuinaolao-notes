const monthly = {
  labels: ["25-11", "25-12", "26-01", "26-03", "26-04", "26-05", "26-06", "26-07", "26-08", "26-09", "26-10"],
  values: [122, 63, 68, 289, 42, 396, 143, 164, 902, 3984, 666],
};

const flavors = [
  {
    name: "原味",
    count: 10,
    positive: "纯奶香、含化后奶味浓",
    negative: "咸、腻、酸臭、恶心",
    verdict: "分裂最明显",
  },
  {
    name: "培根 / 香煎培根",
    count: 10,
    positive: "更像零食、遮盖发酵味",
    negative: "齁咸、酸奶味、假味",
    verdict: "掩味与增咸并存",
  },
  {
    name: "蟹黄",
    count: 8,
    positive: "有人整包炫、联名带动尝试",
    negative: "有人列为最难吃、没蟹味",
    verdict: "排名争议最大",
  },
  {
    name: "蒜 / 蒜苔",
    count: 6,
    positive: "品牌梗有传播性",
    negative: "真实试吃反馈少",
    verdict: "暂不宜判断口碑",
  },
];

const actions = [
  ["产品", "轻盐 / 小份试吃", "咸、高钠与吃多会腻反复出现；优先降低首包试错成本。"],
  ["产品", "配方改版透明", "解释干酪含量与配方变化；同时标清每袋而非仅每 100g 钠/脂肪。"],
  ["产品", "优化发酵味预期", "将“酸臭/坏奶”转译为成熟干酪风味，并提供含化、配咖啡等吃法。"],
  ["营销", "拥抱两极化", "用干酪入门/进阶人群分层，不用单一“巨好吃”承诺覆盖所有消费者。"],
  ["营销", "建立口味选择指南", "怕发酵味、怕咸、偏奶香分别给出试吃路径，避免宣称唯一最佳口味。"],
  ["内容", "补齐成分与真实试吃", "当前官方内容以福利、联名和梗为主，缺少对健康与配方争议的回应。"],
];

function setupTabs() {
  const tabs = document.querySelectorAll(".tab");
  const views = document.querySelectorAll(".view");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((item) => item.classList.remove("is-active"));
      views.forEach((view) => view.classList.remove("is-active"));
      tab.classList.add("is-active");
      document.getElementById(tab.dataset.view).classList.add("is-active");
      window.scrollTo({ top: document.querySelector(".tabs").offsetTop - 80, behavior: "smooth" });
    });
  });
}

function drawTrendChart() {
  const host = document.getElementById("trend-chart");
  const width = 620;
  const height = 250;
  const padding = { top: 18, right: 16, bottom: 32, left: 42 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const max = 4000;
  const x = (index) => padding.left + (index / (monthly.values.length - 1)) * innerWidth;
  const y = (value) => padding.top + innerHeight - (value / max) * innerHeight;
  const points = monthly.values.map((value, index) => `${x(index)},${y(value)}`).join(" ");
  const area = `${padding.left},${padding.top + innerHeight} ${points} ${x(monthly.values.length - 1)},${padding.top + innerHeight}`;
  const gridValues = [0, 1000, 2000, 3000, 4000];

  host.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="2025年11月至2026年10月月度互动趋势">
      ${gridValues.map((value) => `
        <line class="chart-grid" x1="${padding.left}" y1="${y(value)}" x2="${width - padding.right}" y2="${y(value)}"></line>
        <text class="chart-label" x="${padding.left - 8}" y="${y(value) + 3}" text-anchor="end">${value >= 1000 ? `${value / 1000}k` : value}</text>
      `).join("")}
      <polygon class="trend-area" points="${area}"></polygon>
      <polyline class="trend-line" points="${points}"></polyline>
      ${monthly.values.map((value, index) => `
        <circle class="trend-point" cx="${x(index)}" cy="${y(value)}" r="${index === 9 ? 5 : 3.5}">
          <title>${monthly.labels[index]}：${value.toLocaleString()} 次互动</title>
        </circle>
        <text class="chart-label" x="${x(index)}" y="${height - 10}" text-anchor="middle">${monthly.labels[index]}</text>
      `).join("")}
    </svg>
  `;
}

function drawSentiment() {
  const data = [
    { label: "正负都有", value: 15, color: "#e5b83a" },
    { label: "扩抓", value: 12, color: "#345d78" },
    { label: "偏正面", value: 10, color: "#315d4b" },
    { label: "中性/其他", value: 4, color: "#a9aaa4" },
  ];
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cursor = 0;
  const stops = data.map((item) => {
    const start = (cursor / total) * 360;
    cursor += item.value;
    const end = (cursor / total) * 360;
    return `${item.color} ${start}deg ${end}deg`;
  });
  document.getElementById("sentiment-donut").style.background = `conic-gradient(${stops.join(",")})`;
  document.getElementById("sentiment-legend").innerHTML = data.map((item) => `
    <div>
      <i style="background:${item.color}"></i>
      <span>${item.label}</span>
      <strong>${item.value}</strong>
    </div>
  `).join("");
}

const PAGE_SIZE = 10;
const notes = [...(window.NOTE_CONTENTS || [])].sort((a, b) => {
  const score = (note) => Number(note.likes || 0) + Number(note.collects || 0) + Number(note.comments_count || 0);
  return score(b) - score(a);
});
let currentPage = 1;
let lastFocusedElement = null;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderAllNotes() {
  const pageCount = Math.ceil(notes.length / PAGE_SIZE);
  currentPage = Math.min(Math.max(currentPage, 1), pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = notes.slice(start, start + PAGE_SIZE);
  const body = document.getElementById("all-notes-body");

  body.innerHTML = pageItems.map((note) => {
    const tone = note.sentiment_guess === "偏正面"
      ? "tag-product"
      : note.sentiment_guess === "正负都有"
        ? "tag-risk"
        : "";
    return `
      <tr class="note-row" data-note-id="${escapeHtml(note.note_id)}" tabindex="0">
        <td>${escapeHtml(note.title)}</td>
        <td>${escapeHtml(note.author)}</td>
        <td>${escapeHtml(note.publish_time)}</td>
        <td>${escapeHtml(note.likes)}</td>
        <td>${escapeHtml(note.collects)}</td>
        <td>${escapeHtml(note.comments_count)}</td>
        <td><span class="tag ${tone}">${escapeHtml(note.sentiment_guess)}</span></td>
        <td><button class="view-note" type="button" data-note-id="${escapeHtml(note.note_id)}">查看原文与评论</button></td>
      </tr>
    `;
  }).join("");

  body.querySelectorAll(".note-row").forEach((row) => {
    row.addEventListener("click", () => openNote(row.dataset.noteId));
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openNote(row.dataset.noteId);
      }
    });
  });

  const numberHost = document.getElementById("page-numbers");
  numberHost.innerHTML = Array.from({ length: pageCount }, (_, index) => {
    const page = index + 1;
    return `<button type="button" class="${page === currentPage ? "is-active" : ""}" data-page="${page}" aria-label="第${page}页">${page}</button>`;
  }).join("");
  numberHost.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => changePage(Number(button.dataset.page)));
  });

  document.getElementById("page-prev").disabled = currentPage === 1;
  document.getElementById("page-next").disabled = currentPage === pageCount;
  document.getElementById("page-status").textContent = `第 ${currentPage} / ${pageCount} 页 · ${start + 1}—${Math.min(start + PAGE_SIZE, notes.length)} / ${notes.length}`;
}

function changePage(page) {
  currentPage = page;
  renderAllNotes();
  document.querySelector(".table-wrap").scrollIntoView({ behavior: "smooth", block: "start" });
}

function countCommentNodes(comments) {
  return (comments || []).reduce((sum, comment) => sum + 1 + countCommentNodes(comment.replies), 0);
}

function renderCommentItem(comment) {
  const authorClass = comment.is_author ? "is-author" : "";
  const replies = (comment.replies || []).map(renderCommentItem).join("");
  return `
    <article class="comment-item ${authorClass}">
      <header>
        <strong>${escapeHtml(comment.author || "匿名用户")}</strong>
        ${comment.is_author ? '<span class="author-badge">楼主</span>' : ""}
        <span>${escapeHtml(comment.time || "")}</span>
        <span>${escapeHtml(comment.likes || "0")} 赞</span>
      </header>
      <p>${escapeHtml(comment.content || "（空评论）")}</p>
      ${replies ? `<div class="comment-replies">${replies}</div>` : ""}
    </article>
  `;
}

function renderComments(note) {
  const comments = note.comments || [];
  const saved = countCommentNodes(comments);
  document.getElementById("comments-count").textContent = saved
    ? `已落盘 ${saved} 条 · 页面显示 ${escapeHtml(note.comments_count)}`
    : `页面显示 ${escapeHtml(note.comments_count)} · 暂无落盘评论`;
  const host = document.getElementById("modal-comments");
  if (!comments.length) {
    host.innerHTML = `<p class="comment-empty">暂无评论内容</p>`;
    return;
  }
  host.innerHTML = comments.map(renderCommentItem).join("");
}

function openNote(noteId) {
  const note = notes.find((item) => item.note_id === noteId);
  if (!note) return;
  lastFocusedElement = document.activeElement;
  document.getElementById("modal-title").textContent = note.title;
  document.getElementById("modal-meta").innerHTML = `
    <span>作者：${escapeHtml(note.author)}</span>
    <span>发布：${escapeHtml(note.publish_time)}</span>
    <span>笔记 ID：${escapeHtml(note.note_id)}</span>
  `;
  document.getElementById("modal-stats").innerHTML = `
    <span>${escapeHtml(note.likes)} 赞</span>
    <span>${escapeHtml(note.collects)} 收藏</span>
    <span>${escapeHtml(note.comments_count)} 评论</span>
    <span>${escapeHtml(note.sentiment_guess)}</span>
  `;
  document.getElementById("modal-body").textContent = note.body || "（正文为空）";
  document.getElementById("gallery-count").textContent = `${note.images.length} 张`;
  document.getElementById("modal-gallery").innerHTML = note.images.map((image, index) => `
    <figure>
      <a href="${escapeHtml(image)}" target="_blank" rel="noopener" aria-label="打开第${index + 1}张原图">
        <img src="${escapeHtml(image)}" alt="${escapeHtml(note.title)} 配图 ${index + 1}" loading="lazy" />
      </a>
    </figure>
  `).join("");
  renderComments(note);

  const modal = document.getElementById("note-modal");
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  document.querySelector(".modal-dialog").scrollTop = 0;
  document.querySelector(".modal-close").focus();
}

function closeNote() {
  const modal = document.getElementById("note-modal");
  if (!modal.classList.contains("is-open")) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  if (lastFocusedElement) lastFocusedElement.focus();
}

function setupContentBrowser() {
  renderAllNotes();
  document.getElementById("page-prev").addEventListener("click", () => changePage(currentPage - 1));
  document.getElementById("page-next").addEventListener("click", () => changePage(currentPage + 1));
  document.querySelectorAll("[data-close-modal]").forEach((element) => element.addEventListener("click", closeNote));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNote();
  });
}

function drawBars(hostId, items, className) {
  const host = document.getElementById(hostId);
  const max = Math.max(...items.map((item) => item[1]));
  host.classList.add(className);
  host.innerHTML = items.map(([label, value]) => `
    <div class="bar-row">
      <span>${label}</span>
      <div class="bar-track" aria-label="${label} ${value}条">
        <div class="bar-fill" style="width:${(value / max) * 100}%"></div>
      </div>
      <strong>${value}</strong>
    </div>
  `).join("");
}

function renderFlavors() {
  document.getElementById("flavor-grid").innerHTML = flavors.map((flavor) => `
    <article class="flavor-card">
      <span>${flavor.count} 个去重文本单元</span>
      <h3>${flavor.name}</h3>
      <dl>
        <dt>正向反馈</dt><dd>${flavor.positive}</dd>
        <dt>负向反馈</dt><dd>${flavor.negative}</dd>
      </dl>
      <div class="flavor-verdict">${flavor.verdict}</div>
    </article>
  `).join("");
}

function renderActions() {
  document.getElementById("action-list").innerHTML = actions.map(([type, title, evidence]) => `
    <article class="action-item">
      <span class="action-type">${type}</span>
      <strong>${title}</strong>
      <p>${evidence}</p>
    </article>
  `).join("");
}

setupTabs();
drawTrendChart();
drawSentiment();
setupContentBrowser();
drawBars("positive-bars", [
  ["脆 / 咔嚓口感", 62],
  ["好吃 / 回购 / 上瘾", 47],
  ["便携 / 场景", 29],
  ["联名 / 周边", 21],
  ["奶香 / 芝士感", 19],
], "positive");
drawBars("negative-bars", [
  ["难吃 / 踩雷", 29],
  ["咸 / 高钠", 21],
  ["腻 / 多吃不住", 6],
  ["发酵奶味 / 酸臭", 6],
  ["粘牙 / 怪脆", 4],
], "negative");
renderFlavors();
renderActions();
