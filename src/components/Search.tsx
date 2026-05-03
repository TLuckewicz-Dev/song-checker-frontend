import { useEffect, useRef, useState } from 'react'
import { searchTracks, type SpotifyTrack } from '../api'

interface SearchProps {
  spotifyToken: string
}

function Search({ spotifyToken }: SearchProps) {
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
    // TODO: hand off track.uri to the duplicateCheck flow.
    console.log('selected', track.uri)
    setIsOpen(false)
  }

  const showDropdown = isOpen && query.trim().length > 0

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: 400,
        border: '2px solid limegreen',
        padding: '16px',
      }}
    >
      <input
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
        style={{
          width: '100%',
          padding: 8,
          fontSize: 16,
          boxSizing: 'border-box',
        }}
      />

      {showDropdown && (
        <ul
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            margin: 0,
            padding: 0,
            listStyle: 'none',
            background: 'white',
            border: '1px solid #ccc',
            borderTop: 'none',
            maxHeight: 320,
            overflowY: 'auto',
            zIndex: 10,
            color: '#111',
          }}
        >
          {loading && <li style={{ padding: 8 }}>Searching…</li>}
          {error && (
            <li style={{ padding: 8, color: 'crimson' }}>{error}</li>
          )}
          {!loading && !error && results.length === 0 && (
            <li style={{ padding: 8, color: '#666' }}>No results</li>
          )}
          {!loading &&
            !error &&
            results.map((track) => {
              const cover =
                track.album.images[track.album.images.length - 1]?.url
              return (
                <li
                  key={track.id}
                  onClick={() => handleSelect(track)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: 8,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = '#f3f3f3')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = 'transparent')
                  }
                >
                  {cover && (
                    <img
                      src={cover}
                      alt=""
                      width={40}
                      height={40}
                      style={{ flexShrink: 0, borderRadius: 2 }}
                    />
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {track.name}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: '#666',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {track.artists.map((a) => a.name).join(', ')}
                    </div>
                  </div>
                </li>
              )
            })}
        </ul>
      )}
    </div>
  )
}

export default Search
