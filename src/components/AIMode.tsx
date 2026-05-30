import { useEffect, useRef, useState } from 'react'
import { askOpenAI } from '../api'
import Loader from './Loader'
import './AIMode.css'

interface AIModeProps {
  onBack: () => void
}

type View = 'input' | 'loading' | 'response'

const MAX_PROMPT_LENGTH = 500

// Tune typewriter feel: target ~6s for very long replies, ~30ms/char for short.
const TYPEWRITER_INTERVAL_MS = 18
const TYPEWRITER_MAX_DURATION_MS = 6000

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="ai-mode__back">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="m15 18-6-6 6-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Back to Search
    </button>
  )
}

function AIMode({ onBack }: AIModeProps) {
  const [view, setView] = useState<View>('input')
  const [prompt, setPrompt] = useState('')
  const [reply, setReply] = useState('')
  const [displayedReply, setDisplayedReply] = useState('')
  const [error, setError] = useState<string | null>(null)

  const intervalRef = useRef<number | null>(null)

  // Typewriter effect: progress `displayedReply` toward `reply` over time.
  // For very long replies, advance multiple characters per tick so the total
  // animation stays under TYPEWRITER_MAX_DURATION_MS. Users who prefer
  // reduced motion get the full reply set up-front in `handleSubmit`, so this
  // effect simply skips animation when `displayedReply` already matches.
  useEffect(() => {
    if (!reply) return
    if (displayedReply.length >= reply.length) return

    const totalTicks = Math.ceil(TYPEWRITER_MAX_DURATION_MS / TYPEWRITER_INTERVAL_MS)
    const charsPerTick = Math.max(1, Math.ceil(reply.length / totalTicks))

    let index = displayedReply.length
    intervalRef.current = window.setInterval(() => {
      index = Math.min(index + charsPerTick, reply.length)
      setDisplayedReply(reply.slice(0, index))
      if (index >= reply.length && intervalRef.current !== null) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }, TYPEWRITER_INTERVAL_MS)

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    // We intentionally only re-run when `reply` changes; `displayedReply` is
    // mutated by this effect itself and including it would cause an immediate
    // restart on every tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reply])

  const handleSubmit = async () => {
    const trimmed = prompt.trim().slice(0, MAX_PROMPT_LENGTH)
    if (!trimmed) return

    setView('loading')
    setError(null)
    try {
      const result = await askOpenAI(trimmed)
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

      setReply(result.reply)
      setDisplayedReply(prefersReducedMotion ? result.reply : '')
      setView('response')
    } catch (err) {
      console.error('askOpenAI failed:', err)
      setError('Something went wrong. Please try again.')
      setView('input')
    }
  }

  const handleAskAnother = () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setPrompt('')
    setReply('')
    setDisplayedReply('')
    setError(null)
    setView('input')
  }

  // Tap-to-complete: clicking the response card while typing finishes the
  // animation immediately.
  const handleSkipTypewriter = () => {
    if (!reply || displayedReply.length === reply.length) return
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setDisplayedReply(reply)
  }

  const isTyping = view === 'response' && displayedReply.length < reply.length
  const canSubmit = prompt.trim().length > 0 && view !== 'loading'

  return (
    <div className="ai-mode">
      <BackButton onClick={onBack} />

      <header className="ai-mode__header">
        <h1 className="ai-mode__title">AI Mode</h1>
        <p className="ai-mode__subtitle">
          Ask questions based on our Music League history
        </p>
      </header>

      {view === 'input' && (
        <>
          <div className="ai-mode__field">
            <textarea
              className="ai-mode__textarea"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.slice(0, MAX_PROMPT_LENGTH))}
              maxLength={MAX_PROMPT_LENGTH}
              rows={5}
              autoFocus
            />
            <div className="ai-mode__counter">
              {prompt.length} / {MAX_PROMPT_LENGTH}
            </div>
          </div>

          {error && <div className="ai-mode__error">{error}</div>}

          <button
            type="button"
            className="ai-mode__submit"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            Ask
          </button>
        </>
      )}

      {view === 'loading' && <Loader label="Thinking" />}

      {view === 'response' && (
        <>
          <div
            className="ai-mode__response"
            onClick={handleSkipTypewriter}
            role={isTyping ? 'button' : undefined}
            tabIndex={isTyping ? 0 : undefined}
            title={isTyping ? 'Click to skip animation' : undefined}
          >
            {displayedReply}
            {isTyping && <span className="ai-mode__caret" aria-hidden="true" />}
          </div>

          {!isTyping && (
            <div className="ai-mode__actions">
              <button
                type="button"
                className="ai-mode__submit"
                onClick={handleAskAnother}
              >
                Ask a new question
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AIMode
