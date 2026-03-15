interface Props {
  label: string
  onDelete?: () => void
}

export default function Pill({ label, onDelete }: Props) {
  return (
    <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
      {label}
      {onDelete && (
        <button
          onClick={onDelete}
          className="ml-1 hover:text-danger transition-colors"
          aria-label={`Odebrat ${label}`}
        >
          &times;
        </button>
      )}
    </span>
  )
}
