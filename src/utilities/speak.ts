// src/utilities/speak.ts
export function speakText(text: string) {
  if (typeof window === 'undefined') return
  if (!('speechSynthesis' in window)) return

  const u = new SpeechSynthesisUtterance(text)
  // you can set u.lang = 'et-EE' / 'sv-SE' / 'en-US'
  window.speechSynthesis.speak(u)
}
