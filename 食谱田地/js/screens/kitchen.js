// kitchen.js — 厨房：烹饪、成功率、提交

import { ITEMS, MEAL_LABELS, MEAL_EMOJI } from "../config.js";
import { el, showToast } from "../utils.js";
import { refreshUI } from "../app.js";

let activeMealType = "breakfast";

export function renderKitchen(container, state) {
  container.innerHTML = "";

  const todayMenu = state.getTodayMenu();
  if (!todayMenu) {
    container.appendChild(el("div", { className: "card", style: { textAlign: "center" } }, "今天还没有菜单"));
    return;
  }

  // 餐段 Tab
  const tabs = el("div", { className: "kitchen-meal-tabs" });
  ["breakfast", "lunch", "dinner"].forEach(mt => {
    tabs.appendChild(el("button", {
      className: `kitchen-meal-tab ${mt === activeMealType ? "kitchen-meal-tab--active" : ""}`,
      dataset: { meal: mt },
      onClick: () => {
        activeMealType = mt;
        refreshUI();
      },
    }, `${MEAL_EMOJI[mt]} ${MEAL_LABELS[mt]}`));
  });
  container.appendChild(tabs);

  // 当前餐段内容
  const content = el("div", { className: "kitchen-content" });
  const meal = todayMenu.meals[activeMealType];
  const recipe = state.getRecipeById(meal.recipeId);

  if (!recipe) {
    content.appendChild(el("div", { style: { textAlign: "center", padding: "20px", color: "#8d6e63" } }, "找不到菜谱"));
    container.appendChild(content);
    return;
  }

  // 菜名
  content.appendChild(el("div", { className: "kitchen-recipe-name" }, recipe.nameZh));

  // 食材检查表
  recipe.ingredients.forEach(ing => {
    const item = ITEMS[ing.itemId];
    const owned = state.hasItem(ing.itemId, ing.qty);
    content.appendChild(el("div", { className: "kitchen-ingredient" },
      el("span", { className: "kitchen-ingredient__check" }, owned ? "✅" : "❌"),
      el("span", {}, `${item?.nameZh || ing.itemId}`),
      el("span", { style: { marginLeft: "auto", color: owned ? "#4caf50" : "#e53935" } },
        `${Math.min(state.data.inventory[ing.itemId] || 0, ing.qty)}/${ing.qty}`,
      ),
    ));
  });

  // 熟练度
  const prof = state.getProficiency(recipe.id);
  const rate = state.getSuccessRate(recipe.id);
  content.appendChild(el("div", { className: "kitchen-proficiency" },
    el("div", { className: "kitchen-proficiency__label" }, `熟练度：${prof}/100`),
    el("div", { className: "kitchen-proficiency__bar" },
      el("div", { className: "kitchen-proficiency__fill", style: { width: `${prof}%` } }),
    ),
  ));
  content.appendChild(el("div", { className: "kitchen-rate" }, `预计成功率：${Math.floor(rate)}%`));

  // 烹饪按钮
  const canCook = recipe.ingredients.every(ing => state.hasItem(ing.itemId, ing.qty));
  const isCooked = meal.status === "cooked" || meal.status === "submitted";

  if (!isCooked) {
    content.appendChild(el("button", {
      className: "btn btn--accent",
      disabled: !canCook,
      style: { width: "100%", marginTop: "12px" },
      onClick: () => {
        const r = state.cookMeal(activeMealType);
        showToast(r.message);
        refreshUI();
      },
    }, canCook ? "🔥 开火烹饪" : "食材不足，无法烹饪"));
  }

  // 烹饪结果
  if (meal.result) {
    const resultLabels = { perfect: "🎉 完美！", normal: "👍 普通", fail: "😞 失败" };
    content.appendChild(el("div", { className: `kitchen-result kitchen-result--${meal.result}` },
      resultLabels[meal.result],
    ));
  }

  // 提交按钮
  if (meal.status === "cooked") {
    content.appendChild(el("button", {
      className: "btn btn--primary",
      style: { width: "100%", marginTop: "12px" },
      onClick: () => {
        const r = state.submitMeal(activeMealType);
        showToast(r.message);
        refreshUI();
      },
    }, "📤 提交菜品"));
  }

  if (meal.status === "submitted") {
    content.appendChild(el("div", {
      style: { textAlign: "center", padding: "10px", color: "#4caf50", fontWeight: 600 },
    }, "✅ 已提交"));
  }

  container.appendChild(content);
}
