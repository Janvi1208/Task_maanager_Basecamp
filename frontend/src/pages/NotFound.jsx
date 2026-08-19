import { Link } from 'react-router-dom'
import Button from '../components/Button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="font-mono text-5xl text-ink-200 mb-4">404</p>
      <h1 className="font-display font-semibold text-xl text-ink-900">Page not found</h1>
      <p className="text-sm text-ink-600 mt-1">The page you're looking for doesn't exist.</p>
      <Link to="/" className="mt-4">
        <Button>Back to dashboard</Button>
      </Link>
    </div>
  )
}
