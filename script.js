const themeToggle = document.getElementById("theme-toggle");
const body = document.body;
const fileInput = document.getElementById("jsonUpload");

const elTotalUsers = document.getElementById("stat-totalUsers");
const elActiveUsers = document.getElementById("stat-activeUsers");
const elItemsInStock = document.getElementById("stat-itemsInStock");
const elOrdersToday = document.getElementById("stat-ordersToday");
const recentBody = document.getElementById("recentBody");

const moonIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="currentColor"/></svg>`;
const sunIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M6.76 4.84l-1.8-1.79L3.17 4.83l1.79 1.79 1.8-1.78zM1 13h3v-2H1v2zm10-9h2V1h-2v3zm7.04 2.05l1.79-1.8-1.79-1.79-1.8 1.79 1.8 1.8zM20 11v2h3v-2h-3zM6.76 19.16l-1.79 1.79 1.79 1.79 1.8-1.79-1.8-1.79zM12 19a7 7 0 100-14 7 7 0 000 14zm4.24-2.16l1.8 1.79 1.79-1.79-1.79-1.79-1.8 1.79z" fill="currentColor"/></svg>`;

if (typeof themeToggle !== "undefined" && themeToggle) {
    if (localStorage.getItem("theme") === "dark") {
        body.classList.add("dark-mode");
        themeToggle.innerHTML = sunIcon;
    } else {
        themeToggle.innerHTML = moonIcon;
    }
}

themeToggle.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    if (body.classList.contains("dark-mode")) {
        themeToggle.innerHTML = sunIcon;
        localStorage.setItem("theme", "dark");
    } else {
        themeToggle.innerHTML = moonIcon;
        localStorage.setItem("theme", "light");
    }
    rebuildCharts();
});


let charts = [];
// In-memory dataset. Expected shape:
// {
//   stats: { totalUsers, activeUsers, itemsInStock, ordersToday },
//   sales: { labels: string[], data: number[] },
//   stock: { labels: string[], data: number[] },
//   recent: Array<{ user: string, action: string, date: string }>
// }
let dataset = {
    stats: { totalUsers: 0, activeUsers: 0, itemsInStock: 0, ordersToday: 0 },
    sales: { labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"], data: [0,0,0,0,0,0,0] },
    stock: { labels: ["Electronics", "Apparel", "Groceries", "Books", "Furniture"], data: [0,0,0,0,0] },
    recent: []
};

function renderStats(stats) {
    elTotalUsers.textContent = formatNumber(stats.totalUsers ?? 0);
    elActiveUsers.textContent = formatNumber(stats.activeUsers ?? 0);
    elItemsInStock.textContent = formatNumber(stats.itemsInStock ?? 0);
    elOrdersToday.textContent = formatNumber(stats.ordersToday ?? 0);
}

function renderRecent(rows) {
    recentBody.innerHTML = "";
    if (!rows || rows.length === 0) {
        const tr = document.createElement("tr");
        tr.className = "empty-row";
        const td = document.createElement("td");
        td.colSpan = 3;
        td.textContent = "No recent activity yet.";
        tr.appendChild(td);
        recentBody.appendChild(tr);
        return;
    }
    const frag = document.createDocumentFragment();
    rows.forEach(r => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${escapeHtml(r.user ?? "-")}</td><td>${escapeHtml(r.action ?? "-")}</td><td>${escapeHtml(r.date ?? "-")}</td>`;
        frag.appendChild(tr);
    });
    recentBody.appendChild(frag);
}

function createChartsFromData(data) {
    const textColor = getCssVar("--text-color");
    const accentColor = getCssVar("--accent-color");

    const salesCtx = document.getElementById("salesChart").getContext("2d");
    const salesChart = new Chart(salesCtx, {
        type: "line",
        data: {
            labels: data.sales.labels,
            datasets: [{
                label: "Sales ($)",
                data: data.sales.data,
                borderColor: accentColor,
                backgroundColor: hexOrVarToRgba(accentColor, 0.2),
                tension: 0.35,
                fill: true,
            }]
        },
        options: baseChartOptions(textColor)
    });

    const stockCtx = document.getElementById("stockChart").getContext("2d");
    const stockChart = new Chart(stockCtx, {
        type: "bar",
        data: {
            labels: data.stock.labels,
            datasets: [{
                label: "Items in Stock",
                data: data.stock.data,
                backgroundColor: hexOrVarToRgba(accentColor, 0.9)
            }]
        },
        options: {
            ...baseChartOptions(textColor),
            plugins: { legend: { display: false } }
        }
    });

    charts = [salesChart, stockChart];
}

function baseChartOptions(textColor) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: textColor } }, tooltip: { mode: "index", intersect: false } },
        interaction: { mode: "nearest", intersect: false },
        scales: {
            x: { grid: { display: false }, ticks: { color: textColor } },
            y: { grid: { color: "rgba(0,0,0,0.06)" }, ticks: { color: textColor }, beginAtZero: true }
        }
    };
}

function rebuildCharts() {
    charts.forEach(c => c.destroy());
    createChartsFromData(dataset);
}

function getCssVar(name) {
    return getComputedStyle(document.body).getPropertyValue(name).trim();
}

function hexOrVarToRgba(color, alpha) {
    if (color.startsWith("#")) {
        const bigint = parseInt(color.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return color.replace(/rgb\(([^)]+)\)/, `rgba($1, ${alpha})`);
}

function formatNumber(n) {
    const num = Number(n || 0);
    return num.toLocaleString(undefined);
}

function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

fileInput?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
        const text = await file.text();
        const json = JSON.parse(text);
        const normalized = normalizeData(json);
        dataset = normalized;
        renderStats(dataset.stats);
        renderRecent(dataset.recent);
        rebuildCharts();
    } catch (err) {
        console.error("Failed to parse JSON:", err);
        alert("Invalid JSON file. Please check the structure and try again.");
    } finally {
        e.target.value = "";
    }
});

function normalizeData(input) {
    const out = { ...dataset };
    // stats
    if (input.stats && typeof input.stats === "object") {
        out.stats = {
            totalUsers: toNumber(input.stats.totalUsers, 0),
            activeUsers: toNumber(input.stats.activeUsers, 0),
            itemsInStock: toNumber(input.stats.itemsInStock, 0),
            ordersToday: toNumber(input.stats.ordersToday, 0)
        };
    }
    // sales
    if (input.sales && typeof input.sales === "object") {
        out.sales = {
            labels: Array.isArray(input.sales.labels) ? input.sales.labels.map(String) : out.sales.labels,
            data: Array.isArray(input.sales.data) ? input.sales.data.map(n => toNumber(n, 0)) : out.sales.data
        };
    }
    // stock
    if (input.stock && typeof input.stock === "object") {
        out.stock = {
            labels: Array.isArray(input.stock.labels) ? input.stock.labels.map(String) : out.stock.labels,
            data: Array.isArray(input.stock.data) ? input.stock.data.map(n => toNumber(n, 0)) : out.stock.data
        };
    }
    // recent
    if (Array.isArray(input.recent)) {
        out.recent = input.recent.map(r => ({
            user: r?.user ?? "-",
            action: r?.action ?? "-",
            date: r?.date ?? "-"
        }));
    }
    return out;
}

function toNumber(v, fallback = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
}

async function loadDefaultData() {
    try {
        const resp = await fetch("sample-data.json", { cache: "no-cache" });
        if (!resp.ok) return;
        const json = await resp.json();
        const normalized = normalizeData(json);
        dataset = normalized;
        renderStats(dataset.stats);
        renderRecent(dataset.recent);
        rebuildCharts();
    } catch (err) {
        console.warn("Could not load sample-data.json (optional):", err);
    }
}

renderStats(dataset.stats);
renderRecent(dataset.recent);
createChartsFromData(dataset);

loadDefaultData();
