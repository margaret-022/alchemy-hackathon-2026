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

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return jsonResponse(res, 405, { error: "Method not allowed." });
  }

  const env = getRequiredEnv(res);
  if (!env) return;

  const limit = Number.parseInt(req.query.limit, 10) || 10;
  const safeLimit = Math.min(Math.max(limit, 1), 20);
  const query =
    "select=display_name,time_seconds,max_pressure_ratio,approvals,created_at" +
    `&order=time_seconds.asc,max_pressure_ratio.asc,created_at.asc&limit=${safeLimit}`;

  try {
    const response = await fetch(`${env.url}/rest/v1/leaderboard?${query}`, {
      headers: {
        apikey: env.key,
        Authorization: `Bearer ${env.key}`,
      },
    });

    if (!response.ok) {
      return jsonResponse(res, 502, { error: "Supabase fetch failed." });
    }

    const data = await response.json();
    res.setHeader("Cache-Control", "s-maxage=5, stale-while-revalidate=15");
    return jsonResponse(res, 200, data);
  } catch (error) {
    return jsonResponse(res, 502, { error: "Leaderboard fetch failed." });
  }
};
