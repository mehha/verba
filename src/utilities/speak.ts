// src/utilities/speak.ts
export function speakText(text: string) {
  if (typeof window === 'undefined') return
  if (!('speechSynthesis' in window)) return

  const u = new SpeechSynthesisUtterance(text)
  // you can set u.lang = 'et-EE' / 'sv-SE' / 'en-US'
  window.speechSynthesis.speak(u)
}

export function speakET(text: string) {
  const utter = new SpeechSynthesisUtterance(text)

  // sometimes voices are not loaded yet
  const trySpeak = () => {
    const voices = window.speechSynthesis.getVoices()
    
    console.log('voices', voices)

    // look for Estonian
    const etVoice =
      voices.find(v => v.lang?.toLowerCase() === 'et-ee') ||
      voices.find(v => v.lang?.toLowerCase().startsWith('et'))

    if (etVoice) {
      utter.voice = etVoice
    } else {
      // fallback: you could pick something Nordic / English
      const fallback =
        voices.find(v => v.lang?.toLowerCase().startsWith('fi')) ||
        voices.find(v => v.lang?.toLowerCase().startsWith('en')) ||
        null
      if (fallback) utter.voice = fallback
    }

    window.speechSynthesis.speak(utter)
  }

  // if voices list is empty, wait for it once
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      trySpeak()
    }
  } else {
    trySpeak()
  }
}
