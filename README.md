# Transaction Pressure

Transaction Pressure is a short-form strategy game about managing system load.
It frames production reliability as a minesweeper-adjacent puzzle: each action
reveals a local clue about hidden patterns, and you win by pacing and variety
before pressure overwhelms the system.

## Quick Start
- No build step. Open `index.html` in a browser.
- Optional: run a local server for consistent asset loading:
  - `python3 -m http.server` then open `http://localhost:8000`.

## How to Play
Goal: approve 25 tiles before the time limit without triggering an incident.

### Core Actions
- **Approve (default):** click a tile to approve it.
- **Hold (no pressure):** toggle **Hold Mode** and click a tile to hold it.
  Hold is the PRD’s **Inspect** action: it reveals a clue and adds no pressure.

### Clues (Minesweeper-style signals)
Clues are short, local hints based on your **last 4 approvals**.
They tell you whether your current choice repeats a pattern or lands in a burst.
Use them to decide whether to approve now or hold for later.

Typical clues include:
- “Clue: Log lookup repeats (2/4).”
- “Clue: Cluster C repeats (1/4).”
- “Clue: approvals are landing in a burst window.”

### Pressure Systems
Approving tiles increases pressure in two ways:
- **Request Volume (Pacing):** fast approvals raise throughput pressure.
- **Hotspot Concentration (Sameness):** repeating the same method or cluster
  increases repetition pressure.

The global status reads the higher of these two pressures.

### Incidents and Outcomes
An incident triggers when either pressure crosses its threshold:
- **Volume incident:** approvals came too fast.
- **Hotspot incident:** approvals were too similar.
- **Timeout:** the round ends when the clock hits zero.

## How to Win (Patterns to Watch)
You win by reaching 25 approvals while keeping both meters below their thresholds.
The game is about managing patterns, not avoiding single bad tiles.

### The Three Patterns
- **Sameness (Hotspot):** repeating the same method (READ/LOGS/TRACE/SEND/BLOCK)
  or cluster letter (A–E) builds concentration pressure.
- **Burst (Volume):** approving too quickly multiplies throughput pressure even if
  the tiles are diverse.
- **Mixed:** sameness plus burst spikes both meters fastest.

### Practical Playbook
- **Alternate methods and clusters** after each approval to break hotspots.
- **Slow your cadence** when the Volume meter climbs; waiting lets meters decay.
- **Use Hold Mode** to compare tiles without adding pressure.

### What to Look For on the Grid
- Each tile shows `METHOD • CLUSTER`.
- Related tiles glow after approval to show sameness pressure.
- Clues call out repetition or burst timing for your last few approvals.
- **Block Descriptions toggle:** enable hover tooltips to view method, cluster,
  and selector hints per tile.

### Interface Map
- **Grid:** each tile is a request with a hidden pattern.
- **Clues panel:** local hints about repetition or bursts.
- **Meters:** visualize volume and hotspot pressure.
- **Approvals:** progress toward the goal.

### Debug Shortcut
Use the **Show Incident** button in the title bar to open the closing modal
without playing a full round.

## Intent for the Hackathon
This project explores how **transaction pressure** feels when translated into
a decision game. It reimagines reliability risk as a minesweeper-style puzzle:
the player uncovers local clues and must choose between speed and variety.

Design goals:
- Make players feel **clever under pressure** through pattern recognition.
- Keep the game an **informed guessing game**, not a deterministic solver.
- Ensure failure is **avoidable with mastery** through pacing and variety.

## PRD Alignment Notes
- **Failures visible, causes hidden:** incidents are immediate; meters are latent.
- **No bad tiles:** only accumulation triggers failure.
- **Inference over avoidance:** clues are local; the player infers patterns.
- **Minesweeper-adjacent:** clues hint at patterns, not exact safe moves.
- **Inspect action:** implemented as **Hold Mode** (no pressure, reveals clue).
- **Windowed UI:** fixed-size 960×720 game window; no scrolling.
- **Deterministic, demo-safe:** seeded generation; single-incident flow.

## Optional: Live Transaction Flavor
If you have an Alchemy API key, you can map live transaction data into tiles.
Set it in localStorage:
`localStorage.setItem("alchemyKey", "YOUR_KEY")`

Guardrails (from PRD):
- Game runs offline-first; no RPC during gameplay.
- Real data is flavor only; incidents and meters are synthetic.
- When available, the latest Sepolia block seeds the board, and selector hints
  appear in the hover details.

## Project Structure
- `index.html` — UI layout
- `styles.css` — visual design and layout
- `app.js` — game logic and state

## Attribution
- Victory trophy ASCII art by Joan Stark (jgs): https://asciiart.website/art/5899
