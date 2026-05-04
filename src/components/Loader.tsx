import './Loader.css'

interface LoaderProps {
  label?: string
}

function Loader({ label = 'Loading' }: LoaderProps) {
  return (
    <div className="loader">
      <div
        className="loader__spinner"
        aria-label={label}
        role="status"
      />
      <span className="loader__label">{label}…</span>
    </div>
  )
}

export default Loader
