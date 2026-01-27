const GRID_SIZE = 12;
const APPROVAL_TARGET = 25;
const VOLUME_THRESHOLD = 120;
const HOTSPOT_THRESHOLD = 45;
const HOTSPOT_DECAY_RATE = 0.22;
const VOLUME_DECAY_RATE = 0.25;
const BURST_WINDOW_MS = 2000;
const BURST_MAX_MULTIPLIER = 2.8;
const ALCHEMY_NETWORK = "eth-sepolia";
const ALCHEMY_KEY_STORAGE = "alchemyKey";
const LEADERBOARD_STORAGE_KEY = "tpLeaderboardName";
const LEADERBOARD_LIMIT = 10;
const LEADERBOARD_ENDPOINT = "/api/leaderboard";
const LEADERBOARD_SUBMIT_ENDPOINT = "/api/submit-score";
const EGG_PATH = {
  xMax: 180,
  yMax: 140,
  scaleMax: 0.5,
  curve: 1.3,
};

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

const METHOD_LABELS = {
  eth_call: "Read call",
  getLogs: "Log lookup",
  traceCall: "Trace analysis",
  sendRawTransaction: "Transaction submit",
  getBlock: "Block fetch",
};

const METHOD_SHORT = {
  eth_call: "READ",
  getLogs: "LOGS",
  traceCall: "TRACE",
  sendRawTransaction: "SEND",
  getBlock: "BLOCK",
};

const METHOD_DISPLAY = {
  "0xa9059cbb": { short: "XFER", label: "Transfer" },
  "0x23b872dd": { short: "XFRM", label: "TransferFrom" },
  "0x095ea7b3": { short: "APPR", label: "Approve" },
  "0x70a08231": { short: "BAL", label: "BalanceOf" },
  "0xdd62ed3e": { short: "ALLOW", label: "Allowance" },
  "0x18160ddd": { short: "SUP", label: "TotalSupply" },
  "0x313ce567": { short: "DEC", label: "Decimals" },
  "0x40c10f19": { short: "MINT", label: "Mint" },
  "0x9dc29fac": { short: "BURN", label: "Burn" },
  "0x2e1a7d4d": { short: "WDRW", label: "Withdraw" },
  "0xd0e30db0": { short: "DEPO", label: "Deposit" },
  "0x8c5be1e5": { short: "APPV", label: "Approval" },
  "0x7ff36ab5": { short: "SWAP", label: "SwapExactETHForTokens" },
  "0x38ed1739": { short: "SWAP", label: "SwapExactTokensForTokens" },
  "0x18cbafe5": { short: "SWAP", label: "SwapExactTokensForETH" },
  "0xfb3bdb41": { short: "SWAP", label: "SwapETHForExactTokens" },
};

const STATE = {
  HIDDEN: "hidden",
  INSPECTED: "inspected",
  APPROVED: "approved",
  HOLD: "held",
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
  incident: null,
  lastClue: null,
  approvalCount: 0,
  lastAction: null,
  relatedIds: [],
  focusTileId: null,
  introVisible: true,
  elapsedSeconds: 0,
  timeLimitSeconds: 120,
  timerIntervalId: null,
  roundStartMs: 0,
  lastApprovalMs: 0,
  isPaused: false,
  holdMode: false,
  showBlockDescriptions: false,
  tutorialStepIndex: 0,
  maxPressureRatio: 0,
  leaderboardVisible: false,
};

const elements = {
  grid: document.getElementById("grid"),
  signalsContent: document.getElementById("signals-content"),
  statusLabel: document.getElementById("status-label"),
  statusSubtext: document.getElementById("status-subtext"),
  volumeMeter: document.getElementById("volume-meter"),
  hotspotMeter: document.getElementById("hotspot-meter"),
  approvalCount: document.getElementById("approval-count"),
  timerDisplay: document.getElementById("timer-display"),
  timerLimit: document.getElementById("timer-limit"),
  overlay: document.getElementById("incident-overlay"),
  incidentCause: document.getElementById("incident-cause"),
  incidentSummary: document.getElementById("incident-summary"),
  incidentHint: document.getElementById("incident-hint"),
  incidentImpact: document.getElementById("incident-impact"),
  incidentRecommendation: document.getElementById("incident-recommendation"),
  incidentList: document.getElementById("incident-list"),
  restartButton: document.getElementById("restart-button"),
  victoryOverlay: document.getElementById("victory-overlay"),
  victoryRestartButton: document.getElementById("victory-restart-button"),
  quickVictory: document.getElementById("quick-victory"),
  quickRestart: document.getElementById("quick-restart"),
  quickIncident: document.getElementById("quick-incident"),
  holdToggle: document.getElementById("hold-toggle"),
  introOverlay: document.getElementById("intro-overlay"),
  introStartButton: document.getElementById("intro-start-button"),
  helpOverlay: document.getElementById("help-overlay"),
  helpButton: document.getElementById("help-button"),
  helpCloseButton: document.getElementById("help-close-button"),
  howToWinOverlay: document.getElementById("how-to-win-overlay"),
  howToWinButton: document.getElementById("how-to-win-button"),
  howToWinCloseButton: document.getElementById("how-to-win-close-button"),
  tutorialOverlay: document.getElementById("tutorial-overlay"),
  tutorialButton: document.getElementById("tutorial-button"),
  tutorialTitle: document.getElementById("tutorial-title"),
  tutorialBody: document.getElementById("tutorial-body"),
  tutorialStep: document.getElementById("tutorial-step"),
  tutorialPrevButton: document.getElementById("tutorial-prev-button"),
  tutorialNextButton: document.getElementById("tutorial-next-button"),
  tutorialCloseButton: document.getElementById("tutorial-close-button"),
  blockDescriptionsToggle: document.getElementById("block-descriptions-toggle"),
  musicToggle: document.getElementById("music-toggle"),
  leaderboardToggle: document.getElementById("leaderboard-toggle"),
  leaderboardOverlay: document.getElementById("leaderboard-overlay"),
  leaderboardCloseButton: document.getElementById("leaderboard-close-button"),
  leaderboardList: document.getElementById("leaderboard-list"),
  leaderboardEmpty: document.getElementById("leaderboard-empty"),
  leaderboardName: document.getElementById("leaderboard-name"),
  leaderboardSubmit: document.getElementById("leaderboard-submit"),
  leaderboardStatus: document.getElementById("leaderboard-status"),
};

let tooltipEl = null;
let musicPlayer = null;
let musicStarted = false;
let musicEnabled = true;

function getTooltipEl() {
  if (tooltipEl) return tooltipEl;
  tooltipEl = document.createElement("div");
  tooltipEl.className = "tile-tooltip hidden";
  document.body.appendChild(tooltipEl);
  return tooltipEl;
}

function initBackgroundMusic() {
  if (musicPlayer) return;
  musicPlayer = document.getElementById("background-music");
  updateMusicToggle();
}

function requestMusicPlayback() {
  if (!musicPlayer || !musicEnabled) return;
  try {
    musicPlayer.volume = 0.4;
    musicPlayer.muted = false;
    if (!musicStarted || musicPlayer.paused) {
      const playPromise = musicPlayer.play();
      if (playPromise?.catch) {
        playPromise.catch(() => {
          // Autoplay can be blocked until a user gesture.
        });
      }
      musicStarted = true;
    }
  } catch (error) {
    // Autoplay can be blocked until a user gesture.
  }
}

function updateMusicToggle() {
  if (!elements.musicToggle) return;
  elements.musicToggle.textContent = `Music: ${musicEnabled ? "On" : "Off"}`;
  elements.musicToggle.classList.toggle("is-active", musicEnabled);
}

function toggleMusic() {
  musicEnabled = !musicEnabled;
  updateMusicToggle();
  if (!musicPlayer) return;
  if (musicEnabled) {
    requestMusicPlayback();
  } else {
    try {
      musicPlayer.muted = true;
      if (musicPlayer.paused) {
        const playPromise = musicPlayer.play();
        if (playPromise?.catch) {
          playPromise.catch(() => {
            // Autoplay can be blocked until a user gesture.
          });
        }
      }
    } catch (error) {
      // Ignore player state errors.
    }
  }
}

function stopMusic() {
  if (!musicPlayer) return;
  musicEnabled = false;
  updateMusicToggle();
  try {
    musicPlayer.pause();
    musicPlayer.currentTime = 0;
    musicPlayer.muted = true;
    musicStarted = false;
  } catch (error) {
    // Ignore player state errors.
  }
}

const TUTORIAL_STEPS = [
  {
    title: "Step 1 — Read the Tile",
    body:
      "Each tile shows METHOD • CLUSTER. No tile is bad alone. Patterns are what cause incidents.",
    visual: `<div class="tutorial-visual">
      <div class="mini-grid">
        <div class="mini-tile highlight">READ&nbsp;&bull;&nbsp;B</div>
        <div class="mini-tile">LOGS&nbsp;&bull;&nbsp;A</div>
        <div class="mini-tile">SEND&nbsp;&bull;&nbsp;D</div>
        <div class="mini-tile">TRACE&nbsp;&bull;&nbsp;B</div>
        <div class="mini-tile dim">READ&nbsp;&bull;&nbsp;C</div>
        <div class="mini-tile dim">LOGS&nbsp;&bull;&nbsp;E</div>
        <div class="mini-tile dim">BLOCK&nbsp;&bull;&nbsp;A</div>
        <div class="mini-tile dim">SEND&nbsp;&bull;&nbsp;C</div>
      </div>
      <div class="mini-caption">Look at the method + cluster label first.</div>
    </div>`,
  },
  {
    title: "Step 2 — Approve vs Hold",
    body:
      "Approve adds pressure. Hold Mode lets you mark a tile without adding pressure so you can compare patterns.",
    visual: `<div class="tutorial-visual">
      <div class="mini-grid">
        <div class="mini-tile approved">READ&nbsp;&bull;&nbsp;B</div>
        <div class="mini-tile highlight">HELD</div>
        <div class="mini-tile">LOGS&nbsp;&bull;&nbsp;B</div>
        <div class="mini-tile">SEND&nbsp;&bull;&nbsp;C</div>
        <div class="mini-tile dim">TRACE&nbsp;&bull;&nbsp;B</div>
        <div class="mini-tile dim">BLOCK&nbsp;&bull;&nbsp;A</div>
        <div class="mini-tile dim">READ&nbsp;&bull;&nbsp;E</div>
        <div class="mini-tile dim">LOGS&nbsp;&bull;&nbsp;D</div>
      </div>
      <div class="mini-caption">Hold marks a tile without pushing the meters.</div>
    </div>`,
  },
  {
    title: "Step 3 — Watch the Clues",
    body:
      "Clues summarize your last approvals. They call out sameness or bursts so you can adjust the next few picks.",
    visual: `<div class="tutorial-visual">
      <div class="mini-grid">
        <div class="mini-tile risk">READ&nbsp;&bull;&nbsp;B</div>
        <div class="mini-tile risk">READ&nbsp;&bull;&nbsp;D</div>
        <div class="mini-tile">LOGS&nbsp;&bull;&nbsp;A</div>
        <div class="mini-tile">SEND&nbsp;&bull;&nbsp;E</div>
        <div class="mini-tile risk">TRACE&nbsp;&bull;&nbsp;B</div>
        <div class="mini-tile dim">BLOCK&nbsp;&bull;&nbsp;C</div>
        <div class="mini-tile dim">LOGS&nbsp;&bull;&nbsp;D</div>
        <div class="mini-tile dim">SEND&nbsp;&bull;&nbsp;A</div>
      </div>
      <div class="mini-caption">Repeats (same method or cluster) drive hotspot clues.</div>
    </div>`,
  },
  {
    title: "Step 4 — Manage the Meters",
    body:
      "Volume rises with fast approvals. Hotspot rises with repeating method or cluster. Waiting lets meters decay.",
    visual: `<div class="tutorial-visual">
      <div class="mini-grid">
        <div class="mini-tile approved">READ&nbsp;&bull;&nbsp;B</div>
        <div class="mini-tile approved">LOGS&nbsp;&bull;&nbsp;C</div>
        <div class="mini-tile approved">SEND&nbsp;&bull;&nbsp;E</div>
        <div class="mini-tile">TRACE&nbsp;&bull;&nbsp;A</div>
        <div class="mini-tile dim">READ&nbsp;&bull;&nbsp;D</div>
        <div class="mini-tile dim">LOGS&nbsp;&bull;&nbsp;B</div>
        <div class="mini-tile dim">BLOCK&nbsp;&bull;&nbsp;E</div>
        <div class="mini-tile dim">SEND&nbsp;&bull;&nbsp;C</div>
      </div>
      <div class="mini-caption">Burst approvals (back-to-back) spike volume.</div>
    </div>`,
  },
  {
    title: "Step 5 — Win the Game",
    body:
      "Reach 25 approvals before the time limit without crossing either meter threshold. Pace plus variety wins.",
    visual: `<div class="tutorial-visual">
      <div class="mini-grid">
        <div class="mini-tile approved">READ&nbsp;&bull;&nbsp;B</div>
        <div class="mini-tile">LOGS&nbsp;&bull;&nbsp;C</div>
        <div class="mini-tile approved">SEND&nbsp;&bull;&nbsp;E</div>
        <div class="mini-tile">TRACE&nbsp;&bull;&nbsp;A</div>
        <div class="mini-tile approved">BLOCK&nbsp;&bull;&nbsp;D</div>
        <div class="mini-tile">READ&nbsp;&bull;&nbsp;E</div>
        <div class="mini-tile approved">LOGS&nbsp;&bull;&nbsp;A</div>
        <div class="mini-tile">SEND&nbsp;&bull;&nbsp;B</div>
      </div>
      <div class="mini-caption">A mixed pattern keeps both meters steady.</div>
    </div>`,
  },
];

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
      const pseudoSelector = `0x${hashString(`${seed}-${row}-${col}`)
        .toString(16)
        .padStart(8, "0")}`;
      const pseudoDisplay = getMethodDisplay(pseudoSelector);
      tiles.push({
        id: `${row}-${col}-${seed}`,
        row,
        col,
        methodId: pseudoSelector,
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
        methodDisplayShort: pseudoDisplay?.short || null,
        methodDisplayLabel: pseudoDisplay?.label || null,
      });
    }
  }
  return { tiles, rng };
}

function getAlchemyKey() {
  return localStorage.getItem(ALCHEMY_KEY_STORAGE);
}

function getAlchemyUrl(apiKey) {
  return `https://${ALCHEMY_NETWORK}.g.alchemy.com/v2/${apiKey}`;
}

async function fetchRealTransactions() {
  const apiKey = getAlchemyKey();
  if (!apiKey) return null;

  const url = getAlchemyUrl(apiKey);
  const headers = { "Content-Type": "application/json" };

  try {
    const blockNumberRes = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_blockNumber",
        params: [],
      }),
    });
    const blockNumberJson = await blockNumberRes.json();
    const blockNumber = blockNumberJson.result;
    if (!blockNumber) return null;

    const blockRes = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "eth_getBlockByNumber",
        params: [blockNumber, false],
      }),
    });
    const blockJson = await blockRes.json();
    const hashes = blockJson.result?.transactions || [];
    const limited = hashes.slice(0, 10);

    const txs = await Promise.all(
      limited.map(async (hash, idx) => {
        const txRes = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 3 + idx,
            method: "eth_getTransactionByHash",
            params: [hash],
          }),
        });
        const txJson = await txRes.json();
        return txJson.result;
      })
    );

    return {
      blockNumber,
      txs: txs.filter(Boolean),
    };
  } catch (error) {
    return null;
  }
}

function hashString(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getMethodDisplay(methodId) {
  if (!methodId) return null;
  const selector = methodId.slice(0, 10).toLowerCase();
  if (selector === "0x" || selector.length < 10) {
    return { short: "ETH", label: "ETH transfer" };
  }
  if (METHOD_DISPLAY[selector]) return METHOD_DISPLAY[selector];
  const shortHex = selector.replace("0x", "").slice(0, 4).toUpperCase();
  return { short: shortHex, label: `Selector ${selector}` };
}

function mapMethodIdToGroup(methodId, rng) {
  if (!methodId || methodId === "0x") return "sendRawTransaction";
  const selector = methodId.slice(0, 10);
  if (selector === "0xa9059cbb") return "sendRawTransaction";
  return METHOD_GROUPS[hashString(selector) % METHOD_GROUPS.length];
}

function mapAddressToGroup(address) {
  if (!address) return "A";
  return CONTRACT_GROUPS[hashString(address) % CONTRACT_GROUPS.length];
}

function getTileTooltipContent(tile) {
  const methodLabel = METHOD_LABELS[tile.methodGroup] || "Request";
  const methodShort = METHOD_SHORT[tile.methodGroup] || "REQ";
  let selectorText = "0x";
  if (tile.methodId && tile.methodId !== "0x") {
    const raw = tile.methodId.toLowerCase();
    const hex = raw.startsWith("0x") ? raw.slice(2) : raw;
    if (hex.length <= 8) {
      selectorText = `0x${hex}`;
    } else {
      selectorText = `0x${hex.slice(0, 4)}...${hex.slice(-4)}`;
    }
  }
  return `
    <div class="tile-tooltip-title">${methodLabel}</div>
    <div class="tile-tooltip-row"><span>Method</span><span>${methodShort}</span></div>
    <div class="tile-tooltip-row"><span>Cluster</span><span>${tile.contractGroup}</span></div>
    <div class="tile-tooltip-row"><span>Selector</span><span>${selectorText}</span></div>
  `;
}

function showTileTooltip(tile, targetEl) {
  if (!appState.showBlockDescriptions) return;
  const tooltip = getTooltipEl();
  tooltip.innerHTML = getTileTooltipContent(tile);
  tooltip.classList.remove("hidden");
  const rect = targetEl.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  const top = window.scrollY + rect.top - tooltipRect.height - 8;
  const left =
    window.scrollX + rect.left + rect.width / 2 - tooltipRect.width / 2;
  tooltip.style.top = `${Math.max(8, top)}px`;
  tooltip.style.left = `${Math.max(8, left)}px`;
}

function hideTileTooltip() {
  if (!tooltipEl) return;
  tooltipEl.classList.add("hidden");
}

function setBlockDescriptions(enabled) {
  appState.showBlockDescriptions = enabled;
  if (elements.blockDescriptionsToggle) {
    elements.blockDescriptionsToggle.checked = enabled;
  }
  if (!enabled) hideTileTooltip();
}

function mapRealTxsToTiles(realTxs, tiles, rng) {
  if (!realTxs.length) return tiles;
  tiles.forEach((tile) => {
    const tx = rng.randomPick(realTxs);
    tile.txHash = tx.hash;
    tile.from = tx.from;
    tile.to = tx.to;
    tile.methodId = tx.input?.slice(0, 10);
    const methodDisplay = getMethodDisplay(tile.methodId);
    tile.methodDisplayShort = methodDisplay?.short || null;
    tile.methodDisplayLabel = methodDisplay?.label || null;
    tile.methodGroup = mapMethodIdToGroup(tile.methodId, rng);
    tile.contractGroup = mapAddressToGroup(tile.to);
  });
  return tiles;
}

function computeLocalSeverity(tile, approvedTiles) {
  const related = approvedTiles.filter(
    (t) =>
      t.id !== tile.id &&
      (t.methodGroup === tile.methodGroup || t.contractGroup === tile.contractGroup)
  );
  const base = tile.hotspotWeight;
  const accumulated = related.length * 0.5;
  const rawScore = base + accumulated;
  if (rawScore < 1.5) return 0;
  if (rawScore < 3.0) return 1;
  if (rawScore < 4.5) return 2;
  return 3;
}

function createClue(tile, action) {
  const recent = appState.approvedTiles.slice(-4);
  const methodMatches = recent.filter(
    (t) => t.methodGroup === tile.methodGroup
  ).length;
  const clusterMatches = recent.filter(
    (t) => t.contractGroup === tile.contractGroup
  ).length;
  const now = Date.now();
  const isBurst =
    action === "approve" &&
    appState.lastApprovalMs > 0 &&
    now - appState.lastApprovalMs < BURST_WINDOW_MS;
  const hasSameness = methodMatches > 0 || clusterMatches > 0;
  const methodLabel = METHOD_LABELS[tile.methodGroup] || "Request";

  let axis = "Balanced";
  const clues = ["Clue: no recent pattern to compare."];

  if (hasSameness) {
    axis = "Sameness";
    const parts = [];
    if (methodMatches > 0) {
      parts.push(`${methodLabel} repeats (${methodMatches}/${recent.length})`);
    }
    if (clusterMatches > 0) {
      parts.push(
        `Cluster ${tile.contractGroup} repeats (${clusterMatches}/${recent.length})`
      );
    }
    clues.length = 0;
    clues.push(`Clue: ${parts.join(" and ")}.`);
    
  }

  if (isBurst) {
    axis = hasSameness ? "Mixed" : "Pacing";
    if (hasSameness) {
      clues.push("Clue: approvals are landing in a burst window.");
    } else {
      clues.length = 0;
      clues.push("Clue: approvals are landing in a burst window.");
    }
    
  }

  if (action === "hold") {
    clues.length = 0;
    clues.push("Clue: tile held for later. No pressure added.");
    
  }

  return { axis, clues };
}

function setHoldMode(isOn) {
  appState.holdMode = isOn;
  elements.holdToggle.classList.toggle("is-active", isOn);
  elements.holdToggle.textContent = `Hold Mode: ${isOn ? "On" : "Off"}`;
}

function toggleHoldTile(tile) {
  if (tile.state === STATE.APPROVED) return;
  tile.state = tile.state === STATE.HOLD ? STATE.HIDDEN : STATE.HOLD;
  appState.lastAction = "hold";
  appState.lastClue = createClue(tile, "hold");
  appState.focusTileId = null;
  appState.relatedIds = [];
  renderSignals();
  renderTiles();
}

function handleTileClick(tile) {
  if (appState.incident || appState.introVisible) return;
  requestMusicPlayback();
  if (appState.holdMode) {
    toggleHoldTile(tile);
  } else {
    approveTile(tile);
  }
}

function getLogSnippet(severity) {
  return SIGNAL_LOGS[severity] || "ok";
}

function updateMeters(tile) {
  const now = Date.now();
  let burstMultiplier = 1;
  if (appState.lastApprovalMs > 0) {
    const delta = now - appState.lastApprovalMs;
    if (delta < BURST_WINDOW_MS) {
      const ratio = (BURST_WINDOW_MS - delta) / BURST_WINDOW_MS;
      burstMultiplier = 1 + ratio * (BURST_MAX_MULTIPLIER - 1);
    }
  }
  appState.meters.volume += tile.volumeWeight * burstMultiplier;
  appState.lastApprovalMs = now;
  const related = appState.approvedTiles.filter(
    (t) =>
      t.id !== tile.id &&
      (t.methodGroup === tile.methodGroup || t.contractGroup === tile.contractGroup)
  );
  if (related.length > 0) {
    appState.meters.hotspot += tile.hotspotWeight;
    appState.meters.hotspot += related.length * 0.3;
  }
}

function checkForIncident() {
  if (appState.incident) return;
  if (appState.meters.volume >= VOLUME_THRESHOLD) {
    triggerIncident("volume");
  } else if (appState.meters.hotspot >= HOTSPOT_THRESHOLD) {
    triggerIncident("hotspot");
  }
}

function checkForVictory() {
  if (appState.incident) return false;
  if (appState.approvalCount < APPROVAL_TARGET) return false;
  triggerVictory();
  return true;
}

function triggerVictory() {
  stopTimer();
  stopMusic();
  elements.victoryOverlay.classList.remove("hidden");
  fetchLeaderboard();
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
  stopMusic();
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

function approveTile(tile) {
  if (tile.state === STATE.APPROVED || appState.incident || appState.introVisible)
    return;
  const clue = createClue(tile, "approve");
  const severity = computeLocalSeverity(tile, appState.approvedTiles);
  const related = appState.approvedTiles.filter(
    (t) => t.methodGroup === tile.methodGroup || t.contractGroup === tile.contractGroup
  );
  const relatedAll = appState.tiles.filter(
    (t) => t.methodGroup === tile.methodGroup || t.contractGroup === tile.contractGroup
  );
  const signal = {
    symptom: "Retries",
    severity,
    logSnippet: getLogSnippet(severity),
    relatedCount: related.length,
  };
  tile.state = STATE.APPROVED;
  tile.revealedSignal = signal;
  appState.lastClue = clue;
  appState.approvedTiles.push(tile);
  appState.approvalCount += 1;
  appState.lastAction = "approve";
  appState.relatedIds = relatedAll.map((t) => t.id);
  appState.focusTileId = tile.id;
  updateMeters(tile);
  checkForIncident();
  if (checkForVictory()) return;
  renderStatus();
  renderMeters();
  renderSignals();
  renderTiles();
}

function renderSignals() {
  if (!appState.lastClue) return;
  elements.signalsContent.innerHTML = "";
  const list = document.createElement("ul");
  list.className = "clue-list";

  appState.lastClue.clues.forEach((clue) => {
    const item = document.createElement("li");
    item.textContent = clue;
    list.appendChild(item);
  });

  elements.signalsContent.appendChild(list);
}

function setLeaderboardVisible(isVisible) {
  appState.leaderboardVisible = isVisible;
  if (!elements.leaderboardOverlay) return;
  elements.leaderboardOverlay.classList.toggle("hidden", !isVisible);
  if (elements.leaderboardToggle) {
    elements.leaderboardToggle.classList.toggle("is-active", isVisible);
  }
  if (isVisible) {
    pauseTimer();
    fetchLeaderboard();
  } else {
    resumeTimer();
  }
}

function getStoredLeaderboardName() {
  return localStorage.getItem(LEADERBOARD_STORAGE_KEY) || "";
}

function setStoredLeaderboardName(name) {
  localStorage.setItem(LEADERBOARD_STORAGE_KEY, name);
}

function formatLeaderboardEntry(entry, index) {
  const name = entry.display_name || "Anonymous";
  const time = formatTime(entry.time_seconds || 0);
  const pressure = Math.round((entry.max_pressure_ratio || 0) * 100);
  const approvals = entry.approvals || 0;
  return `
    <li class="leaderboard-item">
      <span>#${index + 1} ${name}</span>
      <span>${time} • ${approvals}/${APPROVAL_TARGET} • ${pressure}%</span>
    </li>
  `;
}

function renderLeaderboard(entries) {
  if (!elements.leaderboardList || !elements.leaderboardEmpty) return;
  elements.leaderboardList.innerHTML = "";
  if (!entries.length) {
    elements.leaderboardEmpty.textContent = "No completed runs yet.";
    elements.leaderboardEmpty.style.display = "block";
    return;
  }
  elements.leaderboardEmpty.style.display = "none";
  elements.leaderboardList.innerHTML = entries
    .map((entry, index) => formatLeaderboardEntry(entry, index))
    .join("");
}

async function fetchLeaderboard(options = {}) {
  const { bustCache = false } = options;
  try {
    const cacheBuster = bustCache ? `&t=${Date.now()}` : "";
    const res = await fetch(
      `${LEADERBOARD_ENDPOINT}?limit=${LEADERBOARD_LIMIT}${cacheBuster}`,
      {
        cache: bustCache ? "no-store" : "default",
      }
    );
    if (!res.ok) throw new Error("Failed to fetch leaderboard");
    const data = await res.json();
    renderLeaderboard(Array.isArray(data) ? data : []);
  } catch (error) {
    if (elements.leaderboardEmpty) {
      elements.leaderboardEmpty.textContent = "Leaderboard offline.";
      elements.leaderboardEmpty.style.display = "block";
    }
  }
}

function setLeaderboardStatus(message, isError = false) {
  if (!elements.leaderboardStatus) return;
  elements.leaderboardStatus.textContent = message;
  elements.leaderboardStatus.style.color = isError ? "#8c2b2b" : "#333";
}

async function submitLeaderboardEntry() {
  if (!elements.leaderboardName || !elements.leaderboardSubmit) return;
  const rawName = elements.leaderboardName.value.trim();
  if (!rawName) {
    setLeaderboardStatus("Add a name to submit your run.", true);
    return;
  }
  const payload = {
    displayName: rawName,
    approvals: appState.approvalCount,
    timeSeconds: appState.elapsedSeconds,
    maxPressureRatio: appState.maxPressureRatio,
    timeLimitSeconds: appState.timeLimitSeconds,
  };
  elements.leaderboardSubmit.disabled = true;
  setLeaderboardStatus("Submitting run...");
  try {
    const res = await fetch(LEADERBOARD_SUBMIT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Submission failed");
    setStoredLeaderboardName(rawName);
    setLeaderboardStatus("Run submitted. Refreshing leaderboard...");
    await fetchLeaderboard({ bustCache: true });
    setLeaderboardStatus("Run submitted. See you on the board.");
  } catch (error) {
    setLeaderboardStatus("Could not submit run. Try again.", true);
  } finally {
    elements.leaderboardSubmit.disabled = false;
  }
}

function renderMeters() {
  const volumeRatio = Math.min(appState.meters.volume / VOLUME_THRESHOLD, 1);
  const hotspotRatio = Math.min(appState.meters.hotspot / HOTSPOT_THRESHOLD, 1);
  const pressureRatio = Math.max(volumeRatio, hotspotRatio);
  appState.maxPressureRatio = Math.max(appState.maxPressureRatio, pressureRatio);
  const approachRatio = Math.pow(appState.maxPressureRatio, EGG_PATH.curve);
  elements.volumeMeter.style.width = `${Math.round(volumeRatio * 100)}%`;
  elements.hotspotMeter.style.width = `${Math.round(hotspotRatio * 100)}%`;
  elements.hotspotMeter.classList.add("hotspot");
  document.documentElement.style.setProperty(
    "--egg-offset-x",
    `${Math.round(approachRatio * EGG_PATH.xMax)}px`
  );
  document.documentElement.style.setProperty(
    "--egg-approach-y",
    `${Math.round(approachRatio * EGG_PATH.yMax)}px`
  );
  document.documentElement.style.setProperty(
    "--egg-scale",
    (1 + approachRatio * EGG_PATH.scaleMax).toFixed(3)
  );
  renderStatus();
  elements.approvalCount.textContent = `${appState.approvalCount}/${APPROVAL_TARGET}`;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

function updateTimerDisplay() {
  elements.timerDisplay.textContent = formatTime(appState.elapsedSeconds);
  elements.timerLimit.textContent = `Limit: ${formatTime(appState.timeLimitSeconds)}`;
}

function startTimerInterval() {
  appState.timerIntervalId = setInterval(() => {
    appState.elapsedSeconds = Math.floor((Date.now() - appState.roundStartMs) / 1000);
    if (!appState.incident) {
      applyDecayTick();
    }
    updateTimerDisplay();
    if (appState.elapsedSeconds >= appState.timeLimitSeconds) {
      triggerTimeout();
    }
  }, 1000);
}

function startTimer() {
  stopTimer();
  appState.roundStartMs = Date.now();
  appState.elapsedSeconds = 0;
  appState.isPaused = false;
  updateTimerDisplay();
  startTimerInterval();
}

function stopTimer() {
  if (appState.timerIntervalId) {
    clearInterval(appState.timerIntervalId);
    appState.timerIntervalId = null;
  }
}

function pauseTimer() {
  if (!appState.timerIntervalId) return;
  appState.elapsedSeconds = Math.floor((Date.now() - appState.roundStartMs) / 1000);
  stopTimer();
  appState.isPaused = true;
  updateTimerDisplay();
}

function resumeTimer() {
  if (appState.timerIntervalId || !appState.isPaused) return;
  if (appState.incident || appState.introVisible) return;
  appState.roundStartMs = Date.now() - appState.elapsedSeconds * 1000;
  appState.isPaused = false;
  startTimerInterval();
}

function applyDecayTick() {
  let changed = false;
  if (appState.meters.hotspot > 0) {
    appState.meters.hotspot = Math.max(0, appState.meters.hotspot - HOTSPOT_DECAY_RATE);
    changed = true;
  }
  if (appState.meters.volume > 0) {
    appState.meters.volume = Math.max(0, appState.meters.volume - VOLUME_DECAY_RATE);
    changed = true;
  }
  if (changed) renderMeters();
}

function renderStatus() {
  if (!elements.statusLabel || !elements.statusSubtext) return;
  elements.statusLabel.textContent = getGlobalStatus();
  let subtext = "No approvals yet.";
  if (appState.lastAction === "inspect") {
    subtext = "Inspecting only (no pressure added).";
  } else if (appState.lastAction === "approve") {
    subtext = "Pressure increased by approval.";
  }
  elements.statusSubtext.textContent = subtext;
}

function renderTiles() {
  const fragment = document.createDocumentFragment();
  const focusTile = appState.tiles.find((tile) => tile.id === appState.focusTileId);
  appState.tiles.forEach((tile) => {
    const div = document.createElement("div");
    div.className = `tile ${tile.state}`;
    if (tile.state === STATE.HOLD) {
      // Keep held tiles visually distinct even when focusing elsewhere.
    } else if (focusTile && appState.relatedIds.includes(tile.id)) {
      const severity = computeLocalSeverity(tile, appState.approvedTiles);
      div.classList.add(`risk-${severity}`);
      if (tile.state === STATE.APPROVED) {
        div.classList.add("risk-outline");
      }
    } else if (focusTile) {
      div.classList.add("dim");
    }
    if (
      appState.incident &&
      appState.incident.contributors.some((t) => t.id === tile.id)
    ) {
      div.classList.add("contributor");
    }
    const methodGroupShort = METHOD_SHORT[tile.methodGroup] || "REQ";
    div.innerHTML = `<span class="tile-label">${methodGroupShort} • ${tile.contractGroup}</span>`;
    div.dataset.id = tile.id;
    div.addEventListener("click", () => {
      handleTileClick(tile);
    });
    div.addEventListener("mouseenter", () => {
      showTileTooltip(tile, div);
    });
    div.addEventListener("mouseleave", hideTileTooltip);
    fragment.appendChild(div);
  });
  elements.grid.innerHTML = "";
  elements.grid.appendChild(fragment);
}

function renderIncident() {
  if (!appState.incident) return;
  stopTimer();
  elements.overlay.classList.remove("hidden");
  let causeLabel = "Rate limits kicked in.";
  if (appState.incident.type === "volume") {
    causeLabel = "You pushed too many requests at once.";
  } else if (appState.incident.type === "hotspot") {
    causeLabel = "You concentrated too many similar requests.";
  } else if (appState.incident.type === "timeout") {
    causeLabel = "Time limit reached.";
  }
  const patternSummary = summarizePattern(appState.incident.contributors);
  elements.incidentCause.textContent = causeLabel;
  if (appState.incident.type === "timeout") {
    elements.incidentSummary.textContent = `Round ended at ${formatTime(
      appState.timeLimitSeconds
    )}.`;
    elements.incidentHint.textContent =
      "Pressure was still rising when the clock ran out.";
    elements.incidentImpact.textContent =
      "Impact: the team had to pause approvals to avoid a runaway incident.";
    elements.incidentRecommendation.textContent =
      "Next game: reduce streaks so you can reach the goal before the clock.";
  } else {
    elements.incidentSummary.textContent =
      "Rate limits kicked in. Requests started failing and retries piled on.";
    elements.incidentHint.textContent = patternSummary.summary;
    elements.incidentImpact.textContent =
      "Impact: user actions stalled, error rates spiked, and on-call had to throttle or shed load to recover.";
    elements.incidentRecommendation.textContent =
      appState.incident.type === "hotspot"
        ? "Next game: break up similar approvals to avoid a hotspot cascade."
        : "Next game: slow your approvals to avoid a burst cascade.";
  }

  elements.incidentList.innerHTML = "";
  appState.incident.contributors.forEach((tile, index) => {
    const row = document.createElement("div");
    row.className = "incident-item";
    const count = countRelated(tile);
    const methodLabel = METHOD_LABELS[tile.methodGroup] || "Request";
    row.innerHTML = `<span>#${index + 1} ${methodLabel} • Cluster ${tile.contractGroup}</span>
      <span>Related approvals: ${count}</span>`;
    elements.incidentList.appendChild(row);
  });
}

function triggerTimeout() {
  if (appState.incident) return;
  const likelyType =
    appState.meters.hotspot >= appState.meters.volume ? "hotspot" : "volume";
  appState.incident = {
    type: "timeout",
    contributors: pickContributors(likelyType),
  };
  stopMusic();
  renderIncident();
}

function summarizePattern(contributors) {
  const byMethod = new Map();
  const byContract = new Map();
  contributors.forEach((tile) => {
    byMethod.set(tile.methodGroup, (byMethod.get(tile.methodGroup) || 0) + 1);
    byContract.set(tile.contractGroup, (byContract.get(tile.contractGroup) || 0) + 1);
  });
  const topMethod = getTopKeyWithCount(byMethod);
  const topContract = getTopKeyWithCount(byContract);
  const total = contributors.length;
  const summaryParts = [];
  if (topMethod.key) {
    const methodLabel = METHOD_LABELS[topMethod.key] || topMethod.key;
    summaryParts.push(
      `${methodLabel} appears in ${topMethod.count}/${total} contributors`
    );
  }
  if (topContract.key) {
    summaryParts.push(
      `cluster ${topContract.key} appears in ${topContract.count}/${total} contributors`
    );
  }
  const summary =
    summaryParts.length > 0
      ? `Pattern detected: ${summaryParts.join(" and ")}.`
      : "Pattern detected: no dominant request type or cluster.";
  const recommendation =
    appState.incident?.type === "hotspot"
      ? "Try diversifying request types or clusters in the next game."
      : "Try spacing approvals so the request burst is smaller.";
  return { summary, recommendation };
}

function getTopKeyWithCount(counter) {
  let bestKey = null;
  let bestCount = -1;
  counter.forEach((count, key) => {
    if (count > bestCount) {
      bestKey = key;
      bestCount = count;
    }
  });
  return { key: bestKey, count: bestCount };
}


function showIntro() {
  appState.introVisible = true;
  elements.introOverlay.classList.remove("hidden");
}

function hideIntro() {
  appState.introVisible = false;
  elements.introOverlay.classList.add("hidden");
}

function showHowToWin() {
  pauseTimer();
  elements.howToWinOverlay.classList.remove("hidden");
}

function hideHowToWin() {
  elements.howToWinOverlay.classList.add("hidden");
  resumeTimer();
}

function handleOverlayClick(event, onClose) {
  if (event.target !== event.currentTarget) return;
  onClose();
}

function updateTutorialStep() {
  const step = TUTORIAL_STEPS[appState.tutorialStepIndex];
  elements.tutorialTitle.textContent = step.title;
  elements.tutorialBody.innerHTML = `<p>${step.body}</p>${step.visual || ""}`;
  elements.tutorialStep.textContent = `Step ${
    appState.tutorialStepIndex + 1
  } of ${TUTORIAL_STEPS.length}`;
  elements.tutorialPrevButton.disabled = appState.tutorialStepIndex === 0;
  elements.tutorialNextButton.textContent =
    appState.tutorialStepIndex === TUTORIAL_STEPS.length - 1
      ? "Finish"
      : "Next";
}

function showTutorial() {
  pauseTimer();
  appState.tutorialStepIndex = 0;
  updateTutorialStep();
  elements.tutorialOverlay.classList.remove("hidden");
}

function hideTutorial() {
  elements.tutorialOverlay.classList.add("hidden");
  resumeTimer();
}

function resetGame(newSeed) {
  hideTileTooltip();
  appState.seed = newSeed || `${Date.now()}`;
  appState.meters = { volume: 0, hotspot: 0 };
  appState.approvedTiles = [];
  appState.approvalCount = 0;
  appState.incident = null;
  appState.lastClue = null;
  appState.lastAction = null;
  appState.relatedIds = [];
  appState.focusTileId = null;
  appState.lastApprovalMs = 0;
  appState.maxPressureRatio = 0;
  setHoldMode(false);
  showIntro();
  const { tiles, rng } = generateTiles(appState.seed);
  appState.tiles = tiles;
  appState.rng = rng;
  elements.overlay.classList.add("hidden");
  elements.victoryOverlay.classList.add("hidden");
  elements.signalsContent.innerHTML =
    '<span class="signal-label">Choose a tile to see a pace or sameness clue.</span>';
  renderStatus();
  renderMeters();
  stopTimer();
  appState.elapsedSeconds = 0;
  updateTimerDisplay();
  renderTiles();
  applyRealTransactions();
  fetchLeaderboard();
}

function bindEvents() {
  elements.restartButton.addEventListener("click", () => resetGame());
  elements.victoryRestartButton.addEventListener("click", () => resetGame());
  elements.quickRestart.addEventListener("click", () => resetGame());
  elements.quickIncident.addEventListener("click", () => {
    hideIntro();
    appState.incident = {
      type: "hotspot",
      contributors: pickContributors("hotspot"),
    };
    renderIncident();
  });
  elements.quickVictory.addEventListener("click", () => {
    hideIntro();
    appState.incident = null;
    triggerVictory();
  });
  elements.holdToggle.addEventListener("click", () => {
    requestMusicPlayback();
    setHoldMode(!appState.holdMode);
  });
  elements.blockDescriptionsToggle.addEventListener("change", (event) => {
    requestMusicPlayback();
    setBlockDescriptions(event.target.checked);
  });
  elements.introStartButton.addEventListener("click", () => {
    requestMusicPlayback();
    hideIntro();
    startTimer();
  });
  if (elements.leaderboardName) {
    elements.leaderboardName.value = getStoredLeaderboardName();
  }
  if (elements.leaderboardSubmit) {
    elements.leaderboardSubmit.addEventListener("click", () => {
      submitLeaderboardEntry();
    });
  }
  if (elements.leaderboardToggle) {
    elements.leaderboardToggle.addEventListener("click", () => {
      requestMusicPlayback();
      setLeaderboardVisible(!appState.leaderboardVisible);
    });
  }
  if (elements.leaderboardCloseButton) {
    elements.leaderboardCloseButton.addEventListener("click", () => {
      setLeaderboardVisible(false);
    });
  }
  if (elements.leaderboardOverlay) {
    elements.leaderboardOverlay.addEventListener("click", (event) => {
      handleOverlayClick(event, () => setLeaderboardVisible(false));
    });
  }
  elements.helpButton.addEventListener("click", () => {
    requestMusicPlayback();
    pauseTimer();
    elements.helpOverlay.classList.remove("hidden");
  });
  if (elements.musicToggle) {
    elements.musicToggle.addEventListener("click", () => {
      toggleMusic();
    });
  }
  elements.helpCloseButton.addEventListener("click", () => {
    elements.helpOverlay.classList.add("hidden");
    resumeTimer();
  });
  elements.helpOverlay.addEventListener("click", (event) => {
    handleOverlayClick(event, () => {
      elements.helpOverlay.classList.add("hidden");
      resumeTimer();
    });
  });
  elements.howToWinButton.addEventListener("click", () => {
    requestMusicPlayback();
    showHowToWin();
  });
  elements.howToWinCloseButton.addEventListener("click", () => {
    hideHowToWin();
  });
  elements.howToWinOverlay.addEventListener("click", (event) => {
    handleOverlayClick(event, hideHowToWin);
  });
  elements.tutorialButton.addEventListener("click", () => {
    requestMusicPlayback();
    showTutorial();
  });
  elements.tutorialCloseButton.addEventListener("click", () => {
    hideTutorial();
  });
  elements.tutorialOverlay.addEventListener("click", (event) => {
    handleOverlayClick(event, hideTutorial);
  });
  elements.tutorialPrevButton.addEventListener("click", () => {
    appState.tutorialStepIndex = Math.max(0, appState.tutorialStepIndex - 1);
    updateTutorialStep();
  });
  elements.tutorialNextButton.addEventListener("click", () => {
    if (appState.tutorialStepIndex >= TUTORIAL_STEPS.length - 1) {
      hideTutorial();
      return;
    }
    appState.tutorialStepIndex = Math.min(
      TUTORIAL_STEPS.length - 1,
      appState.tutorialStepIndex + 1
    );
    updateTutorialStep();
  });
  elements.introOverlay.addEventListener("click", (event) => {
    handleOverlayClick(event, () => {
      hideIntro();
      startTimer();
    });
  });
}

function init() {
  const { tiles, rng } = generateTiles(appState.seed);
  appState.tiles = tiles;
  appState.rng = rng;
  updateMusicToggle();
  initBackgroundMusic();
  bindEvents();
  renderMeters();
  updateTimerDisplay();
  renderTiles();
  showIntro();
  setBlockDescriptions(appState.showBlockDescriptions);
  applyRealTransactions();
  fetchLeaderboard();
}

function applyRealTransactions() {
  fetchRealTransactions().then((result) => {
    if (!result || !result.txs.length) return;
    appState.seed = result.blockNumber;
    const { tiles, rng } = generateTiles(appState.seed);
    appState.tiles = mapRealTxsToTiles(result.txs, tiles, rng);
    appState.rng = rng;
    renderTiles();
  });
}

init();
