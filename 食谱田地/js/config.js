// config.js — 静态游戏数据：物品、作物、菜谱、初始状态

// ==================== ITEMS ====================

export const ITEMS = {
  // 种子
  scallion_seed:   { id: "scallion_seed",   nameZh: "葱种子",   type: "seed",       buyPrice: 5,  sellPrice: 2,  isRare: false },
  tomato_seed:     { id: "tomato_seed",     nameZh: "番茄种子", type: "seed",       buyPrice: 8,  sellPrice: 4,  isRare: false },
  rice_seed:       { id: "rice_seed",       nameZh: "水稻种子", type: "seed",       buyPrice: 15, sellPrice: 7,  isRare: false },
  wheat_seed:      { id: "wheat_seed",      nameZh: "小麦种子", type: "seed",       buyPrice: 6,  sellPrice: 3,  isRare: false },
  carrot_seed:     { id: "carrot_seed",     nameZh: "胡萝卜种子", type: "seed",    buyPrice: 4,  sellPrice: 2,  isRare: false },

  // 食材
  scallion:        { id: "scallion",        nameZh: "葱",       type: "ingredient", buyPrice: 8,  sellPrice: 4,  isRare: false },
  tomato:          { id: "tomato",          nameZh: "番茄",     type: "ingredient", buyPrice: 12, sellPrice: 6,  isRare: false },
  rice:            { id: "rice",            nameZh: "大米",     type: "ingredient", buyPrice: 20, sellPrice: 10, isRare: false },
  wheat:           { id: "wheat",           nameZh: "小麦",     type: "ingredient", buyPrice: 10, sellPrice: 5,  isRare: false },
  carrot:          { id: "carrot",          nameZh: "胡萝卜",   type: "ingredient", buyPrice: 7,  sellPrice: 3,  isRare: false },
  egg:             { id: "egg",             nameZh: "鸡蛋",     type: "ingredient", buyPrice: 10, sellPrice: 5,  isRare: false },
  salt:            { id: "salt",            nameZh: "盐",       type: "ingredient", buyPrice: 5,  sellPrice: 2,  isRare: false },
  flour:           { id: "flour",           nameZh: "面粉",     type: "ingredient", buyPrice: 8,  sellPrice: 4,  isRare: false },
  oil:             { id: "oil",             nameZh: "食用油",   type: "ingredient", buyPrice: 6,  sellPrice: 3,  isRare: false },
  soy_sauce:       { id: "soy_sauce",       nameZh: "酱油",     type: "ingredient", buyPrice: 8,  sellPrice: 4,  isRare: false },
  pork:            { id: "pork",            nameZh: "猪肉",     type: "ingredient", buyPrice: 25, sellPrice: 12, isRare: false },
  chicken:         { id: "chicken",         nameZh: "鸡肉",     type: "ingredient", buyPrice: 22, sellPrice: 11, isRare: false },
  milk:            { id: "milk",            nameZh: "牛奶",     type: "ingredient", buyPrice: 10, sellPrice: 5,  isRare: false },
  sugar:           { id: "sugar",           nameZh: "糖",       type: "ingredient", buyPrice: 5,  sellPrice: 2,  isRare: false },
  chili:           { id: "chili",           nameZh: "辣椒",     type: "ingredient", buyPrice: 6,  sellPrice: 3,  isRare: false },
  potato:          { id: "potato",          nameZh: "土豆",     type: "ingredient", buyPrice: 7,  sellPrice: 3,  isRare: false },
  cabbage:         { id: "cabbage",         nameZh: "白菜",     type: "ingredient", buyPrice: 5,  sellPrice: 2,  isRare: false },
  tofu:            { id: "tofu",            nameZh: "豆腐",     type: "ingredient", buyPrice: 6,  sellPrice: 3,  isRare: false },
  mushroom:        { id: "mushroom",        nameZh: "蘑菇",     type: "ingredient", buyPrice: 15, sellPrice: 7,  isRare: true  },
  truffle:         { id: "truffle",         nameZh: "松露",     type: "ingredient", buyPrice: 0,  sellPrice: 50, isRare: true  },
};

// ==================== CROPS ====================

export const CROPS = [
  { id: "scallion", seedId: "scallion_seed", harvestId: "scallion", nameZh: "葱",     growthDays: 1, emoji: "🌱" },
  { id: "carrot",   seedId: "carrot_seed",   harvestId: "carrot",   nameZh: "胡萝卜", growthDays: 2, emoji: "🥕" },
  { id: "wheat",    seedId: "wheat_seed",    harvestId: "wheat",    nameZh: "小麦",   growthDays: 2, emoji: "🌾" },
  { id: "tomato",   seedId: "tomato_seed",   harvestId: "tomato",   nameZh: "番茄",   growthDays: 3, emoji: "🍅" },
  { id: "rice",     seedId: "rice_seed",     harvestId: "rice",     nameZh: "水稻",   growthDays: 5, emoji: "🍚" },
];

export function getCropById(cropId) {
  return CROPS.find(c => c.id === cropId);
}

// ==================== PRESET RECIPES ====================

const 早 = "breakfast";
const 午 = "lunch";
const 晚 = "dinner";

export const PRESET_RECIPES = [
  { id: "scallion_pancake", nameZh: "葱油饼",   mealType: 早, difficulty: 1, ingredients: [{ itemId: "scallion", qty: 2 }, { itemId: "flour", qty: 2 }, { itemId: "oil", qty: 1 }, { itemId: "salt", qty: 1 }], rewardGold: { perfect: 50, normal: 35, fail: 0 } },
  { id: "egg_pancake",     nameZh: "鸡蛋饼",   mealType: 早, difficulty: 1, ingredients: [{ itemId: "egg", qty: 2 }, { itemId: "flour", qty: 2 }, { itemId: "oil", qty: 1 }], rewardGold: { perfect: 55, normal: 38, fail: 0 } },
  { id: "milk_cereal",     nameZh: "牛奶麦片", mealType: 早, difficulty: 1, ingredients: [{ itemId: "milk", qty: 1 }, { itemId: "wheat", qty: 2 }, { itemId: "sugar", qty: 1 }], rewardGold: { perfect: 40, normal: 28, fail: 0 } },
  { id: "tomato_egg",      nameZh: "番茄炒蛋", mealType: 午, difficulty: 1, ingredients: [{ itemId: "tomato", qty: 2 }, { itemId: "egg", qty: 2 }, { itemId: "salt", qty: 1 }, { itemId: "oil", qty: 1 }], rewardGold: { perfect: 70, normal: 50, fail: 0 } },
  { id: "mapo_tofu",       nameZh: "麻婆豆腐", mealType: 午, difficulty: 2, ingredients: [{ itemId: "tofu", qty: 2 }, { itemId: "pork", qty: 1 }, { itemId: "chili", qty: 2 }, { itemId: "soy_sauce", qty: 1 }, { itemId: "scallion", qty: 1 }], rewardGold: { perfect: 100, normal: 70, fail: 0 } },
  { id: "cabbage_stirfry", nameZh: "清炒白菜", mealType: 午, difficulty: 1, ingredients: [{ itemId: "cabbage", qty: 3 }, { itemId: "salt", qty: 1 }, { itemId: "oil", qty: 1 }], rewardGold: { perfect: 55, normal: 38, fail: 0 } },
  { id: "fried_rice",      nameZh: "蛋炒饭",   mealType: 晚, difficulty: 1, ingredients: [{ itemId: "rice", qty: 2 }, { itemId: "egg", qty: 2 }, { itemId: "scallion", qty: 1 }, { itemId: "oil", qty: 1 }, { itemId: "salt", qty: 1 }], rewardGold: { perfect: 80, normal: 56, fail: 0 } },
  { id: "braised_pork",    nameZh: "红烧肉",   mealType: 晚, difficulty: 3, ingredients: [{ itemId: "pork", qty: 3 }, { itemId: "soy_sauce", qty: 2 }, { itemId: "sugar", qty: 1 }, { itemId: "scallion", qty: 2 }], rewardGold: { perfect: 150, normal: 105, fail: 0 } },
  { id: "chicken_soup",    nameZh: "鸡汤",     mealType: 晚, difficulty: 2, ingredients: [{ itemId: "chicken", qty: 2 }, { itemId: "carrot", qty: 2 }, { itemId: "mushroom", qty: 1 }, { itemId: "salt", qty: 1 }], rewardGold: { perfect: 130, normal: 91, fail: 0 } },
];

export const MEAL_TYPES = ["breakfast", "lunch", "dinner"];
export const MEAL_LABELS = { breakfast: "早餐", lunch: "午餐", dinner: "晚餐" };
export const MEAL_EMOJI = { breakfast: "🌅", lunch: "☀️", dinner: "🌙" };

// ==================== SHOP ====================

export const SHOP_STOCK = [
  "scallion_seed", "tomato_seed", "rice_seed", "wheat_seed", "carrot_seed",
  "egg", "salt", "flour", "oil", "soy_sauce", "pork", "chicken",
  "milk", "sugar", "chili", "potato", "cabbage", "tofu",
];

// ==================== DEFAULT GAME STATE ====================

export function createDefaultState() {
  return {
    version: 1,
    gold: 100,
    streak: 0,
    lastLoginDate: "",
    gameDay: 1,
    todayMenu: null,
    inventory: {
      scallion_seed: 3, tomato_seed: 2, rice_seed: 1, wheat_seed: 2, carrot_seed: 2,
      egg: 4, salt: 5, flour: 3, oil: 3,
    },
    farmPlots: [
      { cropId: null, plantedDay: 0, growthDaysAccrued: 0, wateredToday: false },
      { cropId: null, plantedDay: 0, growthDaysAccrued: 0, wateredToday: false },
      { cropId: null, plantedDay: 0, growthDaysAccrued: 0, wateredToday: false },
      { cropId: null, plantedDay: 0, growthDaysAccrued: 0, wateredToday: false },
    ],
    customRecipes: [],
    unlockedRecipes: PRESET_RECIPES.map(r => r.id),
    proficiency: {},
    shopSales: [],
  };
}
