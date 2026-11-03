# 「今日のクイズ」セットアップ手順

ホームページに「今日のクイズ」（/quiz）を追加するための手順です。
Cloudflare Pages の無料プランと、無料のデータベース D1 を使います。追加費用はかかりません。

## 構成

| ファイル | 役割 |
|---|---|
| `quiz.html` | クイズのページ（/quiz または /quiz.html で開けます） |
| `functions/api/quiz/today.js` | 今日の問題を返す |
| `functions/api/quiz/answer.js` | 回答を記録し、ポイントを計算する |
| `functions/api/quiz/ranking.js` | 今月のランキングを返す |
| `functions/_lib/questions.js` | **問題バンク（ここを編集して問題を足します）** |
| `functions/_lib/quiz.js` | 出題スケジュール・ポイント・称号のルール |
| `schema.sql` | データベースのテーブル定義（初回に1回だけ実行） |

## 初回セットアップ（約15分・Cloudflareの画面で行います）

### 1. D1 データベースを作る
1. Cloudflare ダッシュボード → 左メニュー **Storage & Databases** → **D1 SQL Database** → **Create database**
2. 名前は `nursing-alliance-quiz` など → **Create**
3. 作成したデータベースを開き、**Console** タブに `schema.sql` の中身を貼り付けて **Execute**

### 2. Pages プロジェクトにデータベースをつなぐ
1. **Workers & Pages** → `nursing-alliance` のプロジェクト → **Settings** → **Bindings**
2. **Add** → **D1 database** を選ぶ
3. **Variable name** に `DB`（大文字2文字・必ずこの名前）、**D1 database** に 1 で作ったものを選ぶ → **Save**
   - Production と Preview の両方に設定しておくと安心です

### 3. デプロイする
- GitHub と連携している場合：このブランチを `main` にマージすると自動でデプロイされます
- 直接アップロードしている場合：`quiz.html`・`functions/`・`schema.sql` を含むフォルダをアップロードします

### 4. 確認する
- `https://nursing-alliance.pages.dev/quiz` を開き、問題が表示されれば完了です
- 出題開始日より前は「まもなく開始」と表示されます（正常です）
- 「準備中」や「読み込めませんでした」と出る場合は、手順 2 の **Variable name が `DB` になっているか**を確認してください

## 運用

### 問題を足す
`functions/_lib/questions.js` の配列の末尾に、同じ形式で追加します。
`correct` は正解の番号（0 = A、1 = B、2 = C、3 = D）です。追加して保存（デプロイ）すれば、次の出題日から自動で順番に出ます。

### 出題のルール（`functions/_lib/quiz.js` で変更できます）
- 出題日：月・水・金（`QUIZ_DAYS`）
- 開始日：`QUIZ_START_DATE`（`questions.js` 内）
- 正解 10pt、挑戦 3pt、5回連続で +20pt
- 称号：パチ見習い 0〜 ／ パチ修行中 50〜 ／ 循環器チャレンジャー 150〜 ／ 循環器マスター 300〜 ／ パチ師範 600〜
- 月間ランキングは月が変わると自動で切り替わります（累計ポイントと称号は残ります）

### トップページから案内する
`index.html` のナビやボタンに `href="/quiz"` のリンクを1つ足すだけで導線になります。

### データについて
- 参加者は「端末ごとの匿名ID」とニックネームだけで記録され、メールアドレスや氏名は集めません
- D1 のデータは Cloudflare ダッシュボードの **Console** から `SELECT * FROM players;` などで確認できます
