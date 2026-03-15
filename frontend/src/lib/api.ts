const API_BASE = import.meta.env.VITE_API_BASE as string | undefined ?? ''

export class ApiError extends Error {
  status: number
  body: string

  constructor(status: number, body: string) {
    super(`API error ${status}: ${body}`)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export async function callFunction<T>(
  functionName: string,
  params: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(`${API_BASE}/${functionName}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    throw new ApiError(response.status, await response.text())
  }

  return response.json() as Promise<T>
}
