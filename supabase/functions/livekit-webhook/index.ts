// Supabase Edge Function — LiveKit webhook receiver
// Deploy: supabase functions deploy livekit-webhook
//
// In the LiveKit dashboard (or livekit.yaml), add a webhook pointing to:
//   https://<project-ref>.supabase.co/functions/v1/livekit-webhook
//
// Events handled:
//   room_finished    → is_active=false, participant_count=0
//   participant_left → decrement participant_count (atomic RPC)
//
// LiveKit signs webhooks with a JWT whose payload contains sha256 of the body.
// We verify the signature before touching the database.

// ── Signature verification ────────────────────────────────────────────────

function base64UrlToBytes(b64: string): Uint8Array {
  const padded = b64.replace(/-/g, '+').replace(/_/g, '/').padEnd(
    b64.length + (4 - (b64.length % 4)) % 4,
    '=',
  )
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0))
}

async function verifyWebhookAuth(body: string, authHeader: string, apiSecret: string): Promise<boolean> {
  try {
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader
    const parts = token.split('.')
    if (parts.length !== 3) return false

    const [headerB64, payloadB64, sigB64] = parts

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(apiSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    )

    const sigInput = new TextEncoder().encode(`${headerB64}.${payloadB64}`)
    const sigBytes = base64UrlToBytes(sigB64)
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, sigInput)
    if (!valid) return false

    const payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payloadB64)))

    // Verify body hash matches claim in JWT
    const bodyHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body))
    const bodyHashB64 = btoa(String.fromCharCode(...new Uint8Array(bodyHash)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')

    return payload.sha256 === bodyHashB64
  } catch {
    return false
  }
}

// ── Supabase helpers (using REST API directly — no SDK in edge functions) ──

function supabaseHeaders(serviceKey: string) {
  return {
    'Content-Type': 'application/json',
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
    'Prefer': 'return=minimal',
  }
}

async function resetRoom(supabaseUrl: string, serviceKey: string, workspaceId: string) {
  await fetch(
    `${supabaseUrl}/rest/v1/workspaces?id=eq.${workspaceId}`,
    {
      method: 'PATCH',
      headers: supabaseHeaders(serviceKey),
      body: JSON.stringify({
        is_active:         false,
        participant_count: 0,
        last_empty_at:     new Date().toISOString(),
      }),
    },
  )
}

async function decrementCount(supabaseUrl: string, serviceKey: string, workspaceId: string) {
  await fetch(
    `${supabaseUrl}/rest/v1/rpc/decrement_participant_count`,
    {
      method: 'POST',
      headers: supabaseHeaders(serviceKey),
      body: JSON.stringify({ workspace_id: workspaceId }),
    },
  )
}

// ── Handler ───────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const apiSecret    = Deno.env.get('LIVEKIT_API_SECRET') ?? ''
  const supabaseUrl  = Deno.env.get('SUPABASE_URL') ?? ''
  const serviceKey   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

  if (!apiSecret || !supabaseUrl || !serviceKey) {
    return new Response('Server misconfigured', { status: 500 })
  }

  const body       = await req.text()
  const authHeader = req.headers.get('Authorization') ?? ''

  const valid = await verifyWebhookAuth(body, authHeader, apiSecret)
  if (!valid) {
    return new Response('Unauthorized', { status: 401 })
  }

  let event: Record<string, any>
  try {
    event = JSON.parse(body)
  } catch {
    return new Response('Bad request', { status: 400 })
  }

  const roomName = event.room?.name ?? ''
  if (!roomName.startsWith('syncyard-')) {
    return new Response('ok', { status: 200 })
  }

  const workspaceId = roomName.slice('syncyard-'.length)

  switch (event.event) {
    case 'room_finished':
      await resetRoom(supabaseUrl, serviceKey, workspaceId)
      break

    case 'participant_left':
      await decrementCount(supabaseUrl, serviceKey, workspaceId)
      break
  }

  return new Response('ok', { status: 200 })
})
