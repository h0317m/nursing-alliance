-- 今日のクイズ 用テーブル（Cloudflare D1）
-- 初回セットアップ時に一度だけ実行してください。

CREATE TABLE IF NOT EXISTS players (
  token        TEXT PRIMARY KEY,        -- 端末ごとの匿名ID（ブラウザが生成）
  nickname     TEXT NOT NULL,
  total_points INTEGER NOT NULL DEFAULT 0,
  streak       INTEGER NOT NULL DEFAULT 0,  -- 連続回答数
  last_qid     INTEGER,                      -- 最後に回答した問題番号
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS answers (
  token       TEXT NOT NULL,
  qid         INTEGER NOT NULL,
  choice      INTEGER NOT NULL,
  correct     INTEGER NOT NULL,   -- 1 = 正解
  points      INTEGER NOT NULL,
  bonus       INTEGER NOT NULL DEFAULT 0,
  month       TEXT NOT NULL,      -- 'YYYY-MM'（月間ランキング用）
  day         TEXT NOT NULL,      -- 'YYYY-MM-DD'
  answered_at TEXT NOT NULL,
  PRIMARY KEY (token, qid)
);

CREATE INDEX IF NOT EXISTS idx_answers_month ON answers (month);
