import { useParams, useNavigate } from 'react-router-dom'

export default function SplittingPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Rozdělení účtu</h1>
      <p className="text-muted mb-4">Session: {id}</p>
      <button onClick={() => navigate(`/ucet/${id}`)} className="text-primary">
        Zpět
      </button>
    </div>
  )
}
