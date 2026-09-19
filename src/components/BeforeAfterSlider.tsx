import { useCallback, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface BeforeAfterSliderProps {
  beforeSrc: string
  afterSrc: string
  beforeAlt?: string
  afterAlt?: string
  className?: string
  interactive?: boolean
  /** Fill the parent's height instead of using a fixed aspect ratio. */
  fill?: boolean
  /** Override the default aspect ratio used when `fill` is false. */
  aspectClassName?: string
  /** Object-fit of the two comparison images. */
  fit?: 'cover' | 'contain'
}

const BeforeAfterSlider = ({
  beforeSrc,
  afterSrc,
  beforeAlt = 'Before — flat design',
  afterAlt = 'After — enhanced design',
  className = '',
  interactive = true,
  fill = false,
  aspectClassName,
  fit = 'cover',
}: BeforeAfterSliderProps) => {
  const fitClass = fit === 'contain' ? 'object-contain' : 'object-cover'
  const containerRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const [pos, setPos] = useState(50)

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const next = ((clientX - rect.left) / rect.width) * 100
    setPos(Math.min(100, Math.max(0, next)))
  }, [])

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true
    containerRef.current?.setPointerCapture(e.pointerId)
    updateFromClientX(e.clientX)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return
    updateFromClientX(e.clientX)
  }

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false
    if (containerRef.current?.hasPointerCapture(e.pointerId)) {
      containerRef.current.releasePointerCapture(e.pointerId)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      setPos((p) => Math.max(0, p - 4))
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      setPos((p) => Math.min(100, p + 4))
    } else if (e.key === 'Home') {
      e.preventDefault()
      setPos(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      setPos(100)
    }
  }

  // keep the hint pill inside the frame when the thumb nears the edges
  const hintPos = Math.min(Math.max(pos, 26), 74)

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border border-[#EAEAEA] bg-white shadow-[0_40px_90px_-30px_rgba(0,0,0,0.08),0_0_0_1px_rgba(239,122,82,0.04)] ${fill ? 'flex flex-col h-full' : ''} ${className}`}>
      {/* browser bar */}
      <div className="flex items-center gap-2 px-4 h-10 border-b border-[#EAEAEA] bg-[#FBFBFA]">
        <span className="w-2.5 h-2.5 rounded-full bg-[#EAEAEA]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#EAEAEA]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#ef7a52]/60" />
        <span className="ml-3 text-[11px] text-[#787774] font-mono truncate">
          unccodestore.com/redesign
        </span>
      </div>

      {/* labels header */}
      <div className="flex items-center justify-between gap-4 px-4 sm:px-5 h-11 border-b border-[#EAEAEA] bg-white">
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#787774] truncate">
          Before <span className="font-semibold text-[#787774]/60 normal-case tracking-normal">(Flat Design)</span>
        </span>
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#e85a2d] truncate text-right">
          After <span className="font-semibold text-[#e85a2d]/70 normal-case tracking-normal">(Enhanced Design)</span>
        </span>
      </div>

      {/* comparison area */}
      <div
        ref={containerRef}
        className={`relative overflow-hidden select-none bg-[#F5F4F0] ${fill ? 'flex-1' : aspectClassName ?? 'aspect-[16/10]'} ${interactive ? 'cursor-ew-resize touch-none' : 'pointer-events-none'}`}
        {...(interactive ? {
          onPointerDown: handlePointerDown,
          onPointerMove: handlePointerMove,
          onPointerUp: endDrag,
          onPointerCancel: endDrag,
        } : {})}>
        {/* after — base layer (right side) */}
        <img
          src={afterSrc}
          alt={afterAlt}
          draggable={false}
          className={`pointer-events-none absolute inset-0 h-full w-full ${fitClass}`}
        />
        {/* before — clipped to the left of the divider */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <img
            src={beforeSrc}
            alt={beforeAlt}
            draggable={false}
            className={`absolute inset-0 h-full w-full ${fitClass}`}
          />
        </div>

        {/* divider line */}
        <div
          aria-hidden
          className="absolute top-0 bottom-0 w-[2px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_0_14px_rgba(0,0,0,0.25)]"
          style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}
        />

        {/* draggable thumb */}
        <button
          type="button"
          role="slider"
          aria-label="Comparison slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          onKeyDown={handleKeyDown}
          className="absolute top-1/2 z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border border-[#EAEAEA] bg-white text-[#2F3437] shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-shadow hover:shadow-[0_10px_28px_rgba(0,0,0,0.24)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ef7a52]/50"
          style={{ left: `${pos}%` }}>
          <ChevronLeft className="w-4 h-4 -mr-1" />
          <ChevronRight className="w-4 h-4 -ml-1" />
        </button>

        {/* hint — directly below the thumb */}
        {interactive && (
          <span
            aria-hidden
            className="pointer-events-none absolute z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/55 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm"
            style={{ left: `${hintPos}%`, top: 'calc(50% + 34px)' }}>
            Drag the slider to compare
          </span>
        )}
      </div>
    </div>
  )
}

export default BeforeAfterSlider
