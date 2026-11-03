// POST /api/quiz/answer  { token, nickname, qid, choice }
import {
  todaysQuestion, isValidToken, cleanNickname, titleFor, nextTitle, json, jstToday, ymd, monthKey,
  POINTS_CORRECT, POINTS_WRONG, STREAK_EVERY, STREAK_BONUS,
} from "../../_lib/quiz.js";

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ error: "db_not_configured", message: "データベースが設定されていません。" }, 500);
  let body;
  try { body = await request.json(); } catch { return json({ error: "bad_json" }, 400); }

  const token = body.token, qid = Number(body.qid), choice = Number(body.choice);
  const nickname = cleanNickname(body.nickname) || "名無しのオペナース";
  if (!isValidToken(token)) return json({ error: "bad_token" }, 400);

  const t = todaysQuestion();
  if (t.status !== "open" || t.question.id !== qid) return json({ error: "not_open", message: "この問題の受付は終了しています。" }, 409);
  if (!Number.isInteger(choice) || choice < 0 || choice >= t.question.opts.length) return json({ error: "bad_choice" }, 400);

  // 既に回答済みなら、その結果を返す（二重加点しない）
  const prev = await env.DB.prepare("SELECT choice, correct, points FROM answers WHERE token = ? AND qid = ?").bind(token, qid).first();
  if (prev) {
    const p = await env.DB.prepare("SELECT total_points, streak FROM players WHERE token = ?").bind(token).first();
    return json(result(t, prev.choice, !!prev.correct, prev.points, 0, p));
  }

  const correct = choice === t.question.correct;
  let points = correct ? POINTS_CORRECT : POINTS_WRONG;

  // 連続回答：前回の回答が「ひとつ前の問題」なら継続、そうでなければ1から
  const player = await env.DB.prepare("SELECT total_points, streak, last_qid FROM players WHERE token = ?").bind(token).first();
  const streak = player && player.last_qid === qid - 1 ? player.streak + 1 : 1;
  let bonus = 0;
  if (streak > 0 && streak % STREAK_EVERY === 0) bonus = STREAK_BONUS;
  const total = (player ? player.total_points : 0) + points + bonus;

  const today = jstToday();
  const now = new Date().toISOString();
  await env.DB.batch([
    env.DB.prepare(
      "INSERT INTO players (token, nickname, total_points, streak, last_qid, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?) " +
      "ON CONFLICT(token) DO UPDATE SET nickname = excluded.nickname, total_points = excluded.total_points, streak = excluded.streak, last_qid = excluded.last_qid, updated_at = excluded.updated_at"
    ).bind(token, nickname, total, streak, qid, now, now),
    env.DB.prepare(
      "INSERT INTO answers (token, qid, choice, correct, points, bonus, month, day, answered_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(token, qid, choice, correct ? 1 : 0, points, bonus, monthKey(today), ymd(today), now),
  ]);

  return json(result(t, choice, correct, points, bonus, { total_points: total, streak }));
}

function result(t, choice, correct, points, bonus, p) {
  const total = p ? p.total_points : 0;
  return {
    ok: true, correct, choice, correctChoice: t.question.correct, note: t.question.note,
    points, bonus, total, streak: p ? p.streak : 0, title: titleFor(total), next: nextTitle(total),
  };
}
