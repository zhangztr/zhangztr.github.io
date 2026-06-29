// recipes.js — 菜谱管理：预设查看 + 自创菜谱 CRUD

import { PRESET_RECIPES, MEAL_LABELS, ITEMS } from "../config.js";
import { el, showToast, showConfirm } from "../utils.js";
import { refreshUI } from "../app.js";

let editingRecipeId = null;

export function renderRecipes(container, state) {
  container.innerHTML = "";

  const wrapper = el("div", { className: "recipes-sections" });

  // 预设菜谱（只读）
  wrapper.appendChild(el("div", { className: "recipes-section" },
    el("div", { className: "recipes-section__title" }, "📗 预设菜谱"),
    el("div", { style: { fontSize: "12px", color: "#8d6e63", marginBottom: "8px" } }, "系统自带，不可删除"),
  ));
  PRESET_RECIPES.forEach(recipe => {
    wrapper.appendChild(renderRecipeCard(state, recipe, false));
  });

  // 自创菜谱
  const customRecipes = state.getCustomRecipes();
  wrapper.appendChild(el("div", { className: "recipes-section", style: { marginTop: "16px" } },
    el("div", { className: "recipes-section__title" }, "✏️ 自创菜谱"),
    el("div", { style: { fontSize: "12px", color: "#8d6e63", marginBottom: "8px" } },
      customRecipes.length === 0 ? "还没有自创菜谱，点下方按钮添加" : `共 ${customRecipes.length} 道`,
    ),
  ));
  customRecipes.forEach(recipe => {
    wrapper.appendChild(renderRecipeCard(state, recipe, true));
  });

  // 新建按钮
  wrapper.appendChild(el("button", {
    className: "btn btn--primary",
    style: { width: "100%", marginTop: "12px" },
    onClick: () => openRecipeForm(state, null),
  }, "+ 新建菜谱"));

  container.appendChild(wrapper);
}

function renderRecipeCard(state, recipe, isCustom) {
  const ings = recipe.ingredients.map(ing => {
    const item = ITEMS[ing.itemId];
    return `${item?.nameZh || ing.itemId} x${ing.qty}`;
  }).join("、");

  const card = el("div", { className: "recipe-item" },
    el("div", { className: "recipe-item__header" },
      el("div", {},
        el("span", { className: "recipe-item__name" }, recipe.nameZh),
        isCustom ? el("span", { style: { fontSize: "11px", color: "#e8923b", marginLeft: "6px" } }, "自创") : null,
      ),
      el("span", { className: "recipe-item__meta" },
        `${MEAL_LABELS[recipe.mealType]} · 难度 ${"⭐".repeat(recipe.difficulty)}`,
      ),
    ),
    el("div", { className: "recipe-item__ingredients" }, `食材：${ings}`),
  );

  if (isCustom) {
    card.appendChild(el("div", { className: "recipe-item__actions" },
      el("button", {
        className: "btn btn--small btn--cancel",
        onClick: () => openRecipeForm(state, recipe),
      }, "编辑"),
      el("button", {
        className: "btn btn--small btn--danger",
        onClick: async () => {
          const confirmed = await showConfirm(`确定要删除「${recipe.nameZh}」吗？`);
          if (confirmed) {
            const r = state.deleteCustomRecipe(recipe.id);
            showToast(r.message);
            refreshUI();
          }
        },
      }, "删除"),
    ));
  }

  return card;
}

// ============ 菜谱表单弹窗 ============

function openRecipeForm(state, recipe) {
  editingRecipeId = recipe?.id || null;
  const isEdit = !!recipe;

  const modal = document.getElementById("recipeFormModal");
  document.getElementById("recipeFormTitle").textContent = isEdit ? "编辑菜谱" : "新建菜谱";

  const body = document.getElementById("recipeFormBody");
  body.innerHTML = "";

  // 菜名
  body.appendChild(el("div", { className: "form-group" },
    el("label", { className: "form-label" }, "菜名"),
    el("input", { className: "form-input", id: "recipeName", value: recipe?.nameZh || "", placeholder: "例如：红烧排骨" }),
  ));

  // 餐段
  body.appendChild(el("div", { className: "form-group" },
    el("label", { className: "form-label" }, "餐段"),
    el("select", { className: "form-select", id: "recipeMealType" },
      el("option", { value: "breakfast", selected: recipe?.mealType === "breakfast" || undefined }, "早餐"),
      el("option", { value: "lunch", selected: recipe?.mealType === "lunch" || undefined }, "午餐"),
      el("option", { value: "dinner", selected: recipe?.mealType === "dinner" || (!recipe && undefined) }, "晚餐"),
    ),
  ));

  // 难度
  body.appendChild(el("div", { className: "form-group" },
    el("label", { className: "form-label" }, "难度"),
    el("select", { className: "form-select", id: "recipeDifficulty" },
      el("option", { value: "1", selected: recipe?.difficulty === 1 || undefined }, "⭐ 简单"),
      el("option", { value: "2", selected: recipe?.difficulty === 2 || (!recipe && undefined) }, "⭐⭐ 中等"),
      el("option", { value: "3", selected: recipe?.difficulty === 3 || undefined }, "⭐⭐⭐ 困难"),
    ),
  ));

  // 食材列表
  const ingredientsContainer = el("div", { className: "form-group" });
  ingredientsContainer.appendChild(el("label", { className: "form-label" }, "食材配方"));

  const ingredientRows = el("div", { id: "ingredientRows" });
  const currentIngs = recipe ? [...recipe.ingredients] : [{ itemId: "egg", qty: 1 }];

  function addIngredientRow(itemId = "egg", qty = 1) {
    const itemOptions = Object.entries(ITEMS)
      .filter(([_, item]) => item.type === "ingredient")
      .map(([id, item]) => el("option", { value: id, selected: id === itemId || undefined }, item.nameZh));

    const row = el("div", { className: "form-ingredient-row" },
      el("select", { className: "form-select" }, ...itemOptions),
      el("input", { type: "number", className: "form-input", value: String(qty), min: "1", max: "99", style: { width: "56px" } }),
      el("button", {
        className: "btn btn--small btn--danger",
        onClick: () => {
          const rows = document.querySelectorAll(".form-ingredient-row");
          if (rows.length > 1) row.remove();
        },
      }, "✕"),
    );
    ingredientRows.appendChild(row);
  }

  currentIngs.forEach(ing => addIngredientRow(ing.itemId, ing.qty));
  ingredientsContainer.appendChild(ingredientRows);

  ingredientsContainer.appendChild(el("button", {
    className: "btn btn--small btn--outline",
    style: { marginTop: "6px" },
    onClick: () => addIngredientRow(),
  }, "+ 添加食材"));

  body.appendChild(ingredientsContainer);

  // 保存
  document.getElementById("recipeFormSave").onclick = () => {
    const nameZh = document.getElementById("recipeName").value;
    const mealType = document.getElementById("recipeMealType").value;
    const difficulty = parseInt(document.getElementById("recipeDifficulty").value);
    const rows = document.querySelectorAll("#ingredientRows .form-ingredient-row");
    const ingredients = [];
    rows.forEach(row => {
      const sel = row.querySelector("select");
      const inp = row.querySelector("input");
      if (sel && inp && parseInt(inp.value) > 0) {
        ingredients.push({ itemId: sel.value, qty: parseInt(inp.value) });
      }
    });

    if (isEdit) {
      const r = state.updateCustomRecipe(editingRecipeId, { nameZh, mealType, difficulty, ingredients });
      showToast(r.message);
      if (r.success) { modal.style.display = "none"; refreshUI(); }
    } else {
      const r = state.addCustomRecipe({ nameZh, mealType, difficulty, ingredients });
      showToast(r.message);
      if (r.success) { modal.style.display = "none"; refreshUI(); }
    }
  };

  document.getElementById("recipeFormCancel").onclick = () => { modal.style.display = "none"; };
  modal.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };
  modal.style.display = "flex";
}
