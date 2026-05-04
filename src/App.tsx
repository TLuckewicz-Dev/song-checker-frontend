import { useEffect, useState } from 'react'
import './App.css'
import Loader from './components/Loader'
import IntroAnimation from './components/IntroAnimation'
import Search from './components/Search'
import Results from './components/Results'
import {
  duplicateCheck,
  getSpotifyToken,
  type DuplicateCheckResponse,
} from './api'

type Stage = 'loader' | 'intro' | 'search' | 'check-loader' | 'results'

function App() {
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null)
  const [minLoaderElapsed, setMinLoaderElapsed] = useState(false)
  const [introDone, setIntroDone] = useState(false)
  const [selectedUri, setSelectedUri] = useState<string | null>(null)
  const [checkMinElapsed, setCheckMinElapsed] = useState(false)
  const [duplicateResponse, setDuplicateResponse] =
    useState<DuplicateCheckResponse | null>(null)

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

  // Once a song is selected, kick off the duplicate check and a fresh 2s
  // minimum loader timer. The loader stays visible until both finish.
  useEffect(() => {
    if (!selectedUri) return

    const minTimeout = setTimeout(() => setCheckMinElapsed(true), 2000)

    duplicateCheck(selectedUri)
      .then((response) => setDuplicateResponse(response))
      .catch((error) => {
        // TODO: If duplicateCheck fails, `duplicateResponse` stays null and
        // the loader will display indefinitely. Surface an error UI and/or
        // retry instead of leaving the user stuck.
        console.error('Failed to run duplicate check:', error)
      })

    return () => {
      clearTimeout(minTimeout)
    }
  }, [selectedUri])

  const checkLoaderDone = checkMinElapsed && duplicateResponse !== null

  // Reset everything related to a song selection so the user is sent back
  // to the search screen with a clean slate.
  const handleBackToSearch = () => {
    setSelectedUri(null)
    setCheckMinElapsed(false)
    setDuplicateResponse(null)
  }

  let stage: Stage
  if (!loaderDone) stage = 'loader'
  else if (!introDone) stage = 'intro'
  else if (!selectedUri) stage = 'search'
  else if (!checkLoaderDone) stage = 'check-loader'
  else stage = 'results'

  return (
    <main className="app">
      <header className="app__header">
        <div className="app__logo" aria-hidden="true">
          <svg
            className="app__logo-mark"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 18V5l12-2v13"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="6"
              cy="18"
              r="3"
              stroke="currentColor"
              strokeWidth="2.5"
            />
            <circle
              cx="18"
              cy="16"
              r="3"
              stroke="currentColor"
              strokeWidth="2.5"
            />
          </svg>
        </div>
        <div>
          <div className="app__title">Song Checker</div>
          <div className="app__subtitle">Find duplicate submissions</div>
        </div>
      </header>

      <div className="app__main">
        <div className="app__stage" key={stage}>
          {stage === 'loader' && <Loader label="Connecting to Spotify" />}
          {stage === 'intro' && <IntroAnimation />}
          {stage === 'search' && spotifyToken && (
            <Search
              spotifyToken={spotifyToken}
              onSelectTrack={setSelectedUri}
            />
          )}
          {stage === 'check-loader' && <Loader label="Checking for duplicates" />}
          {stage === 'results' && duplicateResponse && (
            <Results response={duplicateResponse} onBack={handleBackToSearch} />
          )}
        </div>
      </div>
    </main>
  )
}

export default App
