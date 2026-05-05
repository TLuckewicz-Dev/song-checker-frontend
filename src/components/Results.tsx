import type { DuplicateCheckResponse } from '../api'
import './Results.css'

interface ResultsProps {
  response: DuplicateCheckResponse
  onBack: () => void
}

type ResultState = 'clean' | 'recent' | 'stale'

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000

function getResultState(matches: DuplicateCheckResponse['matches']): ResultState {
  if (matches.length === 0) return 'clean'
  // Backend returns matches with the most recent submission first.
  const mostRecent = new Date(matches[0].created).getTime()
  if (Number.isFinite(mostRecent) && Date.now() - mostRecent > ONE_YEAR_MS) {
    return 'stale'
  }
  return 'recent'
}

function Results({ response, onBack }: ResultsProps) {
  const { matches } = response
  const state = getResultState(matches)

  const heading =
    state === 'clean'
      ? 'No duplicates found'
      : `Found ${matches.length} duplicate${matches.length === 1 ? '' : 's'}`

  const subheading =
    state === 'clean'
      ? 'This song is fair game'
      : state === 'stale'
        ? 'This song was last sent over a year ago, submit at your own risk.'
        : 'This song has been submitted within the last year.'

  return (
    <div className="results">
      <button
        type="button"
        onClick={onBack}
        className="results__back"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="m15 18-6-6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back to Search
      </button>

      <div className={`results__card results__card--${state}`}>
        <div className="results__status">
          <div
            className={`results__status-icon results__status-icon--${state}`}
            aria-hidden="true"
          >
            {state === 'clean' && (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            {state === 'recent' && (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 8v5"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="17" r="1.25" fill="currentColor" />
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            )}
            {state === 'stale' && (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 3.5 2.5 20.5h19L12 3.5Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 10v4.5"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="17.5" r="1.1" fill="currentColor" />
              </svg>
            )}
          </div>
          <div>
            <div className="results__heading">{heading}</div>
            <div className="results__subheading">{subheading}</div>
          </div>
        </div>
      </div>

      {state !== 'clean' && (
        <ul className="results__list">
          {matches.map((match, i) => (
            <li key={i} className="results__match">
              <div className="results__match-name">{match.roundName}</div>
              <div className="results__match-meta">
                Submitted by {match.submitterName} on{' '}
                {new Date(match.created).toLocaleDateString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Results
