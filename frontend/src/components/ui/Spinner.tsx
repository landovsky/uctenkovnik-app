export default function Spinner({ className = '' }: { className?: string }) {
  return (
    <div
      className={`inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Načítání"
    />
  )
}
