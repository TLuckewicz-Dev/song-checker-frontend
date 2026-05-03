import { useEffect, useState } from 'react'
import './App.css'
import Loader from './components/Loader'
import IntroAnimation from './components/IntroAnimation'
import Search from './components/Search'
import { getSpotifyToken } from './api'

type Stage = 'loader' | 'intro' | 'search'

function App() {
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null)
  const [minLoaderElapsed, setMinLoaderElapsed] = useState(false)
  const [introDone, setIntroDone] = useState(false)

  // On mount: kick off the Spotify token fetch and start the 2s minimum
  // loader timer. The loader stays visible until both finish.
  useEffect(() => {
    const minLoaderTimeout = setTimeout(() => setMinLoaderElapsed(true), 2000)

    getSpotifyToken()
      .then((response) => {
        console.log('Spotify token:', response.access_token)
        setSpotifyToken(response.access_token)
      })
      .catch((error) => {
        // TODO: If getSpotifyToken fails, `spotifyToken` stays null and the
        // loader will display indefinitely. We should surface an error UI
        // and/or retry the request instead of leaving the user stuck.
        console.error('Failed to fetch Spotify token:', error)
      })

    return () => {
      clearTimeout(minLoaderTimeout)
    }
  }, [])

  const loaderDone = minLoaderElapsed && spotifyToken !== null

  // Once the loader finishes, show the intro animation for 2s before
  // advancing to the search screen.
  useEffect(() => {
    if (!loaderDone) return
    const introTimeout = setTimeout(() => setIntroDone(true), 2000)
    return () => clearTimeout(introTimeout)
  }, [loaderDone])

  const stage: Stage = !loaderDone ? 'loader' : !introDone ? 'intro' : 'search'

  return (
    <main>
      {stage === 'loader' && <Loader />}
      {stage === 'intro' && <IntroAnimation />}
      {stage === 'search' && spotifyToken && (
        <Search spotifyToken={spotifyToken} />
      )}
    </main>
  )
}

export default App
