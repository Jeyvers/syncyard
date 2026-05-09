import { type Ref, onUnmounted } from 'vue'
import { supabase } from '@/lib/supabase'

interface Options {
  filter?: (ws: any) => boolean
  onAdded?: (ws: any) => void
  onRemoved?: (id: string) => void
  channelName?: string
}

export function useRealtimeWorkspaces(workspaces: Ref<any[]>, options: Options = {}) {
  const { filter, onAdded, onRemoved, channelName = 'realtime-workspaces' } = options

  function passes(ws: any) {
    return !filter || filter(ws)
  }

  function patchList(ws: any) {
    const idx = workspaces.value.findIndex(w => w.id === ws.id)
    if (idx !== -1) {
      if (!passes(ws)) {
        // Workspace no longer meets the filter (e.g. went inactive) — remove it
        workspaces.value = workspaces.value.filter(w => w.id !== ws.id)
        onRemoved?.(ws.id)
      } else {
        // Patch only the changed fields, keep everything else intact
        workspaces.value = workspaces.value.map(w => w.id === ws.id ? { ...w, ...ws } : w)
      }
    } else if (passes(ws)) {
      // Workspace now matches the filter — prepend it
      workspaces.value = [ws, ...workspaces.value]
      onAdded?.(ws)
    }
  }

  const ch = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'workspaces' },
      (p) => {
        const ws = p.new as any
        if (passes(ws) && !workspaces.value.find(w => w.id === ws.id)) {
          workspaces.value = [ws, ...workspaces.value]
          onAdded?.(ws)
        }
      },
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'workspaces' },
      (p) => patchList(p.new as any),
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'workspaces' },
      (p) => {
        const id = (p.old as any)?.id
        if (id) {
          workspaces.value = workspaces.value.filter(w => w.id !== id)
          onRemoved?.(id)
        }
      },
    )
    .subscribe()

  onUnmounted(() => supabase.removeChannel(ch))
}
