import { useEffect, useState } from 'react'
import {
  fetchAndActivate,
  getBoolean,
  onConfigUpdate,
} from 'firebase/remote-config'
import { remoteConfig } from '../firebase'

export function useAiModeEnabled() {
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const readFlag = () => {
      if (!cancelled) {
        setEnabled(getBoolean(remoteConfig, 'ai_mode_enabled'))
      }
    }

    fetchAndActivate(remoteConfig)
      .then(readFlag)
      .catch(() => readFlag())
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    const unsubscribe = onConfigUpdate(remoteConfig, {
      next: () => {
        fetchAndActivate(remoteConfig).then(readFlag)
      },
      error: () => {},
      complete: () => {},
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  return { enabled, loading }
}
