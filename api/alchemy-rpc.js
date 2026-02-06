const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const ALCHEMY_NETWORK = process.env.ALCHEMY_NETWORK || "eth-sepolia";

function jsonResponse(res, status, payload) {
  res.status(status).json(payload);
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return jsonResponse(res, 405, { error: "Method not allowed." });
  }

  if (!ALCHEMY_API_KEY) {
    return jsonResponse(res, 503, {
      error: "Alchemy API key not configured. Set ALCHEMY_API_KEY in .env or deployment env.",
    });
  }

  const url = `https://${ALCHEMY_NETWORK}.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
  const body = req.body;

  if (!body || typeof body !== "object") {
    return jsonResponse(res, 400, { error: "JSON-RPC body required." });
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    res.status(response.ok ? 200 : 502).json(data);
  } catch (err) {
    jsonResponse(res, 502, { error: "Alchemy request failed." });
  }
};
