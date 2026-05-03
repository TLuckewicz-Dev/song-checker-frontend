import './Loader.css'

function Loader() {
  return (
    <div
      style={{
        border: '2px solid tomato',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <div className="loader-spinner" aria-label="Loading" role="status" />
      <span>Loader</span>
    </div>
  )
}

export default Loader
