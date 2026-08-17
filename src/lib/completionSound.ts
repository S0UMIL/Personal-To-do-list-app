/** Very short programmatic tick — no network, no large asset. */
let audioContext: AudioContext | null = null

export function playTaskCompletionSound(): void {
  if (typeof window === 'undefined') return

  try {
    const Ctx =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!Ctx) return

    if (!audioContext) audioContext = new Ctx()
    if (audioContext.state === 'suspended') {
      void audioContext.resume()
    }

    const osc = audioContext.createOscillator()
    const gain = audioContext.createGain()
    osc.type = 'sine'
    osc.frequency.value = 1046.5
    gain.gain.value = 0.04
    osc.connect(gain)
    gain.connect(audioContext.destination)

    const now = audioContext.currentTime
    gain.gain.setValueAtTime(0.04, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
    osc.start(now)
    osc.stop(now + 0.07)
  } catch {
    /* silent devices / autoplay restrictions */
  }
}
