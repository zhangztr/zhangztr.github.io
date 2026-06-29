// farm.js — 田地：图形化种植体验

import { getCropById, CROPS } from "../config.js";
import { el, showToast } from "../utils.js";
import { refreshUI } from "../app.js";

let plantTargetPlot = -1;

export function renderFarm(container, state) {
  container.innerHTML = "";

  const scene = el("div", { className: "farm-scene" });

  // 田地名牌
  scene.appendChild(el("div", {
    style: { fontSize: "13px", color: "#8d6e63", marginBottom: "8px", textAlign: "center" },
  }, `🌾 第 ${state.getGameDay()} 天 · ${4 - state.getFarmPlots().filter(p => !p.cropId).length}/4 块地在种`));

  const field = el("div", { className: "farm-field" });
  const plots = state.getFarmPlots();

  plots.forEach((plot, i) => {
    const crop = plot.cropId ? getCropById(plot.cropId) : null;
    const progress = crop ? Math.min(1, plot.growthDaysAccrued / crop.growthDays) : 0;
    const isHarvestable = crop && progress >= 1;
    const growthStage = crop ? getGrowthStage(progress) : null;

    let plotClass = "farm-plot";
    if (!crop) plotClass += " farm-plot--empty";
    else {
      plotClass += " farm-plot--planted";
      if (plot.wateredToday) plotClass += " farm-plot--watered";
      if (isHarvestable) plotClass += " farm-plot--harvestable";
    }

    const plotEl = el("div", {
      className: plotClass,
      onClick: (e) => handlePlotClick(e, i, crop, plot, isHarvestable, state),
    });

    if (!crop) {
      // 空地：加号
      plotEl.appendChild(el("div", { className: "farm-plot__add" }, "+"));
      plotEl.appendChild(el("div", { className: "farm-plot__label" }, `田地 ${i + 1}`));
    } else {
      // 生长阶段圆点
      const dots = el("div", { className: "farm-plot__dots" });
      for (let d = 0; d < crop.growthDays; d++) {
        dots.appendChild(el("div", {
          className: `farm-plot__dot ${d < plot.growthDaysAccrued ? "farm-plot__dot--filled" : ""}`,
        }));
      }
      plotEl.appendChild(dots);

      // 浇水标记
      if (plot.wateredToday) {
        plotEl.appendChild(el("div", { className: "farm-plot__water-drops" }, "💧"));
      }

      // 作物图形
      const cropEl = el("div", { className: "farm-plot__crop" },
        el("div", {
          className: `farm-plot__crop-emoji farm-plot__crop-emoji--${growthStage}`,
        }, crop.emoji),
      );
      plotEl.appendChild(cropEl);

      // 底部标签：名称 + 天数
      const daysText = isHarvestable ? "可收获！" : `${plot.growthDaysAccrued}/${crop.growthDays}天`;
      plotEl.appendChild(el("div", { className: "farm-plot__label" }, `${crop.nameZh} · ${daysText}`));
    }

    field.appendChild(plotEl);
  });

  scene.appendChild(field);
  container.appendChild(scene);
}

function getGrowthStage(progress) {
  if (progress <= 0) return "seed";
  if (progress < 0.33) return "sprout";
  if (progress < 1) return "growing";
  return "ready";
}

function handlePlotClick(e, plotIndex, crop, plot, isHarvestable, state) {
  e.stopPropagation();

  if (!crop) {
    // 空地 → 种植弹窗
    openPlantModal(plotIndex, state);
    return;
  }

  if (isHarvestable) {
    const r = state.harvestPlot(plotIndex);
    showToast(r.message);
    refreshUI();
    return;
  }

  // 已种未熟：浇水
  if (!plot.wateredToday) {
    const r = state.waterPlot(plotIndex);
    showToast(r.message);
    refreshUI();
  } else {
    showToast("今天已经浇过水了");
  }
}

function openPlantModal(plotIndex, state) {
  plantTargetPlot = plotIndex;

  const seeds = state.getInventoryEntries()
    .filter(item => item.type === "seed")
    .sort((a, b) => a.nameZh.localeCompare(b.nameZh, "zh"));

  const modal = document.getElementById("plantModal");
  const seedsContainer = document.getElementById("plantSeeds");
  seedsContainer.innerHTML = "";

  if (seeds.length === 0) {
    seedsContainer.appendChild(el("div", {
      style: { textAlign: "center", padding: "20px", color: "#8d6e63" },
    }, "没有种子了，去超市买一些吧！"));
  }

  seeds.forEach(seed => {
    const crop = getCropById(seed.id.replace("_seed", ""));
    seedsContainer.appendChild(el("div", { className: "modal-seed-item" },
      el("div", { style: { display: "flex", alignItems: "center", gap: "10px" } },
        el("span", { style: { fontSize: "32px" } }, crop?.emoji || "🌱"),
        el("div", {},
          el("div", { className: "modal-seed-item__name" }, seed.nameZh),
          el("div", { style: { fontSize: "12px", color: "#8d6e63" } },
            `生长 ${crop?.growthDays || "?"} 天 · 库存 ${seed.qty} 颗`,
          ),
        ),
      ),
      el("button", {
        className: "btn btn--primary btn--small",
        onClick: () => {
          const r = state.plantCrop(plantTargetPlot, crop.id);
          showToast(r.message);
          modal.style.display = "none";
          refreshUI();
        },
      }, "种植"),
    ));
  });

  modal.style.display = "flex";
  document.getElementById("plantCancel").onclick = () => { modal.style.display = "none"; };
  modal.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };
}
