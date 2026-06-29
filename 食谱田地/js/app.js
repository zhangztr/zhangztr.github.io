// app.js — 应用入口：初始化、Tab 路由、全局 refreshUI

import { GameState } from "./state.js";
import { getNext8am, formatDateZh, formatCountdown, showToast, $, el } from "./utils.js";
import { MEAL_LABELS } from "./config.js";
import { renderDashboard } from "./screens/dashboard.js";
import { renderFarm } from "./screens/farm.js";
import { renderSupermarket } from "./screens/supermarket.js";
import { renderKitchen } from "./screens/kitchen.js";
import { renderInventory } from "./screens/inventory.js";
import { renderRecipes } from "./screens/recipes.js";

// ============ 全局实例 ============
export const gameState = new GameState();

// 屏幕渲染表
const SCREENS = {
  dashboard: renderDashboard,
  farm: renderFarm,
  supermarket: renderSupermarket,
  kitchen: renderKitchen,
  inventory: renderInventory,
  recipes: renderRecipes,
};

let currentTab = "dashboard";
let countdownInterval = null;

// ============ 路由 ============

function routeTo(tab) {
  currentTab = tab;

  // 更新屏幕显示
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("screen--active"));
  const target = document.getElementById(`screen-${tab}`);
  if (target) target.classList.add("screen--active");

  // 更新底部导航
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("nav-btn--active"));
  const navBtn = document.querySelector(`.nav-btn[data-tab="${tab}"]`);
  if (navBtn) navBtn.classList.add("nav-btn--active");

  // 渲染当前屏幕
  refreshUI();

  // 更新顶部标题
  const titles = {
    dashboard: "食谱田地",
    farm: "田地",
    supermarket: "超市",
    kitchen: "厨房",
    inventory: "背包",
    recipes: "菜谱",
  };
  document.getElementById("topBarTitle").textContent = titles[tab] || "食谱田地";
}

export function refreshUI() {
  // 更新金币显示
  document.getElementById("topBarGold").textContent = `🪙 ${gameState.getGold()}`;

  // 渲染当前屏幕
  const renderFn = SCREENS[currentTab];
  if (renderFn) {
    const container = document.getElementById(`screen-${currentTab}`);
    if (container) renderFn(container, gameState);
  }
}

// ============ 每日检查 ============

export function checkAndRefreshMenu() {
  if (gameState.needsMenuRefresh()) {
    // 如果过了 8 点但菜单没有刷新，或者菜单是昨天的
    gameState.refreshDailyMenu();
    showToast("今日菜单已刷新！");
    return true;
  }
  return false;
}

// ============ 倒计时 ============

function startCountdown() {
  if (countdownInterval) clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    const el = document.getElementById("countdownDisplay");
    if (el && currentTab === "dashboard") {
      el.textContent = formatCountdown(getNext8am());
    }
  }, 1000);
}

// ============ 初始化 ============

function init() {
  // 首次运行或每日刷新
  const firstRun = !gameState.getTodayMenu();
  const refreshed = checkAndRefreshMenu();

  if (firstRun && !refreshed) {
    // 全新开局，刷第一天的菜单
    gameState.refreshDailyMenu();
  }

  // 底部导航事件
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      routeTo(btn.dataset.tab);
    });
  });

  // 启动倒计时
  startCountdown();

  // 初始路由
  routeTo("dashboard");

  // 注册 Service Worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}

document.addEventListener("DOMContentLoaded", init);
