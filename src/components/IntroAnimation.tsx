import './IntroAnimation.css'

function IntroAnimation() {
  return (
    <div className="intro">
      <div className="intro__pulse" aria-hidden="true">
        <div className="intro__core" />
      </div>
      <div className="intro__heading">Ready to listen</div>
      <div className="intro__text">
        Search the Spotify catalog to check whether a song has already been
        submitted.
      </div>
    </div>
  )
}

export default IntroAnimation
