/**
 * SPIRIXTOTAL - REAL-TIME ANALYTICS & MEDAL STATISTICS ENGINE
 * Full fidelity to the 5 official ITF World Cup infographics.
 */

let rawTournamentData = null;
let rawFormsData = null;
let currentGrouping = "schools"; // 'schools', 'countries', 'both'
let currentModality = "all";      // 'all', 'combat', 'forms'

const CLOUD_API_URL = "https://spirixcloud-server.onrender.com/api/live-results";

// Dual-Mode Connection (Local Socket + Cloud Fallback for Netlify)
let socket = null;
if (typeof io !== "undefined") {
  try {
    socket = io(window.location.origin, { reconnectionAttempts: 3, timeout: 3000 });
    socket.on("connect", () => {
      console.log("[ANALYTICS] Conectado a socket local");
      socket.emit("joinDashboard");
    });
    socket.on("tournamentData", data => {
      rawTournamentData = data;
      recomputeAndRenderAnalytics();
    });
    socket.on("formsTournamentData", data => {
      rawFormsData = data;
      recomputeAndRenderAnalytics();
    });
  } catch(e) {
    console.warn("[ANALYTICS] Socket local no disponible, cambiando a modo Cloud");
  }
}

// Polling fallback from Cloud (for Netlify and mobile spectators)
async function fetchCloudResults() {
  try {
    const res = await fetch(CLOUD_API_URL);
    if (res.ok) {
      const data = await res.json();
      if (data && (data.combatCategories || data.formsCategories)) {
        rawTournamentData = { categories: data.combatCategories || [] };
        rawFormsData = { categories: data.formsCategories || [] };
        recomputeAndRenderAnalytics();
      }
    }
  } catch(err) {
    // offline or local
  }
}

if (!window.location.hostname.includes("localhost") && !window.location.hostname.includes("127.0.0.1") && !window.location.hostname.includes("192.168.")) {
  fetchCloudResults();
  setInterval(fetchCloudResults, 6000);
}

window.setGrouping = function(mode) {
  currentGrouping = mode;
  recomputeAndRenderAnalytics();
};

window.setModality = function(mode) {
  currentModality = mode;
  recomputeAndRenderAnalytics();
};

window.printAnalyticsReport = function() {
  window.print();
};

// ─────────────────────────────────────────────────────────────
// DATA EXTRACTION & AGGREGATION LOGIC
// ─────────────────────────────────────────────────────────────
function extractAllMedals() {
  const medals = []; // { entity, gold: bool, silver: bool, bronze: bool, age: number, sex: string, compName: string }
  const athletesMap = new Map(); // id -> comp object

  // 1. COMBAT
  if (rawTournamentData && (currentModality === "all" || currentModality === "combat")) {
    const cats = rawTournamentData.categories || [];
    cats.forEach(cat => {
      // Index fighters
      (cat.fighters || []).forEach(f => {
        if (f && f.id) athletesMap.set(f.id, f);
      });

      const bracket = cat.bracket || [];
      if (!bracket.length) return;

      // Extract results from matches
      // The final match
      const finalMatch = bracket[bracket.length - 1];
      if (finalMatch && finalMatch.finished && finalMatch.winner) {
        const winnerId = finalMatch.winner.id;
        const loser = (finalMatch.fighter1 && finalMatch.fighter1.id === winnerId) ? finalMatch.fighter2 : finalMatch.fighter1;

        if (finalMatch.winner) {
          medals.push({
            comp: finalMatch.winner,
            type: "gold",
            catName: cat.name
          });
        }
        if (loser) {
          medals.push({
            comp: loser,
            type: "silver",
            catName: cat.name
          });
        }

        // Semifinals (bronzes)
        if (bracket.length >= 3) {
          const semi1 = bracket[bracket.length - 2];
          const semi2 = bracket[bracket.length - 3];
          [semi1, semi2].forEach(semi => {
            if (semi && semi.finished && semi.winner) {
              const semiLoser = (semi.fighter1 && semi.fighter1.id === semi.winner.id) ? semi.fighter2 : semi.fighter1;
              if (semiLoser) {
                medals.push({
                  comp: semiLoser,
                  type: "bronze",
                  catName: cat.name
                });
              }
            }
          });
        }
      }
    });
  }

  // 2. FORMS
  if (rawFormsData && (currentModality === "all" || currentModality === "forms")) {
    const cats = rawFormsData.categories || [];
    cats.forEach(cat => {
      (cat.competitors || []).forEach(f => {
        if (f && f.id) athletesMap.set(f.id, f);
      });

      const bracket = cat.bracket || [];
      if (!bracket.length) return;

      const finalMatch = bracket[bracket.length - 1];
      if (finalMatch && finalMatch.finished && finalMatch.winner) {
        const winnerId = finalMatch.winner.id;
        const loser = (finalMatch.competitor1 && finalMatch.competitor1.id === winnerId) ? finalMatch.competitor2 : finalMatch.competitor1;

        if (finalMatch.winner) {
          medals.push({
            comp: finalMatch.winner,
            type: "gold",
            catName: cat.name
          });
        }
        if (loser) {
          medals.push({
            comp: loser,
            type: "silver",
            catName: cat.name
          });
        }

        if (bracket.length >= 3) {
          const semi1 = bracket[bracket.length - 2];
          const semi2 = bracket[bracket.length - 3];
          [semi1, semi2].forEach(semi => {
            if (semi && semi.finished && semi.winner) {
              const semiLoser = (semi.competitor1 && semi.competitor1.id === semi.winner.id) ? semi.competitor2 : semi.competitor1;
              if (semiLoser) {
                medals.push({
                  comp: semiLoser,
                  type: "bronze",
                  catName: cat.name
                });
              }
            }
          });
        }
      }
    });
  }

  return { medals, athletes: Array.from(athletesMap.values()) };
}

function getEntityKey(comp) {
  if (!comp) return "Sin Asignar";
  const academy = String(comp.academy || comp.escuela || comp.club || "").trim();
  const country = String(comp.country || comp.pais || comp.nacionalidad || "").trim();

  if (currentGrouping === "countries") {
    return country || academy || "Sin País";
  } else if (currentGrouping === "both") {
    if (academy && country) return `${academy} (${country})`;
    return academy || country || "General";
  } else {
    // Default 'schools'
    return academy || country || "Sin Escuela";
  }
}

function getAgeCategoryKey(comp) {
  let age = 0;
  if (comp.age) age = parseInt(comp.age);
  else if (comp.birthDate) {
    const diff = Date.now() - new Date(comp.birthDate).getTime();
    age = Math.abs(new Date(diff).getUTCFullYear() - 1970);
  }

  if (age <= 14) return "Pre-Junior\n(12-14)";
  if (age <= 17) return "Junior\n(15-17)";
  if (age <= 35) return "Senior\n(18-35)";
  if (age <= 45) return "Veteranos\n(36-45)";
  return "Master\n(+45)";
}

// ─────────────────────────────────────────────────────────────
// RECOMPUTE AND RENDER ALL 5 MODULES
// ─────────────────────────────────────────────────────────────
function recomputeAndRenderAnalytics() {
  const { medals, athletes } = extractAllMedals();

  // Aggregate entity stats
  const entityMap = {}; // entityName -> { name, gold: 0, silver: 0, bronze: 0, total: 0, ageMap: {} }
  let totalGold = 0;
  let totalSilver = 0;
  let totalBronze = 0;

  medals.forEach(m => {
    const key = getEntityKey(m.comp);
    if (!entityMap[key]) {
      entityMap[key] = {
        name: key,
        gold: 0,
        silver: 0,
        bronze: 0,
        total: 0,
        ageMap: {
          "Pre-Junior\n(12-14)": 0,
          "Junior\n(15-17)": 0,
          "Senior\n(18-35)": 0,
          "Veteranos\n(36-45)": 0,
          "Master\n(+45)": 0
        }
      };
    }

    if (m.type === "gold") {
      entityMap[key].gold++;
      totalGold++;
      const ageCat = getAgeCategoryKey(m.comp);
      if (entityMap[key].ageMap[ageCat] !== undefined) {
        entityMap[key].ageMap[ageCat]++;
      }
    } else if (m.type === "silver") {
      entityMap[key].silver++;
      totalSilver++;
    } else if (m.type === "bronze") {
      entityMap[key].bronze++;
      totalBronze++;
    }
    entityMap[key].total++;
  });

  const entityList = Object.values(entityMap);
  // Sort by gold desc, then silver desc, then bronze desc
  entityList.sort((a, b) => b.gold - a.gold || b.silver - a.silver || b.bronze - a.bronze || b.total - a.total);

  renderTop10MedalTable(entityList, totalGold, totalSilver, totalBronze);
  renderVolumeVsConversion(entityList);
  renderGoldConcentration(entityList, totalGold);
  renderAgeCategoryHeatmap(entityList);
  renderDemographics(athletes, medals);
}

// ─────────────────────────────────────────────────────────────
// MODULE 1: TOP 10 MEDAL TABLE
// ─────────────────────────────────────────────────────────────
function renderTop10MedalTable(list, totalGold, totalSilver, totalBronze) {
  const container = document.getElementById("medalBarsContainer");
  const subEl = document.getElementById("medalTableSub");
  const countGoldEl = document.getElementById("statTotalGold");
  const countSilverEl = document.getElementById("statTotalSilver");
  const countBronzeEl = document.getElementById("statTotalBronze");

  if (countGoldEl) countGoldEl.innerText = totalGold;
  if (countSilverEl) countSilverEl.innerText = totalSilver;
  if (countBronzeEl) countBronzeEl.innerText = totalBronze;

  if (!list.length) {
    if (container) container.innerHTML = `<p style="color:#94a3b8; text-align:center; padding:30px;">Aún no hay medallas disputadas en el torneo.</p>`;
    return;
  }

  // Dynamic subtitle insight
  const leader = list[0];
  let highestEff = list[0];
  let maxEff = 0;
  list.slice(0, 10).forEach(e => {
    const eff = e.total > 0 ? (e.gold / e.total) : 0;
    if (eff > maxEff && e.total >= 2) {
      maxEff = eff;
      highestEff = e;
    }
  });

  if (subEl && leader) {
    subEl.innerText = `${leader.name} lidera en medallas de oro y total; ${highestEff.name} posee la mayor tasa de conversión a oro por medalla disputada.`;
  }

  const top10 = list.slice(0, 10);
  const maxMedals = Math.max(...top10.map(e => e.total), 1);

  let html = "";
  top10.forEach((e, idx) => {
    const goldPct = (e.gold / maxMedals) * 100;
    const silverPct = (e.silver / maxMedals) * 100;
    const bronzePct = (e.bronze / maxMedals) * 100;

    html += `
      <div class="medal-bar-row">
        <div class="bar-rank-name">
          <span class="bar-rank">${idx + 1}.</span>
          <span class="bar-name" title="${e.name}">${e.name}</span>
        </div>
        <div class="bar-stacked-track">
          ${e.gold > 0 ? `<div class="seg-gold" style="width: ${goldPct}%" title="${e.gold} Oros">${e.gold}</div>` : ''}
          ${e.silver > 0 ? `<div class="seg-silver" style="width: ${silverPct}%" title="${e.silver} Platas">${e.silver}</div>` : ''}
          ${e.bronze > 0 ? `<div class="seg-bronze" style="width: ${bronzePct}%" title="${e.bronze} Bronces">${e.bronze}</div>` : ''}
        </div>
        <div class="bar-total">${e.total}</div>
      </div>
    `;
  });

  if (container) container.innerHTML = html;
}

// ─────────────────────────────────────────────────────────────
// MODULE 2: VOLUME VS GOLD CONVERSION (SCATTER PLOT)
// ─────────────────────────────────────────────────────────────
function renderVolumeVsConversion(list) {
  const canvas = document.getElementById("scatterCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // Resize canvas for crisp resolution
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = 360;

  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const padLeft = 60;
  const padRight = 40;
  const padTop = 30;
  const padBottom = 45;

  const plotW = w - padLeft - padRight;
  const plotH = h - padTop - padBottom;

  const maxTotal = Math.max(...list.map(e => e.total), 10);
  const maxTotalAxis = Math.ceil(maxTotal / 5) * 5 + 5;

  // Draw grid & axes
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 1;

  // Y Axis (0% to 100%)
  ctx.fillStyle = "#94a3b8";
  ctx.font = "11px Outfit, sans-serif";
  ctx.textAlign = "right";

  for (let pct = 0; pct <= 100; pct += 20) {
    const y = padTop + plotH - (pct / 100) * plotH;
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(w - padRight, y);
    ctx.stroke();
    ctx.fillText(`${pct}%`, padLeft - 10, y + 4);
  }

  // X Axis (Total Medals)
  ctx.textAlign = "center";
  const stepX = Math.max(Math.floor(maxTotalAxis / 5), 2);
  for (let val = 0; val <= maxTotalAxis; val += stepX) {
    const x = padLeft + (val / maxTotalAxis) * plotW;
    ctx.beginPath();
    ctx.moveTo(x, padTop);
    ctx.lineTo(x, padTop + plotH);
    ctx.stroke();
    ctx.fillText(`${val}`, x, padTop + plotH + 20);
  }

  // Axis Labels
  ctx.fillStyle = "#38bdf8";
  ctx.font = "bold 12px Outfit, sans-serif";
  ctx.fillText("Total de Medallas Obtenidas (Volumen)", padLeft + plotW / 2, h - 8);

  ctx.save();
  ctx.translate(16, padTop + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Tasa de Conversión a Oro (%)", 0, 0);
  ctx.restore();

  if (!list.length) return;

  // Benchmark average conversion line
  let sumGolds = 0, sumTotals = 0;
  list.forEach(e => { sumGolds += e.gold; sumTotals += e.total; });
  const avgConversion = sumTotals > 0 ? (sumGolds / sumTotals) * 100 : 30;

  const avgY = padTop + plotH - (avgConversion / 100) * plotH;
  ctx.strokeStyle = "#eab308";
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(padLeft, avgY);
  ctx.lineTo(w - padRight, avgY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#facc15";
  ctx.font = "11px Outfit, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(`Promedio Torneo: ${avgConversion.toFixed(1)}%`, w - padRight, avgY - 6);

  // Draw points
  list.forEach(e => {
    if (e.total === 0) return;
    const conversion = (e.gold / e.total) * 100;
    const cx = padLeft + (e.total / maxTotalAxis) * plotW;
    const cy = padTop + plotH - (conversion / 100) * plotH;
    const radius = Math.min(Math.max(6 + e.gold * 1.5, 7), 22);

    // Bubble
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = e.gold > 0 ? "rgba(250, 204, 21, 0.7)" : "rgba(100, 116, 139, 0.5)";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = e.gold > 0 ? "#facc15" : "#94a3b8";
    ctx.stroke();

    // Label
    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 11px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${e.name} (${conversion.toFixed(0)}%)`, cx, cy - radius - 4);
  });
}

// ─────────────────────────────────────────────────────────────
// MODULE 3: GOLD CONCENTRATION (DONUT CHART)
// ─────────────────────────────────────────────────────────────
function renderGoldConcentration(list, totalGold) {
  const donutCanvas = document.getElementById("donutCanvas");
  const bigPctEl = document.getElementById("donutBigPct");
  const tableBody = document.getElementById("concentrationTableBody");
  if (!donutCanvas || !tableBody) return;

  const ctx = donutCanvas.getContext("2d");
  donutCanvas.width = 240;
  donutCanvas.height = 240;
  ctx.clearRect(0, 0, 240, 240);

  if (!totalGold || !list.length) {
    if (bigPctEl) bigPctEl.innerText = "0%";
    tableBody.innerHTML = `<tr><td colspan="3" style="text-align:center;color:#94a3b8;">Sin datos de oro.</td></tr>`;
    return;
  }

  const top5 = list.slice(0, 5);
  const top5Gold = top5.reduce((sum, e) => sum + e.gold, 0);
  const otherGold = Math.max(totalGold - top5Gold, 0);
  const top5Pct = ((top5Gold / totalGold) * 100).toFixed(1);

  if (bigPctEl) bigPctEl.innerText = `${top5Pct}%`;

  const colors = ["#facc15", "#eab308", "#ca8a04", "#a16207", "#713f12", "#334155"];
  const segments = top5.map((e, i) => ({
    name: e.name,
    gold: e.gold,
    pct: ((e.gold / totalGold) * 100).toFixed(1),
    color: colors[i]
  }));

  if (otherGold > 0) {
    segments.push({
      name: `${Math.max(list.length - 5, 1)} otras delegaciones`,
      gold: otherGold,
      pct: ((otherGold / totalGold) * 100).toFixed(1),
      color: colors[5]
    });
  }

  // Draw Donut
  const cx = 120, cy = 120, outerR = 100, innerR = 65;
  let startAngle = -Math.PI / 2;

  segments.forEach(seg => {
    const sliceAngle = (seg.gold / totalGold) * (Math.PI * 2);
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, startAngle, startAngle + sliceAngle);
    ctx.arc(cx, cy, innerR, startAngle + sliceAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = seg.color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#0f172a";
    ctx.stroke();
    startAngle += sliceAngle;
  });

  // Table Body
  let tableHtml = "";
  segments.forEach(seg => {
    tableHtml += `
      <tr>
        <td><span class="color-dot" style="background:${seg.color}"></span><strong>${seg.name}</strong></td>
        <td style="text-align:center; font-weight:bold; color:#facc15;">${seg.gold}</td>
        <td style="text-align:right; color:#cbd5e1;">${seg.pct}%</td>
      </tr>
    `;
  });
  tableBody.innerHTML = tableHtml;
}

// ─────────────────────────────────────────────────────────────
// MODULE 4: WHO WINS WHERE (AGE CATEGORY HEATMAP)
// ─────────────────────────────────────────────────────────────
function renderAgeCategoryHeatmap(list) {
  const theadEl = document.getElementById("heatmapThead");
  const tbodyEl = document.getElementById("heatmapTbody");
  const highlightEl = document.getElementById("heatmapHighlights");
  if (!theadEl || !tbodyEl) return;

  const ageCols = [
    "Pre-Junior\n(12-14)",
    "Junior\n(15-17)",
    "Senior\n(18-35)",
    "Veteranos\n(36-45)",
    "Master\n(+45)"
  ];

  let theadHtml = `<tr><th style="text-align:left; padding-left:14px;">Delegación / Escuela</th>`;
  ageCols.forEach(col => {
    theadHtml += `<th>${col.replace('\n', '<br>')}</th>`;
  });
  theadHtml += `<th>Total Oros</th></tr>`;
  theadEl.innerHTML = theadHtml;

  const top10 = list.slice(0, 10);
  if (!top10.length) {
    tbodyEl.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:#94a3b8;">Sin medallas registradas aún.</td></tr>`;
    return;
  }

  // Find max gold cell for color intensity
  let maxCell = 1;
  top10.forEach(e => {
    ageCols.forEach(col => {
      if (e.ageMap[col] > maxCell) maxCell = e.ageMap[col];
    });
  });

  let tbodyHtml = "";
  top10.forEach(e => {
    tbodyHtml += `<tr><td class="entity-col">${e.name}</td>`;
    ageCols.forEach(col => {
      const val = e.ageMap[col] || 0;
      let cellBg = "rgba(15, 23, 42, 0.4)";
      let cellColor = "#64748b";

      if (val > 0) {
        const intensity = Math.min(val / maxCell, 1);
        cellBg = `rgba(234, 179, 8, ${0.25 + intensity * 0.7})`;
        cellColor = intensity > 0.5 ? "#0b1120" : "#fef08a";
      }

      tbodyHtml += `<td style="background:${cellBg}; color:${cellColor}; font-weight:800; font-size:14px;">${val > 0 ? val : '-'}</td>`;
    });
    tbodyHtml += `<td style="background:#1e293b; color:#facc15; font-weight:900;">${e.gold}</td></tr>`;
  });
  tbodyEl.innerHTML = tbodyHtml;

  // Insights
  if (highlightEl && top10.length > 0) {
    const leader = top10[0];
    const youthCount = (leader.ageMap["Pre-Junior\n(12-14)"] || 0) + (leader.ageMap["Junior\n(15-17)"] || 0);
    const seniorCount = (leader.ageMap["Senior\n(18-35)"] || 0) + (leader.ageMap["Veteranos\n(36-45)"] || 0) + (leader.ageMap["Master\n(+45)"] || 0);

    highlightEl.innerHTML = `
      <div class="highlight-stat">🥇 <strong>${leader.name}</strong>: ${youthCount} oros en Juveniles / ${seniorCount} oros en Adultos y Master.</div>
      <div class="highlight-stat">📌 Matriz en vivo recalculada según resultados oficiales validados en las mesas.</div>
    `;
  }
}

// ─────────────────────────────────────────────────────────────
// MODULE 5: DEMOGRAPHICS & OVERVIEW
// ─────────────────────────────────────────────────────────────
function renderDemographics(athletes, medals) {
  const totalCompEl = document.getElementById("demoTotalAthletes");
  const totalBoutsEl = document.getElementById("demoTotalBouts");
  const totalSchoolsEl = document.getElementById("demoTotalSchools");
  const totalMedalsEl = document.getElementById("demoTotalMedals");

  const schoolsSet = new Set();
  athletes.forEach(a => {
    const sc = a.academy || a.schoolName || a.club;
    if (sc) schoolsSet.add(sc.trim());
  });

  if (totalCompEl) totalCompEl.innerText = athletes.length || 0;
  if (totalSchoolsEl) totalSchoolsEl.innerText = schoolsSet.size || 0;
  if (totalMedalsEl) totalMedalsEl.innerText = medals.length || 0;

  // Count matches
  let matchCount = 0;
  if (rawTournamentData && rawTournamentData.categories) {
    rawTournamentData.categories.forEach(c => {
      (c.bracket || []).forEach(m => {
        if (m.finished) matchCount++;
      });
    });
  }
  if (rawFormsData && rawFormsData.categories) {
    rawFormsData.categories.forEach(c => {
      (c.bracket || []).forEach(m => {
        if (m.finished) matchCount++;
      });
    });
  }
  if (totalBoutsEl) totalBoutsEl.innerText = matchCount;
}

window.addEventListener("resize", () => {
  if (rawTournamentData || rawFormsData) {
    recomputeAndRenderAnalytics();
  }
});
