import { useParams, useNavigate } from 'react-router-dom'

export default function PaymentPage() {
  const { id, participantId } = useParams<{ id: string; participantId: string }>()
  const navigate = useNavigate()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Platba</h1>
      <p className="text-muted mb-4">Účastník: {participantId}</p>
      <button onClick={() => navigate(`/ucet/${id}`)} className="text-primary">
        Zpět
      </button>
    </div>
  )
}
