// GET /api/quiz/today?token=...  今日の問題と、その人の回答状況
import { todaysQuestion, publicQuestion, isValidToken, titleFor, nextTitle, json } from "../../_lib/quiz.js";

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  const t = todaysQuestion();
  const out = { status: t.status, openedOn: t.openedOn, nextOn: t.nextOn, number: t.number ?? null, total: t.total ?? null };

  if (t.status === "open") out.question = publicQuestion(t.question);

  if (env.DB && isValidToken(token)) {
    const player = await env.DB.prepare("SELECT nickname, total_points, streak FROM players WHERE token = ?").bind(token).first();
    if (player) {
      out.player = { nickname: player.nickname, total: player.total_points, streak: player.streak, title: titleFor(player.total_points), next: nextTitle(player.total_points) };
      if (t.status === "open") {
        const a = await env.DB.prepare("SELECT choice, correct, points FROM answers WHERE token = ? AND qid = ?").bind(token, t.question.id).first();
        if (a) out.answered = { choice: a.choice, correct: !!a.correct, points: a.points, correctChoice: t.question.correct, note: t.question.note };
      }
    }
  }
  return json(out);
}
