import { useEffect, useRef, useState } from 'react'
import {
  searchTracks,
  type SelectedTrack,
  type SpotifyTrack,
} from '../api'
import './Search.css'

interface SearchProps {
  spotifyToken: string
  onSelectTrack: (track: SelectedTrack) => void
  onEnterAiMode: () => void
}

function Search({ spotifyToken, onSelectTrack, onEnterAiMode }: SearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SpotifyTrack[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)

  // Debounced search: wait 250ms after the user stops typing before hitting
  // Spotify, and abort any in-flight request when the query changes so an
  // older response can't overwrite a newer one.
  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) return

    const controller = new AbortController()
    const timeout = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const tracks = await searchTracks(
          trimmed,
          spotifyToken,
          controller.signal,
        )
        setResults(tracks)
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        setError((err as Error).message)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 250)

    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [query, spotifyToken])

  // Close the dropdown when the user clicks/taps anywhere outside the
  // component or presses Escape. Using mousedown (rather than click) means
  // clicks that originate inside the dropdown still register on their target.
  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleSelect = (track: SpotifyTrack) => {
    setIsOpen(false)
    onSelectTrack({
      uri: track.uri,
      name: track.name,
      artists: track.artists.map((a) => a.name).join(', '),
      albumName: track.album.name,
      albumImageUrl: track.album.images[0]?.url ?? null,
    })
  }

  const showDropdown = isOpen && query.trim().length > 0

  return (
    <div ref={containerRef} className="search">
      <header className="search__header">
        <div className="search__equalizer" aria-hidden="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="search__bar" />
          ))}
        </div>
        <div className="search__heading">
          <h1 className="search__title">Song Checker</h1>
          <p className="search__subtitle">Check for duplicate songs</p>
        </div>
      </header>

      <div className="search__input-wrap">
        <div className="search__field">
        <svg
          className="search__icon"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle
            cx="11"
            cy="11"
            r="7"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="m20 20-3.5-3.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        {/*
         * `type="search"` plus a non-credential `name` are the strongest hints
         * we can give iOS Chrome/Safari that this isn't a login or payment
         * field, which suppresses the Passwords / Credit Cards autofill
         * toolbar that otherwise eats vertical space above the keyboard.
         * `autoComplete`/`autoCorrect`/`autoCapitalize` reinforce that and
         * stop song titles from being "corrected" mid-typing.
         */}
        <input
          className="search__input"
          type="search"
          name="song-search"
          value={query}
          onChange={(e) => {
            const value = e.target.value
            setQuery(value)
            setIsOpen(true)
            if (!value.trim()) {
              setResults([])
              setError(null)
              setLoading(false)
            }
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search for a song..."
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          inputMode="search"
          enterKeyHint="search"
        />
        </div>

        {showDropdown && (
          <div className="search__dropdown" role="listbox">
            {loading && <div className="search__status">Searching…</div>}
            {error && (
              <div className="search__status search__status--error">
                {error}
              </div>
            )}
            {!loading && !error && results.length === 0 && (
              <div className="search__status">No results</div>
            )}
            {!loading && !error && results.length > 0 && (
              <ul className="search__option-list">
                {results.map((track) => {
                  const cover = track.album.images[0]?.url
                  return (
                    <li key={track.id}>
                      <button
                        type="button"
                        className="search__option"
                        onClick={() => handleSelect(track)}
                        role="option"
                      >
                        {cover ? (
                          <img
                            src={cover}
                            alt=""
                            width={44}
                            height={44}
                            className="search__cover"
                          />
                        ) : (
                          <div
                            className="search__cover-placeholder"
                            aria-hidden="true"
                          >
                            ♪
                          </div>
                        )}
                        <div className="search__meta">
                          <div className="search__name">{track.name}</div>
                          <div className="search__artists">
                            {track.artists.map((a) => a.name).join(', ')}
                          </div>
                          <div className="search__album">{track.album.name}</div>
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        className="search__ai-mode"
        onClick={onEnterAiMode}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M11 2.5 13 9l6.5 2L13 13l-2 6.5L9 13 2.5 11 9 9 11 2.5z"
            fill="currentColor"
          />
          <path
            d="M18.5 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z"
            fill="currentColor"
          />
        </svg>
        AI Mode
      </button>
    </div>
  )
}

export default Search
