const FUNCTIONS_BASE_URL =
  'https://us-central1-song-checker-5a454.cloudfunctions.net'

export interface SpotifyTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export interface DuplicateMatch {
  created: string
  roundName: string
  submitterName: string
}

export interface DuplicateCheckResponse {
  matches: DuplicateMatch[]
}

export async function getSpotifyToken(): Promise<SpotifyTokenResponse> {
  const response = await fetch(`${FUNCTIONS_BASE_URL}/getSpotifyToken`)
  if (!response.ok) {
    throw new Error(`getSpotifyToken failed: ${response.status}`)
  }
  return (await response.json()) as SpotifyTokenResponse
}

export async function duplicateCheck(
  spotifyUri: string,
): Promise<DuplicateCheckResponse> {
  const response = await fetch(`${FUNCTIONS_BASE_URL}/duplicateCheck`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ spotifyUri }),
  })
  if (!response.ok) {
    throw new Error(`duplicateCheck failed: ${response.status}`)
  }
  return (await response.json()) as DuplicateCheckResponse
}
