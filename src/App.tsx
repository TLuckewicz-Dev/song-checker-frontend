import './App.css'

const FUNCTIONS_BASE_URL =
  'https://us-central1-song-checker-5a454.cloudfunctions.net'

const EXAMPLE_SPOTIFY_URI = 'spotify:track:4uvjOKsp7mSjrDhWdkLPBY'

function App() {
  const handleGetSpotifyToken = async () => {
    try {
      const response = await fetch(`${FUNCTIONS_BASE_URL}/getSpotifyToken`)
      const data = await response.json()
      console.log('getSpotifyToken response:', data)
    } catch (error) {
      console.error('getSpotifyToken failed:', error)
    }
  }

  const handleDuplicateCheck = async () => {
    try {
      const response = await fetch(`${FUNCTIONS_BASE_URL}/duplicateCheck`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spotifyUri: EXAMPLE_SPOTIFY_URI }),
      })
      const data = await response.json()
      console.log('duplicateCheck response:', data)
    } catch (error) {
      console.error('duplicateCheck failed:', error)
    }
  }

  return (
    <main>
      <h1>Song Checker</h1>
      <div className="actions">
        <button type="button" onClick={handleGetSpotifyToken}>
          Get Spotify Token
        </button>
        <button type="button" onClick={handleDuplicateCheck}>
          Check Duplicate
        </button>
      </div>
    </main>
  )
}

export default App
