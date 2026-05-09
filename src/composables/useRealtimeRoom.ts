import { type Ref, onUnmounted } from 'vue'
import { supabase } from '@/lib/supabase'

export function useRealtimeRoom(
  workspaceId: string,
  workspace: Ref<any>,
  onEnded: () => void,
) {
  const ch = supabase
    .channel(`room:${workspaceId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'workspaces',
        filter: `id=eq.${workspaceId}`,
      },
      (p) => {
        const updated = p.new as any

        // Workspace hasn't loaded yet — nothing to merge into
        if (!workspace.value) return

        // Fire ended callback only on the transition (not if already ended on load)
        if (updated.ended_at && !workspace.value.ended_at) {
          onEnded()
        }

        workspace.value = { ...workspace.value, ...updated }
      },
    )
    .subscribe()

  onUnmounted(() => supabase.removeChannel(ch))
}
