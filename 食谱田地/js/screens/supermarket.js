// supermarket.js — 超市：购买/出售、每日特价

import { ITEMS, SHOP_STOCK } from "../config.js";
import { el, showToast } from "../utils.js";
import { refreshUI } from "../app.js";

let shopMode = "buy";

export function renderSupermarket(container, state) {
  container.innerHTML = "";

  // 模式切换 tabs（动态生成，不依赖静态 HTML）
  const tabs = el("div", { className: "shop-tabs" },
    el("button", {
      className: `shop-tab ${shopMode === "buy" ? "shop-tab--active" : ""}`,
      dataset: { tab: "buy" },
      onClick: () => { shopMode = "buy"; refreshUI(); },
    }, "购买"),
    el("button", {
      className: `shop-tab ${shopMode === "sell" ? "shop-tab--active" : ""}`,
      dataset: { tab: "sell" },
      onClick: () => { shopMode = "sell"; refreshUI(); },
    }, "出售"),
  );
  container.appendChild(tabs);

  // 动态容器
  const salesContainer = el("div", { className: "shop-content" });
  const catalogContainer = el("div", { className: "shop-content" });
  container.appendChild(salesContainer);
  container.appendChild(catalogContainer);

  if (shopMode === "buy") {
    renderBuy(salesContainer, catalogContainer, state);
  } else {
    renderSell(salesContainer, catalogContainer, state);
  }
}

function renderBuy(salesContainer, catalogContainer, state) {
  // 特价区
  const sales = state.getShopSales();
  if (sales && sales.length > 0) {
    salesContainer.appendChild(el("div", { className: "recipes-section__title", style: { marginBottom: "8px" } }, "🔴 今日特价"));

    sales.forEach(s => {
      const item = ITEMS[s.itemId];
      if (!item) return;
      const salePrice = Math.floor(item.buyPrice * (1 - s.discountPercent / 100));
      const qtyId = `buy_qty_${s.itemId}`;

      salesContainer.appendChild(el("div", { className: "shop-item" },
        el("div", {},
          el("div", { className: "shop-item__name" }, `${item.nameZh}`),
          el("div", {},
            el("span", { className: "shop-item__price--original" }, `${item.buyPrice}G`),
            el("span", { className: "shop-item__price--sale" }, `${salePrice}G`),
            el("span", { className: "sale-badge" }, `-${s.discountPercent}%`),
          ),
        ),
        el("div", { className: "shop-item__qty" },
          el("button", { className: "btn btn--small btn--cancel", onClick: () => { const inp = document.getElementById(qtyId); if (inp) inp.value = Math.max(0, +inp.value - 1); } }, "−"),
          el("input", { type: "number", value: "0", min: "0", max: "99", id: qtyId, style: { width: "44px" } }),
          el("button", { className: "btn btn--small btn--cancel", onClick: () => { const inp = document.getElementById(qtyId); if (inp) inp.value = Math.min(99, +inp.value + 1); } }, "+"),
          el("button", {
            className: "btn btn--primary btn--small",
            onClick: () => {
              const qty = parseInt(document.getElementById(qtyId)?.value || 0);
              if (qty <= 0) return showToast("请选择数量");
              const r = state.buyItem(s.itemId, qty, salePrice);
              showToast(r.message);
              refreshUI();
            },
          }, "买"),
        ),
      ));
    });
  }

  // 全目录
  catalogContainer.appendChild(el("div", { className: "recipes-section__title", style: { marginBottom: "8px" } }, "📦 全部商品"));

  catalogContainer.appendChild(el("div", { style: { fontSize: "13px", fontWeight: 600, color: "#8d6e63", marginBottom: "4px" } }, "—— 种子 ——"));
  renderShopCategory(catalogContainer, state, SHOP_STOCK.filter(id => ITEMS[id]?.type === "seed"));

  catalogContainer.appendChild(el("div", { style: { fontSize: "13px", fontWeight: 600, color: "#8d6e63", marginBottom: "4px", marginTop: "8px" } }, "—— 食材 ——"));
  renderShopCategory(catalogContainer, state, SHOP_STOCK.filter(id => ITEMS[id]?.type === "ingredient" && !ITEMS[id]?.isRare));
}

function renderShopCategory(container, state, itemIds) {
  itemIds.forEach(id => {
    const item = ITEMS[id];
    if (!item) return;
    const qtyId = `buy_qty_${id}`;

    container.appendChild(el("div", { className: "shop-item" },
      el("div", {},
        el("div", { className: "shop-item__name" }, item.nameZh),
        el("div", { className: "shop-item__price" }, `${item.buyPrice}G`),
      ),
      el("div", { className: "shop-item__qty" },
        el("button", { className: "btn btn--small btn--cancel", onClick: () => { const inp = document.getElementById(qtyId); if (inp) inp.value = Math.max(0, +inp.value - 1); } }, "−"),
        el("input", { type: "number", value: "0", min: "0", max: "99", id: qtyId, style: { width: "44px" } }),
        el("button", { className: "btn btn--small btn--cancel", onClick: () => { const inp = document.getElementById(qtyId); if (inp) inp.value = Math.min(99, +inp.value + 1); } }, "+"),
        el("button", {
          className: "btn btn--primary btn--small",
          onClick: () => {
            const qty = parseInt(document.getElementById(qtyId)?.value || 0);
            if (qty <= 0) return showToast("请选择数量");
            const r = state.buyItem(id, qty);
            showToast(r.message);
            refreshUI();
          },
        }, "买"),
      ),
    ));
  });
}

function renderSell(salesContainer, catalogContainer, state) {
  catalogContainer.appendChild(el("div", { className: "recipes-section__title", style: { marginBottom: "8px" } }, "💰 出售物品"));

  const entries = state.getInventoryEntries().filter(e => e.type === "ingredient");
  if (entries.length === 0) {
    catalogContainer.appendChild(el("div", { style: { textAlign: "center", padding: "20px", color: "#8d6e63" } }, "没有可出售的食材"));
    return;
  }

  entries.forEach(entry => {
    const qtyId = `sell_qty_${entry.id}`;

    catalogContainer.appendChild(el("div", { className: "shop-item" },
      el("div", {},
        el("div", { className: "shop-item__name" }, `${entry.nameZh} x${entry.qty}`),
        el("div", { className: "shop-item__price" }, `单价 ${entry.sellPrice}G`),
      ),
      el("div", { className: "shop-item__qty" },
        el("button", { className: "btn btn--small btn--cancel", onClick: () => { const inp = document.getElementById(qtyId); if (inp) inp.value = Math.max(0, +inp.value - 1); } }, "−"),
        el("input", { type: "number", value: "0", min: "0", max: String(entry.qty), id: qtyId, style: { width: "44px" } }),
        el("button", { className: "btn btn--small btn--cancel", onClick: () => { const inp = document.getElementById(qtyId); if (inp) inp.value = Math.min(entry.qty, +inp.value + 1); } }, "+"),
        el("button", {
          className: "btn btn--primary btn--small",
          onClick: () => {
            const qty = parseInt(document.getElementById(qtyId)?.value || 0);
            if (qty <= 0) return showToast("请选择数量");
            const r = state.sellItem(entry.id, qty);
            showToast(r.message);
            refreshUI();
          },
        }, "卖"),
      ),
    ));
  });
}
