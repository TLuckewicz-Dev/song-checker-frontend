import type { DuplicateCheckResponse } from '../api'
import './Results.css'

interface ResultsProps {
  response: DuplicateCheckResponse
  onBack: () => void
}

function Results({ response, onBack }: ResultsProps) {
  const { matches } = response
  const isClean = matches.length === 0

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
        Check another song
      </button>

      <div
        className={
          'results__card' + (isClean ? ' results__card--clean' : '')
        }
      >
        <div className="results__status">
          <div
            className={
              'results__status-icon ' +
              (isClean
                ? 'results__status-icon--clean'
                : 'results__status-icon--match')
            }
            aria-hidden="true"
          >
            {isClean ? (
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
            ) : (
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
          </div>
          <div>
            <div className="results__heading">
              {isClean
                ? 'No duplicates found'
                : `Found ${matches.length} duplicate${
                    matches.length === 1 ? '' : 's'
                  }`}
            </div>
            <div className="results__subheading">
              {isClean
                ? 'This song is fair game'
                : 'This song has been submitted before'}
            </div>
          </div>
        </div>
      </div>

      {!isClean && (
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
