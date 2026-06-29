// utils.js — DOM 辅助、格式化、随机工具

export function $(selector, parent = document) {
  return parent.querySelector(selector);
}

export function $$(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

export function el(tag, attrs = {}, ...children) {
  const elem = document.createElement(tag);
  for (const [key, val] of Object.entries(attrs)) {
    if (key === "className") {
      elem.className = val;
    } else if (key === "style" && typeof val === "object") {
      Object.assign(elem.style, val);
    } else if (key.startsWith("on") && typeof val === "function") {
      elem.addEventListener(key.slice(2).toLowerCase(), val);
    } else if (key === "dataset" && typeof val === "object") {
      Object.assign(elem.dataset, val);
    } else if (key === "textContent") {
      elem.textContent = val;
    } else if (key === "innerHTML") {
      elem.innerHTML = val;
    } else {
      elem.setAttribute(key, val);
    }
  }
  for (const child of children) {
    if (typeof child === "string") {
      elem.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      elem.appendChild(child);
    } else if (child === null || child === undefined) {
      // skip
    } else {
      elem.appendChild(document.createTextNode(String(child)));
    }
  }
  return elem;
}

export function formatGold(n) {
  return `🪙 ${n}`;
}

export function formatCountdown(targetDate) {
  const now = new Date();
  let diff = Math.max(0, targetDate.getTime() - now.getTime());
  const h = Math.floor(diff / 3600000);
  diff -= h * 3600000;
  const m = Math.floor(diff / 60000);
  diff -= m * 60000;
  const s = Math.floor(diff / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomPick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function weightedRandomPick(items, weightFn) {
  const total = items.reduce((sum, item) => sum + weightFn(item), 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= weightFn(item);
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

export function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 获取下一个 8AM 的 Date 对象
export function getNext8am() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(8, 0, 0, 0);
  if (now >= next) next.setDate(next.getDate() + 1);
  return next;
}

// 今天是周几（中文）
export function weekdayZh(date) {
  const days = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return days[date.getDay()];
}

// 日期格式化：2026年5月24日 周日
export function formatDateZh(date) {
  const d = date || new Date();
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${weekdayZh(d)}`;
}

// Toast 提示
export function showToast(message, duration = 2000) {
  let toast = $(".toast");
  if (!toast) {
    toast = el("div", { className: "toast" });
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("toast--visible");
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove("toast--visible");
  }, duration);
}

// 确认弹窗
export function showConfirm(message) {
  return new Promise((resolve) => {
    const overlay = el("div", { className: "modal-overlay" },
      el("div", { className: "modal" },
        el("div", { className: "modal-body", textContent: message }),
        el("div", { className: "modal-actions" },
          el("button", { className: "btn btn--cancel", onClick: () => { overlay.remove(); resolve(false); } }, "取消"),
          el("button", { className: "btn btn--danger", onClick: () => { overlay.remove(); resolve(true); } }, "确认"),
        ),
      ),
    );
    document.body.appendChild(overlay);
  });
}
