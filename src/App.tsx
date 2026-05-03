import { useEffect, useState } from 'react'
import './App.css'
import Loader from './components/Loader'
import IntroAnimation from './components/IntroAnimation'
import Search from './components/Search'

const FUNCTIONS_BASE_URL =
  'https://us-central1-song-checker-5a454.cloudfunctions.net'

const EXAMPLE_SPOTIFY_URI = 'spotify:track:4uvjOKsp7mSjrDhWdkLPBY'

type Stage = 'loader' | 'intro' | 'search'

function App() {
  const [stage, setStage] = useState<Stage>('loader')

  useEffect(() => {
    const loaderTimeout = setTimeout(() => setStage('intro'), 2000)
    const introTimeout = setTimeout(() => setStage('search'), 4000)

    return () => {
      clearTimeout(loaderTimeout)
      clearTimeout(introTimeout)
    }
  }, [])

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
      {stage === 'loader' && <Loader />}
      {stage === 'intro' && <IntroAnimation />}
      {stage === 'search' && <Search />}
    </main>
  )
}

export default App
