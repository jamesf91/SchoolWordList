import { useCallback, useEffect, useRef, useState } from 'react'
import { TTS_RATE } from '@/constants/config'

interface UseTtsResult {
  speak(text: string): void
  cancel(): void
  isSpeaking: boolean
  isSupported: boolean
}

export function useTts(): UseTtsResult {
  const isSupported = typeof window !== 'undefined' && typeof window.speechSynthesis !== 'undefined'
  const [isSpeaking, setIsSpeaking] = useState(false)
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)

  useEffect(() => {
    if (!isSupported) return

    function pickVoice() {
      const voices = window.speechSynthesis.getVoices()
      if (voices.length === 0) return
      voiceRef.current =
        voices.find(v => v.lang === 'en-GB') ??
        voices.find(v => v.lang === 'en-AU') ??
        voices.find(v => v.lang.startsWith('en')) ??
        voices[0] ??
        null
    }

    pickVoice()
    window.speechSynthesis.addEventListener('voiceschanged', pickVoice)

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', pickVoice)
      window.speechSynthesis.cancel()
    }
  }, [isSupported])

  const cancel = useCallback(() => {
    if (!isSupported) return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [isSupported])

  const speak = useCallback((text: string) => {
    if (!isSupported) return
    // Cancel any in-progress utterance first (prevents iOS queue buildup)
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = TTS_RATE
    if (voiceRef.current) utterance.voice = voiceRef.current

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }, [isSupported])

  return { speak, cancel, isSpeaking, isSupported }
}
