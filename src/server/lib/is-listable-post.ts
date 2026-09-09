type ListablePostInput = {
  isPublic: boolean
  isDeleted: boolean
}

/**
 * 一覧に表示してよい投稿かどうかを判定する
 * 公開かつ未削除のときだけ true
 */
export const isListablePost = (post: ListablePostInput): boolean => {
  return post.isPublic === true && post.isDeleted === false
}
