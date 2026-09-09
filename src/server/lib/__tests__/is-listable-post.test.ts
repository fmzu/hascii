import { it, expect } from "bun:test"
import { isListablePost } from "../is-listable-post"

it("公開かつ未削除なら true", () => {
  expect(isListablePost({ isPublic: true, isDeleted: false })).toBe(true)
})

it("非公開なら false", () => {
  expect(isListablePost({ isPublic: false, isDeleted: false })).toBe(false)
})

it("削除済みなら false", () => {
  expect(isListablePost({ isPublic: true, isDeleted: true })).toBe(false)
})

it("非公開かつ削除済みなら false", () => {
  expect(isListablePost({ isPublic: false, isDeleted: true })).toBe(false)
})
