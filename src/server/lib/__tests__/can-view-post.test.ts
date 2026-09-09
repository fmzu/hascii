import { it, expect } from "bun:test"
import { canViewPost } from "../can-view-post"

it("公開投稿は他人でも閲覧できる", () => {
  expect(canViewPost({ isPublic: true }, false)).toBe(true)
})

it("公開投稿は所有者でも閲覧できる", () => {
  expect(canViewPost({ isPublic: true }, true)).toBe(true)
})

it("非公開投稿は所有者だけ閲覧できる", () => {
  expect(canViewPost({ isPublic: false }, true)).toBe(true)
})

it("非公開投稿は他人からは閲覧できない", () => {
  expect(canViewPost({ isPublic: false }, false)).toBe(false)
})
