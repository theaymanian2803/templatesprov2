import { cn } from '@/lib/utils'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronDown, ChevronUp, ExternalLink, Loader2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface FullScreenPreviewProps {
  url: string
  title: string
  open: boolean
  onClose: () => void
}

/*
  Lovable-style full-screen preview. Covers the entire window edge-to-edge with
  the template's demo site in an iframe. Minimal chrome: a single grouped,
  vertical dock running parallel to the viewport height on the left edge,
  holding the "open in new tab" and close actions stacked together, plus a hide
  control that collapses the dock to a small restore pill so the embedded site
  can be viewed unobstructed. Closes via ×, Escape, or a backdrop click; body
  scroll is locked while open. The iframe stays sandboxed (no top-navigation)
  so the embedded site can never take the parent page away.
*/

const FullScreenPreview = ({ url, title, open, onClose }: FullScreenPreviewProps) => {
  const [loaded, setLoaded] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const reduceMotion = useReducedMotion()
  const loadTimer = useRef<number | undefined>(undefined)

  // Escape to close + lock body scroll while open
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = original
    }
  }, [open, onClose])

  // reset the loading state each time the modal opens, with a safety timeout
  useEffect(() => {
    if (!open) return
    setLoaded(false)
    loadTimer.current = window.setTimeout(() => setLoaded(true), 8000)
    return () => {
      if (loadTimer.current !== undefined) clearTimeout(loadTimer.current)
    }
  }, [open, url])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] bg-white"
          role="dialog"
          aria-modal="true"
          aria-label={`Aperçu en plein écran de ${title}`}
          onClick={onClose}>
          {/* inner layer stops the backdrop click from firing while the site is interactive */}
          <div className="absolute inset-0" onClick={(e) => e.stopPropagation()}>
            {!loaded && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white">
                <Loader2 className="h-8 w-8 animate-spin text-[#e85a2d]" />
              </div>
            )}
            <motion.iframe
              initial={{ scale: 0.985, opacity: 0.4 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              src={url}
              title={`${title} — Aperçu en plein écran`}
              className="h-full w-full border-none bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms"
              onLoad={() => setLoaded(true)}
            />
          </div>

          {/* control dock — vertical capsule, running parallel to the viewport height */}
          <motion.div
            className="absolute top-1/2 z-20"
            style={{ left: 'calc(env(safe-area-inset-left, 0px) + 1rem)' }}
            initial={{ opacity: 0, x: -12, y: '-50%' }}
            animate={{ opacity: 1, x: 0, y: '-50%' }}
            transition={{ delay: 0.15, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}>
            {/* discovery indicator — breathing orange glow that draws the eye to the controls */}
            {controlsVisible && (
              <motion.span
                data-testid="dock-ping"
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-full border-2 border-[#e85a2d]/60 shadow-[0_0_22px_6px_rgba(232,90,45,0.25)]"
                initial={reduceMotion ? { opacity: 0.4, scale: 1 } : { opacity: 0.65, scale: 1 }}
                animate={
                  reduceMotion
                    ? { opacity: 0.4, scale: 1 }
                    : { opacity: [0.65, 0.15], scale: [1, 1.26] }
                }
                transition={
                  reduceMotion
                    ? undefined
                    : {
                        duration: 2.2,
                        delay: 0.4,
                        repeat: Infinity,
                        repeatType: 'mirror',
                        ease: 'easeInOut',
                      }
                }
              />
            )}
            <div
              role="group"
              aria-label="Contrôles de l'aperçu"
              aria-hidden={!controlsVisible}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-full border border-[#EAEAEA] bg-white/85 px-1.5 py-1.5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.12)] backdrop-blur-md transition-all duration-200 ease-out',
                controlsVisible
                  ? 'translate-y-0 opacity-100'
                  : 'pointer-events-none invisible -translate-x-1.5 opacity-0',
              )}>
              {/* open in new tab — stacked with close */}
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ouvrir dans un nouvel onglet"
                title="Ouvrir dans un nouvel onglet"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#111111] transition-colors hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e85a2d]/50">
                <ExternalLink className="h-4 w-4" />
              </a>

              <span className="my-1 h-px w-4 bg-[#EAEAEA]" aria-hidden="true" />

              {/* close button */}
              <button
                type="button"
                autoFocus
                onClick={(e) => {
                  e.stopPropagation()
                  onClose()
                }}
                aria-label="Fermer l'aperçu"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#111111] transition-colors hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e85a2d]/50">
                <X className="h-4 w-4" />
              </button>

              <span className="my-1 h-px w-4 bg-[#EAEAEA]" aria-hidden="true" />

              {/* hide controls */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setControlsVisible(false)
                }}
                aria-label="Masquer les contrôles"
                title="Masquer les contrôles"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#787774] transition-colors hover:bg-black/5 hover:text-[#111111] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e85a2d]/50">
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            {/* restore pill — overlays the dock's spot when the dock is hidden */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setControlsVisible(true)
              }}
              aria-label="Afficher les contrôles"
              title="Afficher les contrôles"
              aria-hidden={controlsVisible}
              className={cn(
                'absolute left-1/2 top-1/2 inline-flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#EAEAEA] bg-white/85 text-[#787774] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.12)] backdrop-blur-md transition-all duration-200 ease-out hover:bg-white hover:text-[#111111] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e85a2d]/50',
                controlsVisible
                  ? 'pointer-events-none invisible scale-75 opacity-0'
                  : 'scale-100 opacity-100',
              )}>
              <ChevronUp className="h-4 w-4" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default FullScreenPreview