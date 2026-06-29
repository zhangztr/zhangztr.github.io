// state.js — GameState 类：状态加载、保存、所有变更方法

import { createDefaultState, ITEMS, getCropById, MEAL_TYPES, PRESET_RECIPES } from "./config.js";

const STORAGE_KEY = "recipeFarmState";

export class GameState {
  constructor() {
    this.data = this._load();
  }

  // ============ localStorage 读写 ============

  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const defaults = createDefaultState();
        // 深度合并，确保新字段有默认值
        return this._merge(defaults, saved);
      }
    } catch (e) {
      console.warn("加载存档失败，使用新存档", e);
    }
    return createDefaultState();
  }

  _merge(defaults, saved) {
    const result = { ...defaults, ...saved };
    // farmPlots 逐项合并
    if (saved.farmPlots && Array.isArray(saved.farmPlots)) {
      result.farmPlots = saved.farmPlots.map((plot, i) => ({
        ...defaults.farmPlots[Math.min(i, defaults.farmPlots.length - 1)],
        ...plot,
      }));
    }
    if (saved.inventory) {
      result.inventory = { ...defaults.inventory, ...saved.inventory };
    }
    return result;
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      return true;
    } catch (e) {
      console.error("存档保存失败", e);
      return false;
    }
  }

  reset() {
    this.data = createDefaultState();
    this.save();
  }

  // ============ 通用 ============

  getGold() { return this.data.gold; }
  getStreak() { return this.data.streak; }
  getGameDay() { return this.data.gameDay; }

  addGold(amount) {
    this.data.gold += amount;
    this.save();
    return { success: true, message: `获得 ${amount} 金币` };
  }

  spendGold(amount) {
    if (this.data.gold < amount) {
      return { success: false, message: "金币不足" };
    }
    this.data.gold -= amount;
    this.save();
    return { success: true, message: `花费 ${amount} 金币` };
  }

  // ============ 库存 ============

  getInventory() {
    return { ...this.data.inventory };
  }

  getInventoryEntries() {
    return Object.entries(this.data.inventory)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => ({ ...ITEMS[id], qty }));
  }

  hasItem(itemId, qty = 1) {
    return (this.data.inventory[itemId] || 0) >= qty;
  }

  addItem(itemId, qty = 1) {
    if (!ITEMS[itemId]) return { success: false, message: "未知物品" };
    this.data.inventory[itemId] = (this.data.inventory[itemId] || 0) + qty;
    this.save();
    return { success: true, message: `获得 ${ITEMS[itemId].nameZh} x${qty}` };
  }

  removeItem(itemId, qty = 1) {
    const current = this.data.inventory[itemId] || 0;
    if (current < qty) return { success: false, message: `${ITEMS[itemId]?.nameZh || itemId} 数量不足` };
    this.data.inventory[itemId] = current - qty;
    this.save();
    return { success: true, message: `消耗 ${ITEMS[itemId].nameZh} x${qty}` };
  }

  // ============ 田地 ============

  getFarmPlots() { return this.data.farmPlots; }

  plantCrop(plotIndex, cropId) {
    if (plotIndex < 0 || plotIndex >= this.data.farmPlots.length) {
      return { success: false, message: "无效的田地编号" };
    }
    const plot = this.data.farmPlots[plotIndex];
    if (plot.cropId !== null) {
      return { success: false, message: "这块地已经种了东西" };
    }
    const crop = getCropById(cropId);
    if (!crop) return { success: false, message: "未知作物" };

    const seedResult = this.removeItem(crop.seedId, 1);
    if (!seedResult.success) return { success: false, message: `缺少${ITEMS[crop.seedId].nameZh}` };

    plot.cropId = cropId;
    plot.plantedDay = this.data.gameDay;
    plot.growthDaysAccrued = 0;
    plot.wateredToday = false;
    this.save();
    return { success: true, message: `种下了${crop.nameZh}` };
  }

  waterPlot(plotIndex) {
    if (plotIndex < 0 || plotIndex >= this.data.farmPlots.length) {
      return { success: false, message: "无效的田地编号" };
    }
    const plot = this.data.farmPlots[plotIndex];
    if (plot.cropId === null) return { success: false, message: "这块地还没种东西" };
    if (plot.wateredToday) return { success: false, message: "今天已经浇过水了" };

    plot.wateredToday = true;
    plot.growthDaysAccrued += 1;
    this.save();

    const crop = getCropById(plot.cropId);
    const daysLeft = crop.growthDays - plot.growthDaysAccrued;
    return { success: true, message: `浇水完成！还有 ${Math.max(0, daysLeft)} 天成熟` };
  }

  harvestPlot(plotIndex) {
    if (plotIndex < 0 || plotIndex >= this.data.farmPlots.length) {
      return { success: false, message: "无效的田地编号" };
    }
    const plot = this.data.farmPlots[plotIndex];
    if (plot.cropId === null) return { success: false, message: "这块地还没种东西" };

    const crop = getCropById(plot.cropId);
    if (plot.growthDaysAccrued < crop.growthDays) {
      return { success: false, message: `${crop.nameZh}还没成熟（${plot.growthDaysAccrued}/${crop.growthDays}天）` };
    }

    plot.cropId = null;
    plot.plantedDay = 0;
    plot.growthDaysAccrued = 0;
    plot.wateredToday = false;
    const qty = 2 + Math.floor(Math.random() * 3); // 收获 2-4 个
    this.addItem(crop.harvestId, qty);
    this.save();
    return { success: true, message: `收获了 ${qty} 个${crop.nameZh}！` };
  }

  // ============ 当日菜单 ============

  getTodayMenu() { return this.data.todayMenu; }

  getAllRecipes() {
    return [...PRESET_RECIPES, ...this.data.customRecipes];
  }

  getRecipeById(id) {
    return this.getAllRecipes().find(r => r.id === id);
  }

  setMealStatus(mealType, status, result = null) {
    if (!this.data.todayMenu) return { success: false, message: "今天还没有菜单" };
    const meal = this.data.todayMenu.meals[mealType];
    if (!meal) return { success: false, message: "无效的餐段" };
    meal.status = status;
    if (result !== null) meal.result = result;
    this.save();
    return { success: true };
  }

  // ============ 烹饪 ============

  getProficiency(recipeId) {
    return this.data.proficiency[recipeId] || 0;
  }

  getSuccessRate(recipeId) {
    return 60 + this.getProficiency(recipeId) * 0.4;
  }

  cookMeal(mealType) {
    if (!this.data.todayMenu) return { success: false, message: "今天还没有菜单" };
    const meal = this.data.todayMenu.meals[mealType];
    if (!meal) return { success: false, message: "无效的餐段" };
    if (meal.status !== "pending") return { success: false, message: "这道菜已经烹饪过了" };

    const recipe = this.getRecipeById(meal.recipeId);
    if (!recipe) return { success: false, message: "找不到菜谱" };

    // 检查食材
    for (const ing of recipe.ingredients) {
      if (!this.hasItem(ing.itemId, ing.qty)) {
        return { success: false, message: `食材不足：缺少 ${ITEMS[ing.itemId]?.nameZh || ing.itemId}` };
      }
    }

    // 消耗食材
    for (const ing of recipe.ingredients) {
      this.removeItem(ing.itemId, ing.qty);
    }

    // 计算成功率
    const rate = this.getSuccessRate(meal.recipeId);
    const roll = Math.random() * 100;
    let result;
    if (roll < rate * 0.65) result = "perfect";
    else if (roll < rate) result = "normal";
    else result = "fail";

    // 更新熟练度
    const profGain = result === "perfect" ? 5 : result === "normal" ? 2 : 1;
    this.data.proficiency[meal.recipeId] = Math.min(100, (this.data.proficiency[meal.recipeId] || 0) + profGain);

    meal.status = "cooked";
    meal.result = result;
    this.save();
    return { success: true, message: `烹饪完成：${result === "perfect" ? "完美！" : result === "normal" ? "普通" : "失败了……"}`, result };
  }

  submitMeal(mealType) {
    if (!this.data.todayMenu) return { success: false, message: "今天还没有菜单" };
    const meal = this.data.todayMenu.meals[mealType];
    if (!meal) return { success: false, message: "无效的餐段" };
    if (meal.status !== "cooked") return { success: false, message: "请先烹饪这道菜" };

    const recipe = this.getRecipeById(meal.recipeId);
    const reward = recipe.rewardGold[meal.result];
    this.addGold(reward);
    meal.status = "submitted";

    // 检查当日是否全部提交
    const allSubmitted = MEAL_TYPES.every(mt => this.data.todayMenu.meals[mt].status === "submitted");
    if (allSubmitted) {
      this.data.streak += 1;
    }

    this.save();
    return { success: true, message: `提交成功！获得 ${reward} 金币`, reward };
  }

  // ============ 自定义菜谱 ============

  getCustomRecipes() {
    return this.data.customRecipes;
  }

  addCustomRecipe({ nameZh, mealType, difficulty, ingredients, rewardGold }) {
    // 名称为空
    if (!nameZh || !nameZh.trim()) return { success: false, message: "菜名不能为空" };
    // 重名检查
    const all = this.getAllRecipes();
    if (all.some(r => r.nameZh === nameZh.trim())) return { success: false, message: "已有同名菜谱" };
    // 食材检查
    if (!ingredients || ingredients.length === 0) return { success: false, message: "至少需要一种食材" };
    for (const ing of ingredients) {
      if (!ITEMS[ing.itemId]) return { success: false, message: `未知食材：${ing.itemId}` };
      if (!ing.qty || ing.qty < 1) return { success: false, message: "食材数量至少为 1" };
    }

    const id = "custom_" + Date.now();
    const recipe = {
      id,
      nameZh: nameZh.trim(),
      mealType,
      difficulty: Math.min(3, Math.max(1, difficulty || 1)),
      ingredients: ingredients.map(i => ({ itemId: i.itemId, qty: i.qty })),
      rewardGold: {
        perfect: rewardGold?.perfect || this._calcReward(ingredients, "perfect"),
        normal: rewardGold?.normal || this._calcReward(ingredients, "normal"),
        fail: 0,
      },
    };

    this.data.customRecipes.push(recipe);
    this.data.unlockedRecipes.push(id);
    this.save();
    return { success: true, message: `菜谱「${recipe.nameZh}」已添加`, recipe };
  }

  updateCustomRecipe(id, updates) {
    const idx = this.data.customRecipes.findIndex(r => r.id === id);
    if (idx === -1) return { success: false, message: "找不到这个菜谱" };

    const recipe = this.data.customRecipes[idx];
    if (updates.nameZh !== undefined) {
      if (!updates.nameZh.trim()) return { success: false, message: "菜名不能为空" };
      const others = this.getAllRecipes().filter(r => r.id !== id);
      if (others.some(r => r.nameZh === updates.nameZh.trim())) return { success: false, message: "已有同名菜谱" };
      recipe.nameZh = updates.nameZh.trim();
    }
    if (updates.mealType !== undefined) recipe.mealType = updates.mealType;
    if (updates.difficulty !== undefined) recipe.difficulty = Math.min(3, Math.max(1, updates.difficulty));
    if (updates.ingredients !== undefined) {
      if (updates.ingredients.length === 0) return { success: false, message: "至少需要一种食材" };
      recipe.ingredients = updates.ingredients;
    }
    this.save();
    return { success: true, message: `菜谱「${recipe.nameZh}」已更新` };
  }

  deleteCustomRecipe(id) {
    const idx = this.data.customRecipes.findIndex(r => r.id === id);
    if (idx === -1) return { success: false, message: "找不到这个菜谱" };
    const name = this.data.customRecipes[idx].nameZh;
    this.data.customRecipes.splice(idx, 1);
    this.data.unlockedRecipes = this.data.unlockedRecipes.filter(rid => rid !== id);
    delete this.data.proficiency[id];
    this.save();
    return { success: true, message: `菜谱「${name}」已删除` };
  }

  _calcReward(ingredients, tier) {
    let base = 0;
    for (const ing of ingredients) {
      const item = ITEMS[ing.itemId];
      base += (item?.buyPrice || 5) * ing.qty;
    }
    return tier === "perfect" ? Math.floor(base * 1.8) : Math.floor(base * 1.2);
  }

  // ============ 超市 ============

  getShopSales() { return this.data.shopSales; }

  setShopSales(sales) {
    this.data.shopSales = sales;
    this.save();
  }

  buyItem(itemId, qty = 1, unitPrice = null) {
    if (!ITEMS[itemId]) return { success: false, message: "未知物品" };
    if (ITEMS[itemId].isRare) return { success: false, message: "稀有食材不出售" };
    const price = unitPrice ?? ITEMS[itemId].buyPrice;
    const total = price * qty;
    const spendResult = this.spendGold(total);
    if (!spendResult.success) return { success: false, message: `金币不足，需要 ${total} 金币` };
    this.addItem(itemId, qty);
    this.save();
    return { success: true, message: `购买了 ${ITEMS[itemId].nameZh} x${qty}，花费 ${total} 金币` };
  }

  sellItem(itemId, qty = 1) {
    if (!ITEMS[itemId]) return { success: false, message: "未知物品" };
    const removeResult = this.removeItem(itemId, qty);
    if (!removeResult.success) return removeResult;
    const total = ITEMS[itemId].sellPrice * qty;
    this.data.gold += total;
    this.save();
    return { success: true, message: `出售了 ${ITEMS[itemId].nameZh} x${qty}，获得 ${total} 金币` };
  }

  // ============ 每日刷新 ============

  refreshDailyMenu(fallbackRecipes = null) {
    const pool = fallbackRecipes || this.getAllRecipes();
    if (pool.length === 0) return { success: false, message: "没有可用的菜谱" };

    const byType = { breakfast: [], lunch: [], dinner: [] };
    for (const r of pool) {
      byType[r.mealType]?.push(r);
    }

    // 如果某个餐段没有菜谱，从全部池中随机
    const meals = {};
    for (const mt of MEAL_TYPES) {
      const candidates = byType[mt].length > 0 ? byType[mt] : pool;
      meals[mt] = {
        recipeId: candidates[Math.floor(Math.random() * candidates.length)].id,
        status: "pending",
        result: null,
      };
    }

    const today = this._todayStr();
    this.data.todayMenu = { date: today, meals };
    this.data.gameDay += 1;
    this.data.lastLoginDate = today;

    // 重置浇水状态
    this.data.farmPlots.forEach(p => { p.wateredToday = false; });

    // 生成超市特价（1-3 种随机物品）
    const shopable = Object.keys(ITEMS).filter(id => !ITEMS[id].isRare && ITEMS[id].type === "ingredient");
    const saleCount = 1 + Math.floor(Math.random() * 3);
    const sales = [];
    for (let i = 0; i < saleCount; i++) {
      const itemId = shopable[Math.floor(Math.random() * shopable.length)];
      const discount = [20, 25, 30, 40][Math.floor(Math.random() * 4)];
      sales.push({ itemId, discountPercent: discount });
    }
    this.data.shopSales = sales;

    this.save();
    return { success: true, message: "今日菜单已刷新！" };
  }

  needsMenuRefresh() {
    return !this.data.todayMenu || this.data.todayMenu.date !== this._todayStr();
  }

  _todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
}
