import { useEffect, useState } from 'react'
import './App.css'
import Loader from './components/Loader'
import IntroAnimation from './components/IntroAnimation'
import Search from './components/Search'

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

  return (
    <main>
      {stage === 'loader' && <Loader />}
      {stage === 'intro' && <IntroAnimation />}
      {stage === 'search' && <Search />}
    </main>
  )
}

export default App
