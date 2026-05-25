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

export interface SpotifyImage {
  url: string
  height: number | null
  width: number | null
}

export interface SpotifyArtist {
  name: string
}

export interface SpotifyTrack {
  id: string
  uri: string
  name: string
  artists: SpotifyArtist[]
  album: {
    name: string
    images: SpotifyImage[]
  }
}

export interface SelectedTrack {
  uri: string
  name: string
  artists: string
  albumName: string
  albumImageUrl: string | null
}

interface SpotifySearchResponse {
  tracks: { items: SpotifyTrack[] }
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

export interface AskOpenAIResponse {
  reply: string
  model: string
}

export async function askOpenAI(prompt: string): Promise<AskOpenAIResponse> {
  const response = await fetch(`${FUNCTIONS_BASE_URL}/askOpenAI`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, group: '908beanbagboys' }),
  })
  if (!response.ok) {
    throw new Error(`askOpenAI failed: ${response.status}`)
  }
  return (await response.json()) as AskOpenAIResponse
}

export async function searchTracks(
  query: string,
  token: string,
  signal?: AbortSignal,
): Promise<SpotifyTrack[]> {
  const url = new URL('https://api.spotify.com/v1/search')
  url.searchParams.set('q', query)
  url.searchParams.set('type', 'track')
  url.searchParams.set('limit', '10')

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  })
  if (!response.ok) {
    throw new Error(`searchTracks failed: ${response.status}`)
  }
  const data = (await response.json()) as SpotifySearchResponse
  return data.tracks.items
}
