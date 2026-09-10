import { useEffect, useRef } from "react"

type Props = {
  onDraw(ctx: CanvasRenderingContext2D): void
  onTouchStart(canvas: HTMLCanvasElement, w: number, h: number): void
  onTouchEnd(canvas: HTMLCanvasElement, w: number, h: number): void
  onTouchMove(canvas: HTMLCanvasElement, x: number, y: number): void
}

export function ReactCanvas(props: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  const isActive = useRef(false)

  useEffect(() => {
    const listener = () => {
      if (ref.current === null) return
      const ctx = ref.current.getContext("2d")
      if (ctx === null) return
      ref.current.width = ref.current.clientWidth
      ref.current.height = ref.current.clientHeight
      // 奇数なら偶数にしてピクセルがズレないようにする
      if (ref.current.width % 2 === 1) {
        ref.current.width = (ref.current.clientWidth - 1) & ~1
      }
      if (ref.current.height % 2 === 1) {
        ref.current.height = (ref.current.clientHeight - 1) & ~1
      }
      props.onDraw(ctx)
    }
    listener()
    window.addEventListener("resize", listener)
    return () => {
      window.removeEventListener("resize", listener)
    }
  }, [])

  useEffect(() => {
    if (ref.current === null) return
    const ctx = ref.current.getContext("2d")
    if (ctx === null) return
    ctx.imageSmoothingEnabled = false
    ctx.clearRect(0, 0, ref.current.width, ref.current.height)
    props.onDraw(ctx)
  }, [props.onDraw])

  const toPositionFromMouseEvent = (e: React.MouseEvent) => {
    if (ref.current === null) return null
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    if (x < 0 || y < 0) return null
    if (rect.width < x || rect.height < y) return null
    return { x: x, y: y }
  }

  const toPositionFromTouchEvent = (e: React.TouchEvent) => {
    if (ref.current === null) return null
    const rect = ref.current.getBoundingClientRect()
    const x = e.touches[0].clientX - rect.left
    const y = e.touches[0].clientY - rect.top
    if (x < 0 || y < 0) return null
    if (rect.width < x || rect.height < y) return null
    return { x: x, y: y }
  }

  return (
    <canvas
      ref={ref}
      className={"touch-none w-full h-full"}
      style={{ imageRendering: "pixelated" }}
      onMouseDown={(e) => {
        if (ref.current === null) return
        isActive.current = true
        const position = toPositionFromMouseEvent(e)
        if (position === null) return
        props.onTouchStart(ref.current, position.x, position.y)
      }}
      onMouseMove={(e) => {
        if (ref.current === null) return
        if (isActive.current === false) return
        const position = toPositionFromMouseEvent(e)
        if (position === null) return
        props.onTouchMove(ref.current, position.x, position.y)
      }}
      onMouseUp={(e) => {
        if (ref.current === null) return
        isActive.current = false
        const position = toPositionFromMouseEvent(e)
        if (position === null) return
        props.onTouchMove(ref.current, position.x, position.y)
      }}
      onMouseLeave={(e) => {
        if (ref.current === null) return
        isActive.current = false
        const position = toPositionFromMouseEvent(e)
        if (position === null) return
        props.onTouchStart(ref.current, position.x, position.y)
      }}
      onTouchStart={(e) => {
        if (ref.current === null) return
        isActive.current = true
        const position = toPositionFromTouchEvent(e)
        if (position === null) return
        props.onTouchStart(ref.current, position.x, position.y)
      }}
      onTouchMove={(e) => {
        if (ref.current === null) return
        if (isActive.current === false) return
        const position = toPositionFromTouchEvent(e)
        if (position === null) return
        props.onTouchMove(ref.current, position.x, position.y)
      }}
      onTouchEnd={(e) => {
        if (ref.current === null) return
        isActive.current = false
        const position = toPositionFromTouchEvent(e)
        if (position === null) return
        props.onTouchEnd(ref.current, position.x, position.y)
      }}
      onTouchCancel={(e) => {
        if (ref.current === null) return
        isActive.current = false
        const position = toPositionFromTouchEvent(e)
        if (position === null) return
        props.onTouchEnd(ref.current, position.x, position.y)
      }}
      // onMouseDown={props.onMouseDown}
      // onMouseUp={props.onMouseUp}
      // onMouseLeave={props.onMouseLeave}
      // onMouseMove={(event) => {
      //   // if (props.onChange === undefined) return
      //   // const gridSide = props.grid.length
      //   // const rect = event.currentTarget.getBoundingClientRect()
      //   // const scaleX = event.currentTarget.width / rect.width
      //   // const scaleY = event.currentTarget.height / rect.height
      //   // const x = (event.clientX - rect.left) * scaleX
      //   // const y = (event.clientY - rect.top) * scaleY
      //   // const colIndex = Math.floor(x / (props.width / gridSide))
      //   // const rowIndex = Math.floor(y / (props.width / gridSide))
      //   // if (
      //   //   colIndex < 0 ||
      //   //   colIndex >= gridSide ||
      //   //   rowIndex < 0 ||
      //   //   rowIndex >= gridSide
      //   // )
      //   //   return
      //   // props.onChange(rowIndex, colIndex, x, y)
      // }}
    />
  )
}
