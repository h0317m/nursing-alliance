// 今日のクイズ 共通ロジック（出題スケジュール・ポイント・称号）
import { QUESTIONS, QUIZ_START_DATE } from "./questions.js";

export const POINTS_CORRECT = 10;
export const POINTS_WRONG = 3;
export const STREAK_EVERY = 5;   // 連続回答がこの回数ごとに
export const STREAK_BONUS = 20;  // ボーナス
export const QUIZ_DAYS = [1, 3, 5]; // 月・水・金（0=日）

export const TITLES = [
  { min: 600, name: "パチ師範" },
  { min: 300, name: "循環器マスター" },
  { min: 150, name: "循環器チャレンジャー" },
  { min: 50, name: "パチ修行中" },
  { min: 0, name: "パチ見習い" },
];

export function titleFor(points) {
  for (const t of TITLES) if (points >= t.min) return t.name;
  return TITLES[TITLES.length - 1].name;
}
export function nextTitle(points) {
  const higher = [...TITLES].reverse().find((t) => t.min > points);
  return higher ? { name: higher.name, remaining: higher.min - points } : null;
}

// JST の日付オブジェクト（Date は UTC で保持し、JST の年月日として扱う）
export function jstToday(now = new Date()) {
  const t = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate()));
}
export function ymd(d) {
  return d.toISOString().slice(0, 10);
}
export function monthKey(d) {
  return d.toISOString().slice(0, 7);
}

// 開始日から今日までの出題日（月水金）を数え、今日の問題番号を返す
// 戻り値: { index: 0始まりの問題番号 | -1, openedOn: その問題の出題日, nextOn: 次の出題日 }
export function scheduleFor(now = new Date()) {
  const today = jstToday(now);
  const start = new Date(QUIZ_START_DATE + "T00:00:00Z");
  if (today < start) return { index: -1, openedOn: null, nextOn: ymd(start) };
  let count = 0, openedOn = null;
  for (let d = new Date(start); d <= today; d.setUTCDate(d.getUTCDate() + 1)) {
    if (QUIZ_DAYS.includes(d.getUTCDay())) { count++; openedOn = ymd(d); }
  }
  let next = new Date(today);
  do { next.setUTCDate(next.getUTCDate() + 1); } while (!QUIZ_DAYS.includes(next.getUTCDay()));
  return { index: count - 1, openedOn, nextOn: ymd(next) };
}

export function todaysQuestion(now = new Date()) {
  const s = scheduleFor(now);
  if (s.index < 0) return { status: "before_start", ...s };
  if (s.index >= QUESTIONS.length) return { status: "exhausted", ...s, total: QUESTIONS.length };
  return { status: "open", ...s, question: QUESTIONS[s.index], number: s.index + 1, total: QUESTIONS.length };
}

export function publicQuestion(q) {
  return { id: q.id, text: q.text, opts: q.opts };
}

export function isValidToken(t) {
  return typeof t === "string" && /^[A-Za-z0-9_-]{16,64}$/.test(t);
}
export function cleanNickname(n) {
  if (typeof n !== "string") return "";
  return n.replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 16);
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
