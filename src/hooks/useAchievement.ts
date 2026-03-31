import { useEffect } from 'react'
import { unlockAchievement } from '../pages/Achievements'

export function useAchievement(id: string) {
  useEffect(() => {
    unlockAchievement(id)
  }, [id])
}
