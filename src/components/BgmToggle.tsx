import { useState } from 'react'
import { motion } from 'framer-motion'
import { startBGM, stopBGM, isBGMPlaying } from '../hooks/use8bitAudio'

export default function BgmToggle() {
  const [on, setOn] = useState(isBGMPlaying)

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (on) {
      stopBGM()
      setOn(false)
    } else {
      startBGM()
      setOn(true)
    }
    if (navigator.vibrate) navigator.vibrate(15)
  }

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={toggle}
      className={`fixed top-4 right-4 z-50 pixel-font text-[9px] px-3 py-1.5 rounded-full border transition-colors ${
        on
          ? 'bg-primary/20 border-primary/40 text-primary-light'
          : 'bg-slate-800/80 border-slate-600 text-slate-400'
      }`}
    >
      {on ? '🔊' : '🔇'} BGM
    </motion.button>
  )
}
