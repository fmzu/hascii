/**
 * callbackUrl クエリを安全なアプリ内パスへ解決する
 * オープンリダイレクトを防ぐため "/" 始まりの相対パスのみ許可する
 * 不正・未指定のときは fallback を返す
 */
export const resolveCallbackUrl = (
  raw: string | null,
  fallback = "/",
): string => {
  if (raw === null) {
    return fallback
  }
  if (raw.startsWith("/") === false) {
    return fallback
  }
  // プロトコル相対 (//host) やバックスラッシュ細工 (/\host) を拒否
  if (raw.startsWith("//") || raw.startsWith("/\\")) {
    return fallback
  }
  // スキーム付き (http:, javascript: 等) を拒否
  if (raw.includes(":")) {
    return fallback
  }
  return raw
}
