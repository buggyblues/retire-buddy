/**
 * 全局音频管理 —— 让 BGM 跨页面持续播放
 * 单例模式：同一个 Audio 实例在路由切换时不会被销毁
 */

let globalAudio: HTMLAudioElement | null = null
let fadeInterval: ReturnType<typeof setInterval> | null = null
let isStarted = false

export function startGlobalAudio(src: string, targetVolume = 0.5) {
  if (isStarted && globalAudio) return globalAudio

  // 清理旧实例
  if (globalAudio) {
    globalAudio.pause()
    globalAudio.src = ''
    globalAudio = null
  }

  const audio = new Audio(src)
  audio.loop = true
  audio.volume = 0
  globalAudio = audio
  isStarted = true

  const playPromise = audio.play()
  if (playPromise) {
    playPromise.catch(() => {
      const handleClick = () => {
        audio.play().catch(() => {})
        document.removeEventListener('click', handleClick)
      }
      document.addEventListener('click', handleClick)
    })
  }

  // 淡入
  if (fadeInterval) clearInterval(fadeInterval)
  let vol = 0
  fadeInterval = setInterval(() => {
    vol = Math.min(vol + 0.02, targetVolume)
    if (globalAudio) globalAudio.volume = vol
    if (vol >= targetVolume && fadeInterval) {
      clearInterval(fadeInterval)
      fadeInterval = null
    }
  }, 100)

  return audio
}

export function fadeOutGlobalAudio(duration = 2000) {
  if (!globalAudio || !isStarted) return
  const audio = globalAudio
  const startVol = audio.volume
  const steps = Math.ceil(duration / 50)
  const decrement = startVol / steps
  let step = 0

  if (fadeInterval) clearInterval(fadeInterval)
  fadeInterval = setInterval(() => {
    step++
    const newVol = Math.max(startVol - decrement * step, 0)
    audio.volume = newVol
    if (newVol <= 0 || step >= steps) {
      if (fadeInterval) clearInterval(fadeInterval)
      fadeInterval = null
      audio.pause()
      audio.src = ''
      globalAudio = null
      isStarted = false
    }
  }, 50)
}

export function getGlobalAudio() {
  return globalAudio
}

export function isGlobalAudioPlaying() {
  return isStarted && globalAudio !== null
}
