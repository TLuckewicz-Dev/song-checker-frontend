import './IntroAnimation.css'

const TITLE = 'Song Checker'
const BAR_COUNT = 9

function IntroAnimation() {
  return (
    <div className="intro">
      <div className="intro__glow" aria-hidden="true" />

      <div className="intro__equalizer" aria-hidden="true">
        {Array.from({ length: BAR_COUNT }).map((_, i) => (
          <span
            key={i}
            className="intro__bar"
            style={{
              animationDelay: `${(i % 3) * 0.12 + (i * 0.05)}s`,
            }}
          />
        ))}
      </div>

      <h1 className="intro__title" aria-label={TITLE}>
        {TITLE.split('').map((char, i) => (
          <span
            key={i}
            className="intro__char"
            aria-hidden="true"
            style={{ animationDelay: `${0.45 + i * 0.05}s` }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </h1>
    </div>
  )
}

export default IntroAnimation
