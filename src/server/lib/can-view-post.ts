type ViewablePostInput = {
  isPublic: boolean
}

/**
 * 投稿の詳細を閲覧してよいかどうかを判定する
 * 公開投稿は誰でも、非公開投稿は所有者だけ閲覧できる
 */
export const canViewPost = (
  post: ViewablePostInput,
  isMine: boolean,
): boolean => {
  return post.isPublic === true || isMine === true
}
