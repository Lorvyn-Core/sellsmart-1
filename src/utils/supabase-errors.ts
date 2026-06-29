import * as Supabase from '@supabase/supabase-js'
import * as Sonner from 'sonner'

export function toastSupabaseError(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = String((error as Supabase.PostgrestError).message || fallback)
    const details = 'details' in error && (error as Supabase.PostgrestError).details
      ? String((error as Supabase.PostgrestError).details)
      : undefined
    const text = details ? msg + ' — ' + details : msg || fallback
    Sonner.toast.error(text)
    return
  }
  Sonner.toast.error(fallback)
}
