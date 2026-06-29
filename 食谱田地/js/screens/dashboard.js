// dashboard.js — 仪表盘：日期、倒计时、每日菜单卡片

import { MEAL_LABELS, MEAL_EMOJI, ITEMS } from "../config.js";
import { formatDateZh, getNext8am, formatCountdown, el } from "../utils.js";
import { refreshUI } from "../app.js";

export function renderDashboard(container, state) {
  container.innerHTML = "";

  const todayMenu = state.getTodayMenu();
  const streak = state.getStreak();

  // 日期 & 连击
  const header = el("div", { className: "dashboard-header" },
    el("div", { className: "dashboard-date" }, formatDateZh()),
    el("div", { className: "dashboard-streak" }, `🔥 连续 ${streak} 天`),
  );

  // 倒计时卡片
  const countdown = el("div", { className: "countdown-card" },
    el("div", { className: "countdown-label" }, "距离明日菜单刷新"),
    el("div", { className: "countdown-time", id: "countdownDisplay" }, formatCountdown(getNext8am())),
  );

  // 菜单卡片
  const cards = el("div", { className: "meal-cards" });

  if (todayMenu) {
    for (const mt of ["breakfast", "lunch", "dinner"]) {
      const meal = todayMenu.meals[mt];
      const recipe = state.getRecipeById(meal.recipeId);

      if (!recipe) continue;

      const card = el("div", {
        className: "meal-card",
        onClick: () => {
          if (meal.status !== "submitted") {
            window.location.hash = "#kitchen";
            // 延迟一下等路由完成，选中对应餐段 tab
            setTimeout(() => {
              const tabBtn = document.querySelector(`.kitchen-meal-tab[data-meal="${mt}"]`);
              if (tabBtn) tabBtn.click();
            }, 100);
          }
        },
      });

      // 头部：餐段 + 菜名 + 状态
      const statusLabels = { pending: "待完成", cooked: "已烹饪", submitted: "已提交" };
      const statusClass = `meal-card__status--${meal.status}`;

      card.appendChild(el("div", { className: "meal-card__header" },
        el("div", { className: "meal-card__title" },
          `${MEAL_EMOJI[mt]} ${MEAL_LABELS[mt]} · ${recipe.nameZh}`,
        ),
        el("span", { className: `meal-card__status ${statusClass}` }, statusLabels[meal.status]),
      ));

      // 食材列表
      const ings = recipe.ingredients.map(ing => {
        const item = ITEMS[ing.itemId];
        return `${item?.nameZh || ing.itemId} x${ing.qty}`;
      }).join("、");
      card.appendChild(el("div", { className: "meal-card__ingredients" }, `食材：${ings}`));

      // 结果
      if (meal.result) {
        const resultLabels = { perfect: "完美", normal: "普通", fail: "失败" };
        card.appendChild(el("div", { style: { marginTop: "6px", fontSize: "13px", color: meal.result === "perfect" ? "#4caf50" : meal.result === "fail" ? "#e53935" : "#ff9800" } },
          `结果：${resultLabels[meal.result]} · 获得 ${recipe.rewardGold[meal.result]} 金币`,
        ));
      }

      cards.appendChild(card);
    }
  } else {
    cards.appendChild(el("div", { className: "card", style: { textAlign: "center" } }, "菜单加载中…"));
  }

  container.appendChild(header);
  container.appendChild(countdown);
  container.appendChild(cards);
}
