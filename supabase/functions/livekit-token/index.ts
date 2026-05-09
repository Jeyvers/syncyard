// Supabase Edge Function — LiveKit token generator
// Deploy:  supabase functions deploy livekit-token
// Secrets: supabase secrets set LIVEKIT_API_KEY=... LIVEKIT_API_SECRET=...
//
// Required DB migration (run once in Supabase SQL editor):
//   ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS participant_count INTEGER NOT NULL DEFAULT 0;
//   ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT FALSE;

import { corsHeaders } from '../_shared/cors.ts'

// ---------------------------------------------------------------------------
// Minimal LiveKit JWT — no npm dep needed, pure Web Crypto (Deno-native)
// ---------------------------------------------------------------------------
async function createLiveKitToken(
  apiKey: string,
  apiSecret: string,
  identity: string,
  name: string,
  roomName: string,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000)

  const header = { alg: 'HS256', typ: 'JWT' }
  const payload = {
    iss: apiKey,
    sub: identity,
    jti: crypto.randomUUID(),
    iat: now,
    nbf: now,
    exp: now + 6 * 60 * 60, // 6 h
    name,
    video: {
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    },
  }

  const b64url = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')

  const header64 = b64url(header)
  const payload64 = b64url(payload)
  const signingInput = `${header64}.${payload64}`

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(apiSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  const sigBytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signingInput))
  const sig = btoa(String.fromCharCode(...new Uint8Array(sigBytes)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

  return `${signingInput}.${sig}`
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { roomName, identity, name } = await req.json()

    if (!roomName || !identity) {
      return new Response(JSON.stringify({ error: 'roomName and identity are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const apiKey = Deno.env.get('LIVEKIT_API_KEY')
    const apiSecret = Deno.env.get('LIVEKIT_API_SECRET')

    if (!apiKey || !apiSecret) {
      return new Response(JSON.stringify({ error: 'LiveKit credentials not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const token = await createLiveKitToken(
      apiKey,
      apiSecret,
      identity,
      name ?? identity,
      roomName,
    )

    return new Response(JSON.stringify({ token }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
