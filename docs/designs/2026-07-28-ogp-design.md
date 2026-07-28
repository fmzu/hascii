# hascii OGP対応 設計

## 目的

hasciiのURLをSNSやチャットに貼ったとき、ドット絵がカード画像として表示されるようにする。現状はリンクが素っ気なく表示されるだけで、相手に「見て」と送っても絵が見えない。

## 対象ルート

| ルート | 用途 |
|---|---|
| `/dot/:dot` | エディタ上のドット絵（未投稿でもURL共有可能） |
| `/posts/:post` | 投稿済み作品の詳細ページ |

## OGP画像生成

### エンドポイント

`GET /ogp/:dots` — APIに新規追加。ドット文字列を受け取りPNG画像を返す。

### 生成フロー

1. ドット文字列をパース（ハイフン区切りの色インデックス列 → グリッド配列）
2. グリッドからSVGを生成（色付き `<rect>` を並べる）
3. resvg-wasmでSVG → PNGに変換
4. PNGをレスポンスとして返す（`Content-Type: image/png`）

### 画像仕様

- **サイズ**: 1200x630（OGP推奨サイズ）
- **背景**: 白 (`#FFFFFF`)
- **ドット絵の配置**: 中央
- **スケール**: グリッドサイズから630pxの高さに収まる最大の整数倍を算出し、余白を均等配分
  - 例: 8x8グリッド → 1ドット=78px（78×8=624px、上下余白3px）→ 横は(1200-624)/2=288pxの左右余白

### キャッシュ

- Cloudflare Cache APIを使用（追加バインディング不要）
- 同一ドット文字列は同一画像を返すため、URLベースのキャッシュと相性が良い
- Cache-Controlヘッダで長めのTTLを設定（ドット絵は不変）

## メタタグ

React Routerの `meta` 関数で各ルートにOGPタグを出力する。

### `/dot/:dot`（エディタ）

```html
<meta property="og:title" content="HASCII" />
<meta property="og:description" content="ドット絵エディタ" />
<meta property="og:image" content="https://{API_HOST}/ogp/{dots}" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
```

### `/posts/:post`（投稿詳細）

```html
<meta property="og:title" content="{投稿タイトル}" />
<meta property="og:description" content="{投稿の説明文 or 'HASCII'}" />
<meta property="og:image" content="https://{API_HOST}/ogp/{dots}" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
```

## 技術構成

- **画像生成**: resvg-wasm（SVG → PNG変換）
- **API**: Hono on Cloudflare Workers（既存APIに `/ogp/:dots` エンドポイントを追加）
- **メタタグ**: React Router v7の `meta` 関数（UIルート側で export）
- **キャッシュ**: Cloudflare Cache API

## 依存パッケージ追加

- `@resvg/resvg-wasm` — api/ に追加

## 決定ログ

### SVG→PNG方式を採用（PNG直接生成ではなく）

PNG直接生成（依存ゼロ）も検討したが、SVG→PNG方式を選択した。

- SVGは `<rect fill="#FF0000"/>` のように「何を描いているか」がコードから直接読める。PNG直接生成だとピクセルバッファ操作になり意図が読みにくい
- 将来の見た目変更（背景色、余白、角丸等）がSVGのプロパティ変更だけで済む
- resvg-wasmのバンドルサイズ増（約2MB）はCloudflare Workersの上限（圧縮後10MB）内で実害なし

### 1200x630の横長白背景に中央配置（正方形出力ではなく）

ドット絵は正方形だが、OGP画像は1200x630の横長で出力する。

- 正方形出力だとSNSのカード表示で左右が切れるリスクがある
- 白背景に中央配置することで、どのSNSでもカードとして安定して表示される

### ドット絵のみ（装飾・テキストなし）

OGP画像にはドット絵だけを表示し、アプリ名やタイトルは含めない。

- 絵が主役。シンプルな方が可愛い
- タイトルは `og:title` タグで表示されるため画像に重ねる必要がない
- テキスト描画にはフォントの埋め込みが必要で実装コストが上がる

### Cloudflare Cache API（R2/KV追加ではなく）

画像キャッシュにはCloudflare Cache APIを使用し、R2やKVは追加しない。

- 同一dotsは同一画像なのでURLベースキャッシュと自然に噛み合う
- 追加バインディング不要で設定がシンプル
- キャッシュミス時の再生成コストも低い（グリッドの矩形描画のみ）
