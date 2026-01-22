const GRID_SIZE = 12;
const APPROVAL_TARGET = 25;
const VOLUME_THRESHOLD = 120;
const HOTSPOT_THRESHOLD = 45;

const METHOD_GROUPS = [
  "eth_call",
  "getLogs",
  "traceCall",
  "sendRawTransaction",
  "getBlock",
];
const CONTRACT_GROUPS = ["A", "B", "C", "D", "E"];

const SIGNAL_LOGS = [
  "ok",
  "retry-after: 1s",
  "429: Too Many Requests",
  "rate limit exceeded (burst)",
];

const STATE = {
  HIDDEN: "hidden",
  INSPECTED: "inspected",
  APPROVED: "approved",
};

const STATUS_THRESHOLDS = [
  { label: "Stable", max: 0.25 },
  { label: "Warm", max: 0.5 },
  { label: "Hot", max: 0.75 },
  { label: "Critical", max: 1.1 },
];

const appState = {
  seed: `${Date.now()}`,
  rng: null,
  tiles: [],
  approvedTiles: [],
  meters: { volume: 0, hotspot: 0 },
  mode: "inspect",
  incident: null,
  lastSignal: null,
  approvalCount: 0,
};

const elements = {
  grid: document.getElementById("grid"),
  signalsContent: document.getElementById("signals-content"),
  statusLabel: document.getElementById("status-label"),
  volumeMeter: document.getElementById("volume-meter"),
  hotspotMeter: document.getElementById("hotspot-meter"),
  approvalCount: document.getElementById("approval-count"),
  inspectButton: document.getElementById("inspect-button"),
  approveButton: document.getElementById("approve-button"),
  overlay: document.getElementById("incident-overlay"),
  incidentCause: document.getElementById("incident-cause"),
  incidentHint: document.getElementById("incident-hint"),
  incidentList: document.getElementById("incident-list"),
  restartButton: document.getElementById("restart-button"),
};

function createSeededRng(seed) {
  function xmur3(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i += 1) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return function () {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      h ^= h >>> 16;
      return h >>> 0;
    };
  }

  function mulberry32(a) {
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const seedHash = xmur3(String(seed))();
  const random = mulberry32(seedHash);
  return {
    random,
    randomInt(min, max) {
      return Math.floor(random() * (max - min + 1)) + min;
    },
    randomPick(list) {
      return list[Math.floor(random() * list.length)];
    },
    weightedRandom(weights) {
      const entries = Object.entries(weights);
      const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
      let roll = random() * total;
      for (const [value, weight] of entries) {
        roll -= weight;
        if (roll <= 0) return value;
      }
      return entries[entries.length - 1][0];
    },
  };
}

function generateTiles(seed) {
  const rng = createSeededRng(seed);
  const tiles = [];
  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      tiles.push({
        id: `${row}-${col}-${seed}`,
        row,
        col,
        methodGroup: rng.weightedRandom({
          eth_call: 0.25,
          getLogs: 0.2,
          traceCall: 0.15,
          sendRawTransaction: 0.25,
          getBlock: 0.15,
        }),
        contractGroup: rng.randomPick(CONTRACT_GROUPS),
        volumeWeight: rng.randomInt(1, 4),
        hotspotWeight: rng.randomInt(0, 3),
        state: STATE.HIDDEN,
        revealedSignal: null,
      });
    }
  }
  return { tiles, rng };
}

function computeLocalSeverity(tile, approvedTiles) {
  const related = approvedTiles.filter(
    (t) => t.methodGroup === tile.methodGroup || t.contractGroup === tile.contractGroup
  );
  const base = tile.hotspotWeight;
  const accumulated = related.length * 0.5;
  const rawScore = base + accumulated;
  if (rawScore < 1.5) return 0;
  if (rawScore < 3.0) return 1;
  if (rawScore < 4.5) return 2;
  return 3;
}

function getLogSnippet(severity) {
  return SIGNAL_LOGS[severity] || "ok";
}

function updateMeters(tile) {
  appState.meters.volume += tile.volumeWeight;
  const related = appState.approvedTiles.filter(
    (t) => t.methodGroup === tile.methodGroup || t.contractGroup === tile.contractGroup
  );
  appState.meters.hotspot += tile.hotspotWeight;
  appState.meters.hotspot += related.length * 0.3;
}

function checkForIncident() {
  if (appState.incident) return;
  if (appState.meters.volume >= VOLUME_THRESHOLD) {
    triggerIncident("volume");
  } else if (appState.meters.hotspot >= HOTSPOT_THRESHOLD) {
    triggerIncident("hotspot");
  }
}

function scoreContribution(tile, incidentType) {
  let score = tile.volumeWeight;
  if (incidentType === "hotspot") {
    score += tile.hotspotWeight;
    score += countRelated(tile) * 0.5;
  }
  return score;
}

function countRelated(tile) {
  return appState.approvedTiles.filter(
    (t) => t.methodGroup === tile.methodGroup || t.contractGroup === tile.contractGroup
  ).length;
}

function pickContributors(incidentType) {
  const rng = appState.rng;
  return appState.approvedTiles
    .map((t) => ({ t, score: scoreContribution(t, incidentType) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, rng.randomInt(8, 12))
    .map((x) => x.t);
}

function triggerIncident(type) {
  const contributors = pickContributors(type);
  appState.incident = {
    type,
    contributors,
  };
  renderIncident();
}

function getGlobalStatus() {
  const volumeRatio = appState.meters.volume / VOLUME_THRESHOLD;
  const hotspotRatio = appState.meters.hotspot / HOTSPOT_THRESHOLD;
  const maxRatio = Math.max(volumeRatio, hotspotRatio);
  const threshold =
    STATUS_THRESHOLDS.find((entry) => maxRatio < entry.max) ||
    STATUS_THRESHOLDS[STATUS_THRESHOLDS.length - 1];
  return threshold.label;
}

function setMode(mode) {
  appState.mode = mode;
  elements.inspectButton.classList.toggle("active", mode === "inspect");
  elements.approveButton.classList.toggle("active", mode === "approve");
}

function inspectTile(tile) {
  if (tile.state === STATE.APPROVED || appState.incident) return;
  const severity = computeLocalSeverity(tile, appState.approvedTiles);
  const signal = {
    symptom: "Retries",
    severity,
    logSnippet: getLogSnippet(severity),
  };
  tile.state = STATE.INSPECTED;
  tile.revealedSignal = signal;
  appState.lastSignal = signal;
  renderSignals();
  renderTiles();
}

function approveTile(tile) {
  if (tile.state === STATE.APPROVED || appState.incident) return;
  tile.state = STATE.APPROVED;
  appState.approvedTiles.push(tile);
  appState.approvalCount += 1;
  updateMeters(tile);
  checkForIncident();
  renderMeters();
  renderTiles();
}

function renderSignals() {
  if (!appState.lastSignal) return;
  elements.signalsContent.innerHTML = "";
  const badge = document.createElement("span");
  badge.className = `signal-badge sev-${appState.lastSignal.severity}`;
  badge.textContent = `Severity ${appState.lastSignal.severity}`;

  const label = document.createElement("span");
  label.className = "signal-label";
  label.textContent = `${appState.lastSignal.symptom}: ${appState.lastSignal.logSnippet}`;

  elements.signalsContent.appendChild(badge);
  elements.signalsContent.appendChild(label);
}

function renderMeters() {
  const volumeRatio = Math.min(appState.meters.volume / VOLUME_THRESHOLD, 1);
  const hotspotRatio = Math.min(appState.meters.hotspot / HOTSPOT_THRESHOLD, 1);
  elements.volumeMeter.style.width = `${Math.round(volumeRatio * 100)}%`;
  elements.hotspotMeter.style.width = `${Math.round(hotspotRatio * 100)}%`;
  elements.hotspotMeter.classList.add("hotspot");
  elements.statusLabel.textContent = getGlobalStatus();
  elements.approvalCount.textContent = `${appState.approvalCount}/${APPROVAL_TARGET}`;
}

function renderTiles() {
  const fragment = document.createDocumentFragment();
  appState.tiles.forEach((tile) => {
    const div = document.createElement("div");
    div.className = `tile ${tile.state}`;
    if (
      appState.incident &&
      appState.incident.contributors.some((t) => t.id === tile.id)
    ) {
      div.classList.add("contributor");
    }
    div.dataset.id = tile.id;
    div.addEventListener("click", () => {
      if (appState.mode === "inspect") {
        inspectTile(tile);
      } else {
        approveTile(tile);
      }
    });
    fragment.appendChild(div);
  });
  elements.grid.innerHTML = "";
  elements.grid.appendChild(fragment);
}

function renderIncident() {
  if (!appState.incident) return;
  elements.overlay.classList.remove("hidden");
  const causeLabel =
    appState.incident.type === "volume"
      ? "Primary cause: Request Volume"
      : "Primary cause: Hotspot Concentration";
  elements.incidentCause.textContent = causeLabel;
  elements.incidentHint.textContent =
    "Normal approvals accumulated into a rate-limit incident.";

  elements.incidentList.innerHTML = "";
  appState.incident.contributors.forEach((tile, index) => {
    const row = document.createElement("div");
    row.className = "incident-item";
    const count = countRelated(tile);
    row.innerHTML = `<span>#${index + 1} Tile ${tile.row + 1},${tile.col + 1}</span>
      <span>Approvals linked: ${count}</span>`;
    elements.incidentList.appendChild(row);
  });
}

function resetGame(newSeed) {
  appState.seed = newSeed || `${Date.now()}`;
  appState.meters = { volume: 0, hotspot: 0 };
  appState.approvedTiles = [];
  appState.approvalCount = 0;
  appState.incident = null;
  appState.lastSignal = null;
  const { tiles, rng } = generateTiles(appState.seed);
  appState.tiles = tiles;
  appState.rng = rng;
  elements.overlay.classList.add("hidden");
  elements.signalsContent.innerHTML =
    '<span class="signal-label">Inspect a tile to reveal symptoms.</span>';
  renderMeters();
  renderTiles();
}

function bindEvents() {
  elements.inspectButton.addEventListener("click", () => setMode("inspect"));
  elements.approveButton.addEventListener("click", () => setMode("approve"));
  elements.restartButton.addEventListener("click", () => resetGame());
}

function init() {
  const { tiles, rng } = generateTiles(appState.seed);
  appState.tiles = tiles;
  appState.rng = rng;
  bindEvents();
  renderMeters();
  renderTiles();
}

init();
