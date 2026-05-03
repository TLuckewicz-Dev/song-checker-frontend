import type { DuplicateCheckResponse } from '../api'

interface ResultsProps {
  response: DuplicateCheckResponse
  onBack: () => void
}

function Results({ response, onBack }: ResultsProps) {
  const { matches } = response

  return (
    <div style={{ border: '2px solid darkorange', padding: '16px' }}>
      <button
        type="button"
        onClick={onBack}
        style={{
          marginBottom: 12,
          padding: '6px 12px',
          fontSize: 14,
          cursor: 'pointer',
        }}
      >
        ← Check another song
      </button>

      <h2 style={{ marginTop: 0 }}>
        {matches.length === 0
          ? 'No duplicates found'
          : `Found ${matches.length} duplicate${matches.length === 1 ? '' : 's'}`}
      </h2>

      {matches.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {matches.map((match, i) => (
            <li key={i} style={{ marginBottom: 8 }}>
              <div>
                <strong>{match.roundName}</strong>
              </div>
              <div style={{ fontSize: 14, color: '#666' }}>
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
