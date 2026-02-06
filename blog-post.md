# No Token, No Problem: Building a Puzzle Game with Blockchain Data

Most people hear "crypto game" and think speculation. Tokens. Wallets. Maybe a rug pull. I made a puzzle game instead.

**Transaction Pressure** is a minesweeper-style strategy game about managing API rate limits. You approve tiles. Pressure builds. If you push too hard or repeat too much, the system breaks. Win by reaching 25 approvals before triggering an incident.

There's no token. No wallet connection. No financial incentive whatsoever.

But there *is* real blockchain data running through it—and that's the point.

---

## The Premise

I'm a product designer at Alchemy. My day job involves designing data dashboards, thinking about money movement, and the hiding the plumbing that makes blockchain applications work. For a recent internal hackathon, I wanted to build something that made that invisible pain points *visible*—and playable.

The result: a browser game where every tile represents a transaction, and the mechanics teach you what rate limiting actually feels like.

Here's how it works:

- **The grid** shows 144 tiles. Each tile has a method type (READ, LOGS, TRACE, SEND, BLOCK) and a cluster letter (A–E).
- **Approve a tile** and pressure increases. Volume pressure rises when you approve too fast. Hotspot pressure rises when you repeat the same method or cluster.
- **Clues appear** after each action, hinting at patterns in your last few approvals. "Log lookup repeats." "Approvals are landing in a burst window."
- **An incident triggers** when either pressure meter crosses its threshold. Game over.

The design goal was minesweeper-adjacent: local clues, hidden global state, inference over avoidance. No single tile is "bad." Only accumulation causes failure.

---

## Where the Blockchain Comes In

Here's the twist: if you have an Alchemy API key, the game fetches real transactions from the Sepolia testnet and maps them onto the grid.

The latest block seeds the board. Real transaction hashes, sender addresses, and method selectors become tile metadata. Hover over a tile and you'll see actual on-chain data.

But—and this is critical—**the game works without any of it.**

The blockchain data is flavor, not causality. Pressure meters, thresholds, incidents, clues—all synthetic. The game runs offline-first. If the RPC call fails, you still play. The mechanics don't change.

This was a deliberate design constraint from the PRD:

> Real RPC data provides identity and texture, never causality.

Why? Because I wanted to show that blockchain infrastructure can be **creative material**—not just financial rails. The Alchemy API gave me a data source that's real, public, and endlessly refreshing. Every block produces new transactions. Every game session can pull fresh inputs.

No tokens required.

---

## What Players Actually Learn

Transaction Pressure isn't trying to teach you Solidity. It's trying to make you *feel* what happens when a system gets overwhelmed. The game is also designed to overwhelm your senses, make you competitive. The more the pressure rises, the more mistakes cost you.

The two pressure axes—volume and hotspot—map directly to real API reliability concepts:

- **Volume (pacing):** Too many requests in a short window triggers rate limiting. In the game, approving tiles too fast spikes your volume meter.
- **Hotspot (sameness):** Correlated traffic to the same endpoint or contract concentrates load. In the game, repeating the same method or cluster spikes your hotspot meter.

The winning strategy? Alternate. Slow down. Use Hold Mode to compare tiles before committing. Manage patterns, not positions.

This is how production systems actually fail—not from one bad request, but from accumulation. The game makes that tangible.

---

## Why This Matters Beyond the Game

The dominant narrative about crypto is financial. Tokens, trading, speculation. That framing has made it hard for people to see what else is possible.

But blockchain infrastructure is just infrastructure. It's APIs and data and reliability engineering. It can power DeFi, sure. It can also power a puzzle game that teaches you about rate limits.

Transaction Pressure is proof that you can build with crypto without building *for* crypto. The blockchain becomes a data source, not a business model. The game has no economic loop. It's just... a game.

I think we need more of this. More projects that use blockchain infrastructure for texture, for play, for creativity. More things that demonstrate capability without demanding speculation.

The best way to change how people think about crypto is to show them something they didn't expect.

---

## The Takeaway

Alchemy's API is easy enough that a product designer can integrate it during a hackathon. The barrier to using blockchain data is lower than people assume.

What you build with it is up to you.

I built a puzzle game about rate limits. No tokens. No wallets. Just blockchain data turned into something playable.

Maybe that's not what you expected from a crypto project. Good.

---

*Margaret Sommers is a product designer at Alchemy, where she works on the crypto engine powering the future of financial services, and making blockchain infrastructure feel invisible. Transaction Pressure was built during the internal Alchemy Hackathon January 2026 over two days.*
