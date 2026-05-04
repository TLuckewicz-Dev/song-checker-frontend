import { useEffect, useRef, useState } from 'react'
import { searchTracks, type SpotifyTrack } from '../api'
import './Search.css'

interface SearchProps {
  spotifyToken: string
  onSelectTrack: (spotifyUri: string) => void
}

function Search({ spotifyToken, onSelectTrack }: SearchProps) {
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
    onSelectTrack(track.uri)
  }

  const showDropdown = isOpen && query.trim().length > 0

  return (
    <div ref={containerRef} className="search">
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
        <input
          className="search__input"
          type="text"
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
          spellCheck={false}
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
  )
}

export default Search
