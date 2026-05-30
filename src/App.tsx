import { useEffect, useState } from 'react'
import './App.css'
import Loader from './components/Loader'
import IntroAnimation from './components/IntroAnimation'
import Search from './components/Search'
import Results from './components/Results'
import AIMode from './components/AIMode'
import {
  duplicateCheck,
  getSpotifyToken,
  type DuplicateCheckResponse,
  type SelectedTrack,
} from './api'
import { useAiModeEnabled } from './hooks/useAiModeEnabled'

type Stage =
  | 'intro'
  | 'loader'
  | 'search'
  | 'ai-mode'
  | 'check-loader'
  | 'results'

function App() {
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null)
  const [introDone, setIntroDone] = useState(false)
  const [selectedTrack, setSelectedTrack] = useState<SelectedTrack | null>(null)
  const [checkMinElapsed, setCheckMinElapsed] = useState(false)
  const [duplicateResponse, setDuplicateResponse] =
    useState<DuplicateCheckResponse | null>(null)
  const [aiModeActive, setAiModeActive] = useState(false)
  const { enabled: aiModeEnabled } = useAiModeEnabled()

  // On mount: kick off the Spotify token fetch in the background and start
  // the 5s intro timer. The token request runs in parallel with the intro
  // so it's typically ready by the time the intro finishes.
  useEffect(() => {
    const introTimeout = setTimeout(() => setIntroDone(true), 5000)

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
      clearTimeout(introTimeout)
    }
  }, [])

  // Once a song is selected, kick off the duplicate check and a fresh 2s
  // minimum loader timer. The loader stays visible until both finish.
  useEffect(() => {
    if (!selectedTrack) return

    const minTimeout = setTimeout(() => setCheckMinElapsed(true), 2000)

    duplicateCheck(selectedTrack.uri)
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
  }, [selectedTrack])

  const checkLoaderDone = checkMinElapsed && duplicateResponse !== null

  // Reset everything related to a song selection so the user is sent back
  // to the search screen with a clean slate.
  const handleBackToSearch = () => {
    setSelectedTrack(null)
    setCheckMinElapsed(false)
    setDuplicateResponse(null)
    setAiModeActive(false)
  }

  const handleEnterAiMode = () => {
    if (aiModeEnabled) setAiModeActive(true)
  }
  const handleExitAiMode = () => setAiModeActive(false)

  let stage: Stage
  if (!introDone) stage = 'intro'
  else if (!spotifyToken) stage = 'loader'
  else if (!selectedTrack && aiModeEnabled && aiModeActive) stage = 'ai-mode'
  else if (!selectedTrack) stage = 'search'
  else if (!checkLoaderDone) stage = 'check-loader'
  else stage = 'results'

  if (stage === 'intro') {
    return (
      <main className="app app--intro">
        <IntroAnimation />
      </main>
    )
  }

  return (
    <main className="app">
      <div className="app__main">
        <div className="app__stage" key={stage}>
          {stage === 'loader' && <Loader label="Connecting to Spotify" />}
          {stage === 'search' && spotifyToken && (
            <Search
              spotifyToken={spotifyToken}
              onSelectTrack={setSelectedTrack}
              onEnterAiMode={handleEnterAiMode}
              showAiMode={aiModeEnabled}
            />
          )}
          {stage === 'ai-mode' && <AIMode onBack={handleExitAiMode} />}
          {stage === 'check-loader' && <Loader label="Checking for duplicates" />}
          {stage === 'results' && duplicateResponse && selectedTrack && (
            <Results
              track={selectedTrack}
              response={duplicateResponse}
              onBack={handleBackToSearch}
            />
          )}
        </div>
      </div>
    </main>
  )
}

export default App
