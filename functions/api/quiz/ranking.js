// GET /api/quiz/ranking?token=...  今月のランキング（上位20名）と自分の順位
import { isValidToken, titleFor, json, jstToday, monthKey } from "../../_lib/quiz.js";

export async function onRequestGet({ request, env }) {
  if (!env.DB) return json({ error: "db_not_configured" }, 500);
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  const month = monthKey(jstToday());

  const top = await env.DB.prepare(
    "SELECT a.token, p.nickname, p.total_points, SUM(a.points + a.bonus) AS month_points, COUNT(*) AS answered " +
    "FROM answers a JOIN players p ON p.token = a.token WHERE a.month = ? " +
    "GROUP BY a.token ORDER BY month_points DESC, answered DESC, p.updated_at ASC LIMIT 20"
  ).bind(month).all();

  const ranking = (top.results || []).map((r, i) => ({
    rank: i + 1, nickname: r.nickname, monthPoints: r.month_points, answered: r.answered,
    title: titleFor(r.total_points), me: isValidToken(token) && r.token === token,
  }));

  const stats = await env.DB.prepare("SELECT COUNT(DISTINCT token) AS players FROM answers WHERE month = ?").bind(month).first();
  const out = { month, players: stats ? stats.players : 0, ranking };

  if (isValidToken(token)) {
    const me = await env.DB.prepare("SELECT SUM(points + bonus) AS month_points FROM answers WHERE month = ? AND token = ?").bind(month, token).first();
    if (me && me.month_points != null) {
      const above = await env.DB.prepare(
        "SELECT COUNT(*) AS n FROM (SELECT token, SUM(points + bonus) AS mp FROM answers WHERE month = ? GROUP BY token) WHERE mp > ?"
      ).bind(month, me.month_points).first();
      out.me = { rank: (above ? above.n : 0) + 1, monthPoints: me.month_points };
    }
  }
  return json(out);
}
