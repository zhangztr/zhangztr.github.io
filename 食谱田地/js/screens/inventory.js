// inventory.js — 背包：物品列表、分类筛选

import { ITEMS } from "../config.js";
import { el } from "../utils.js";
import { refreshUI } from "../app.js";

let invFilter = "all";

export function renderInventory(container, state) {
  container.innerHTML = "";

  // 分类筛选
  const filter = el("div", { className: "inv-filter" });
  const filters = ["all", "seed", "ingredient"];
  const labels = { all: "全部", seed: "种子", ingredient: "食材" };
  filters.forEach(f => {
    filter.appendChild(el("button", {
      className: `inv-filter-btn ${invFilter === f ? "inv-filter-btn--active" : ""}`,
      onClick: () => {
        invFilter = f;
        refreshUI();
      },
    }, labels[f]));
  });
  container.appendChild(filter);

  // 物品列表
  const list = el("div", { className: "inv-list" });
  const allItems = { ...state.data.inventory };

  // 补齐物品表中所有物品（包括数量为 0 的）
  for (const id of Object.keys(ITEMS)) {
    if (!(id in allItems)) allItems[id] = 0;
  }

  const entries = Object.entries(allItems)
    .map(([id, qty]) => ({ ...ITEMS[id], id, qty }))
    .filter(item => {
      if (invFilter === "all") return true;
      return item.type === invFilter;
    })
    .sort((a, b) => {
      // 有数量的排前面
      if (a.qty > 0 && b.qty === 0) return -1;
      if (a.qty === 0 && b.qty > 0) return 1;
      return a.nameZh.localeCompare(b.nameZh, "zh");
    });

  if (entries.length === 0) {
    list.appendChild(el("div", { style: { textAlign: "center", padding: "20px", color: "#8d6e63" } }, "背包空空如也"));
  }

  entries.forEach(item => {
    const isEmpty = item.qty === 0;
    const typeLabel = item.type === "seed" ? "种子" : "食材";
    list.appendChild(el("div", { className: `inv-item ${isEmpty ? "inv-item--empty" : ""}` },
      el("div", { style: { display: "flex", alignItems: "center", gap: "8px" } },
        el("span", { className: "inv-item__name" }, item.nameZh),
        el("span", { className: "inv-item__type" }, typeLabel),
      ),
      el("span", { className: "inv-item__qty" }, `x${item.qty}`),
    ));
  });

  container.appendChild(list);
}
