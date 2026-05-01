export interface SampleVoiceOptions {
  buffer: AudioBuffer
  envelope: {
    attack: number
    decay: number
    sustain: number
    release: number
  }
  filterFrequency: number
  filterQ: number
}

export interface SampleVoice {
  start: () => void
}

export function useSampleVoice(ctx: AudioContext, opts: SampleVoiceOptions): SampleVoice {
  const src = ctx.createBufferSource()
  src.buffer = opts.buffer

  const gain = ctx.createGain()
  gain.gain.value = 0

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = opts.filterFrequency
  filter.Q.value = opts.filterQ

  src.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)

  const start = () => {
    const now = ctx.currentTime
    const { attack, decay, sustain, release } = opts.envelope

    // Envelope start
    gain.gain.cancelScheduledValues(now)
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(1, now + attack)
    gain.gain.linearRampToValueAtTime(sustain, now + attack + decay)

    src.start(now)

    // Schedule release at end of buffer
    const end = now + src.buffer!.duration
    gain.gain.setValueAtTime(sustain, end)
    gain.gain.linearRampToValueAtTime(0, end + release)

    src.stop(end + release + 0.05)
  }

  return { start }
}
