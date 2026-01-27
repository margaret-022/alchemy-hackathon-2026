const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function jsonResponse(res, status, payload) {
  res.status(status).json(payload);
}

function getRequiredEnv(res) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    jsonResponse(res, 500, { error: "Supabase env not configured." });
    return null;
  }
  return {
    url: SUPABASE_URL,
    key: SUPABASE_SERVICE_ROLE_KEY,
  };
}

function normalizeName(name) {
  const trimmed = String(name || "").trim().replace(/\s+/g, " ");
  return trimmed.slice(0, 20);
}

function isNumber(value) {
  return Number.isFinite(value);
}

function parseBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch (error) {
      return {};
    }
  }
  return {};
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return jsonResponse(res, 405, { error: "Method not allowed." });
  }

  const env = getRequiredEnv(res);
  if (!env) return;

  const body = parseBody(req);
  const displayName = normalizeName(body.displayName);
  const approvals = Number(body.approvals);
  const timeSeconds = Number(body.timeSeconds);
  const maxPressureRatio = Number(body.maxPressureRatio);
  const timeLimitSeconds = Number(body.timeLimitSeconds);

  if (!displayName) {
    return jsonResponse(res, 400, { error: "Display name required." });
  }
  if (!isNumber(approvals) || approvals < 1 || approvals > 100) {
    return jsonResponse(res, 400, { error: "Invalid approvals." });
  }
  if (!isNumber(timeSeconds) || timeSeconds < 0 || timeSeconds > 600) {
    return jsonResponse(res, 400, { error: "Invalid time." });
  }
  if (!isNumber(maxPressureRatio) || maxPressureRatio < 0 || maxPressureRatio > 2) {
    return jsonResponse(res, 400, { error: "Invalid pressure." });
  }
  if (
    isNumber(timeLimitSeconds) &&
    (timeLimitSeconds < 30 || timeLimitSeconds > 1200)
  ) {
    return jsonResponse(res, 400, { error: "Invalid time limit." });
  }

  const payload = {
    display_name: displayName,
    approvals,
    time_seconds: Math.round(timeSeconds),
    max_pressure_ratio: Number(maxPressureRatio.toFixed(3)),
  };

  try {
    const response = await fetch(`${env.url}/rest/v1/leaderboard`, {
      method: "POST",
      headers: {
        apikey: env.key,
        Authorization: `Bearer ${env.key}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify([payload]),
    });

    if (!response.ok) {
      return jsonResponse(res, 502, { error: "Supabase insert failed." });
    }

    const data = await response.json();
    return jsonResponse(res, 200, { ok: true, entry: data?.[0] || payload });
  } catch (error) {
    return jsonResponse(res, 502, { error: "Submit failed." });
  }
};
